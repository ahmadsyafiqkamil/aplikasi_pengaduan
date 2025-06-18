import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { useAuth } from '../../hooks/useAuth';
import { Complaint, ComplaintStatus, ServiceType } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { formatDate } from '../../utils/helpers';
import ComplaintDetailsView from '../shared/ComplaintDetailsView';
import ComplaintHistoryView from '../shared/ComplaintHistoryView';
import { COMPLAINT_STATUS_OPTIONS, SERVICE_TYPES_AVAILABLE } from '../../constants';
import Input from '../common/Input';
import Select from '../common/Select';


const AllComplaintsManagement: React.FC = () => {
  const { complaints } = useComplaints();
  const { users } = useAuth(); 
  
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [filters, setFilters] = useState<{ status: string; serviceType: string; search: string }>({ status: '', serviceType: '', search: ''});


  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const statusMatch = filters.status ? c.status === filters.status : true;
      const serviceTypeMatch = filters.serviceType ? c.serviceType === filters.serviceType : true;
      const searchMatch = filters.search ? 
        (c.trackingId?.toLowerCase().includes(filters.search.toLowerCase()) || 
         c.reporterName?.toLowerCase().includes(filters.search.toLowerCase()) ||
         c.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
         c.assignedAgentName?.toLowerCase().includes(filters.search.toLowerCase())
         )
        : true;
      return statusMatch && serviceTypeMatch && searchMatch;
    }).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [complaints, filters]);

  const handleOpenDetailsModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const detailsModalFooter = (
    <Button variant="outline" onClick={() => setSelectedComplaint(null)}>Tutup</Button>
  );

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Daftar Semua Pengaduan Sistem</h3>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
        <Input name="search" placeholder="Cari ID, Pelapor, Deskripsi, Agent..." value={filters.search} onChange={handleFilterChange} containerClassName="mb-0"/>
        <Select name="status" value={filters.status} onChange={handleFilterChange} options={[{value:'', label: 'Semua Status'}, ...COMPLAINT_STATUS_OPTIONS.map(s => ({value: s.value, label: s.label}))]} containerClassName="mb-0"/>
        <Select name="serviceType" value={filters.serviceType} onChange={handleFilterChange} options={[{value:'', label: 'Semua Layanan'}, ...SERVICE_TYPES_AVAILABLE.map(s => ({value: s, label: s}))]} containerClassName="mb-0"/>
      </div>

      {filteredComplaints.length === 0 && <p className="text-gray-500 py-6 text-center">Tidak ada data pengaduan yang cocok dengan filter.</p>}
      
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">{complaint.trackingId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{complaint.isAnonymous ? 'Anonim' : complaint.reporterName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.serviceType}</td>
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
                    <ComplaintDetailsView complaint={selectedComplaint} showFullDetails showAgentRequestInfo />
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

export default AllComplaintsManagement;