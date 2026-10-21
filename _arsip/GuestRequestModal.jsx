// ============================================================
//  src/components/GuestRequestModal.jsx
//  Modal form untuk Security membuat "Request Guest Entry"
//  (tamu dadakan / go-show).
//  Diimpor dan dipakai di SecurityDashboard.jsx
// ============================================================

import React, { useState } from "react";
import toast from "react-hot-toast";

// Style Neo-Brutalism (konsisten dengan SecurityDashboard)
const S = {
  overlay: {
    position:       "fixed",
    inset:          0,
    zIndex:         50,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    background:     "rgba(0,0,0,0.65)",
  },
  modal: {
    background:  "#FFE135",
    border:      "4px solid #0D0D0D",
    boxShadow:   "10px 10px 0 #0D0D0D",
    padding:     "28px",
    width:       "100%",
    maxWidth:    "540px",
    margin:      "0 16px",
    maxHeight:   "90vh",
    overflowY:   "auto",
  },
  label: {
    display:       "block",
    fontWeight:    800,
    fontSize:      "11px",
    letterSpacing: ".09em",
    marginBottom:  "6px",
    opacity:       0.6,
    textTransform: "uppercase",
    fontFamily:    "'Space Grotesk', sans-serif",
  },
  input: {
    border:       "3px solid #0D0D0D",
    fontFamily:   "'JetBrains Mono', monospace",
    fontWeight:   500,
    fontSize:     "13px",
    padding:      "10px 14px",
    background:   "#fff",
    color:        "#0D0D0D",
    outline:      "none",
    width:        "100%",
    borderRadius: 0,
    boxShadow:    "3px 3px 0 #0D0D0D",
  },
  btnGreen: {
    fontFamily:    "'Space Grotesk', sans-serif",
    fontWeight:    800,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    cursor:        "pointer",
    borderRadius:  0,
    border:        "3px solid #0D0D0D",
    background:    "#00C853",
    color:         "#0D0D0D",
    boxShadow:     "4px 4px 0 #0D0D0D",
    padding:       "12px 20px",
    fontSize:      "15px",
  },
  btnYellow: {
    fontFamily:    "'Space Grotesk', sans-serif",
    fontWeight:    800,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    cursor:        "pointer",
    borderRadius:  0,
    border:        "3px solid #0D0D0D",
    background:    "#FFE135",
    color:         "#0D0D0D",
    boxShadow:     "4px 4px 0 #0D0D0D",
    padding:       "12px 20px",
    fontSize:      "15px",
  },
};

export default function GuestRequestModal({ onClose, onSubmit, hosts }) {
  const [form, setForm] = useState({
    nama_tamu:   "",
    perusahaan:  "",
    host_id:     "",
    catatan:     "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.nama_tamu.trim()) {
      toast.error("Nama tamu wajib diisi!");
      return;
    }
    if (!form.host_id) {
      toast.error("Pilih host yang dituju!");
      return;
    }

    const hostDipilih = hosts.find((h) => h.uid === form.host_id);
    if (!hostDipilih) {
      toast.error("Host tidak ditemukan.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...form,
        host_nama: hostDipilih.nama,
      });
      toast.success(`✓ Request dikirim ke ${hostDipilih.nama}. Timer 5 menit dimulai!`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim request. Cek koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>

        {/* Header */}
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            marginBottom:   "22px",
            paddingBottom:  "16px",
            borderBottom:   "4px solid #0D0D0D",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily:   "'Space Grotesk', sans-serif",
                fontWeight:   900,
                fontSize:     "20px",
                textTransform:"uppercase",
                letterSpacing:"-.01em",
              }}
            >
              Request Guest Entry
            </h2>
            <p style={{ fontSize: "12px", opacity: 0.55, marginTop: "4px", fontWeight: 700 }}>
              Tamu dadakan (go-show) — Host akan diberitahu segera
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ ...S.btnYellow, padding: "6px 12px", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>

        {/* Peringatan info timer */}
        <div
          style={{
            background:    "#0D0D0D",
            color:         "#FFE135",
            border:        "3px solid #0D0D0D",
            padding:       "12px 16px",
            marginBottom:  "20px",
            fontSize:      "13px",
            fontWeight:    800,
            fontFamily:    "'Space Grotesk', sans-serif",
            letterSpacing: ".02em",
            display:       "flex",
            alignItems:    "center",
            gap:           "10px",
          }}
        >
          <span style={{ fontSize: "20px" }}>⏱</span>
          <span>
            Host punya <strong style={{ color: "#fff" }}>5 MENIT</strong> untuk merespons.
            Jika tidak ada respons, request akan eskalasi otomatis ke IRGA Admin.
          </span>
        </div>

        {/* Form Fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

          {/* Nama Tamu */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={S.label}>Nama Lengkap Tamu *</label>
            <input
              name="nama_tamu"
              value={form.nama_tamu}
              onChange={handleChange}
              placeholder="Nama tamu yang akan masuk"
              style={S.input}
            />
          </div>

          {/* Perusahaan */}
          <div>
            <label style={S.label}>Perusahaan / Instansi</label>
            <input
              name="perusahaan"
              value={form.perusahaan}
              onChange={handleChange}
              placeholder="PT. Contoh Jaya (opsional)"
              style={S.input}
            />
          </div>

          {/* Pilih Host */}
          <div>
            <label style={S.label}>Tujuan / Host *</label>
            <select
              name="host_id"
              value={form.host_id}
              onChange={handleChange}
              style={S.input}
            >
              <option value="">-- Pilih Host --</option>
              {hosts.map((h) => (
                <option key={h.uid} value={h.uid}>
                  {h.nama}{h.departemen ? ` (${h.departemen})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Catatan */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={S.label}>Catatan / Keperluan</label>
            <input
              name="catatan"
              value={form.catatan}
              onChange={handleChange}
              placeholder="Keperluan kunjungan, dokumen yang dibawa, dsb."
              style={S.input}
            />
          </div>
        </div>

        {/* Tombol */}
        <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ ...S.btnGreen, flex: 1 }}
          >
            {loading ? "MENGIRIM..." : "KIRIM REQUEST →"}
          </button>
          <button onClick={onClose} style={S.btnYellow}>
            BATAL
          </button>
        </div>
      </div>
    </div>
  );
}
