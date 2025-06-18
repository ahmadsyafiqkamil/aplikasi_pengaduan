import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { useAuth } from '../../hooks/useAuth';
import { Complaint, ComplaintStatus, User, UserRole } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Textarea from '../common/Textarea';
import Alert from '../common/Alert';
import { formatDate } from '../../utils/helpers';
import ComplaintDetailsView from '../shared/ComplaintDetailsView';

const AgentMonitoringSupervisor: React.FC = () => {
  const { complaints, addNoteToComplaint } = useComplaints();
  const { loggedInUser, users } = useAuth();
  
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [noteToAgent, setNoteToAgent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const supervisorServiceTypes = loggedInUser?.serviceTypesHandled || [];
  const agentsUnderSupervisionIds = useMemo(() => 
    users.filter(u => u.role === UserRole.AGENT && u.serviceTypesHandled?.some(st => supervisorServiceTypes.includes(st)))
         .map(u => u.id),
    [users, supervisorServiceTypes]
  );

  const activeComplaintsByAgents = useMemo(() => {
    return complaints.filter(c => 
      c.assignedAgentId && agentsUnderSupervisionIds.includes(c.assignedAgentId) &&
      c.status === ComplaintStatus.DIPROSES 
    ).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [complaints, agentsUnderSupervisionIds]);

  const handleOpenSendNoteModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNoteToAgent('');
    setError(null);
  };

  const handleSendNote = async () => {
    if (!selectedComplaint || !noteToAgent.trim() || !loggedInUser) {
      setError("Catatan tidak boleh kosong.");
      return;
    }
    setError(null);
    try {
      await addNoteToComplaint(selectedComplaint.id, loggedInUser, noteToAgent, "Supervisor mengirim catatan/peringatan");
      setSelectedComplaint(null); 
    } catch (err: any) {
      setError(err.message || "Gagal mengirim catatan.");
    }
  };

  const sendNoteModalFooter = selectedComplaint ? (
    <>
      <Button variant="outline" onClick={() => setSelectedComplaint(null)}>Batal</Button>
      <Button variant="primary" onClick={handleSendNote} disabled={!noteToAgent.trim()}>
          Kirim Catatan
      </Button>
    </>
  ) : null;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Monitoring Pengaduan Aktif oleh Agent</h3>
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-3"/>}
      {activeComplaintsByAgents.length === 0 && <p className="text-gray-500">Tidak ada pengaduan aktif yang sedang ditangani oleh agent di bawah supervisi Anda.</p>}
      
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Laporan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelapor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Update Terakhir Agent</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeComplaintsByAgents.map(complaint => (
              <tr key={complaint.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">{complaint.trackingId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{complaint.assignedAgentName || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.isAnonymous ? 'Anonim' : complaint.reporterName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(complaint.updatedAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button onClick={() => handleOpenSendNoteModal(complaint)} variant="outline" size="sm">
                    Kirim Catatan/Peringatan
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
            title={`Kirim Catatan ke Agent untuk: ${selectedComplaint.trackingId}`} 
            size="lg"
            footer={sendNoteModalFooter}
        >
            {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-3"/>}
            <ComplaintDetailsView complaint={selectedComplaint} />
            <div className="mt-6 border-t pt-4">
                <h4 className="text-md font-semibold mb-2 text-gray-700">Isi Catatan/Peringatan untuk Agent:</h4>
                <Textarea
                    value={noteToAgent}
                    onChange={(e) => setNoteToAgent(e.target.value)}
                    rows={6} // Increased rows
                    placeholder="Tuliskan catatan atau peringatan Anda di sini..."
                    required
                />
            </div>
        </Modal>
      )}
    </div>
  );
};

export default AgentMonitoringSupervisor;