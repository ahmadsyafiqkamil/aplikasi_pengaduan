-- =====================================================
-- DATABASE SETUP SCRIPT UNTUK APLIKASI PENGADUAN
-- =====================================================

-- Buat database
CREATE DATABASE IF NOT EXISTS pengaduan_db
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Gunakan database
USE pengaduan_db;

-- =====================================================
-- 1. TABEL USERS
-- =====================================================
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role ENUM('admin', 'supervisor', 'agent', 'manajemen') NOT NULL DEFAULT 'agent',
    service_types_handled JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABEL COMPLAINTS
-- =====================================================
CREATE TABLE complaints (
    id CHAR(36) PRIMARY KEY,
    tracking_id VARCHAR(20) NOT NULL UNIQUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    reporter_name VARCHAR(100),
    reporter_email VARCHAR(100),
    reporter_whatsapp VARCHAR(20),
    service_type ENUM(
        'Layanan Imigrasi',
        'Layanan Konsuler',
        'Layanan Sosial Budaya',
        'Layanan Ekonomi',
        'Layanan Lainnya'
    ) NOT NULL,
    incident_time DATETIME NOT NULL,
    description TEXT NOT NULL,
    custom_field_data JSON,
    status ENUM(
        'Baru',
        'Sedang Diverifikasi',
        'Dalam Proses',
        'Menunggu Persetujuan Supervisor',
        'Selesai',
        'Ditolak'
    ) DEFAULT 'Baru',
    assigned_agent_id CHAR(36),
    supervisor_id CHAR(36),
    agent_follow_up_notes TEXT,
    requested_status_change ENUM(
        'Baru',
        'Sedang Diverifikasi',
        'Dalam Proses',
        'Menunggu Persetujuan Supervisor',
        'Selesai',
        'Ditolak'
    ),
    status_change_request_notes TEXT,
    supervisor_review_notes TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    estimated_resolution_days INT,
    actual_resolution_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_tracking_id (tracking_id),
    INDEX idx_status (status),
    INDEX idx_service_type (service_type),
    INDEX idx_assigned_agent_id (assigned_agent_id),
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_incident_time (incident_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABEL COMPLAINT HISTORIES
-- =====================================================
CREATE TABLE complaint_histories (
    id CHAR(36) PRIMARY KEY,
    complaint_id CHAR(36) NOT NULL,
    user_id CHAR(36),
    user_name VARCHAR(100) NOT NULL,
    user_role ENUM('admin', 'supervisor', 'agent', 'manajemen', 'public'),
    action VARCHAR(200) NOT NULL,
    notes TEXT,
    old_status ENUM(
        'Baru',
        'Sedang Diverifikasi',
        'Dalam Proses',
        'Menunggu Persetujuan Supervisor',
        'Selesai',
        'Ditolak'
    ),
    new_status ENUM(
        'Baru',
        'Sedang Diverifikasi',
        'Dalam Proses',
        'Menunggu Persetujuan Supervisor',
        'Selesai',
        'Ditolak'
    ),
    assigned_to_agent_id CHAR(36),
    assigned_to_agent_name VARCHAR(100),
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to_agent_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_complaint_id (complaint_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABEL APP CONFIGS
-- =====================================================
CREATE TABLE app_configs (
    id CHAR(36) PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    value JSON NOT NULL,
    description VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE,
    category ENUM('content', 'form', 'system', 'ui') DEFAULT 'system',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_key (`key`),
    INDEX idx_category (category),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. INSERT DATA AWAL (SEED DATA)
-- =====================================================

-- Insert default users (password: adminpass)
INSERT INTO users (id, username, password, name, email, role, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'Administrator', 'admin@example.com', 'admin', TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'super1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'Supervisor', 'supervisor@example.com', 'supervisor', TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'agent1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'Agent', 'agent@example.com', 'agent', TRUE),
('550e8400-e29b-41d4-a716-446655440004', 'manajer1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'Manajemen', 'manajemen@example.com', 'manajemen', TRUE);

-- Insert default app configuration
INSERT INTO app_configs (id, `key`, value, description, is_public, category) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'app_content_config', 
'{
  "bannerTitle": "Selamat Datang di Aplikasi Pengaduan KeluhanKu",
  "bannerDescription": "Laporkan masalah layanan dengan mudah dan transparan. Kami siap membantu!",
  "bannerImageUrl": "https://picsum.photos/1200/400?random=1",
  "complaintFlowTitle": "Alur Proses Pengaduan Anda",
  "complaintFlowDescription": "1. Buat Laporan → 2. Verifikasi → 3. Tindak Lanjut oleh Petugas → 4. Selesai/Informasi.",
  "showComplaintFlowSection": false,
  "formTexts": {
    "anonymousLabel": "Kirim Secara Anonim",
    "reporterNameLabel": "Nama Lengkap Anda",
    "reporterNamePlaceholder": "Masukkan nama lengkap Anda",
    "reporterEmailLabel": "Alamat Email Aktif",
    "reporterEmailPlaceholder": "cth: nama@email.com",
    "reporterWhatsAppLabel": "Nomor WhatsApp Aktif",
    "reporterWhatsAppPlaceholder": "cth: 081234567890",
    "serviceTypeLabel": "Pilih Jenis Layanan Terkait",
    "incidentTimeLabel": "Estimasi Waktu Kejadian",
    "descriptionLabel": "Uraikan Pengaduan Anda",
    "descriptionPlaceholder": "Jelaskan detail pengaduan Anda di sini...",
    "attachmentsLabel": "Unggah Lampiran Pendukung (Opsional)",
    "attachmentsButton": "Pilih File Lampiran",
    "submitButtonText": "Kirim Laporan Pengaduan",
    "successMessage": "Pengaduan Anda berhasil dikirim! ID Laporan Anda: {trackingId}",
    "errorMessage": "Terjadi kesalahan. Mohon periksa kembali isian Anda.",
    "requiredFieldMessage": "Kolom ini wajib diisi."
  },
  "customFormFields": [
    {
      "id": "lokasi_kejadian",
      "label": "Lokasi Kejadian Spesifik",
      "type": "Teks Singkat",
      "isRequired": false,
      "isVisible": true,
      "order": 100,
      "placeholder": "cth: Ruang Tunggu Gate A"
    },
    {
      "id": "saksi_mata",
      "label": "Apakah ada saksi mata?",
      "type": "Pilihan",
      "options": ["Ya", "Tidak", "Tidak Yakin"],
      "isRequired": false,
      "isVisible": true,
      "order": 101
    }
  ],
  "standardFieldsOrderAndVisibility": {
    "isAnonymous": {"order": 1, "isVisible": true, "label": "Kirim Secara Anonim", "isCore": true},
    "reporterName": {"order": 2, "isVisible": true, "label": "Nama Lengkap Anda", "isCore": false},
    "reporterEmail": {"order": 3, "isVisible": true, "label": "Alamat Email Aktif", "isCore": false},
    "reporterWhatsApp": {"order": 4, "isVisible": true, "label": "Nomor WhatsApp Aktif", "isCore": false},
    "serviceType": {"order": 5, "isVisible": true, "label": "Pilih Jenis Layanan Terkait", "isCore": true},
    "incidentTime": {"order": 6, "isVisible": true, "label": "Estimasi Waktu Kejadian", "isCore": true},
    "description": {"order": 7, "isVisible": true, "label": "Uraikan Pengaduan Anda", "isCore": true},
    "attachments": {"order": 8, "isVisible": true, "label": "Unggah Lampiran Pendukung", "isCore": false}
  },
  "socialMediaFacebookUrl": "https://facebook.com",
  "socialMediaTwitterUrl": "https://twitter.com",
  "socialMediaInstagramUrl": "https://instagram.com",
  "socialMediaYoutubeUrl": "",
  "socialMediaWebsiteUrl": "https://layananonline.kjripenang.my"
}', 
'Default application content configuration', TRUE, 'content'),

('550e8400-e29b-41d4-a716-446655440102', 'service_types', 
'[
  "Layanan Imigrasi",
  "Layanan Konsuler", 
  "Layanan Sosial Budaya",
  "Layanan Ekonomi",
  "Layanan Lainnya"
]', 
'Available service types for complaints', TRUE, 'system'),

('550e8400-e29b-41d4-a716-446655440103', 'complaint_statuses', 
'[
  {"value": "Baru", "label": "Baru", "color": "bg-blue-100 text-blue-700"},
  {"value": "Sedang Diverifikasi", "label": "Sedang Diverifikasi", "color": "bg-yellow-100 text-yellow-700"},
  {"value": "Dalam Proses", "label": "Dalam Proses", "color": "bg-orange-100 text-orange-700"},
  {"value": "Menunggu Persetujuan SPV", "label": "Menunggu Persetujuan SPV", "color": "bg-purple-100 text-purple-700"},
  {"value": "Selesai", "label": "Selesai", "color": "bg-green-100 text-green-700"},
  {"value": "Ditolak", "label": "Ditolak", "color": "bg-red-100 text-red-700"}
]', 
'Available complaint statuses with their display properties', TRUE, 'system');

-- =====================================================
-- 6. BUAT VIEWS UNTUK REPORTING
-- =====================================================

-- View untuk statistik pengaduan per status
CREATE VIEW complaint_status_stats AS
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints), 2) as percentage
FROM complaints 
GROUP BY status;

