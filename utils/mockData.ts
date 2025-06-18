
import { User, Complaint, UserRole, ServiceType, ComplaintStatus, ComplaintHistoryEntry, CustomFormFieldDefinition, FormFieldType } from '../types';
import { INITIAL_CUSTOM_FIELDS } from '../constants';

const UNIFIED_PASSWORD = "pass123";

export const USERS_DATA: User[] = [
  { id: 'admin001', username: 'admin', passwordHash: UNIFIED_PASSWORD, name: 'Admin Utama', role: UserRole.ADMIN },
  
  // Supervisors
  { id: 'spv001', username: 'spimigrasi', passwordHash: UNIFIED_PASSWORD, name: 'Supervisor Imigrasi', role: UserRole.SUPERVISOR, serviceTypesHandled: [ServiceType.IMIGRASI] },
  { id: 'spv002', username: 'spkonsuler', passwordHash: UNIFIED_PASSWORD, name: 'Supervisor Konsuler', role: UserRole.SUPERVISOR, serviceTypesHandled: [ServiceType.KONSULER] },
  { id: 'spv003', username: 'spsosbud', passwordHash: UNIFIED_PASSWORD, name: 'Supervisor SosBud', role: UserRole.SUPERVISOR, serviceTypesHandled: [ServiceType.SOSBUD] },
  { id: 'spv004', username: 'spekonomi', passwordHash: UNIFIED_PASSWORD, name: 'Supervisor Ekonomi', role: UserRole.SUPERVISOR, serviceTypesHandled: [ServiceType.EKONOMI] },

  // Agents
  { id: 'agent001', username: 'agim1', passwordHash: UNIFIED_PASSWORD, name: 'Agent Imigrasi Alpha', role: UserRole.AGENT, serviceTypesHandled: [ServiceType.IMIGRASI] },
  { id: 'agent002', username: 'agim2', passwordHash: UNIFIED_PASSWORD, name: 'Agent Imigrasi Bravo', role: UserRole.AGENT, serviceTypesHandled: [ServiceType.IMIGRASI] },
  { id: 'agent003', username: 'agkon1', passwordHash: UNIFIED_PASSWORD, name: 'Agent Konsuler Charlie', role: UserRole.AGENT, serviceTypesHandled: [ServiceType.KONSULER] },
  { id: 'agent004', username: 'agsos1', passwordHash: UNIFIED_PASSWORD, name: 'Agent SosBud Delta', role: UserRole.AGENT, serviceTypesHandled: [ServiceType.SOSBUD] },
  { id: 'agent005', username: 'ageko1', passwordHash: UNIFIED_PASSWORD, name: 'Agent Ekonomi Echo', role: UserRole.AGENT, serviceTypesHandled: [ServiceType.EKONOMI] },
  
  { id: 'mgmt001', username: 'manajemen', passwordHash: UNIFIED_PASSWORD, name: 'Manajer Umum', role: UserRole.MANAGEMENT },
];

const getUserNameById = (id: string): string => USERS_DATA.find(u=>u.id === id)?.name || 'Pengguna Tidak Dikenal';

const initialHistoryEntry = (complaintId: string, reporterName: string = "Pelapor Anonim", createdAt?: string): ComplaintHistoryEntry[] => [{
    id: `hist-init-${complaintId}`,
    timestamp: createdAt || new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago or specific
    userName: reporterName,
    userRole: UserRole.PUBLIC,
    action: "Pengaduan Dibuat",
}];


