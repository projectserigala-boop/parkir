// ============================================================
//  PATCH SecurityDashboard.jsx — BAGIAN 3
//  Tambahkan di SecurityDashboard.jsx yang sudah ada:
//
//  1. Import tambahan (push & ref sudah ada)
//  2. Komponen <ModalGoShow />
//  3. State & handler baru di SecurityDashboard()
//  4. Tombol "GO-SHOW REQUEST" di header area tombol utama
//  5. Tab ketiga: "Go-Show History"
//
//  ⚠ BACA INSTRUKSI DI BAWAH SEBELUM COPY-PASTE
// ============================================================


// ════════════════════════════════════════════════════════════
//  LANGKAH 1 — IMPORT
//  Ganti baris import lama dengan yang ini.
//  (Tambahan: tidak ada import baru, semua sudah ada)
// ════════════════════════════════════════════════════════════

/*
import React, { useState, useEffect } from "react";
import { ref, onValue, push, update, serverTimestamp } from "firebase/database";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
*/
// ✅ Import di atas sudah benar, tidak perlu diubah.


// ════════════════════════════════════════════════════════════
//  LANGKAH 2 — TAMBAH KOMPONEN <ModalGoShow />
//  Tempelkan SEBELUM komponen ModalKendaraanMasuk (di atas baris:
//  "function ModalKendaraanMasuk...")
// ════════════════════════════════════════════════════════════

function ModalGoShow({ onClose, onSubmit, users }) {
  const [form, setForm] = useState({
    nama_tamu:   "",
    perusahaan:  "",
    keperluan:   "",
    host_uid:    "",
    host_nama:   "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "host_uid") {
      const selected = users.find((u) => u.uid === value);
      setForm((prev) => ({
        ...prev,
        host_uid:  value,
        host_nama: selected?.nama || "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.nama_tamu.trim() || !form.keperluan.trim()) {
      toast.error("Nama tamu dan keperluan wajib diisi!");
      return;
    }
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#0D0D0D",
        border:     "4px solid #FFE135",
        boxShadow:  "8px 8px 0 #FFE135",
        padding:    "28px",
        width:      "100%",
        maxWidth:   "480px",
        margin:     "0 16px",
      }}>
        {/* Judul */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "20px", paddingBottom: "16px",
          borderBottom: "3px solid #FFE135",
        }}>
          <div>
            <div style={{ color: "#FF6D00", fontWeight: 900, fontSize: "11px", letterSpacing: ".15em" }}>
              ⚡ GO-SHOW REQUEST
            </div>
            <h2 style={{ color: "#FFE135", fontWeight: 900, fontSize: "20px", textTransform: "uppercase" }}>
              Tamu Tanpa Jadwal
            </h2>
          </div>
          <button onClick={onClose} style={{ ...styles.btnYellow, padding: "8px 14px" }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ display: "grid", gap: "14px" }}>
          <div>
            <label style={{ ...styles.label, color: "#FFE135" }}>NAMA TAMU *</label>
            <input
              name="nama_tamu"
              value={form.nama_tamu}
              onChange={handleChange}
              placeholder="Nama lengkap tamu"
              style={styles.input}
            />
          </div>
          <div>
            <label style={{ ...styles.label, color: "#FFE135" }}>PERUSAHAAN</label>
            <input
              name="perusahaan"
              value={form.perusahaan}
              onChange={handleChange}
              placeholder="PT / CV / Instansi (opsional)"
              style={styles.input}
            />
          </div>
          <div>
            <label style={{ ...styles.label, color: "#FFE135" }}>KEPERLUAN *</label>
            <input
              name="keperluan"
              value={form.keperluan}
              onChange={handleChange}
              placeholder="Tujuan kedatangan tamu"
              style={styles.input}
            />
          </div>
          <div>
            <label style={{ ...styles.label, color: "#FFE135" }}>TUJUAN TEMU (HOST)</label>
            <select
              name="host_uid"
              value={form.host_uid}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">— Pilih Host / Karyawan —</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>{u.nama} ({u.departemen || u.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Info timeout */}
        <div style={{
          marginTop: "16px",
          background: "#1A1A1A", border: "2px solid #FF6D00",
          padding: "10px 14px",
          fontSize: "12px", color: "#FF6D00", fontWeight: 700,
        }}>
          ⏱ Request akan otomatis EXPIRED dalam 5 menit jika tidak direspons host.
        </div>

        {/* Tombol */}
        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ ...styles.btnYellow, flex: 1, fontSize: "15px", padding: "14px" }}
          >
            {loading ? "MENGIRIM..." : "⚡ KIRIM REQUEST"}
          </button>
          <button onClick={onClose} style={{ ...styles.btnYellow, padding: "14px 18px", opacity: 0.5 }}>
            BATAL
          </button>
        </div>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════
