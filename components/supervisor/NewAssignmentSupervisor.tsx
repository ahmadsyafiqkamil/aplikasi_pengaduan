import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { useAuth } from '../../hooks/useAuth';
import { Complaint, ComplaintStatus, UserRole, User, ServiceType } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Alert from '../common/Alert';
import { formatDate } from '../../utils/helpers';
import ComplaintDetailsView from '../shared/ComplaintDetailsView';

const NewAssignmentSupervisor: React.FC = () => {
  const { complaints, assignAgentToComplaint, updateComplaint } = useComplaints();
  const { loggedInUser, users } = useAuth();
  
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [supervisorNotes, setSupervisorNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const supervisorServiceTypes = loggedInUser?.serviceTypesHandled || [];

  const unassignedComplaints = useMemo(() => {
    return complaints.filter(c => 
      supervisorServiceTypes.includes(c.serviceType) &&
      (c.status === ComplaintStatus.VERIFIKASI || c.status === ComplaintStatus.BARU || (c.status === ComplaintStatus.DIPROSES && !c.assignedAgentId))
    ).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [complaints, supervisorServiceTypes]);

  const availableAgents = useMemo(() => {
    if (!selectedComplaint) return [];
    return users.filter(u => 
      u.role === UserRole.AGENT && 
      u.serviceTypesHandled?.includes(selectedComplaint.serviceType)
    );
  }, [users, selectedComplaint]);

  const handleOpenAssignModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setSelectedAgentId('');
    setSupervisorNotes('');
    setError(null);
  };

  const handleAssignAgent = async () => {
    if (!selectedComplaint || !selectedAgentId || !loggedInUser) {
      setError("Pengaduan dan Agent harus dipilih.");
      return;
    }
    setError(null);
    try {
      const agentToAssign = users.find(u => u.id === selectedAgentId);
      let actionDescription = `Pengaduan ditugaskan ke Agent ${agentToAssign?.name || 'N/A'}.`;
      // Pass supervisorNotes as specificNoteForHistory
      await updateComplaint(
        selectedComplaint.id,
        {
          assignedAgentId: selectedAgentId,
          status: ComplaintStatus.DIPROSES,
          supervisorId: loggedInUser.id,
          // supervisorReviewNotes: supervisorNotes.trim() || undefined // Only if it's a review note
        },
        loggedInUser,
        actionDescription,
        supervisorNotes.trim() || undefined // Pass supervisor's notes for history if any
      );
      
      setSelectedComplaint(null); // Close modal
    } catch (err: any) {
      setError(err.message || "Gagal menugaskan agent.");
    }
  };

  const handleRejectComplaint = async () => {
    if (!selectedComplaint || !loggedInUser) {
      setError("Pengaduan harus dipilih.");
      return;
    }
    if (!supervisorNotes.trim()) {
      setError("Alasan penolakan wajib diisi jika menolak pengaduan secara langsung.");
      return;
    }
    setError(null);
    try {
      const updates: Partial<Complaint> = {
        status: ComplaintStatus.DITOLAK,
        supervisorReviewNotes: supervisorNotes.trim(),
        assignedAgentId: undefined,
        assignedAgentName: undefined,
      };
      const actionDescription = `Pengaduan ditolak langsung oleh Supervisor.`;
      // Pass supervisorNotes as specificNoteForHistory
      await updateComplaint(selectedComplaint.id, updates, loggedInUser, actionDescription, supervisorNotes.trim());
      setSelectedComplaint(null); // Close modal
    } catch (err: any) {
      setError(err.message || "Gagal menolak pengaduan.");
    }
  };

  const modalFooter = selectedComplaint ? (
    <>
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-3 w-full"/>}
      <div className="flex w-full justify-end space-x-2">
          <Button variant="outline" onClick={() => setSelectedComplaint(null)}>Batal</Button>
          <Button variant="danger" onClick={handleRejectComplaint}>
              Tolak Langsung Pengaduan Ini
          </Button>
          <Button variant="primary" onClick={handleAssignAgent} disabled={!selectedAgentId || availableAgents.length === 0}>
              Tugaskan ke Agent Ini
          </Button>
      </div>
    </>
  ) : null;


  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Daftar Pengaduan Menunggu Penugasan/Verifikasi Awal</h3>
      {unassignedComplaints.length === 0 && <p className="text-gray-500">Tidak ada pengaduan baru yang perlu ditugaskan/diverifikasi untuk layanan Anda saat ini.</p>}
      
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Laporan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelapor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layanan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Masuk</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {unassignedComplaints.map(complaint => (
              <tr key={complaint.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">{complaint.trackingId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{complaint.isAnonymous ? 'Anonim' : complaint.reporterName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.serviceType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(complaint.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button onClick={() => handleOpenAssignModal(complaint)} variant="primary" size="sm">
                    Verifikasi & Tindak Lanjut
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedComplaint && (
        <Modal 
            isOpen={!!selectedComplaint} 
            onClose={() => setSelectedComplaint(null)} 
            title={`Verifikasi & Tindak Lanjut Pengaduan: ${selectedComplaint.trackingId}`} 
            size="xl"
            footer={modalFooter}
        >
            {/* Konten utama modal yang akan scroll jika perlu, tanpa max-h sendiri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Informasi Pengaduan</h4>
                    <ComplaintDetailsView complaint={selectedComplaint} showFullDetails /> 
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Tindakan Supervisor</h4>
                    <Textarea
                        label="Catatan/Alasan Supervisor (opsional jika menugaskan, wajib diisi jika menolak langsung)"
                        value={supervisorNotes}
                        onChange={(e) => setSupervisorNotes(e.target.value)}
                        rows={6}
                        placeholder="Berikan catatan atau alasan Anda di sini..."
                        className="mb-4"
                    />
                    <h4 className="text-md font-semibold mb-2 text-gray-700">Pilih Agent untuk Ditugaskan (jika tidak ditolak):</h4>
                    {availableAgents.length > 0 ? (
                        <Select
                            label="Agent Tersedia"
                            value={selectedAgentId}
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            options={availableAgents.map(agent => ({ value: agent.id, label: `${agent.name} (${agent.serviceTypesHandled?.join(', ')})` }))}
                            placeholder="-- Pilih Agent --"
                        />
                    ) : (
                        <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded-md">Tidak ada agent yang terdaftar untuk jenis layanan ini ({selectedComplaint.serviceType}). Pengaduan tidak dapat ditugaskan ke agent.</p>
                    )}
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default NewAssignmentSupervisor;