import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { useAuth } from '../../hooks/useAuth';
import { Complaint, ComplaintStatus, User } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Textarea from '../common/Textarea';
import Alert from '../common/Alert';
import { formatDate } from '../../utils/helpers';
import ComplaintDetailsView from '../shared/ComplaintDetailsView';

const StatusApprovalSupervisor: React.FC = () => {
  const { complaints, approveOrRejectStatusChange } = useComplaints();
  const { loggedInUser } = useAuth();
  
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [supervisorNotes, setSupervisorNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const supervisorServiceTypes = loggedInUser?.serviceTypesHandled || [];

  const complaintsAwaitingApproval = useMemo(() => {
    return complaints.filter(c => 
      supervisorServiceTypes.includes(c.serviceType) &&
      c.status === ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV &&
      c.supervisorId === loggedInUser?.id 
    ).sort((a,b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
  }, [complaints, supervisorServiceTypes, loggedInUser]);

  const handleOpenReviewModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setSupervisorNotes('');
    setError(null);
  };

  const handleApprovalAction = async (isApproved: boolean) => {
    if (!selectedComplaint || !loggedInUser) return;
    if (!isApproved && !supervisorNotes.trim()) {
      setError("Catatan Supervisor wajib diisi jika permintaan ditolak.");
      return;
    }
    setError(null);
    try {
      await approveOrRejectStatusChange(selectedComplaint.id, loggedInUser, isApproved, supervisorNotes);
      setSelectedComplaint(null); 
    } catch (err: any) {
      setError(err.message || `Gagal ${isApproved ? 'menyetujui' : 'menolak'} status.`);
    }
  };

  const approvalModalFooter = selectedComplaint ? (
    <>
      <Button variant="outline" onClick={() => setSelectedComplaint(null)}>Batal</Button>
      <Button variant="danger" onClick={() => handleApprovalAction(false)} disabled={!supervisorNotes.trim() && false}>
          Tolak Permintaan
      </Button>
        <Button variant="success" onClick={() => handleApprovalAction(true)}>
          Setujui Permintaan
      </Button>
    </>
  ) : null;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Daftar Pengaduan Menunggu Persetujuan Status</h3>
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-3"/>}
      {complaintsAwaitingApproval.length === 0 && <p className="text-gray-500">Tidak ada pengaduan yang menunggu persetujuan status untuk layanan Anda.</p>}
      
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Laporan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diajukan Ke</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Update Agent</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {complaintsAwaitingApproval.map(complaint => (
              <tr key={complaint.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">{complaint.trackingId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{complaint.assignedAgentName || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{complaint.requestedStatusChange}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(complaint.updatedAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button onClick={() => handleOpenReviewModal(complaint)} variant="primary" size="sm">
                    Tinjau Permintaan
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
            title={`Tinjau Perubahan Status: ${selectedComplaint.trackingId}`} 
            size="lg"
            footer={approvalModalFooter}
        >
            {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-3"/>}
            <ComplaintDetailsView complaint={selectedComplaint} showAgentRequestInfo />
            <div className="mt-6 border-t pt-4">
                <h4 className="text-md font-semibold mb-2 text-gray-700">Catatan Supervisor:</h4>
                <Textarea
                    label="Catatan Supervisor (wajib jika menolak)"
                    value={supervisorNotes}
                    onChange={(e) => setSupervisorNotes(e.target.value)}
                    rows={6} // Increased rows
                    placeholder="Berikan catatan Anda untuk Agent..."
                />
            </div>
        </Modal>
      )}
    </div>
  );
};

export default StatusApprovalSupervisor;