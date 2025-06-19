import React, { useState } from 'react';
import { Complaint, FormFieldType, ComplaintStatus } from '../../types'; // Added ComplaintStatus
import { formatDate } from '../../utils/helpers';
import { useAppConfig } from '../../hooks/useAppConfig';
import { useAuth } from '../../hooks/useAuth';
import { COMPLAINT_STATUS_OPTIONS } from '../../constants'; // For status color
import Button from '../common/Button'; // Added Button for copy functionality

interface ComplaintDetailsViewProps {
  complaint: Complaint;
  showFullDetails?: boolean; // For management/admin to see everything
  showAgentRequestInfo?: boolean; // To show agent's request details if any
}

const DetailItem: React.FC<{ label: string; value?: React.ReactNode; fullWidth?: boolean; className?: string; children?: React.ReactNode }> = ({ label, value, fullWidth, className, children }) => (
  <div className={`py-2 ${fullWidth ? 'sm:col-span-2' : ''} ${className || ''}`}>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    {value && <dd className="mt-1 text-sm text-gray-900 break-words">{value}</dd>}
    {children && <dd className="mt-1 text-sm text-gray-900 break-words">{children}</dd>}
    {!value && !children && <dd className="mt-1 text-sm text-gray-900 break-words">-</dd>}
  </div>
);

