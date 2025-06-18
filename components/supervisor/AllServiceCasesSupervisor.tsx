import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { useAuth } from '../../hooks/useAuth';
import { Complaint, ComplaintStatus } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { formatDate } from '../../utils/helpers';
import ComplaintDetailsView from '../shared/ComplaintDetailsView';
import ComplaintHistoryView from '../shared/ComplaintHistoryView';
import { COMPLAINT_STATUS_OPTIONS } from '../../constants';

const AllServiceCasesSupervisor: React.FC = () => {
  const { complaints } = useComplaints();
  const { loggedInUser, users } = useAuth();
  
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const supervisorServiceTypes = loggedInUser?.serviceTypesHandled || [];

  const allServiceCases = useMemo(() => {
    return complaints.filter(c => 
      supervisorServiceTypes.includes(c.serviceType)
    ).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [complaints, supervisorServiceTypes]);

  const handleOpenDetailsModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const detailsModalFooter = (
    <Button variant="outline" onClick={() => setSelectedComplaint(null)}>Tutup</Button>
  );

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Semua Kasus dalam Layanan Anda</h3>
      {allServiceCases.length === 0 && <p className="text-gray-500">Tidak ada pengaduan untuk layanan yang Anda supervisi.</p>}
      
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Laporan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelapor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Update Terakhir</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allServiceCases.map(complaint => (
              <tr key={complaint.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">{complaint.trackingId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{complaint.isAnonymous ? 'Anonim' : complaint.reporterName}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${COMPLAINT_STATUS_OPTIONS.find(s=>s.value === complaint.status)?.color || 'bg-gray-100 text-gray-800'}`}>
                        {complaint.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.assignedAgentName || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(complaint.updatedAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button onClick={() => handleOpenDetailsModal(complaint)} variant="outline" size="sm">
                    Lihat Detail & Histori
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
            title={`Detail Pengaduan: ${selectedComplaint.trackingId}`} 
            size="xl"
            footer={detailsModalFooter}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Removed max-h and overflow */}
                <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Informasi Pengaduan</h4>
                    <ComplaintDetailsView complaint={selectedComplaint} showFullDetails />
                </div>
                 <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Histori Pengaduan</h4>
                    <ComplaintHistoryView history={selectedComplaint.history} users={users} />
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default AllServiceCasesSupervisor;