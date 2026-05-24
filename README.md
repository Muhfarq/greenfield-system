# 🌿 Greenfield OMS
**Operations Management System — PT Greenfield, Ngajum, Malang**

> Sistem manajemen operasional berbasis web untuk monitoring aktivitas lapangan, pengelolaan aset, pencatatan insiden, dan manajemen alur produksi berbasis Kanban dengan Attention Logic Dashboard.

---

## 📋 Deskripsi

Greenfield OMS adalah aplikasi fullstack yang dirancang untuk menjawab kebutuhan operasional PT Greenfield dalam mendeteksi anomali data secara cepat dan mengelola alur produksi secara visual. Sistem ini mengimplementasikan **Opsi B: Production & Kanban Task** — manajemen alur produksi berbasis Kanban meliputi task assignment dan progress tracking.

### Fitur Utama
- 🚨 **Attention Logic Dashboard** — highlight otomatis data darurat berdasarkan urgency level (Critical/High/Normal)
- ⚡ **Auto-Urgency Detection** — sistem otomatis mengubah urgency via PostgreSQL trigger tanpa intervensi manual
- 📋 **Kanban Board** — manajemen task visual dengan drag & drop, filter per operator, dan progress tracking
- 🏭 **Manajemen Aktivitas** — pencatatan aktivitas produksi dengan tipe: maintenance, inspeksi, produksi, darurat
- 🔧 **Manajemen Aset** — inventaris aset dengan monitoring kondisi dan insiden terkait
- 🚑 **Log Insiden** — pelaporan dan penanganan insiden operasional real-time
- 👥 **Kelola User** — manajemen akun dengan role Admin dan Operator
- 🔐 **Auth JWT** — autentikasi stateless dengan session 8 jam

---

## 🛠️ Tech Stack

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| Frontend | React + Vite | SPA interaktif, fast build |
| Styling | CSS Modules | Style terisolasi per komponen |
| Chart | Recharts | Grafik distribusi insiden |
| HTTP Client | Axios | Auto-inject JWT via interceptor |
| Backend | Node.js + Express | REST API, ringan di VM 2GB |
| Database | PostgreSQL 17 | Raw SQL, no ORM, triggers |
| Auth | JWT (jsonwebtoken) | Stateless, expire 8 jam |
| Password | bcryptjs | Cost factor 10 |
| Process Manager | PM2 | Zero-downtime, auto-restart |
| Reverse Proxy | Nginx | Static serving + proxy |

---

## 📁 Struktur Proyek

```
greenfield-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Koneksi PostgreSQL
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js            # Login, register, user management
│   │   │   ├── activities.js      # CRUD aktivitas
│   │   │   ├── assets.js          # CRUD aset
│   │   │   ├── incidents.js       # CRUD insiden
│   │   │   └── tasks.js           # CRUD task + status update
│   │   ├── app.js                 # Entry point Express
│   │   └── seed.js                # Seed default users
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance + interceptor
│   │   ├── assets/                # SVG icons & images
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # Collapsible sidebar
│   │   │   └── Sidebar.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Admin only
│   │   │   ├── Activities.jsx
│   │   │   ├── Assets.jsx
│   │   │   ├── Incidents.jsx
│   │   │   ├── Kanban.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Users.jsx          # Admin only
│   │   └── App.jsx                # Router + route guard
│   └── package.json
└── schema.sql                     # Database schema + triggers
```

---

## 🚀 Cara Menjalankan (Development)

### Prerequisites
- Node.js v18+
- PostgreSQL 17
- npm

### 1. Clone Repository
```bash
git clone https://github.com/Muhfarq/greenfield-system.git
cd greenfield-system
```

### 2. Setup Database
```bash
# Buat database
psql -U postgres -c "CREATE DATABASE greenfield_db"

# Jalankan schema
psql -U postgres -d greenfield_db -f schema.sql
```

### 3. Setup Backend
```bash
cd backend
npm install

# Buat file .env
cp .env.example .env
# Edit .env sesuai konfigurasi lokal kamu
```