-- View untuk statistik pengaduan per service type
CREATE VIEW complaint_service_stats AS
SELECT 
    service_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints), 2) as percentage
FROM complaints 
GROUP BY service_type;

-- View untuk performance agent
CREATE VIEW agent_performance AS
SELECT 
    u.id as agent_id,
    u.name as agent_name,
    COUNT(c.id) as total_assigned,
    COUNT(CASE WHEN c.status = 'Selesai' THEN 1 END) as total_completed,
    COUNT(CASE WHEN c.status IN ('Dalam Proses', 'Menunggu Persetujuan Supervisor') THEN 1 END) as total_in_progress,
    ROUND(AVG(DATEDIFF(c.actual_resolution_date, c.created_at)), 1) as avg_resolution_time_days
FROM users u
LEFT JOIN complaints c ON u.id = c.assigned_agent_id
WHERE u.role = 'agent' AND u.is_active = TRUE
GROUP BY u.id, u.name;

-- =====================================================
-- 7. BUAT STORED PROCEDURES
-- =====================================================

-- Procedure untuk generate tracking ID
DELIMITER //
CREATE PROCEDURE GenerateTrackingId(OUT tracking_id VARCHAR(20))
BEGIN
    DECLARE year_val INT;
    DECLARE sequence_val INT;
    DECLARE prefix VARCHAR(10) DEFAULT 'PEN';
    
    SET year_val = YEAR(NOW());
    
    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(tracking_id, 9) AS UNSIGNED)), 0) + 1
    INTO sequence_val
    FROM complaints 
    WHERE tracking_id LIKE CONCAT(prefix, '-', year_val, '-%');
    
    SET tracking_id = CONCAT(prefix, '-', year_val, '-', LPAD(sequence_val, 3, '0'));
