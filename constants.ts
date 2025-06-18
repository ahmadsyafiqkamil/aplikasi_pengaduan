
import { ServiceType, UserRole, ComplaintStatus, AppContentConfig, CustomFormFieldDefinition, FormFieldType } from './types';

export const APP_NAME = "Aplikasi Pengaduan KeluhanKu";

export const ROLES_CONFIG: { [key in UserRole]: { name: string; path: string } } = {
  [UserRole.PUBLIC]: { name: "Publik", path: "/" },
  [UserRole.ADMIN]: { name: "Admin", path: "/admin" },
  [UserRole.SUPERVISOR]: { name: "Supervisor", path: "/supervisor" },
  [UserRole.AGENT]: { name: "Agent", path: "/agent" },
  [UserRole.MANAGEMENT]: { name: "Manajemen", path: "/management" },
};

export const SERVICE_TYPES_AVAILABLE: ServiceType[] = [
  ServiceType.IMIGRASI,
  ServiceType.KONSULER,
  ServiceType.SOSBUD,
  ServiceType.EKONOMI,
  ServiceType.LAINNYA,
];

export const COMPLAINT_STATUS_OPTIONS: { value: ComplaintStatus; label: string; color: string }[] = [
  { value: ComplaintStatus.BARU, label: "Baru", color: "bg-blue-100 text-blue-700" },
  { value: ComplaintStatus.VERIFIKASI, label: "Sedang Diverifikasi", color: "bg-yellow-100 text-yellow-700" },
  { value: ComplaintStatus.DIPROSES, label: "Dalam Proses", color: "bg-orange-100 text-orange-700" },
  { value: ComplaintStatus.MENUNGGU_PERSETUJUAN_SPV, label: "Menunggu Persetujuan SPV", color: "bg-purple-100 text-purple-700" },
  { value: ComplaintStatus.SELESAI, label: "Selesai", color: "bg-green-100 text-green-700" },
  { value: ComplaintStatus.DITOLAK, label: "Ditolak", color: "bg-red-100 text-red-700" },
];

export const INITIAL_CUSTOM_FIELDS: CustomFormFieldDefinition[] = [
  { id: 'lokasi_kejadian', label: 'Lokasi Kejadian Spesifik', type: FormFieldType.TEXT_SINGKAT, isRequired: false, isVisible: true, order: 100, placeholder: 'cth: Ruang Tunggu Gate A' },
  { id: 'saksi_mata', label: 'Apakah ada saksi mata?', type: FormFieldType.PILIHAN, options: ['Ya', 'Tidak', 'Tidak Yakin'], isRequired: false, isVisible: true, order: 101 },
];

export const INITIAL_APP_CONTENT_CONFIG: AppContentConfig = {
  bannerTitle: "Selamat Datang di Aplikasi Pengaduan KeluhanKu",
  bannerDescription: "Laporkan masalah layanan dengan mudah dan transparan. Kami siap membantu!",
  bannerImageUrl: "https://picsum.photos/1200/400?random=1",
  complaintFlowTitle: "Alur Proses Pengaduan Anda", 
  complaintFlowDescription: "1. Buat Laporan → 2. Verifikasi → 3. Tindak Lanjut oleh Petugas → 4. Selesai/Informasi.",
  showComplaintFlowSection: false, // Default to hidden
  formTexts: {
    anonymousLabel: "Kirim Secara Anonim",
    reporterNameLabel: "Nama Lengkap Anda",
    reporterNamePlaceholder: "Masukkan nama lengkap Anda",
    reporterEmailLabel: "Alamat Email Aktif",
    reporterEmailPlaceholder: "cth: nama@email.com",
    reporterWhatsAppLabel: "Nomor WhatsApp Aktif",
    reporterWhatsAppPlaceholder: "cth: 081234567890",
    serviceTypeLabel: "Pilih Jenis Layanan Terkait",
    incidentTimeLabel: "Estimasi Waktu Kejadian",
    descriptionLabel: "Uraikan Pengaduan Anda",
    descriptionPlaceholder: "Jelaskan detail pengaduan Anda di sini...",
    attachmentsLabel: "Unggah Lampiran Pendukung (Opsional)",
    attachmentsButton: "Pilih File Lampiran",
    submitButtonText: "Kirim Laporan Pengaduan",
    successMessage: "Pengaduan Anda berhasil dikirim! ID Laporan Anda: {trackingId}",
    errorMessage: "Terjadi kesalahan. Mohon periksa kembali isian Anda.",
    requiredFieldMessage: "Kolom ini wajib diisi.",
    // Admin specific texts
    adminBannerTitleLabel: "Judul Utama Banner",
    adminBannerDescriptionLabel: "Deskripsi Utama Banner",
    adminBannerImageUrlLabel: "URL Gambar Banner",
    adminFlowTitleLabel: "Judul Bagian Alur", // Adjusted label
    adminFlowDescriptionLabel: "Deskripsi Bagian Alur", // Adjusted label
    adminFlowShowSectionLabel: "Tampilkan Bagian Alur di Halaman Utama", // New label for checkbox
    adminSocialMediaSectionTitle: "Kelola Tautan Media Sosial & Website",
    adminSocialFacebookLabel: "URL Facebook",
    adminSocialTwitterLabel: "URL Twitter (X)",
    adminSocialInstagramLabel: "URL Instagram",
    adminSocialYoutubeLabel: "URL YouTube",
    adminSocialWebsiteLabel: "URL Website Resmi", 
    adminSaveContentButton: "Simpan Semua Perubahan Konten & Form",
    // Login
    loginTitle: "Login Aplikasi Pengaduan",
    usernameLabel: "Username",
    passwordLabel: "Password",
    loginButton: "Masuk",
    logoutButton: "Keluar",
    // User Management
    addUserButton: "Tambah User",
    userNameLabel: "Nama",
    userRoleLabel: "Role",
    userServiceTypeLabel: "Jenis Layanan Ditangani",
    saveUserButton: "Simpan User",
    // ... other texts
  },
  customFormFields: INITIAL_CUSTOM_FIELDS,
  standardFieldsOrderAndVisibility: {
    isAnonymous: { order: 1, isVisible: true, label: "Kirim Secara Anonim", isCore: true },
    reporterName: { order: 2, isVisible: true, label: "Nama Lengkap Anda", isCore: false },
    reporterEmail: { order: 3, isVisible: true, label: "Alamat Email Aktif", isCore: false },
    reporterWhatsApp: { order: 4, isVisible: true, label: "Nomor WhatsApp Aktif", isCore: false },
    serviceType: { order: 5, isVisible: true, label: "Pilih Jenis Layanan Terkait", isCore: true },
    incidentTime: { order: 6, isVisible: true, label: "Estimasi Waktu Kejadian", isCore: true },
    description: { order: 7, isVisible: true, label: "Uraikan Pengaduan Anda", isCore: true },
    attachments: { order: 8, isVisible: true, label: "Unggah Lampiran Pendukung", isCore: false },
  },
  socialMediaFacebookUrl: "https://facebook.com",
  socialMediaTwitterUrl: "https://twitter.com",
  socialMediaInstagramUrl: "https://instagram.com",
  socialMediaYoutubeUrl: "", 
  socialMediaWebsiteUrl: "https://layananonline.kjripenang.my", // Updated default URL
};

export const LOCAL_STORAGE_KEYS = {
  APP_CONFIG: 'appPengaduanConfig',
  USERS: 'appPengaduanUsers',
  COMPLAINTS: 'appPengaduanComplaints',
  LOGGED_IN_USER: 'appPengaduanLoggedInUser',
};