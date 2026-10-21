// ============================================================
//  src/pages/SecurityDashboard.jsx  — UPDATE BAGIAN 3
//  Tambahkan section "Request Tamu Go-Show" di bawah statistik.
//  HANYA bagian baru yang perlu ditambahkan — copy paste
//  section ini ke dalam file SecurityDashboard.jsx yang sudah ada.
//
//  Yang berubah:
//    1. Import tambahan di bagian atas file
//    2. State baru: showGoShowModal
//    3. Hook useGuestRequests
//    4. Section JSX baru "Panel Request Go-Show" di bawah stats
// ============================================================

// ── LANGKAH 1: Tambahkan import berikut ke bagian atas ──────
// (letakkan setelah baris import yang sudah ada)
// ---------------------------------------------------------
// import GuestRequestModal  from "../components/GuestRequestModal";
// import CountdownTimer     from "../components/CountdownTimer";
// import { useGuestRequests } from "../hooks/useGuestRequests";
// ---------------------------------------------------------


// ── LANGKAH 2: Tambahkan state baru di dalam komponen ───────
// (letakkan bersama useState lain yang sudah ada)
// ---------------------------------------------------------
// const [showGoShowModal, setShowGoShowModal] = useState(false);
// ---------------------------------------------------------


// ── LANGKAH 3: Tambahkan hook ini di dalam komponen ─────────
// (letakkan setelah const { userProfile } = useAuth(); )
// ---------------------------------------------------------
// const {
//   requests: goShowRequests,
//   hosts,
//   createRequest,
// } = useGuestRequests({ role: userProfile?.role, uid: userProfile?.uid });
// ---------------------------------------------------------


// ── LANGKAH 4: Tambahkan JSX ini setelah blok Statistik ─────
// (cari bagian {/* Statistik */} dalam return(), letakkan tepat setelahnya)
// Salin semua kode di bawah garis putus-putus berikut:
// =========================================================

