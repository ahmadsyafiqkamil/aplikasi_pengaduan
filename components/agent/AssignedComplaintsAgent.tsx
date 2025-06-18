
import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { useAuth } from '../../hooks/useAuth';
import { Complaint, ComplaintStatus, ComplaintAttachment } from '../../types';
import Button from '../common/Button';
import { formatDate, getMimeType, fileToBase64 } from '../../utils/helpers';
import ComplaintFollowUpModal from './ComplaintFollowUpModal';
import { COMPLAINT_STATUS_OPTIONS } from '../../constants';


const AssignedComplaintsAgent: React.FC = () => {
  const { complaints } = useComplaints();
  const { loggedInUser } = useAuth();
  
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const assignedComplaints = useMemo(() => {
    if (!loggedInUser) return [];
    return complaints.filter(c => c.assignedAgentId === loggedInUser.id)
      .sort((a,b) => {
        // Prioritize active statuses
        const statusOrder = (status: ComplaintStatus) => {
            if (status === ComplaintStatus.DIPROSES) return 1;
            if (status === ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV) return 2;
            return 3; // Selesai, Ditolak
        }
        if (statusOrder(a.status) !== statusOrder(b.status)) {
            return statusOrder(a.status) - statusOrder(b.status);
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [complaints, loggedInUser]);

  const handleOpenFollowUpModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };
  
  const getActionButtonText = (complaint: Complaint): string => {
    if (complaint.status === ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV) return "Menunggu Persetujuan";
    if (complaint.status === ComplaintStatus.SELESAI || complaint.status === ComplaintStatus.DITOLAK) return "Lihat Detail";
    return "Lihat & Tindak Lanjuti";
  }


  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Pengaduan Ditugaskan Kepada Anda</h3>
      {assignedComplaints.length === 0 && <p className="text-gray-500">Tidak ada pengaduan yang saat ini ditugaskan kepada Anda.</p>}
      
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Laporan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelapor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layanan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Update Terakhir</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignedComplaints.map(complaint => (
              <tr key={complaint.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">{complaint.trackingId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{complaint.isAnonymous ? 'Anonim' : complaint.reporterName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.serviceType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${COMPLAINT_STATUS_OPTIONS.find(s=>s.value === complaint.status)?.color || 'bg-gray-100 text-gray-800'}`}>
                        {complaint.status}
                         {complaint.status === ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV && ` (${complaint.requestedStatusChange})`}
                    </span>
                   
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(complaint.updatedAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button 
                    onClick={() => handleOpenFollowUpModal(complaint)} 
                    variant={complaint.status === ComplaintStatus.DIPROSES ? "primary" : "outline"} 
                    size="sm"
                    disabled={complaint.status === ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV && complaint.requestedStatusChange === ComplaintStatus.SELESAI} // Example condition
                  >
                    {getActionButtonText(complaint)}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedComplaint && (
        <ComplaintFollowUpModal
          complaint={selectedComplaint}
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};

export default AssignedComplaintsAgent;
