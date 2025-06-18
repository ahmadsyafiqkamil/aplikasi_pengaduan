import React, { useState, useEffect } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { useAuth } from '../../hooks/useAuth';
import { Complaint, ComplaintStatus, ComplaintAttachment, User } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Alert from '../common/Alert';
import ComplaintDetailsView from '../shared/ComplaintDetailsView';
import ComplaintHistoryView from '../shared/ComplaintHistoryView'; 
import { getMimeType, fileToBase64 } from '../../utils/helpers';

interface ComplaintFollowUpModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
}

const ComplaintFollowUpModal: React.FC<ComplaintFollowUpModalProps> = ({ complaint, isOpen, onClose }) => {
  const { requestComplaintStatusChange, addNoteToComplaint } = useComplaints();
  const { loggedInUser, users } = useAuth(); 

  const [targetStatus, setTargetStatus] = useState<ComplaintStatus | 'UPDATE_CATATAN'>('UPDATE_CATATAN');
  const [followUpNotes, setFollowUpNotes] = useState<string>(''); 
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && complaint) {
        setTargetStatus(complaint.status === ComplaintStatus.DIPROSES ? 'UPDATE_CATATAN' : complaint.status);
        setFollowUpNotes(''); 
        setAttachment(null);
        setAttachmentPreview(null);
        setError(null);
    }
  }, [complaint, isOpen]);

  const handleAttachmentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      if (file.type.startsWith('image/')) {
        const previewUrl = await fileToBase64(file);
        setAttachmentPreview(previewUrl);
      } else {
        setAttachmentPreview(null); 
      }
    } else {
      setAttachment(null);
      setAttachmentPreview(null);
    }
  };

  const handleSubmitFollowUp = async () => {
    if (!loggedInUser) {
      setError("User tidak terautentikasi.");
      return;
    }
    if (!followUpNotes.trim()) {
      setError("Catatan tindak lanjut wajib diisi.");
      return;
    }
    
    setError(null);
    setIsLoading(true);

    let complaintAttachment: ComplaintAttachment | undefined = undefined;
    if (attachment) {
        try {
            const dataUrl = await fileToBase64(attachment);
            complaintAttachment = {
                id: `agent-att-${Date.now()}`,
                fileName: attachment.name,
                fileType: attachment.type || getMimeType(attachment.name),
                fileDataUrl: dataUrl,
            };
        } catch (e) {
            setError("Gagal memproses file lampiran.");
            setIsLoading(false);
            return;
        }
    }

    try {
      if (targetStatus === ComplaintStatus.SELESAI || targetStatus === ComplaintStatus.DITOLAK) {
        await requestComplaintStatusChange(complaint.id, loggedInUser, targetStatus, followUpNotes, complaintAttachment);
      } else { 
        await addNoteToComplaint(complaint.id, loggedInUser, followUpNotes, "Agent menambahkan catatan tindak lanjut");
      }
      onClose(); 
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui pengaduan.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const canTakeAction = complaint.status === ComplaintStatus.DIPROSES;

  const followUpModalFooter = (
    <>
      <Button variant="outline" onClick={onClose}>Tutup</Button>
      {canTakeAction && (
        <Button variant="primary" onClick={handleSubmitFollowUp} isLoading={isLoading}>
          {targetStatus === 'UPDATE_CATATAN' 
              ? 'Simpan Catatan Tindak Lanjut' 
              : `Ajukan Status ${targetStatus === ComplaintStatus.SELESAI ? 'Selesai' : 'Ditolak'}`
          }
        </Button>
      )}
    </>
  );

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={`Tindak Lanjut Pengaduan: ${complaint.trackingId}`} 
        size="xl"
        footer={followUpModalFooter}
    >
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Removed max-h and overflow */}
        {/* Left Column: Details & History */}
        <div className="space-y-4">
            <div>
                <h4 className="text-lg font-semibold mb-2 text-gray-700 border-b pb-1">Detail Pengaduan</h4>
                <ComplaintDetailsView complaint={complaint} showFullDetails={false} showAgentRequestInfo={false} />

                {complaint.status === ComplaintStatus.DIPROSES && complaint.supervisorReviewNotes && complaint.requestedStatusChange === undefined && ( // Show only if previous request was rejected and now it's back to DIPROSES
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm font-semibold text-red-700">Catatan Penolakan Supervisor sebelumnya:</p>
                        <p className="text-sm text-red-600 italic mt-1">{complaint.supervisorReviewNotes}</p>
                    </div>
                )}
            </div>
             <div>
                <h4 className="text-lg font-semibold mb-2 text-gray-700 border-b pb-1 mt-3">Histori Tindak Lanjut</h4>
                <ComplaintHistoryView history={complaint.history} users={users} />
            </div>
        </div>

        {/* Right Column: Agent Actions */}
        <div>
            <h4 className="text-lg font-semibold mb-2 text-gray-700 border-b pb-1">Area Tindak Lanjut</h4>
            {complaint.status === ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                    Pengajuan perubahan status ke "{complaint.requestedStatusChange}" sedang menunggu persetujuan Supervisor.
                    <p className="mt-1 italic">Catatan Anda saat pengajuan: {complaint.statusChangeRequestNotes}</p>
                </div>
            )}
            {(complaint.status === ComplaintStatus.SELESAI || complaint.status === ComplaintStatus.DITOLAK) && (
                 <div className="p-4 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                    Pengaduan ini telah <span className="font-semibold">{complaint.status}</span>.
                    <p className="mt-1 italic">Catatan akhir: {complaint.supervisorReviewNotes || complaint.statusChangeRequestNotes || complaint.agentFollowUpNotes}</p>
                 </div>
            )}

            {canTakeAction && (
            <>
                <Select
                    label="Pilih Tindakan/Status Berikutnya:"
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as ComplaintStatus | 'UPDATE_CATATAN')}
                    options={[
                        { value: 'UPDATE_CATATAN', label: 'Dalam Proses (Hanya Update Catatan)' },
                        { value: ComplaintStatus.SELESAI, label: 'Selesai (Ajukan Persetujuan ke Supervisor)' },
                        { value: ComplaintStatus.DITOLAK, label: 'Ditolak (Ajukan Persetujuan ke Supervisor)' },
                    ]}
                    containerClassName="mb-3"
                />
                <Textarea
                    label="Catatan Tindak Lanjut Baru (Wajib Diisi)"
                    value={followUpNotes} 
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    rows={8} 
                    placeholder="Jelaskan tindakan yang telah dilakukan, progres, atau alasan pengajuan status untuk tindak lanjut ini..."
                    required
                    containerClassName="mb-3"
                />
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Dokumentasi Tindak Lanjut Baru (Opsional)</label>
                    <input
                        type="file"
                        onChange={handleAttachmentFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    {attachmentPreview && <img src={attachmentPreview} alt="Preview" className="mt-2 max-h-32 rounded object-contain"/>}
                    {attachment && !attachmentPreview && <p className="text-xs mt-1 text-gray-500">{attachment.name}</p>}
                </div>
            </>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default ComplaintFollowUpModal;