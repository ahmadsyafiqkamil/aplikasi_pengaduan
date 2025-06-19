import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, ComplaintHistoryEntry, User, UserRole, StatsData, AgentStat, ComplaintAttachment, ServiceType } from '../types';
import { useAuth } from './useAuth';
import { reportsAPI } from '../utils/api';

interface ComplaintsContextType {
  complaints: Complaint[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  getComplaintById: (id: string) => Complaint | undefined;
  getComplaintByTrackingId: (trackingId: string) => Complaint | undefined;
  addComplaint: (data: any) => Promise<Complaint>;
  updateComplaint: (
    id: string, 
    updates: Partial<Complaint>, 
    actor: User | { name: string, role: UserRole, id?: string }, 
    actionDescription: string,
    specificNoteForHistory?: string
  ) => Promise<Complaint | null>;
  deleteComplaint: (id: string) => Promise<boolean>;
  getStats: (users: User[]) => StatsData;
  assignAgentToComplaint: (complaintId: string, agentId: string, supervisor: User) => Promise<Complaint | null>;
  requestComplaintStatusChange: (
    complaintId: string, 
    agent: User, 
    newStatus: ComplaintStatus.SELESAI | ComplaintStatus.DITOLAK, 
    notes: string, 
    attachment?: ComplaintAttachment
  ) => Promise<Complaint | null>;
  approveOrRejectStatusChange: (
    complaintId: string,
    supervisor: User,
    isApproved: boolean,
    supervisorNotes: string
  ) => Promise<Complaint | null>;
   addNoteToComplaint: (complaintId: string, actor: User, note: string, actionPrefix?: string) => Promise<Complaint | null>;
  fetchComplaints: () => Promise<void>;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export const ComplaintsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loggedInUser } = useAuth();

  // Fetch all complaints
  const fetchComplaints = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportsAPI.getAll();
      if (data.success && data.data && Array.isArray(data.data.complaints)) {
        setComplaints(data.data.complaints);
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  };

