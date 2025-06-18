const { Complaint, ComplaintHistory, User } = require('../models');
const { generateTrackingId } = require('../utils/trackingId');
const { Op } = require('sequelize');

// Create new complaint
const createComplaint = async (req, res) => {
  try {
    const {
      is_anonymous,
      reporter_name,
      reporter_email,
      reporter_whatsapp,
      service_type,
      incident_time,
      description,
      custom_field_data
    } = req.body;

    // Generate tracking ID
    const tracking_id = await generateTrackingId();

    // Create complaint
    const complaint = await Complaint.create({
      tracking_id,
      is_anonymous,
      reporter_name: is_anonymous ? null : reporter_name,
      reporter_email,
      reporter_whatsapp,
      service_type,
      incident_time,
      description,
      custom_field_data
    });

    // Create initial history entry
    await ComplaintHistory.create({
      complaint_id: complaint.id,
      user_name: is_anonymous ? 'Pelapor Anonim' : (reporter_name || 'Pelapor'),
      user_role: 'public',
      action: 'Pengaduan dibuat',
      notes: 'Pengaduan baru telah dibuat',
      new_status: 'Baru'
    });

    res.status(201).json({
      success: true,
      message: 'Pengaduan berhasil dibuat',
      data: {
        complaint,
        tracking_id
      }
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all complaints with pagination and filters
const getComplaints = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      service_type,
      priority,
      search,
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) whereClause.status = status;
    if (service_type) whereClause.service_type = service_type;
    if (priority) whereClause.priority = priority;
    if (search) {
      whereClause[Op.or] = [
        { tracking_id: { [Op.like]: `%${search}%` } },
        { reporter_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Role-based filtering
    if (req.user.role === 'agent') {
      whereClause.assigned_agent_id = req.user.id;
    } else if (req.user.role === 'supervisor') {
      whereClause[Op.or] = [
        { supervisor_id: req.user.id },
        { assigned_agent_id: { [Op.in]: await getAgentIdsBySupervisor(req.user.id) } }
      ];
    }

    const { count, rows: complaints } = await Complaint.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignedAgent',
          attributes: ['id', 'name', 'username']
        },
        {
          model: User,
          as: 'supervisor',
          attributes: ['id', 'name', 'username']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order.toUpperCase()]]
    });

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedAgent',
          attributes: ['id', 'name', 'username']
        },
        {
          model: User,
          as: 'supervisor',
          attributes: ['id', 'name', 'username']
        },
        {
          model: ComplaintHistory,
          as: 'history',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Pengaduan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update complaint
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Pengaduan tidak ditemukan'
      });
    }

    // Check permissions
    if (!canUpdateComplaint(req.user, complaint)) {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki izin untuk mengupdate pengaduan ini'
      });
    }

    const oldStatus = complaint.status;
    await complaint.update(updateData);

    // Create history entry if status changed
    if (updateData.status && updateData.status !== oldStatus) {
      await ComplaintHistory.create({
        complaint_id: complaint.id,
        user_id: req.user.id,
        user_name: req.user.name,
        user_role: req.user.role,
        action: `Status diubah dari "${oldStatus}" ke "${updateData.status}"`,
        old_status: oldStatus,
        new_status: updateData.status,
        notes: updateData.notes
      });
    }

    res.json({
      success: true,
      message: 'Pengaduan berhasil diupdate',
      data: complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Assign complaint to agent
const assignComplaint = async (req, res) => {
  try {
    const { complaint_id, agent_id } = req.body;

    const complaint = await Complaint.findByPk(complaint_id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Pengaduan tidak ditemukan'
      });
    }

    const agent = await User.findByPk(agent_id);
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({
        success: false,
        message: 'Agent tidak valid'
      });
    }

    const oldAgentId = complaint.assigned_agent_id;
    await complaint.update({ 
      assigned_agent_id: agent_id,
      status: 'Dalam Proses'
    });

    // Create history entry
    await ComplaintHistory.create({
      complaint_id: complaint.id,
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: `Pengaduan ditugaskan ke ${agent.name}`,
      assigned_to_agent_id: agent_id,
      assigned_to_agent_name: agent.name,
      old_status: 'Baru',
      new_status: 'Dalam Proses'
    });

    res.json({
      success: true,
      message: 'Pengaduan berhasil ditugaskan',
      data: {
        complaint_id,
        assigned_agent: agent.name
      }
    });
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get complaint by tracking ID (public)
const getComplaintByTrackingId = async (req, res) => {
  try {
    const { tracking_id } = req.params;

    const complaint = await Complaint.findOne({
      where: { tracking_id },
      include: [
        {
          model: ComplaintHistory,
          as: 'history',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Pengaduan tidak ditemukan'
      });
    }

    // Only return public data
    const publicData = {
      id: complaint.id,
      tracking_id: complaint.tracking_id,
      service_type: complaint.service_type,
      status: complaint.status,
      created_at: complaint.created_at,
      updated_at: complaint.updated_at,
      history: complaint.history
    };

    res.json({
      success: true,
      data: publicData
    });
  } catch (error) {
    console.error('Get complaint by tracking ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper functions
const canUpdateComplaint = (user, complaint) => {
  if (user.role === 'admin') return true;
  if (user.role === 'supervisor' && complaint.supervisor_id === user.id) return true;
  if (user.role === 'agent' && complaint.assigned_agent_id === user.id) return true;
  return false;
};

const getAgentIdsBySupervisor = async (supervisorId) => {
  const agents = await User.findAll({
    where: { 
      role: 'agent',
      is_active: true
    },
    attributes: ['id']
  });
  return agents.map(agent => agent.id);
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  assignComplaint,
  getComplaintByTrackingId
}; 