**Isi file `.env`:**
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenfield_db
DB_USER=postgres
DB_PASSWORD=passwordmu
JWT_SECRET=greenfield_secret_key
```

```bash
# Seed default users
node src/seed.js

# Jalankan backend
npm run dev
```

Backend berjalan di `http://localhost:5000`

### 4. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`

---

## 🗄️ Database Schema

Schema database tersedia di file `schema.sql` dan mencakup:

- **6 tabel utama**: users, activities, assets, incidents, tasks, audit_logs
- **7 ENUM types**: user_role, urgency_level, activity_status, asset_condition, incident_status, task_status, task_priority
- **PostgreSQL Triggers**:
  - `trg_auto_urgency_activities` — set urgency CRITICAL otomatis jika tipe aktivitas = 'darurat'
  - `trg_auto_urgency_assets` — eskalasi insiden terkait ke CRITICAL jika kondisi aset = 'rusak'
- **Scheduled Function**: `escalate_stale_incidents()` — eskalasi insiden open > 24 jam ke HIGH
- **Partial Indexes** untuk optimasi query dashboard dan Kanban

---

## 👤 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@greenfield.com | admin123 |
| Operator | operator@greenfield.com | operator123 |

> ⚠️ Ganti password default setelah deployment ke production.

---

## 🔐 Role & Akses

| Fitur                          | Admin      | Operator                    |
|--------------------------------|------------|-----------------------------|
| Dashboard (statistik & grafik) | ✅         | ❌ (redirect ke Aktivitas) |
| CRUD Aktivitas                 | ✅ Semua   | ✅ Milik sendiri           |
| CRUD Aset                      | ✅ Semua   | ✅ Milik sendiri           |
| CRUD Insiden                   | ✅ Semua   | ✅ Milik sendiri           |
| Kanban — Buat & Assign Task    | ✅         | ❌                         |
| Kanban — Update Status Task    | ✅ Semua   | ✅ Task milik sendiri      |
| Kanban — Filter per Operator   | ✅         | ❌                         |
| Kelola User                    | ✅         | ❌                         |

---

## 🌐 Deployment (Ubuntu VM)

### Prerequisites
```bash
sudo apt update
sudo apt install -y nodejs npm postgresql nginx
npm install -g pm2
```

### Steps
```bash
# 1. Clone & build
git clone https://github.com/Muhfarq/greenfield-system.git
cd greenfield-system/frontend && npm install && npm run build

# 2. Setup database
sudo -u postgres psql -c "CREATE DATABASE greenfield_db"
sudo -u postgres psql -d greenfield_db -f ../schema.sql

# 3. Setup backend
cd ../backend && npm install
cp .env.example .env  # Edit sesuai konfigurasi VM

# 4. Seed & start
node src/seed.js
pm2 start src/app.js --name greenfield-api
pm2 save && pm2 startup
```

### Konfigurasi Nginx
```nginx
server {
    listen 80;
    server_name your-domain-or-ip;

    # Serve React build
    root /path/to/greenfield-system/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy ke backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📊 Evaluation Matrix

| Komponen                         | Bobot | Implementasi                                                    |
|----------------------------------|-------|-----------------------------------------------------------------|
| Functionality                    | 30%   | CRUD semua entitas, Attention Logic, Kanban                     |
| Operational Usability            | 30%   | Toast notification, confirm dialog, sidebar collapsible, filter |
| Diagram & Workflow Documentation | 25%   | System Design Doc, ERD, API docs                                |
| Scalability & HA Blueprint       | 15%   | PM2, Nginx, PostgreSQL triggers, partial index                  |

---

## 🎯 Target Environment

```
VM Spec    : CPU 1 Core — 2GB RAM
OS         : Ubuntu 22.04 LTS
Deployment : Internal VM (Phased rollout dari staging)
```

---

## 👨‍💻 Developer

**Muhammad Faruq** — Magang System Designer  
PT Greenfield, Ngajum, Malang · Mei 2026

---

<div align="center">
  <sub>Built with ❤️ for PT Greenfield Operations</sub>
</div>