  // Load complaints on mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  const getComplaintById = (id: string): Complaint | undefined => {
    return complaints.find(c => c.id === id);
  };

  const getComplaintByTrackingId = (trackingId: string): Complaint | undefined => {
    return complaints.find(c => c.trackingId === trackingId);
  };

  const addComplaint = async (data: any): Promise<Complaint> => {
    setError(null);

    try {
      const response = await reportsAPI.create(data);

      if (response.success) {
        const newComplaint = response.data;
        setComplaints(prev => [newComplaint, ...prev]);
        return newComplaint;
      } else {
        throw new Error(response.message || 'Failed to create complaint');
      }
    } catch (error) {
      console.error('Failed to add complaint:', error);
      setError(error instanceof Error ? error.message : 'Failed to create complaint');
      throw error;
    }
  };

  const updateComplaint = async (
    id: string, 
    updates: Partial<Complaint>, 
    actor: User | { name: string, role: UserRole, id?: string }, 
    actionDescription: string,
    specificNoteForHistory?: string
    ): Promise<Complaint | null> => {
    setError(null);

    try {
      const response = await reportsAPI.update(id, {
        ...updates,
        actor,
        actionDescription,
        specificNoteForHistory
      });

      if (response.success) {
        const updatedComplaint = response.data;
        setComplaints(prev => 
          prev.map(c => c.id === id ? updatedComplaint : c)
          );
          return updatedComplaint;
      } else {
        throw new Error(response.message || 'Failed to update complaint');
      }
    } catch (error) {
      console.error('Failed to update complaint:', error);
      setError(error instanceof Error ? error.message : 'Failed to update complaint');
      return null;
    }
  };
  
  const deleteComplaint = async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await reportsAPI.delete(id);

      if (response.success) {
    setComplaints(prev => prev.filter(c => c.id !== id));
    return true;
      } else {
        throw new Error(response.message || 'Failed to delete complaint');
      }
    } catch (error) {
      console.error('Failed to delete complaint:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete complaint');
      return false;
    }
  };

  const assignAgentToComplaint = async (complaintId: string, agentId: string, supervisor: User): Promise<Complaint | null> => {
    return updateComplaint(
      complaintId,
      {
        assignedAgentId: agentId, 
        status: ComplaintStatus.DIPROSES, 
        supervisorId: supervisor.id,
      },
      supervisor,
      `Pengaduan ditugaskan ke Agent.`
    );
  };

  const requestComplaintStatusChange = async (
    complaintId: string, 
    agent: User, 
    newStatus: ComplaintStatus.SELESAI | ComplaintStatus.DITOLAK, 
    notes: string, 
    attachment?: ComplaintAttachment
  ): Promise<Complaint | null> => {
    return updateComplaint(
      complaintId,
      { 
        status: newStatus,
        agentFollowUpNotes: notes,
        ...(attachment && { attachment })
      },
      agent,
      `Status pengaduan diubah menjadi ${newStatus}.`
    );
  };

  const approveOrRejectStatusChange = async (
    complaintId: string,
    supervisor: User,
    isApproved: boolean,
    supervisorNotes: string
  ): Promise<Complaint | null> => {
    const action = isApproved ? 'disetujui' : 'ditolak';
    return updateComplaint(
      complaintId,
      {
      supervisorReviewNotes: supervisorNotes, 
        status: isApproved ? ComplaintStatus.SELESAI : ComplaintStatus.DITOLAK
      },
      supervisor,
      `Perubahan status pengaduan ${action}.`
    );
  };

  const addNoteToComplaint = async (complaintId: string, actor: User, note: string, actionPrefix?: string): Promise<Complaint | null> => {
    const actionDescription = actionPrefix ? `${actionPrefix}: ${note}` : note;
    return updateComplaint(
        complaintId,
      {},
        actor,
      actionDescription
    );
  };

  const getStats = (users: User[]): StatsData => {
    // Calculate stats from complaints data
    const totalComplaints = complaints.length;
    const completedComplaints = complaints.filter(c => c.status === ComplaintStatus.SELESAI).length;
    const rejectedComplaints = complaints.filter(c => c.status === ComplaintStatus.DITOLAK).length;
    const resolvedComplaints = completedComplaints + rejectedComplaints;
    const completionRate = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;

    // Calculate average resolution time
    let totalResolutionTimeDays = 0;
    let resolvedCountForAvg = 0;
    complaints.forEach(c => {
      if (c.status === ComplaintStatus.SELESAI || c.status === ComplaintStatus.DITOLAK) {
        const createTime = new Date(c.createdAt).getTime();
        const resolveTime = new Date(c.updatedAt).getTime(); 
        totalResolutionTimeDays += (resolveTime - createTime) / (1000 * 60 * 60 * 24);
        resolvedCountForAvg++;
      }
    });
    const averageResolutionTimeDays = resolvedCountForAvg > 0 ? totalResolutionTimeDays / resolvedCountForAvg : 0;

    // Status distribution
    const statusDistribution = Object.values(ComplaintStatus).map(status => ({
      status,
      count: complaints.filter(c => c.status === status).length,
    }));

    // Service type distribution
    const serviceTypeDistribution = Object.values(ServiceType).map(st => ({
      serviceType: st,
      count: complaints.filter(c => c.serviceType === st).length,
    }));

    // Agent performance stats
    const agentPerformance: AgentStat[] = users
      .filter(user => user.role === UserRole.AGENT)
      .map(agent => {
      const assignedToAgent = complaints.filter(c => c.assignedAgentId === agent.id);
      const completedByAgent = assignedToAgent.filter(c => c.status === ComplaintStatus.SELESAI).length;
        const inProgressByAgent = assignedToAgent.filter(c => 
          c.status === ComplaintStatus.DIPROSES || 
          c.status === ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV
        ).length;
      
        // Calculate agent's average resolution time
      let agentTotalResolutionTimeDays = 0;
      let agentResolvedCount = 0;
      assignedToAgent.forEach(c => {
        if (c.status === ComplaintStatus.SELESAI) { 
            agentTotalResolutionTimeDays += (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          agentResolvedCount++;
        }
      });
      const avgAgentTimeDays = agentResolvedCount > 0 ? agentTotalResolutionTimeDays / agentResolvedCount : 0;

      return {
        agentId: agent.id,
        agentName: agent.name,
        totalAssigned: assignedToAgent.length,
        totalCompleted: completedByAgent,
        totalInProgress: inProgressByAgent,
        avgResolutionTimeDays: avgAgentTimeDays,
      };
    });

    return {
      totalComplaints,
      completionRate,
      averageResolutionTimeDays,
      statusDistribution,
      serviceTypeDistribution,
      agentPerformance,
      lastCalculated: new Date().toLocaleString('id-ID'),
    };
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ComplaintsContext.Provider value={{ 
        complaints, 
      isLoading,
      error,
      clearError,
        getComplaintById, 
        getComplaintByTrackingId, 
        addComplaint, 
        updateComplaint, 
        deleteComplaint, 
        getStats, 
        assignAgentToComplaint, 
        requestComplaintStatusChange, 
        approveOrRejectStatusChange, 
      addNoteToComplaint,
      fetchComplaints,
    }}>
      {children}
    </ComplaintsContext.Provider>
  );
};

export const useComplaints = (): ComplaintsContextType => {
  const context = useContext(ComplaintsContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintsProvider');
  }
  return context;
};
