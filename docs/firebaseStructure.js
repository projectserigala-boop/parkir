// ============================================================
//  src/firebaseStructure.js
//  File REFERENSI saja — menggambarkan struktur database.
//  Anda TIDAK perlu menjalankan file ini. Gunakan sebagai panduan.
// ============================================================

/**
 * Struktur Realtime Database SmartGate Management
 *
 * smartgate-db/
 * │
 * ├── logs/
 * │   └── {logId}/
 * │       ├── plat_nomor      : "B 1234 XYZ"       — Plat kendaraan
 * │       ├── nama_driver     : "Budi Santoso"      — Nama pengemudi/tamu
 * │       ├── kategori        : "Truk" | "Tamu"     — Jenis kendaraan
 * │       ├── tujuan          : "Gudang A"           — Tujuan di dalam pabrik
 * │       ├── timestamp_in    : 1700000000000        — Waktu masuk (ms)
 * │       ├── timestamp_out   : 1700003600000        — Waktu keluar (ms), null jika masih di dalam
 * │       ├── status          : "Area" | "Keluar"   — Status saat ini
 * │       ├── catatan         : "Muatan: 10 ton"    — Catatan tambahan (opsional)
 * │       └── security_id     : "uid-security-123"  — UID petugas yang input
 * │
 * ├── pre_registrations/
 * │   └── {regId}/
 * │       ├── nama_tamu       : "Andi Wijaya"        — Nama tamu yang didaftarkan
 * │       ├── perusahaan      : "PT. Maju Jaya"      — Perusahaan tamu (opsional)
 * │       ├── host_id         : "uid-employee-456"   — UID karyawan yang mendaftarkan
 * │       ├── host_nama       : "Siti Rahayu"        — Nama karyawan host
 * │       ├── tanggal         : "2024-01-15"         — Tanggal kunjungan (YYYY-MM-DD)
 * │       ├── jam             : "09:00"              — Jam kunjungan (HH:mm)
 * │       ├── keperluan       : "Meeting produksi"   — Keperluan kunjungan
 * │       ├── status_approve  : "pending" | "approved" | "rejected" | "done"
 * │       └── created_at      : 1700000000000        — Waktu pendaftaran dibuat
 * │
 * └── users/
 *     └── {uid}/
 *         ├── nama            : "Ahmad Fauzi"        — Nama lengkap
 *         ├── email           : "ahmad@pabrik.com"   — Email login
 *         ├── role            : "security" | "employee" | "warehouse" | "admin"
 *         ├── departemen      : "Keamanan"           — Departemen (opsional)
 *         ├── aktif           : true | false         — Status akun
 *         └── created_at      : 1700000000000        — Waktu akun dibuat
 */

// Contoh data dummy untuk testing (bisa di-paste langsung ke Firebase Console → Import JSON)
export const contohDataDummy = {
  logs: {
    "log-001": {
      plat_nomor:    "B 9876 TRK",
      nama_driver:   "Hendra Gunawan",
      kategori:      "Truk",
      tujuan:        "Gudang B",
      timestamp_in:  Date.now() - 3600000,
      timestamp_out: null,
      status:        "Area",
      catatan:       "Pengiriman bahan baku",
      security_id:   "uid-security-001",
    },
    "log-002": {
      plat_nomor:    "D 4321 TMS",
      nama_driver:   "Rudi Hermawan",
      kategori:      "Tamu",
      tujuan:        "Kantor HRD",
      timestamp_in:  Date.now() - 7200000,
      timestamp_out: Date.now() - 3600000,
      status:        "Keluar",
      catatan:       "",
      security_id:   "uid-security-001",
    },
  },
  pre_registrations: {
    "reg-001": {
      nama_tamu:     "Dian Pratiwi",
      perusahaan:    "PT. Sukses Makmur",
      host_id:       "uid-employee-001",
      host_nama:     "Siti Rahayu",
      tanggal:       "2024-01-15",
      jam:           "10:00",
      keperluan:     "Presentasi produk baru",
      status_approve: "approved",
      created_at:    Date.now() - 86400000,
    },
  },
  users: {
    "uid-security-001": {
      nama:        "Ahmad Fauzi",
      email:       "security@smartgate.com",
      role:        "security",
      departemen:  "Keamanan",
      aktif:       true,
      created_at:  Date.now() - 2592000000,
    },
    "uid-employee-001": {
      nama:        "Siti Rahayu",
      email:       "siti@smartgate.com",
      role:        "employee",
      departemen:  "HR & GA",
      aktif:       true,
      created_at:  Date.now() - 2592000000,
    },
    "uid-admin-001": {
      nama:        "Budi Direktur",
      email:       "admin@smartgate.com",
      role:        "admin",
      departemen:  "Manajemen",
      aktif:       true,
      created_at:  Date.now() - 2592000000,
    },
  },
};