END //
DELIMITER ;

-- Procedure untuk update complaint status dengan history
DELIMITER //
CREATE PROCEDURE UpdateComplaintStatus(
    IN complaint_id CHAR(36),
    IN new_status VARCHAR(50),
    IN user_id CHAR(36),
    IN user_name VARCHAR(100),
    IN user_role VARCHAR(20),
    IN notes TEXT
)
BEGIN
    DECLARE old_status VARCHAR(50);
    DECLARE action_text VARCHAR(200);
    
    -- Get current status
    SELECT status INTO old_status FROM complaints WHERE id = complaint_id;
    
    -- Set action text
    IF old_status != new_status THEN
        SET action_text = CONCAT('Status diubah dari "', old_status, '" ke "', new_status, '"');
    ELSE
        SET action_text = 'Pengaduan diperbarui';
    END IF;
    
    -- Update complaint
    UPDATE complaints 
    SET status = new_status, updated_at = NOW()
    WHERE id = complaint_id;
    
    -- Insert history
    INSERT INTO complaint_histories (
        id, complaint_id, user_id, user_name, user_role, 
        action, notes, old_status, new_status, created_at
    ) VALUES (
        UUID(), complaint_id, user_id, user_name, user_role,
        action_text, notes, old_status, new_status, NOW()
    );
END //
DELIMITER ;

-- =====================================================
-- 8. BUAT TRIGGERS
-- =====================================================

-- Trigger untuk auto-update updated_at
DELIMITER //
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
SET NEW.updated_at = NOW();
//

CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON complaints
FOR EACH ROW
SET NEW.updated_at = NOW();
//

CREATE TRIGGER update_app_configs_updated_at
BEFORE UPDATE ON app_configs
FOR EACH ROW
SET NEW.updated_at = NOW();
//
DELIMITER ;

-- =====================================================
-- 9. BUAT USER DAN GRANT PERMISSIONS
-- =====================================================

-- Buat user untuk aplikasi (ganti password sesuai kebutuhan)
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'rootpassword';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON pengaduan_db.* TO 'root'@'localhost';
GRANT EXECUTE ON PROCEDURE pengaduan_db.* TO 'root'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- =====================================================
-- 10. VERIFIKASI SETUP
-- =====================================================

-- Tampilkan semua tabel yang dibuat
SHOW TABLES;

-- Tampilkan struktur tabel users
DESCRIBE users;

-- Tampilkan data users yang sudah di-insert
SELECT id, username, name, role, is_active FROM users;

-- Tampilkan konfigurasi aplikasi
SELECT `key`, description, is_public, category FROM app_configs;

-- Tampilkan views yang dibuat
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- Tampilkan stored procedures
SHOW PROCEDURE STATUS WHERE Db = 'pengaduan_db';

-- =====================================================
-- SELESAI - DATABASE PENGADUAN SUDAH SIAP DIGUNAKAN
-- =====================================================

-- Catatan:
-- 1. Password default untuk semua user: adminpass
-- 2. Ganti password user database 'pengaduan_user' sesuai kebutuhan
-- 3. Backup database sebelum digunakan di production
-- 4. Test semua fitur di environment development terlebih dahulu 