//  LANGKAH 3 — TAMBAH STATE & HANDLER DI SecurityDashboard()
//  Temukan bagian "export default function SecurityDashboard()"
//  Tambahkan state & useEffect & handler berikut
//  di dalam function SecurityDashboard(), setelah state yang sudah ada.
// ════════════════════════════════════════════════════════════

/*
── TAMBAHKAN STATE BARU (setelah state searchQuery):
const [showGoShow,   setShowGoShow]   = useState(false);
const [goShowLogs,   setGoShowLogs]   = useState([]);
const [hostUsers,    setHostUsers]    = useState([]);

── TAMBAHKAN useEffect BARU (setelah useEffect yang ada):

// Ambil data guest_requests hari ini untuk tab go-show history
useEffect(() => {
  const today  = new Date().toISOString().split("T")[0];
  const reqRef = ref(db, "guest_requests");
  const unsubscribe = onValue(reqRef, (snap) => {
    if (!snap.exists()) { setGoShowLogs([]); return; }
    const data = snap.val();
    const arr = Object.entries(data)
      .map(([id, val]) => ({ id, ...val }))
      .filter((r) => new Date(r.created_at).toISOString().split("T")[0] === today)
      .sort((a, b) => b.created_at - a.created_at);
    setGoShowLogs(arr);
  });
  return () => unsubscribe();
}, []);

// Ambil daftar user dengan role employee/admin sebagai pilihan host
useEffect(() => {
  const usersRef = ref(db, "users");
  const unsubscribe = onValue(usersRef, (snap) => {
    if (!snap.exists()) { setHostUsers([]); return; }
    const data = snap.val();
    const arr = Object.entries(data)
      .map(([uid, val]) => ({ uid, ...val }))
      .filter((u) => ["employee", "admin"].includes(u.role));
    setHostUsers(arr);
  });
  return () => unsubscribe();
}, []);

── TAMBAHKAN HANDLER BARU (setelah handleConfirmTamu):

const handleSubmitGoShow = async (form) => {
  try {
    const reqRef = ref(db, "guest_requests");
    await push(reqRef, {
      nama_tamu:     form.nama_tamu.trim(),
      perusahaan:    form.perusahaan.trim(),
      keperluan:     form.keperluan.trim(),
      host_uid:      form.host_uid || null,
      host_nama:     form.host_nama || null,
      security_id:   userProfile?.uid || "unknown",
      security_nama: userProfile?.nama || "Security",
      created_at:    Date.now(),          // pakai Date.now() bukan serverTimestamp untuk countdown
      status:        "pending",           // pending → approved / rejected / expired
    });
    toast.success("✓ Go-Show request terkirim! Menunggu respons host.");
  } catch (err) {
    console.error(err);
    toast.error("Gagal mengirim request.");
  }
};
*/


// ════════════════════════════════════════════════════════════
//  LANGKAH 4 — TAMBAH TAB "GO-SHOW" di bagian Tab Buttons
//  Temukan array tab yang berisi "area" dan "tamu", tambahkan "goshow":
// ════════════════════════════════════════════════════════════