export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'comp001',
    trackingId: 'PGDN-123456-ABCD',
    isAnonymous: false,
    reporterName: 'Budi Santoso',
    reporterEmail: 'budi.s@example.com',
    reporterWhatsApp: '081234567890',
    serviceType: ServiceType.IMIGRASI,
    incidentTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().slice(0, 16), // 2 days ago
    description: 'Antrian layanan paspor sangat panjang dan tidak teratur. Petugas terlihat kurang responsif terhadap pertanyaan.',
    customFieldData: { [INITIAL_CUSTOM_FIELDS[0].id]: 'Area pembuatan paspor Lt. 2', [INITIAL_CUSTOM_FIELDS[1].id]: 'Ya' },
    attachments: [{id: 'att1', fileName: 'foto_antrian.jpg', fileType: 'image/jpeg', fileDataUrl: 'https://picsum.photos/200/300?random=10'}],
    status: ComplaintStatus.DIPROSES,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    assignedAgentId: 'agent001', // Agent Imigrasi Alpha
    assignedAgentName: getUserNameById('agent001'),
    supervisorId: 'spv001', // Supervisor Imigrasi
    history: [
        ...initialHistoryEntry('comp001', 'Budi Santoso', new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()),
        { 
            id: 'hist-assign-comp001', 
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
            userId: 'spv001', 
            userName: getUserNameById('spv001'), 
            userRole: UserRole.SUPERVISOR,
            action: `Pengaduan ditugaskan ke Agent ${getUserNameById('agent001')}`, 
            newStatus: ComplaintStatus.DIPROSES, 
            oldStatus: ComplaintStatus.VERIFIKASI,
            assignedToAgentId: 'agent001',
            assignedToAgentName: getUserNameById('agent001')
        }
    ],
  },
  {
    id: 'comp002',
    trackingId: 'PGDN-789012-EFGH',
    isAnonymous: true,
    serviceType: ServiceType.KONSULER,
    incidentTime: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString().slice(0, 16), // 3 days ago
    description: 'Proses legalisasi dokumen memakan waktu terlalu lama dari yang dijanjikan. Tidak ada update yang jelas.',
    customFieldData: {},
    attachments: [],
    status: ComplaintStatus.VERIFIKASI, // Supervisor Konsuler (spv002) will see this
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    supervisorId: 'spv002', // Pre-assign to correct supervisor for filtering
    history: initialHistoryEntry('comp002', "Pelapor Anonim", new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()),
  },
  {
    id: 'comp003',
    trackingId: 'PGDN-345678-IJKL',
    isAnonymous: false,
    reporterName: 'Citra Lestari',
    reporterEmail: 'citra.l@example.com',
    serviceType: ServiceType.SOSBUD,
    incidentTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 16), // 5 days ago
    description: 'Informasi mengenai beasiswa budaya tidak lengkap di website. Sulit menghubungi PIC.',
    customFieldData: {},
    attachments: [],
    status: ComplaintStatus.SELESAI,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    assignedAgentId: 'agent004', // Agent SosBud Delta
    assignedAgentName: getUserNameById('agent004'),
    supervisorId: 'spv003', // Supervisor SosBud
    agentFollowUpNotes: "Sudah menghubungi pelapor dan memberikan informasi lengkap. Website akan diupdate oleh tim terkait.",
    supervisorReviewNotes: "Penyelesaian disetujui oleh Supervisor SosBud.",
    history: [
        ...initialHistoryEntry('comp003', "Citra Lestari", new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()),
        { id: 'hist-verif-comp003', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4.5).toISOString(), userId: 'admin001', userName: getUserNameById('admin001'), userRole: UserRole.ADMIN, action: 'Status Diubah ke Sedang Diverifikasi', oldStatus: ComplaintStatus.BARU, newStatus: ComplaintStatus.VERIFIKASI},
        { id: 'hist-assign-comp003', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), userId: 'spv003', userName: getUserNameById('spv003'), userRole: UserRole.SUPERVISOR, action: `Pengaduan ditugaskan ke Agent ${getUserNameById('agent004')}`, newStatus: ComplaintStatus.DIPROSES, oldStatus: ComplaintStatus.VERIFIKASI, assignedToAgentId: 'agent004', assignedToAgentName: getUserNameById('agent004') },
        { id: 'hist-folloup-comp003', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), userId: 'agent004', userName: getUserNameById('agent004'), userRole: UserRole.AGENT, action: `Agent mengajukan perubahan status ke ${ComplaintStatus.SELESAI}`, notes: 'Sudah menghubungi pelapor dan memberikan informasi lengkap. Website akan diupdate oleh tim terkait.', newStatus: ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV, oldStatus: ComplaintStatus.DIPROSES },
        { id: 'hist-approve-comp003', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), userId: 'spv003', userName: getUserNameById('spv003'), userRole: UserRole.SUPERVISOR, action: `Supervisor menyetujui perubahan status ke ${ComplaintStatus.SELESAI}.`, notes: 'Penyelesaian disetujui oleh Supervisor SosBud.', newStatus: ComplaintStatus.SELESAI, oldStatus: ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV },
    ]
  },
  {
    id: 'comp004',
    trackingId: 'PGDN-901234-MNOP',
    isAnonymous: false,
    reporterName: 'Rahmat Hidayat',
    reporterEmail: 'rahmat.h@example.com',
    serviceType: ServiceType.EKONOMI,
    incidentTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 16), // 7 days ago
    description: 'Kesulitan mendapatkan informasi terkait prosedur ekspor produk UKM. Informasi di portal kurang jelas.',
    customFieldData: { [INITIAL_CUSTOM_FIELDS[0].id]: 'Portal Informasi Bisnis' },
    attachments: [],
    status: ComplaintStatus.DIPROSES,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    assignedAgentId: 'agent005', // Agent Ekonomi Echo
    assignedAgentName: getUserNameById('agent005'),
    supervisorId: 'spv004', // Supervisor Ekonomi
    agentFollowUpNotes: "Sedang mengumpulkan informasi detail dan akan segera menghubungi pelapor.",
    history: [
        ...initialHistoryEntry('comp004', "Rahmat Hidayat", new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()),
        { id: 'hist-verif-comp004', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), userId: 'admin001', userName: getUserNameById('admin001'), userRole: UserRole.ADMIN, action: 'Status Diubah ke Sedang Diverifikasi', oldStatus: ComplaintStatus.BARU, newStatus: ComplaintStatus.VERIFIKASI},
        { id: 'hist-assign-comp004', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), userId: 'spv004', userName: getUserNameById('spv004'), userRole: UserRole.SUPERVISOR, action: `Pengaduan ditugaskan ke Agent ${getUserNameById('agent005')}`, newStatus: ComplaintStatus.DIPROSES, oldStatus: ComplaintStatus.VERIFIKASI, assignedToAgentId: 'agent005', assignedToAgentName: getUserNameById('agent005') },
        { id: 'hist-note-comp004', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), userId: 'agent005', userName: getUserNameById('agent005'), userRole: UserRole.AGENT, action: 'Agent memperbarui catatan tindak lanjut', notes: "Sedang mengumpulkan informasi detail dan akan segera menghubungi pelapor."},
    ]
  },
  {
    id: 'comp005',
    trackingId: 'PGDN-567890-QRST',
    isAnonymous: true,
    serviceType: ServiceType.IMIGRASI,
    incidentTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().slice(0,16), // 1 day ago
    description: 'Petugas di loket A kurang ramah saat melayani.',
    customFieldData: {},
    attachments: [],
    status: ComplaintStatus.BARU, // Admin will see this
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    history: initialHistoryEntry('comp005', "Pelapor Anonim", new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()),
  },
];
