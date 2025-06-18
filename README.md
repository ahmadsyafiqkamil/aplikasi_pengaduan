# Aplikasi Pengaduan Fullstack

Aplikasi ini merupakan platform pelaporan pengaduan layanan publik dengan frontend berbasis React dan backend Node.js + Express.

## 🚀 Fitur

- Login dengan peran: `admin`, `supervisor`, `agent`, `manajemen`
- Pengelolaan pengaduan (buat & lihat)
- Autentikasi JWT
- Backend menggunakan SQLite + Sequelize
- Docker-ready

## 🛠️ Cara Menjalankan

### 1. Prasyarat
- [Docker](https://docs.docker.com/get-docker/) dan Docker Compose harus terinstal

### 2. Jalankan Aplikasi
```bash
docker-compose up --build
```

Ini akan:
- Build backend
- Seed database
- Menjalankan server di `http://localhost:3000`

### 3. Akses Frontend
Frontend berada di folder utama. Untuk menjalankannya:

```bash
# Di terminal baru
npm install
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

## 🔐 Akun Login Awal

| Username    | Password   | Role        |
|-------------|------------|-------------|
| admin1      | adminpass  | admin       |
| super1      | superpass  | supervisor  |
| agent1      | agentpass  | agent       |
| manajer1    | manpass    | manajemen   |

## 📁 Struktur Proyek

```
.
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── seed.js
│   └── server.js
├── Dockerfile
├── docker-compose.yml
├── index.tsx (frontend)
└── ...
```

## 📦 Teknologi

- Frontend: React + Vite + TypeScript
- Backend: Express.js + Sequelize
- Database: SQLite
- Auth: JWT