/*
// SEBELUM (di dalam array .map tab):
{ key: "area",  label: `Kendaraan di Area (${logsArea.length})` },
{ key: "tamu",  label: `Tamu Terjadwal (${preRegs.length})` },

// SESUDAH:
{ key: "area",   label: `Kendaraan di Area (${logsArea.length})` },
{ key: "tamu",   label: `Tamu Terjadwal (${preRegs.length})` },
{ key: "goshow", label: `Go-Show (${goShowLogs.length})` },
*/


// ════════════════════════════════════════════════════════════
//  LANGKAH 5 — TAMBAH TOMBOL GO-SHOW di sebelah tombol utama
//  Temukan tombol besar "KENDARAAN MASUK", tambahkan tombol ini
//  di sebelahnya (dalam div style={{ display:"flex", gap:"12px" }})
// ════════════════════════════════════════════════════════════

/*
// Tambahkan tombol ini SETELAH tombol KENDARAAN MASUK, SEBELUM Search Box:
<button
  onClick={() => setShowGoShow(true)}
  style={{
    ...styles.btnBlack,
    background:      "#FF6D00",
    color:           "#fff",
    padding:         "20px 24px",
    fontSize:        "16px",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             "10px",
    whiteSpace:      "nowrap",
    boxShadow:       "4px 4px 0 #0D0D0D",
  }}
>
  <span style={{ fontSize: "22px" }}>⚡</span>
  GO-SHOW
</button>
*/


// ════════════════════════════════════════════════════════════
//  LANGKAH 6 — TAMBAH PANEL TAB GO-SHOW
//  Setelah panel "tamu" (setelah blok {activeTab === "tamu" && ...}),
//  tambahkan panel berikut:
// ════════════════════════════════════════════════════════════

/*
{activeTab === "goshow" && (
  <div style={{ ...styles.nbCard, borderTop: "none", padding: 0 }}>
    {goShowLogs.length === 0 ? (
      <div style={{ padding: "48px", textAlign: "center", opacity: 0.35, fontWeight: 800, fontSize: "18px", textTransform: "uppercase", letterSpacing: ".1em" }}>
        Belum ada go-show request hari ini
      </div>
    ) : (
      goShowLogs.map((req) => {
        const statusCfg = {
          pending:  { bg: "#FF6D00", color: "#fff",    label: "⏳ PENDING"   },
          approved: { bg: "#00C853", color: "#0D0D0D", label: "✓ APPROVED"   },
          rejected: { bg: "#FF2B2B", color: "#fff",    label: "✕ DITOLAK"    },
          expired:  { bg: "#9E9E9E", color: "#fff",    label: "⏱ EXPIRED"    },
        }[req.status] || { bg: "#9E9E9E", color: "#fff", label: req.status };

        return (
          <div
            key={req.id}
            style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "14px 16px",
              borderBottom: "3px solid #0D0D0D",
            }}
          >
            <div style={{
              background: statusCfg.bg, color: statusCfg.color,
              border: "3px solid #0D0D0D",
              padding: "4px 12px",
              fontWeight: 800, fontSize: "11px", letterSpacing: ".08em",
              minWidth: "110px", textAlign: "center",
            }}>
              {statusCfg.label}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: "14px" }}>{req.nama_tamu}</div>
              <div style={{ fontSize: "12px", opacity: 0.5, fontWeight: 700 }}>
                {req.perusahaan || "Tamu Umum"} · {req.keperluan}
              </div>
              {req.catatan_reject && (
                <div style={{ fontSize: "11px", color: "#FF2B2B", fontWeight: 700, marginTop: "2px" }}>
                  ↳ {req.catatan_reject}
                </div>
              )}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px", fontWeight: 700, opacity: 0.45,
            }}>
              {new Date(req.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
            </div>
          </div>
        );
      })
    )}
  </div>
)}
*/


// ════════════════════════════════════════════════════════════
//  LANGKAH 7 — TAMBAH MODAL DI AKHIR RETURN (sebelah ModalKendaraanMasuk)
// ════════════════════════════════════════════════════════════

/*
{showGoShow && (
  <ModalGoShow
    onClose={() => setShowGoShow(false)}
    onSubmit={handleSubmitGoShow}
    users={hostUsers}
  />
)}
*/
