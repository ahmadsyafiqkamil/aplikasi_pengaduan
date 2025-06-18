
const Report = require('../models/Report');

const getAllReports = async (req, res) => {
    try {
        let whereClause = {};
        if (req.user.role === 'agent') {
            whereClause.assignedTo = req.user.id;
        } else if (req.user.role === 'supervisor') {
            whereClause.status = 'open';
        }
        const reports = await Report.findAll({ where: whereClause });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

const createReport = async (req, res) => {
    try {
        const { title, description } = req.body;
        const report = await Report.create({
            title,
            description,
            userId: req.user.id
        });
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create report' });
    }
};

const assignReport = async (req, res) => {
    try {
        const { reportId, agentId } = req.body;
        const report = await Report.findByPk(reportId);
        if (!report) return res.status(404).json({ error: 'Report not found' });

        report.assignedTo = agentId;
        await report.save();

        res.json({ message: 'Assigned successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Assignment failed' });
    }
};

module.exports = { getAllReports, createReport, assignReport };