const CopyIcon: React.FC<{className?: string}> = ({className = "w-4 h-4"}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({className = "w-4 h-4"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);


const ComplaintDetailsView: React.FC<ComplaintDetailsViewProps> = ({ complaint, showFullDetails = false, showAgentRequestInfo = false }) => {
  if (!complaint) {
    return <div>No complaint data found.</div>;
  }
  const { config } = useAppConfig(); // To get custom field labels
  const { getUserById } = useAuth(); // To get supervisor name if needed
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);

  const statusConfig = COMPLAINT_STATUS_OPTIONS.find(s => s.value === complaint.status) || {label: complaint.status, color: 'bg-gray-100 text-gray-800'};

  const handleCopyTrackingId = () => {
    navigator.clipboard.writeText(complaint.trackingId)
      .then(() => {
        setCopiedTrackingId(true);
        setTimeout(() => setCopiedTrackingId(false), 2000); // Reset after 2 seconds
      })
      .catch(err => console.error('Gagal menyalin ID Laporan:', err));
  };

  return (
    <dl className="space-y-1">
      <DetailItem label="ID Laporan">
        <div className="flex items-center space-x-2">
          <span>{complaint.trackingId}</span>
          <Button 
            onClick={handleCopyTrackingId} 
            variant="ghost" 
            size="sm" 
            className="p-1 text-xs"
            title="Salin ID Laporan"
          >
            {copiedTrackingId ? <CheckIcon className="text-success"/> : <CopyIcon />}
            <span className="ml-1">{copiedTrackingId ? 'Tersalin!' : ''}</span>
          </Button>
        </div>
      </DetailItem>
      <DetailItem label="Status Saat Ini" value={
          <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
      }/>

      {!complaint.isAnonymous && (
        <>
          <DetailItem label="Nama Pelapor" value={complaint.reporterName} />
          {/* Email dan WhatsApp akan ditampilkan jika !showFullDetails DAN data ada */}
          {!showFullDetails && complaint.reporterEmail && <DetailItem label="Email Pelapor" value={complaint.reporterEmail} />}
          {!showFullDetails && complaint.reporterWhatsApp && <DetailItem label="Nomor WhatsApp" value={complaint.reporterWhatsApp}/>}
          {/* Email dan WhatsApp juga akan ditampilkan jika showFullDetails */}
          {showFullDetails && <DetailItem label="Email Pelapor" value={complaint.reporterEmail} />}
          {showFullDetails && <DetailItem label="WhatsApp Pelapor" value={complaint.reporterWhatsApp} />}
        </>
      )}
      {complaint.isAnonymous && <DetailItem label="Pelapor" value="Anonim" />}
      
      <DetailItem label="Jenis Layanan" value={complaint.serviceType} />
      <DetailItem label="Waktu Kejadian" value={formatDate(complaint.incidentTime)} />
      <DetailItem label="Deskripsi Pengaduan" value={<p className="whitespace-pre-wrap text-gray-800">{complaint.description}</p>} fullWidth className="pt-2 pb-3 border-t border-b my-2" />

      {complaint.customFieldData && Object.keys(complaint.customFieldData).length > 0 && (
        <div className="py-2 sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500 mb-1">Informasi Tambahan:</dt>
            {config.customFormFields.filter(f => complaint.customFieldData[f.id] && f.isVisible).map(fieldDef => (
                 <dd key={fieldDef.id} className="mt-1 text-sm text-gray-900">
                    <span className="font-semibold">{fieldDef.label}: </span> 
                    {Array.isArray(complaint.customFieldData[fieldDef.id]) 
                        ? (complaint.customFieldData[fieldDef.id] as string[]).join(', ') 
                        : complaint.customFieldData[fieldDef.id]}
                </dd>
            ))}
        </div>
      )}

      {complaint.attachments && complaint.attachments.length > 0 && (
        <div className="py-2 sm:col-span-2">
          <dt className="text-sm font-medium text-gray-500">Lampiran Pelapor:</dt>
          <dd className="mt-1 text-sm text-gray-900">
            <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
              {complaint.attachments.map((file) => (
                <li key={file.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                  <div className="w-0 flex-1 flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 003 3h4a3 3 0 003-3V7a3 3 0 00-3-3H8zm0 1.5a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5h-4A1.5 1.5 0 014 11.5V7A1.5 1.5 0 015.5 5.5H8z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 flex-1 w-0 truncate">{file.fileName}</span>
                  </div>
                  {file.fileDataUrl && (
                    <div className="ml-4 flex-shrink-0">
                        <a href={file.fileDataUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:text-primary/80">
                        Lihat/Unduh
                        </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      )}
      
      {/* Tanggal Dibuat dan Update Terakhir Sistem selalu ditampilkan */}
      <DetailItem label="Tanggal Dibuat" value={formatDate(complaint.createdAt)} />
      <DetailItem label="Update Terakhir Sistem" value={formatDate(complaint.updatedAt)} />

      {showFullDetails && (
        <>
            {complaint.assignedAgentName && <DetailItem label="Ditangani Oleh Agent" value={complaint.assignedAgentName} />}
            {complaint.supervisorId && <DetailItem label="Disupervisi Oleh" value={getUserById(complaint.supervisorId)?.name || complaint.supervisorId} />}
        </>
      )}
      
      {showFullDetails && complaint.agentFollowUpNotes && complaint.status !== ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV && (
        <DetailItem label="Catatan Terakhir Agent" value={complaint.agentFollowUpNotes} fullWidth />
      )}

      {showAgentRequestInfo && complaint.status === ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV && complaint.requestedStatusChange && (
        <div className="py-3 my-2 sm:col-span-2 bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <dt className="text-sm font-bold text-yellow-700">Agent ({complaint.assignedAgentName}) Mengajukan Perubahan Status:</dt>
            <dd className="mt-1">
                <p className="text-sm text-yellow-800"><span className="font-semibold">Status Diajukan:</span> {complaint.requestedStatusChange}</p>
                <p className="text-sm text-yellow-800 mt-1"><span className="font-semibold">Catatan Agent:</span> {complaint.statusChangeRequestNotes || '-'}</p>
                {complaint.agentUploadedAttachment && (
                    <div className="mt-2">
                        <p className="text-sm font-semibold text-yellow-800">Lampiran Pendukung dari Agent:</p>
                        <a href={complaint.agentUploadedAttachment.fileDataUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:text-primary/80 block truncate">
                           {complaint.agentUploadedAttachment.fileName}
                        </a>
                    </div>
                )}
            </dd>
        </div>
      )}
       {showFullDetails && complaint.supervisorReviewNotes && (complaint.status === ComplaintStatus.SELESAI || complaint.status === ComplaintStatus.DITOLAK || (complaint.status === ComplaintStatus.DIPROSES && complaint.supervisorReviewNotes) ) && (
        <div className={`py-3 my-2 sm:col-span-2 p-3 rounded-md border ${complaint.status === ComplaintStatus.DIPROSES ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
            <dt className="text-sm font-bold text-gray-700">Catatan Supervisor ({getUserById(complaint.supervisorId || '')?.name || 'Supervisor'}):</dt>
            <dd className="mt-1 text-sm text-gray-800 italic">{complaint.supervisorReviewNotes}</dd>
        </div>
      )}
    </dl>
  );
};

export default ComplaintDetailsView;