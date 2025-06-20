# --- TAHAP 1: BUILD ---
# Gunakan base image Node.js untuk membangun aplikasi React
FROM node:18-alpine AS build

# Set direktori kerja
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin sisa kode aplikasi
COPY . .

# Bangun aplikasi untuk produksi
# Variabel VITE_API_BASE_URL akan digunakan oleh aplikasi React
# untuk mengetahui alamat backend. Di dalam Docker Compose, ini adalah http://backend:3000
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# --- TAHAP 2: SERVE ---
# Gunakan image Nginx yang ringan untuk menyajikan file statis
FROM nginx:stable-alpine

# Salin file hasil build dari tahap 'build' ke direktori default Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Salin konfigurasi Nginx kustom (akan kita buat selanjutnya)
# Ini penting untuk menangani routing di sisi klien (client-side routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80, port default untuk Nginx
EXPOSE 80

# Perintah default Nginx akan berjalan secara otomatis
CMD ["nginx", "-g", "daemon off;"]
