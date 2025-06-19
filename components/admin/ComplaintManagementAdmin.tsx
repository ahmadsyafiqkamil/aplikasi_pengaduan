import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { useAuth } from '../../hooks/useAuth';
import { Complaint, ComplaintStatus, ServiceType, UserRole, User, CustomFormFieldDefinition, FormFieldType, ComplaintAttachment } from '../../types';
import { SERVICE_TYPES_AVAILABLE, COMPLAINT_STATUS_OPTIONS } from '../../constants';
import { useAppConfig } from '../../hooks/useAppConfig';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Alert from '../common/Alert';
import { formatDate, getMimeType, fileToBase64 } from '../../utils/helpers';
import ComplaintHistoryView from '../shared/ComplaintHistoryView';

const ComplaintManagementAdmin: React.FC = () => {
  const { complaints, updateComplaint, deleteComplaint, getComplaintById, assignAgentToComplaint } = useComplaints();
  const { users, loggedInUser, getUserById } = useAuth();
  const { config } = useAppConfig(); 

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [formData, setFormData] = useState<Partial<Complaint> & { newAttachments?: File[] }>({});
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status: string; serviceType: string; search: string }>({ status: '', serviceType: '', search: ''});

  const agents = useMemo(() => users.filter(u => u.role === UserRole.AGENT), [users]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const statusMatch = filters.status ? c.status === filters.status : true;
      const serviceTypeMatch = filters.serviceType ? c.serviceType === filters.serviceType : true;
      const searchMatch = filters.search ? 
        (c.trackingId?.toLowerCase().includes(filters.search.toLowerCase()) || 
         c.reporterName?.toLowerCase().includes(filters.search.toLowerCase()) ||
         c.description?.toLowerCase().includes(filters.search.toLowerCase()))
        : true;
      return statusMatch && serviceTypeMatch && searchMatch;
    }).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [complaints, filters]);


  const openEditModal = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setFormData({ ...complaint }); 
    setError(null);
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCustomFieldChange = (fieldId: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      customFieldData: { ...(prev.customFieldData || {}), [fieldId]: value },
    }));
  };

  const handleAttachmentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newComplaintAttachments: ComplaintAttachment[] = [];
      for (const file of filesArray) {
        try {
          const base64 = await fileToBase64(file);
          newComplaintAttachments.push({
            id: `file-admin-${Date.now()}-${Math.random()}`,
            fileName: file.name,
            fileType: file.type || getMimeType(file.name),
            fileDataUrl: base64,
          });
        } catch (error) {
          console.error("Error converting file", error);
        }
      }
      setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...newComplaintAttachments] }));
    }
  };
  
  const removeAttachment = (fileIdToRemove: string) => {
    setFormData(prev => ({...prev, attachments: prev.attachments?.filter(att => att.id !== fileIdToRemove)}));
  };

  const handleSaveChanges = async () => {
    if (!editingComplaint || !loggedInUser) return;
    setError(null);
    try {
      let actionDescription = "Admin memperbarui detail pengaduan.";
      if (formData.status && formData.status !== editingComplaint.status) {
        actionDescription += ` Status diubah ke ${formData.status}.`;
      }
      if (formData.assignedAgentId && formData.assignedAgentId !== editingComplaint.assignedAgentId) {
          const agent = getUserById(formData.assignedAgentId);
          actionDescription += ` Ditugaskan ke agent ${agent?.name || 'baru'}.`;
          formData.assignedAgentName = agent?.name; 
          if (formData.status === ComplaintStatus.VERIFIKASI || formData.status === ComplaintStatus.BARU) {
            formData.status = ComplaintStatus.DIPROSES; 
          }
      } else if (formData.assignedAgentId === '' && editingComplaint.assignedAgentId) {
        actionDescription += ` Agent ${editingComplaint.assignedAgentName} dilepaskan dari tugas.`;
        formData.assignedAgentName = undefined;
      }
      
      await updateComplaint(editingComplaint.id, formData, loggedInUser, actionDescription);
      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan perubahan.');
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    if (window.confirm('Yakin ingin menghapus pengaduan ini secara permanen?')) {
      try {
        await deleteComplaint(complaintId);
      } catch (err: any) {
        setError(err.message || 'Gagal menghapus pengaduan.');
      }
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const renderCustomFieldInputs = (currentCustomData: Record<string, any> = {}) => {
    return config.customFormFields.map(field => {
      if (!field.isVisible) return null;
      const value = currentCustomData[field.id] || (field.type === FormFieldType.PILIHAN && field.options?.includes('') ? '' : (field.options?.[0] || ''));
      
      if (field.type === FormFieldType.TEXT_SINGKAT) {
        return <Input key={field.id} label={field.label} value={value as string} onChange={e => handleCustomFieldChange(field.id, e.target.value)} />;
      }
      if (field.type === FormFieldType.TEXT_PANJANG) {
        return <Textarea key={field.id} label={field.label} value={value as string} onChange={e => handleCustomFieldChange(field.id, e.target.value)} />;
      }
      if (field.type === FormFieldType.PILIHAN) {
        return (
          <Select
            key={field.id}
            label={field.label}
            value={value as string}
            onChange={e => handleCustomFieldChange(field.id, e.target.value)}
            options={(field.options || []).map(opt => ({ value: opt, label: opt }))}
          />
        );
      }
      return null;
    });
  };
  
  const editModalFooter = (
    <>
      <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
      <Button variant="primary" onClick={handleSaveChanges}>Simpan Perubahan</Button>
    </>
  );

  return (
    <div>
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-3"/>}
      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
        <Input name="search" placeholder="Cari ID, Pelapor, Deskripsi..." value={filters.search} onChange={handleFilterChange} containerClassName="mb-0"/>
        <Select name="status" value={filters.status} onChange={handleFilterChange} options={[{value:'', label: 'Semua Status'}, ...COMPLAINT_STATUS_OPTIONS.map(s => ({value: s.value, label: s.label}))]} containerClassName="mb-0"/>
        <Select name="serviceType" value={filters.serviceType} onChange={handleFilterChange} options={[{value:'', label: 'Semua Layanan'}, ...SERVICE_TYPES_AVAILABLE.map(s => ({value: s, label: s}))]} containerClassName="mb-0"/>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Laporan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelapor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layanan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Update Terakhir</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredComplaints.map(complaint => (
              <tr key={complaint.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">{complaint.tracking_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{complaint.is_anonymous ? 'Anonim' : complaint.reporter_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.service_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${COMPLAINT_STATUS_OPTIONS.find(s=>s.value === complaint.status)?.color || 'bg-gray-100 text-gray-800'}`}>
                        {complaint.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.assignedAgent?.name  || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(complaint.updatedAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button onClick={() => openEditModal(complaint)} variant="outline" size="sm">Edit</Button>
                  <Button onClick={() => handleDeleteComplaint(complaint.id)} variant="danger" size="sm">Hapus</Button>
                </td>
              </tr>
            ))}
             {filteredComplaints.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Tidak ada data pengaduan yang cocok.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingComplaint && (
        <Modal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            title={`Edit Pengaduan: ${editingComplaint.trackingId}`} 
            size="xl"
            footer={editModalFooter}
        >
          {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-3"/>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Removed max-h and overflow from here */}
            <div> {/* Left Column for Form */}
              <h4 className="text-lg font-semibold mb-2 text-gray-700">Detail Pengaduan</h4>
              {!formData.isAnonymous && (
                <>
                  <Input label="Nama Pelapor" name="reporterName" value={formData.reporterName || ''} onChange={handleInputChange} />
                  <Input label="Email Pelapor" name="reporterEmail" value={formData.reporterEmail || ''} onChange={handleInputChange} />
                  <Input label="WhatsApp Pelapor" name="reporterWhatsApp" value={formData.reporterWhatsApp || ''} onChange={handleInputChange} />
                </>
              )}
              {formData.isAnonymous && <p className="mb-2 text-sm text-gray-600 italic">Pengaduan ini dikirim secara anonim.</p>}
              
              <Select label="Jenis Layanan" name="serviceType" value={formData.serviceType || ''} onChange={handleInputChange} options={SERVICE_TYPES_AVAILABLE.map(st => ({ value: st, label: st }))} />
              <Input label="Waktu Kejadian" name="incidentTime" type="datetime-local" value={formData.incidentTime ? formData.incidentTime.slice(0,16) : ''} onChange={handleInputChange} />
              <Textarea label="Deskripsi Pengaduan" name="description" value={formData.description || ''} onChange={handleInputChange} rows={3}/>
              
              <h4 className="text-md font-semibold mt-4 mb-2 text-gray-700">Data Field Kustom</h4>
              {renderCustomFieldInputs(formData.customFieldData)}

              <h4 className="text-md font-semibold mt-4 mb-2 text-gray-700">Lampiran</h4>
               <input
                id="attachments-admin-edit"
                type="file"
                multiple
                onChange={handleAttachmentChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mb-2"
                />
                {formData.attachments && formData.attachments.length > 0 && (
                    <div className="space-y-1 text-sm">
                    {formData.attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between bg-gray-100 p-1.5 rounded">
                        <a href={att.fileDataUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:underline" title={att.fileName}>{att.fileName}</a>
                        <button type="button" onClick={() => removeAttachment(att.id)} className="text-red-500 hover:text-red-700 ml-2 text-xs">Hapus</button>
                        </div>
                    ))}
                    </div>
                )}

              <h4 className="text-md font-semibold mt-4 mb-2 text-gray-700">Manajemen Internal</h4>
              <Select label="Status Pengaduan" name="status" value={formData.status || ''} onChange={handleInputChange} options={COMPLAINT_STATUS_OPTIONS} />
              <Select 
                label="Tugaskan Agent" 
                name="assignedAgentId" 
                value={formData.assignedAgentId || ''} 
                onChange={handleInputChange} 
                options={[{value: '', label: '-- Tidak Ditugaskan --'}, ...agents.map(agent => ({ value: agent.id, label: agent.name }))]} 
              />
               {editingComplaint.requestedStatusChange && (
                <div className="mt-2 p-2 border border-yellow-300 bg-yellow-50 rounded">
                    <p className="text-sm font-semibold text-yellow-700">Ada permintaan perubahan status dari Agent ke "{editingComplaint.requestedStatusChange}" menunggu persetujuan Supervisor.</p>
                    <Button 
                        variant="outline" size="sm" 
                        onClick={() => {
                            if (window.confirm("Yakin ingin membatalkan permintaan perubahan status dari Agent? Ini akan mengembalikan status ke 'Dalam Proses' dan agent perlu mengajukan ulang jika perlu.")) {
                                updateComplaint(editingComplaint.id, {requestedStatusChange: undefined, statusChangeRequestNotes: undefined, agentUploadedAttachment: undefined, status: ComplaintStatus.DIPROSES}, loggedInUser!, "Admin membatalkan permintaan perubahan status Agent.");
                                setIsEditModalOpen(false); 
                            }
                        }}
                        className="mt-1"
                    >
                        Batalkan Permintaan Agent
                    </Button>
                </div>
               )}
            </div>
            <div> {/* Right Column for History */}
                <h4 className="text-lg font-semibold mb-2 text-gray-700">Histori Pengaduan</h4>
                <ComplaintHistoryView history={editingComplaint.history} users={users} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ComplaintManagementAdmin;