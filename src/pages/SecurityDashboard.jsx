import React, { useState, useEffect } from "react";
import { ref, onValue, push, update, serverTimestamp } from "firebase/database";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
function ModalKendaraanMasuk({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    plat_nomor: "",
    nama_driver: "",
    kategori: "Truk",
    tujuan: "Gudang A",
    catatan: "",
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async () => {
    if (!form.plat_nomor.trim() || !form.nama_driver.trim()) {
      toast.error("Plat nomor dan nama wajib diisi!");
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
      style={{
        background: "rgba(0,0,0,0.65)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg mx-4 overflow-y-auto"
        style={{
          background: "#FFE135",
          border: "4px solid #0D0D0D",
          boxShadow: "8px 8px 0 #0D0D0D",
          maxHeight: "90vh",
          padding: "28px",
        }}
      >
        <div
          className="flex items-center justify-between mb-6 pb-4"
          style={{
            borderBottom: "4px solid #0D0D0D",
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: "22px",
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
            }}
          >
            Kendaraan Masuk
          </h2>
          <button onClick={onClose} style={styles.btnBlack}>
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={styles.label}>PLAT NOMOR *</label>
            <input
              name="plat_nomor"
              value={form.plat_nomor}
              onChange={handleChange}
              placeholder="B 1234 XYZ"
              style={{
                ...styles.input,
                textTransform: "uppercase",
              }}
            />
          </div>
          <div>
            <label style={styles.label}>KATEGORI *</label>
            <select
              name="kategori"
              value={form.kategori}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Truk">Truk</option>
              <option value="Tamu">Tamu</option>
            </select>
          </div>
          <div className="col-span-2">
            <label style={styles.label}>NAMA DRIVER / TAMU *</label>
            <input
              name="nama_driver"
              value={form.nama_driver}
              onChange={handleChange}
              placeholder="Nama lengkap"
              style={styles.input}
            />
          </div>
          <div className="col-span-2">
            <label style={styles.label}>TUJUAN *</label>
            <select name="tujuan" value={form.tujuan} onChange={handleChange} style={styles.input}>
              {[
                "Gudang A",
                "Gudang B",
                "Gudang C",
                "Loading Dock",
                "Kantor Produksi",
                "Kantor HRD",
                "Parkir Tamu",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label style={styles.label}>CATATAN (opsional)</label>
            <input
              name="catatan"
              value={form.catatan}
              onChange={handleChange}
              placeholder="Muatan, keperluan, informasi tambahan..."
              style={styles.input}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...styles.btnGreen,
              flex: 1,
              fontSize: "16px",
              padding: "14px",
            }}
          >
            {loading ? "MENYIMPAN..." : "KONFIRMASI MASUK"}
          </button>
          <button
            onClick={onClose}
            style={{
              ...styles.btnYellow,
              padding: "14px 20px",
            }}
          >
            BATAL
          </button>
        </div>
      </div>
    </div>
  );
}
function VehicleCard({ vehicle, onCheckout }) {
  const masukDate = new Date(vehicle.timestamp_in);
  const jamMasuk = masukDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const diffMs = Date.now() - vehicle.timestamp_in;
  const diffJam = Math.floor(diffMs / 3600000);
  const diffMnt = Math.floor((diffMs % 3600000) / 60000);
  const durasi = diffJam > 0 ? `${diffJam}j ${diffMnt}m` : `${diffMnt}m`;
  return (
    <div
      className="flex items-center gap-4 p-4"
      style={{
        borderBottom: "3px solid #0D0D0D",
      }}
    >
      <div
        style={{
          minWidth: "120px",
        }}
      >
        <div style={styles.platNomor}>{vehicle.plat_nomor}</div>
        <div style={styles.kategoriPill}>{vehicle.kategori === "Truk" ? "🚛 TRUK" : "👤 TAMU"}</div>
      </div>

      <div
        style={{
          flex: 1,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: "15px",
          }}
        >
          {vehicle.nama_driver}
        </div>
        <div
          style={{
            fontSize: "12px",
            opacity: 0.55,
            fontWeight: 700,
            marginTop: "2px",
          }}
        >
          → {vehicle.tujuan}
          {vehicle.catatan ? ` · ${vehicle.catatan}` : ""}
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          minWidth: "70px",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: "18px",
          }}
        >
          {jamMasuk}
        </div>
        <div
          style={{
            fontSize: "10px",
            opacity: 0.45,
            fontWeight: 800,
            letterSpacing: ".08em",
          }}
        >
          {durasi}
        </div>
      </div>

      <button
        onClick={() => onCheckout(vehicle)}
        style={{
          ...styles.btnRed,
          fontSize: "13px",
          padding: "10px 16px",
        }}
      >
        CHECK-OUT
      </button>
    </div>
  );
}
function TamuCard({ tamu, onConfirm }) {
  return (
    <div
      className="flex items-center gap-4 p-4"
      style={{
        borderBottom: "3px solid #0D0D0D",
        background: "#FFFDE7",
      }}
    >
      <div
        style={{
          background: "#FF6D00",
          border: "3px solid #0D0D0D",
          padding: "10px 14px",
          textAlign: "center",
          minWidth: "70px",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: "18px",
          }}
        >
          {tamu.jam}
        </div>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 800,
            opacity: 0.7,
          }}
        >
          WIB
        </div>
      </div>

      <div
        style={{
          flex: 1,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: "15px",
          }}
        >
          {tamu.nama_tamu}
        </div>
        <div
          style={{
            fontSize: "12px",
            opacity: 0.55,
            fontWeight: 700,
            marginTop: "2px",
          }}
        >
          {tamu.perusahaan || "Tamu Umum"} · Host: {tamu.host_nama || "—"}
        </div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 800,
            marginTop: "4px",
            color: "#1565C0",
          }}
        >
          {tamu.keperluan}
        </div>
      </div>

      <button
        onClick={() => onConfirm(tamu)}
        style={{
          ...styles.btnGreen,
          fontSize: "13px",
          padding: "10px 14px",
        }}
      >
        CONFIRM MASUK
      </button>
    </div>
  );
}
export default function SecurityDashboard() {
  const { userProfile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [preRegs, setPreRegs] = useState([]);
  const [activeTab, setActiveTab] = useState("area");
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [jamSekarang, setJamSekarang] = useState("");
  useEffect(() => {
    const tick = () => {
      setJamSekarang(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB",
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const logsRef = ref(db, "logs");
    const unsubscribe = onValue(logsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        arr.sort((a, b) => b.timestamp_in - a.timestamp_in);
        setLogs(arr);
      } else {
        setLogs([]);
      }
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const regRef = ref(db, "pre_registrations");
    const unsubscribe = onValue(regRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.entries(data)
          .map(([id, val]) => ({
            id,
            ...val,
          }))
          .filter((r) => r.tanggal === today && r.status_approve === "approved");
        setPreRegs(arr);
      } else {
        setPreRegs([]);
      }
    });
    return () => unsubscribe();
  }, []);
  const logsArea = logs.filter((l) => l.status === "Area");
  const logsKeluar = logs.filter((l) => l.status === "Keluar");
  const searchQ = searchQuery.toUpperCase();
  const filteredArea = searchQ
    ? logs.filter(
        (l) =>
          l.plat_nomor?.toUpperCase().includes(searchQ) ||
          l.nama_driver?.toUpperCase().includes(searchQ),
      )
    : logsArea;
  const handleSubmitMasuk = async (form) => {
    try {
      const logsRef = ref(db, "logs");
      await push(logsRef, {
        plat_nomor: form.plat_nomor.toUpperCase().trim(),
        nama_driver: form.nama_driver.trim(),
        kategori: form.kategori,
        tujuan: form.tujuan,
        catatan: form.catatan.trim(),
        timestamp_in: serverTimestamp(),
        timestamp_out: null,
        status: "Area",
        security_id: userProfile?.uid || "unknown",
      });
      toast.success(`✓ ${form.plat_nomor.toUpperCase()} berhasil masuk!`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan. Cek koneksi internet.");
    }
  };
  const handleCheckout = async (vehicle) => {
    if (
      !window.confirm(
        `Konfirmasi CHECK-OUT kendaraan ${vehicle.plat_nomor} (${vehicle.nama_driver})?`,
      )
    )
      return;
    try {
      const logRef = ref(db, `logs/${vehicle.id}`);
      await update(logRef, {
        status: "Keluar",
        timestamp_out: serverTimestamp(),
      });
      toast.success(`✓ ${vehicle.plat_nomor} telah keluar`);
    } catch (err) {
      toast.error("Gagal memproses checkout.");
    }
  };
  const handleConfirmTamu = async (tamu) => {
    const plat = window.prompt(`Masukkan plat nomor kendaraan untuk tamu:\n${tamu.nama_tamu}`, "");
    if (!plat) return;
    try {
      const logsRef = ref(db, "logs");
      await push(logsRef, {
        plat_nomor: plat.toUpperCase().trim(),
        nama_driver: tamu.nama_tamu,
        kategori: "Tamu",
        tujuan: "Tamu Terjadwal",
        catatan: `Pre-registered: ${tamu.keperluan}`,
        timestamp_in: serverTimestamp(),
        timestamp_out: null,
        status: "Area",
        security_id: userProfile?.uid || "unknown",
        pre_reg_id: tamu.id,
      });
      const regRef = ref(db, `pre_registrations/${tamu.id}`);
      await update(regRef, {
        status_approve: "done",
      });
      toast.success(`✓ Tamu ${tamu.nama_tamu} berhasil dikonfirmasi masuk`);
    } catch (err) {
      toast.error("Gagal mengkonfirmasi tamu.");
    }
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFE135",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
      `}</style>

      <div
        style={{
          height: "8px",
          background:
            "repeating-linear-gradient(45deg,#0D0D0D 0,#0D0D0D 2px,transparent 2px,transparent 10px)",
          borderBottom: "4px solid #0D0D0D",
        }}
      />

      <div
        style={{
          background: "#FFE135",
          borderBottom: "4px solid #0D0D0D",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "#0D0D0D",
              padding: "8px 16px",
              border: "3px solid #0D0D0D",
            }}
          >
            <span
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#FFE135",
                letterSpacing: "-.02em",
              }}
            >
              SMART
              <span
                style={{
                  background: "#FF2B2B",
                  padding: "0 4px",
                }}
              >
                GATE
              </span>
            </span>
          </div>
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: ".1em",
                opacity: 0.5,
              }}
            >
              SECURITY DASHBOARD
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              {jamSekarang}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#00C853",
              border: "3px solid #0D0D0D",
              padding: "4px 12px",
              fontWeight: 800,
              fontSize: "11px",
              letterSpacing: ".08em",
            }}
          >
            ● ONLINE
          </div>
          <div
            style={{
              background: "#fff",
              border: "3px solid #0D0D0D",
              padding: "8px 14px",
              fontWeight: 800,
              fontSize: "13px",
            }}
          >
            {userProfile?.nama || "Security"}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              label: "TOTAL MASUK HARI INI",
              value: logs.length,
              bg: "#fff",
            },
            {
              label: "DI DALAM AREA",
              value: logsArea.length,
              bg: "#00C853",
            },
            {
              label: "SUDAH KELUAR",
              value: logsKeluar.length,
              bg: "#E3F2FD",
            },
            {
              label: "TAMU TERJADWAL",
              value: preRegs.length,
              bg: "#FF6D00",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                ...styles.nbCard,
                background: s.bg,
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: ".08em",
                  opacity: 0.55,
                  marginBottom: "6px",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "44px",
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => setShowModal(true)}
            style={{
              ...styles.btnBlack,
              flex: 1,
              fontSize: "22px",
              padding: "20px 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
            }}
          >
            <span
              style={{
                fontSize: "28px",
              }}
            >
              ＋
            </span>
            KENDARAAN MASUK
          </button>

          <div
            style={{
              ...styles.nbCard,
              flex: 1,
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: ".1em",
                opacity: 0.5,
              }}
            >
              CARI PLAT NOMOR / NAMA
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="B 1234 ABC atau nama driver..."
                style={{
                  ...styles.input,
                  flex: 1,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    ...styles.btnYellow,
                    padding: "10px 14px",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "4px",
            borderBottom: "4px solid #0D0D0D",
          }}
        >
          {[
            {
              key: "area",
              label: `Kendaraan di Area (${logsArea.length})`,
            },
            {
              key: "tamu",
              label: `Tamu Terjadwal (${preRegs.length})`,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setSearchQuery("");
              }}
              style={{
                background: activeTab === t.key ? "#FFE135" : "#0D0D0D",
                color: activeTab === t.key ? "#0D0D0D" : "#FFE135",
                border: "3px solid #0D0D0D",
                borderBottom: activeTab === t.key ? "3px solid #FFE135" : "3px solid #0D0D0D",
                padding: "10px 22px",
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 800,
                fontSize: "13px",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: ".05em",
                boxShadow: activeTab === t.key ? "4px 4px 0 #0D0D0D" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "area" && (
          <div
            style={{
              ...styles.nbCard,
              borderTop: "none",
              padding: 0,
            }}
          >
            {filteredArea.length === 0 ? (
              <div
                style={{
                  padding: "48px",
                  textAlign: "center",
                  opacity: 0.35,
                  fontWeight: 800,
                  fontSize: "18px",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                }}
              >
                {searchQuery ? "Tidak ditemukan" : "Tidak ada kendaraan di area"}
              </div>
            ) : (
              filteredArea.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} onCheckout={handleCheckout} />
              ))
            )}
          </div>
        )}

        {activeTab === "tamu" && (
          <div
            style={{
              ...styles.nbCard,
              borderTop: "none",
              padding: 0,
            }}
          >
            {preRegs.length === 0 ? (
              <div
                style={{
                  padding: "48px",
                  textAlign: "center",
                  opacity: 0.35,
                  fontWeight: 800,
                  fontSize: "18px",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                }}
              >
                Tidak ada tamu terjadwal hari ini
              </div>
            ) : (
              preRegs.map((t) => <TamuCard key={t.id} tamu={t} onConfirm={handleConfirmTamu} />)
            )}
          </div>
        )}
      </div>

      {showModal && (
        <ModalKendaraanMasuk onClose={() => setShowModal(false)} onSubmit={handleSubmitMasuk} />
      )}
    </div>
  );
}
const styles = {
  nbCard: {
    background: "#FAFAFA",
    border: "4px solid #0D0D0D",
    boxShadow: "6px 6px 0 #0D0D0D",
    borderRadius: 0,
  },
  btnBase: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    cursor: "pointer",
    borderRadius: 0,
    transition: "all .1s",
    border: "3px solid #0D0D0D",
  },
  get btnBlack() {
    return {
      ...this.btnBase,
      background: "#0D0D0D",
      color: "#FFE135",
      boxShadow: "4px 4px 0 #FFE13566",
    };
  },
  get btnRed() {
    return {
      ...this.btnBase,
      background: "#FF2B2B",
      color: "#fff",
      boxShadow: "4px 4px 0 #0D0D0D",
    };
  },
  get btnGreen() {
    return {
      ...this.btnBase,
      background: "#00C853",
      color: "#0D0D0D",
      boxShadow: "4px 4px 0 #0D0D0D",
    };
  },
  get btnYellow() {
    return {
      ...this.btnBase,
      background: "#FFE135",
      color: "#0D0D0D",
      boxShadow: "4px 4px 0 #0D0D0D",
    };
  },
  input: {
    border: "3px solid #0D0D0D",
    fontFamily: "'JetBrains Mono',monospace",
    fontWeight: 500,
    fontSize: "13px",
    padding: "10px 14px",
    background: "#fff",
    color: "#0D0D0D",
    outline: "none",
    width: "100%",
    borderRadius: 0,
    boxShadow: "3px 3px 0 #0D0D0D",
  },
  label: {
    display: "block",
    fontWeight: 800,
    fontSize: "11px",
    letterSpacing: ".09em",
    marginBottom: "6px",
    opacity: 0.6,
    textTransform: "uppercase",
  },
  platNomor: {
    background: "#0D0D0D",
    color: "#FFE135",
    padding: "4px 12px",
    fontFamily: "'JetBrains Mono',monospace",
    fontWeight: 700,
    fontSize: "14px",
    letterSpacing: ".1em",
    display: "inline-block",
    border: "2px solid #0D0D0D",
  },
  kategoriPill: {
    display: "inline-block",
    marginTop: "4px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: ".08em",
    opacity: 0.5,
    textTransform: "uppercase",
  },
};