export const GoShowSection = ({
  goShowRequests,
  hosts,
  userProfile,
  showGoShowModal,
  setShowGoShowModal,
  createRequest,
}) => {

  // Warna badge berdasarkan status
  const badgeStatus = (status) => {
    const map = {
      pending:   { bg: "#FF6D00", color: "#fff",     label: "⏳ MENUNGGU" },
      approved:  { bg: "#00C853", color: "#0D0D0D",  label: "✓ DISETUJUI" },
      rejected:  { bg: "#FF2B2B", color: "#fff",     label: "✕ DITOLAK"   },
      escalated: { bg: "#7F77DD", color: "#fff",     label: "⚠ ESKALASI"  },
      expired:   { bg: "#6b7280", color: "#fff",     label: "— EXPIRED"   },
    };
    return map[status] || map.expired;
  };

  return (
    <>
      {/* ── Tombol Request Go-Show ── */}
      <div
        style={{
          background:   "#0D0D0D",
          border:       "4px solid #0D0D0D",
          boxShadow:    "6px 6px 0 #FFE13566",
          padding:      "16px 24px",
          marginBottom: "20px",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "space-between",
          gap:          "16px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily:    "'Space Grotesk', sans-serif",
              fontWeight:    900,
              fontSize:      "16px",
              color:         "#FFE135",
              textTransform: "uppercase",
              letterSpacing: ".04em",
            }}
          >
            👤 Tamu Dadakan (Go-Show)
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 700, marginTop: "4px" }}>
            Tamu tanpa pre-registrasi — butuh persetujuan Host dalam 5 menit
          </div>
        </div>
        <button
          onClick={() => setShowGoShowModal(true)}
          style={{
            fontFamily:    "'Space Grotesk', sans-serif",
            fontWeight:    800,
            textTransform: "uppercase",
            letterSpacing: ".04em",
            cursor:        "pointer",
            borderRadius:  0,
            border:        "3px solid #FFE135",
            background:    "#FFE135",
            color:         "#0D0D0D",
            boxShadow:     "4px 4px 0 #FFE13566",
            padding:       "12px 22px",
            fontSize:      "15px",
            whiteSpace:    "nowrap",
          }}
        >
          + REQUEST MASUK
        </button>
      </div>

      {/* ── Daftar Request Go-Show Hari Ini ── */}
      {goShowRequests.length > 0 && (
        <div
          style={{
            background:   "#FAFAFA",
            border:       "4px solid #0D0D0D",
            boxShadow:    "6px 6px 0 #0D0D0D",
            marginBottom: "20px",
          }}
        >
          {/* Header tabel */}
          <div
            style={{
              background:    "#0D0D0D",
              color:         "#FFE135",
              padding:       "10px 16px",
              fontFamily:    "'Space Grotesk', sans-serif",
              fontWeight:    800,
              fontSize:      "12px",
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}
          >
            RIWAYAT REQUEST GO-SHOW HARI INI
          </div>

          {goShowRequests.map((req, i) => {
            const badge = badgeStatus(req.status);
            return (
              <div
                key={req.id}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "12px",
                  padding:      "14px 16px",
                  borderBottom: i < goShowRequests.length - 1 ? "2px solid #e5e7eb" : "none",
                  background:   i % 2 === 0 ? "#fff" : "#FFFDE7",
                }}
              >
                {/* Badge status */}
                <span
                  style={{
                    background:    badge.bg,
                    color:         badge.color,
                    padding:       "4px 10px",
                    fontFamily:    "'Space Grotesk', sans-serif",
                    fontWeight:    800,
                    fontSize:      "11px",
                    letterSpacing: ".06em",
                    border:        "2px solid #0D0D0D",
                    whiteSpace:    "nowrap",
                    minWidth:      "100px",
                    textAlign:     "center",
                  }}
                >
                  {badge.label}
                </span>

                {/* Info tamu */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "14px", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {req.nama_tamu}
                    {req.perusahaan && (
                      <span style={{ fontWeight: 600, opacity: 0.55, fontSize: "12px", marginLeft: "8px" }}>
                        ({req.perusahaan})
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.6, fontWeight: 700, marginTop: "2px" }}>
                    Host: {req.host_nama}
                    {req.catatan && ` · ${req.catatan}`}
                  </div>
                </div>

                {/* Timer atau waktu diputuskan */}
                <div style={{ textAlign: "right", minWidth: "120px" }}>
                  {req.status === "pending" ? (
                    <CountdownTimerInline expireAt={req.timestamp_expire} />
                  ) : (
                    <div style={{ fontSize: "11px", opacity: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
                      {req.decided_at
                        ? new Date(req.decided_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                        : req.status === "escalated"
                        ? "Eskalasi ke Admin"
                        : "—"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showGoShowModal && (
        <GuestRequestModalInline
          onClose={() => setShowGoShowModal(false)}
          onSubmit={async (formData) => {
            await createRequest({
              ...formData,
              security_nama: userProfile?.nama || "Security",
            });
          }}
          hosts={hosts}
        />
      )}
    </>
  );
};

// ── Komponen internal kecil ──────────────────────────────────
// (versi inline — sudah include langsung di sini agar tidak perlu import terpisah)

function CountdownTimerInline({ expireAt }) {
  const [sisa, setSisa] = React.useState(0);
  React.useEffect(() => {
    const hitung = () => setSisa(Math.max(0, Math.floor((expireAt - Date.now()) / 1000)));
    hitung();
    const id = setInterval(hitung, 1000);
    return () => clearInterval(id);
  }, [expireAt]);

  const mm = String(Math.floor(sisa / 60)).padStart(2, "0");
  const ss = String(sisa % 60).padStart(2, "0");
  const isKritis = sisa <= 60;
  const bg = isKritis ? "#FF2B2B" : sisa <= 120 ? "#FF6D00" : "#0D0D0D";

  if (sisa === 0) return <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", opacity: 0.4 }}>EXPIRED</span>;

  return (
    <span style={{
      fontFamily: "'JetBrains Mono',monospace",
      fontWeight: 700,
      fontSize: "14px",
      background: bg,
      color: "#FFE135",
      padding: "3px 10px",
      border: `2px solid ${bg}`,
      letterSpacing: ".05em",
    }}>
      ⏱ {mm}:{ss}
    </span>
  );
}

function GuestRequestModalInline({ onClose, onSubmit, hosts }) {
  const [form, setForm] = React.useState({ nama_tamu: "", perusahaan: "", host_id: "", catatan: "" });
  const [loading, setLoading] = React.useState(false);

  const s = {
    overlay: { position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.65)" },
    modal: { background:"#FFE135",border:"4px solid #0D0D0D",boxShadow:"10px 10px 0 #0D0D0D",padding:"28px",width:"100%",maxWidth:"540px",margin:"0 16px",maxHeight:"90vh",overflowY:"auto" },
    label: { display:"block",fontWeight:800,fontSize:"11px",letterSpacing:".09em",marginBottom:"6px",opacity:0.6,textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif" },
    input: { border:"3px solid #0D0D0D",fontFamily:"'JetBrains Mono',monospace",fontWeight:500,fontSize:"13px",padding:"10px 14px",background:"#fff",color:"#0D0D0D",outline:"none",width:"100%",borderRadius:0,boxShadow:"3px 3px 0 #0D0D0D" },
    btnG: { fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,textTransform:"uppercase",cursor:"pointer",borderRadius:0,border:"3px solid #0D0D0D",background:"#00C853",color:"#0D0D0D",boxShadow:"4px 4px 0 #0D0D0D",padding:"12px 20px",fontSize:"15px",letterSpacing:".04em" },
    btnY: { fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,textTransform:"uppercase",cursor:"pointer",borderRadius:0,border:"3px solid #0D0D0D",background:"#FFE135",color:"#0D0D0D",boxShadow:"4px 4px 0 #0D0D0D",padding:"12px 20px",fontSize:"15px",letterSpacing:".04em" },
  };

  const handleSubmit = async () => {
    if (!form.nama_tamu.trim()) { alert("Nama tamu wajib diisi!"); return; }
    if (!form.host_id) { alert("Pilih host yang dituju!"); return; }
    const host = hosts.find(h => h.uid === form.host_id);
    setLoading(true);
    try { await onSubmit({ ...form, host_nama: host?.nama || "—" }); onClose(); }
    catch (e) { alert("Gagal mengirim request."); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",paddingBottom:"16px",borderBottom:"4px solid #0D0D0D" }}>
          <div>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,fontSize:"20px",textTransform:"uppercase" }}>Request Guest Entry</h2>
            <p style={{ fontSize:"12px",opacity:0.55,marginTop:"4px",fontWeight:700 }}>Tamu dadakan — Host dinotifikasi segera</p>
          </div>
          <button onClick={onClose} style={{ ...s.btnY,padding:"6px 12px",fontSize:"16px" }}>✕</button>
        </div>

        {/* Info 5 menit */}
        <div style={{ background:"#0D0D0D",color:"#FFE135",border:"3px solid #0D0D0D",padding:"12px 16px",marginBottom:"20px",fontSize:"13px",fontWeight:800,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:"10px" }}>
          <span style={{ fontSize:"20px" }}>⏱</span>
          <span>Host punya <strong style={{ color:"#fff" }}>5 MENIT</strong> untuk merespons. Jika tidak, otomatis eskalasi ke Admin.</span>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px" }}>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={s.label}>Nama Lengkap Tamu *</label>
            <input name="nama_tamu" value={form.nama_tamu} onChange={e=>setForm(p=>({...p,nama_tamu:e.target.value}))} placeholder="Nama tamu yang akan masuk" style={s.input}/>
          </div>
          <div>
            <label style={s.label}>Perusahaan / Instansi</label>
            <input name="perusahaan" value={form.perusahaan} onChange={e=>setForm(p=>({...p,perusahaan:e.target.value}))} placeholder="PT. Contoh (opsional)" style={s.input}/>
          </div>
          <div>
            <label style={s.label}>Host / Tujuan *</label>
            <select name="host_id" value={form.host_id} onChange={e=>setForm(p=>({...p,host_id:e.target.value}))} style={s.input}>
              <option value="">-- Pilih Host --</option>
              {hosts.map(h=><option key={h.uid} value={h.uid}>{h.nama}{h.departemen?` (${h.departemen})`:""}</option>)}
            </select>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={s.label}>Catatan / Keperluan</label>
            <input name="catatan" value={form.catatan} onChange={e=>setForm(p=>({...p,catatan:e.target.value}))} placeholder="Keperluan kunjungan, dsb." style={s.input}/>
          </div>
        </div>

        <div style={{ display:"flex",gap:"10px",marginTop:"22px" }}>
          <button onClick={handleSubmit} disabled={loading} style={{ ...s.btnG,flex:1 }}>
            {loading ? "MENGIRIM..." : "KIRIM REQUEST →"}
          </button>
          <button onClick={onClose} style={s.btnY}>BATAL</button>
        </div>
      </div>
    </div>
  );
}
