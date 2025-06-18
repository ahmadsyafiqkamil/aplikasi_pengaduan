
import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { useComplaints } from '../hooks/useComplaints';
import { Complaint, ComplaintHistoryEntry, UserRole } from '../types';
import ComplaintDetailsView from '../components/shared/ComplaintDetailsView';
import ComplaintHistoryView from '../components/shared/ComplaintHistoryView'; // Assuming users prop can be empty for public view
import { useAuth } from '../hooks/useAuth'; // To pass users (empty for public) to history view

const TrackComplaintPage: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getComplaintByTrackingId } = useComplaints();
  const { users } = useAuth(); // Get all users, but will be filtered or not used for sensitive data

  const handleTrackComplaint = () => {
    if (!trackingId.trim()) {
      setError("ID Laporan tidak boleh kosong.");
      setComplaint(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setComplaint(null);

    // Simulate API call delay
    setTimeout(() => {
      const foundComplaint = getComplaintByTrackingId(trackingId.trim());
      if (foundComplaint) {
        setComplaint(foundComplaint);
      } else {
        setError("ID Laporan tidak ditemukan atau tidak valid. Mohon periksa kembali.");
      }
      setIsLoading(false);
    }, 500);
  };

  const handleSearchAgain = () => {
    setTrackingId('');
    setComplaint(null);
    setError(null);
  };

  // Filter history for public view: only show entries by PUBLIC or generic system updates for status changes.
  // Or, more simply for now, show all history but be mindful of `action` strings in `useComplaints`.
  // The current `ComplaintHistoryView` shows names if available. For a truly public view, one might create
  // a version that anonymizes internal user actions or uses generic labels.
  // For this iteration, we'll pass an empty array for `users` to `ComplaintHistoryView` if we want to hide internal names,
  // or rely on `entry.userName` which is set by `addHistoryEntry`.
  // Let's show history entries whose actors are 'Pelapor', 'Pelapor Anonim', or system-like generic actions.
  const getPublicHistory = (history: ComplaintHistoryEntry[]): ComplaintHistoryEntry[] => {
    return history.filter(entry => {
        // Show if action by public user or if it's a significant status change by the system/staff (but action string should be generic)
        return entry.userRole === UserRole.PUBLIC || 
               entry.userName === "Sistem" || 
               !entry.userRole || // Some generic system actions might not have a role
               (entry.action.includes("Status Diubah") || entry.action.includes("Pengaduan Selesai") || entry.action.includes("Pengaduan Ditolak"));
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // ensure it's still sorted if filtering changes order
  };


  return (
    <PageWrapper title="Lacak Status Pengaduan Anda">
      {!complaint && (
        <div className="max-w-lg mx-auto">
          <p className="text-gray-600 mb-4">
            Masukkan ID Laporan yang Anda terima saat membuat pengaduan untuk melihat status terkini.
          </p>
          <Input
            label="ID Laporan Anda"
            id="trackingId"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Contoh: PGDN-XXXXXX-YYYY"
            containerClassName="mb-2"
            onKeyDown={(e) => { if (e.key === 'Enter') handleTrackComplaint();}}
          />
          {error && <Alert type="error" message={error} onClose={() => setError(null)} className="my-3"/>}
          <Button onClick={handleTrackComplaint} isLoading={isLoading} variant="primary" className="w-full">
            Lacak Pengaduan
          </Button>
        </div>
      )}

      {complaint && (
        <div>
          <Button onClick={handleSearchAgain} variant="outline" className="mb-6">
            &larr; Lacak ID Lain
          </Button>
          <h3 className="text-2xl font-semibold text-primary mb-4">Detail Pengaduan: {complaint.trackingId}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Informasi Utama</h4>
                <ComplaintDetailsView complaint={complaint} showFullDetails={false} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                 <h4 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Histori Status</h4>
                <ComplaintHistoryView history={getPublicHistory(complaint.history)} users={users} />
            </div>
          </div>

           {/* Displaying supervisor/agent notes if complaint is resolved */}
           {(complaint.status === 'Selesai' || complaint.status === 'Ditolak') && (complaint.supervisorReviewNotes || complaint.agentFollowUpNotes) && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Catatan Penyelesaian / Tindak Lanjut Akhir</h4>
                {complaint.supervisorReviewNotes && <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Catatan Supervisor:</span> {complaint.supervisorReviewNotes}</p>}
                {!complaint.supervisorReviewNotes && complaint.agentFollowUpNotes && <p className="text-sm text-gray-600"><span className="font-semibold">Catatan Petugas:</span> {complaint.agentFollowUpNotes}</p>}
            </div>
           )}

        </div>
      )}
    </PageWrapper>
  );
};

export default TrackComplaintPage;
