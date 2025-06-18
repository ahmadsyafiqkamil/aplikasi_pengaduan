
export enum UserRole {
  PUBLIC = "PUBLIC",
  ADMIN = "ADMIN",
  SUPERVISOR = "SUPERVISOR",
  AGENT = "AGENT",
  MANAGEMENT = "MANAGEMENT",
}

export enum ServiceType {
  IMIGRASI = "Layanan Imigrasi",
  KONSULER = "Layanan Konsuler",
  SOSBUD = "Layanan Sosial Budaya",
  EKONOMI = "Layanan Ekonomi",
  LAINNYA = "Layanan Lainnya",
}

export enum ComplaintStatus {
  BARU = "Baru", // New, not yet verified
  VERIFIKASI = "Sedang Diverifikasi", // Verification by Admin/Supervisor
  DIPROSES = "Dalam Proses", // Assigned to Agent / Being worked on
  MENUNGGU_PERSETUJUAN_SPV = "Menunggu Persetujuan Supervisor",
  SELESAI = "Selesai",
  DITOLAK = "Ditolak",
}

export enum FormFieldType {
  TEXT_SINGKAT = "Teks Singkat",
  TEXT_PANJANG = "Teks Panjang",
  PILIHAN = "Pilihan", // Dropdown/Radio
}

export interface User {
  id: string;
  username: string;
  passwordHash: string; // In a real app, this would be a hash
  name: string;
  role: UserRole;
  serviceTypesHandled?: ServiceType[]; // For Supervisor & Agent
}

export interface CustomFormFieldDefinition {
  id: string;
  label: string;
  placeholder?: string;
  type: FormFieldType;
  options?: string[]; // For 'PILIHAN' type, comma-separated then split
  isRequired: boolean;
  isVisible: boolean; // Controlled by Admin
  order: number; // Controlled by Admin
}

export interface ComplaintAttachment {
  id: string;
  fileName: string;
  fileType: string; // e.g., 'image/png', 'application/pdf'
  fileDataUrl?: string; // Base64 data URL for images/previews, or a placeholder
}

export interface ComplaintHistoryEntry {
  id: string;
  timestamp: string; // ISO date string
  userId?: string; // Optional if system action or public user before login
  userName: string; // "Pelapor Anonim", "Sistem", or user's name
  userRole?: UserRole;
  action: string; // e.g., "Pengaduan Dibuat", "Status Diubah ke Diproses", "Catatan Ditambahkan"
  notes?: string;
  oldStatus?: ComplaintStatus;
  newStatus?: ComplaintStatus;
  assignedToAgentId?: string;
  assignedToAgentName?: string;
}

export interface Complaint {
  id: string;
  trackingId: string; // User-friendly tracking ID
  isAnonymous: boolean;
  reporterName?: string;
  reporterEmail?: string;
  reporterWhatsApp?: string;
  serviceType: ServiceType;
  incidentTime: string; // ISO date string for datetime-local
  description: string;
  customFieldData: Record<string, string | string[]>; // { customFieldId: value }
  attachments: ComplaintAttachment[]; // Main attachments by reporter
  status: ComplaintStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  assignedAgentId?: string;
  assignedAgentName?: string; // Denormalized for display
  supervisorId?: string; // For routing approvals etc.
  
  // Fields for agent interaction & supervisor approval
  agentFollowUpNotes?: string;
  agentUploadedAttachment?: ComplaintAttachment; // Temporary while awaiting approval
  requestedStatusChange?: ComplaintStatus; // Status agent wants to change to
  statusChangeRequestNotes?: string; // Agent's notes for this request
  supervisorReviewNotes?: string; // Supervisor's notes on approval/rejection

  history: ComplaintHistoryEntry[];
}

export interface AppFormTexts {
  [key: string]: string; // e.g., 'reporterNameLabel', 'submitButtonText'
}

export interface AppContentConfig {
  bannerTitle: string;
  bannerDescription: string;
  bannerImageUrl: string;
  complaintFlowTitle: string; 
  complaintFlowDescription: string; 
  showComplaintFlowSection: boolean; // Added to control visibility
  formTexts: AppFormTexts; // Labels, placeholders, button texts
  customFormFields: CustomFormFieldDefinition[];
  standardFieldsOrderAndVisibility: { // For standard fields
    [fieldName: string]: { order: number, isVisible: boolean, label: string, isCore?: boolean } 
  };
  // Social Media Links
  socialMediaFacebookUrl: string;
  socialMediaTwitterUrl: string;
  socialMediaInstagramUrl: string;
  socialMediaYoutubeUrl: string;
  socialMediaWebsiteUrl: string; // Added
}

export interface StatsData {
  totalComplaints: number;
  completionRate: number; // percentage
  averageResolutionTimeDays: number; // in days
  statusDistribution: { status: ComplaintStatus; count: number }[];
  serviceTypeDistribution: { serviceType: ServiceType; count: number }[];
  agentPerformance: AgentStat[];
  lastCalculated: string;
}

export interface AgentStat {
  agentId: string;
  agentName: string;
  totalAssigned: number;
  totalCompleted: number;
  totalInProgress: number;
  avgResolutionTimeDays: number;
}
