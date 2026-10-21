import React, { useState, useEffect, useCallback } from "react";
import {
  ref,
  onValue,
  update,
  serverTimestamp,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
const TIMEOUT_MS = 5 * 60 * 1000;
function CountdownTimer({ createdAt, onExpire }) {
  const [sisa, setSisa] = useState(TIMEOUT_MS);
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - createdAt;
      const remaining = Math.max(0, TIMEOUT_MS - elapsed);
      setSisa(remaining);
      if (remaining === 0) onExpire?.();
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [createdAt, onExpire]);
  const totalSecs = Math.ceil(sisa / 1000);
  const mnt = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const pct = sisa / TIMEOUT_MS;
  const color = pct > 0.5 ? "#00C853" : pct > 0.2 ? "#FF6D00" : "#FF2B2B";
  return (
    <div
      style={{
        textAlign: "center",
        minWidth: "80px",
      }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="#E0E0E0" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${2 * Math.PI * 28}`}
          strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct)}`}
          strokeLinecap="butt"
          transform="rotate(-90 32 32)"
          style={{
            transition: "stroke-dashoffset 0.5s linear, stroke 0.5s",
          }}
        />
        <text
          x="32"
          y="37"
          textAnchor="middle"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: "14px",
            fill: color,
          }}
        >
          {String(mnt).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </text>
      </svg>
      <div
        style={{
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: ".08em",
          opacity: 0.5,
        }}
      >
        SISA WAKTU
      </div>
    </div>
  );
}
function ModalReject({ request, onClose, onConfirm }) {
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    setLoading(true);
    await onConfirm(request, catatan || "Ditolak oleh host");
    setLoading(false);
    onClose();
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#FF2B2B",
          border: "4px solid #0D0D0D",
          boxShadow: "8px 8px 0 #0D0D0D",
          padding: "28px",
          width: "100%",
          maxWidth: "440px",
          margin: "0 16px",
        }}
      >
        <h2
          style={{
            ...S.heading,
            color: "#fff",
            marginBottom: "16px",
          }}
        >
          TOLAK PERMINTAAN
        </h2>
        <div
          style={{
            background: "#fff",
            border: "3px solid #0D0D0D",
            padding: "12px 16px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: "15px",
            }}
          >
            {request.nama_tamu}
          </div>
          <div
            style={{
              fontSize: "12px",
              opacity: 0.6,
              fontWeight: 700,
            }}
          >
            {request.perusahaan}
          </div>
        </div>
        <label
          style={{
            ...S.label,
            color: "#fff",
          }}
        >
          ALASAN PENOLAKAN
        </label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Tulis alasan penolakan... (opsional)"
          rows={3}
          style={{
            ...S.input,
            resize: "none",
            marginBottom: "16px",
            display: "block",
            width: "100%",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...S.btnWhite,
              flex: 1,
              padding: "14px",
            }}
          >
            {loading ? "MEMPROSES..." : "YA, TOLAK"}
          </button>
          <button
            onClick={onClose}
            style={{
              ...S.btnBlack,
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
function RequestCard({ req, onApprove, onReject, onExpired }) {
  const [expired, setExpired] = useState(false);
  const handleExpire = useCallback(() => {
    if (!expired) {
      setExpired(true);
      onExpired(req);
    }
  }, [expired, req, onExpired]);
  if (expired) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "4px solid #0D0D0D",
        boxShadow: "6px 6px 0 #0D0D0D",
        padding: "20px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-14px",
          left: "20px",
          background: "#FF2B2B",
          color: "#fff",
          border: "3px solid #0D0D0D",
          padding: "2px 12px",
          fontWeight: 900,
          fontSize: "11px",
          letterSpacing: ".1em",
        }}
      >
        ● PERMINTAAN BARU
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <CountdownTimer createdAt={req.created_at} onExpire={handleExpire} />

        <div
          style={{
            flex: 1,
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: "18px",
              letterSpacing: "-.01em",
            }}
          >
            {req.nama_tamu}
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              opacity: 0.55,
              marginTop: "2px",
            }}
          >
            {req.perusahaan || "Tamu Umum"}
          </div>
          <div
            style={{
              marginTop: "8px",
              display: "inline-block",
              background: "#E3F2FD",
              border: "2px solid #0D0D0D",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            {req.keperluan}
          </div>
          <div
            style={{
              marginTop: "8px",
              fontSize: "12px",
              opacity: 0.45,
              fontWeight: 700,
            }}
          >
            Diminta oleh Security ·{" "}
            {new Date(req.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            WIB
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            minWidth: "140px",
          }}
        >
          <button
            onClick={() => onApprove(req)}
            style={{
              ...S.btnGreen,
              padding: "14px",
              fontSize: "14px",
            }}
          >
            ✓ APPROVE
          </button>
          <button
            onClick={() => onReject(req)}
            style={{
              ...S.btnRed,
              padding: "14px",
              fontSize: "14px",
            }}
          >
            ✕ TOLAK
          </button>
        </div>
      </div>
    </div>
  );
}
function RiwayatCard({ req }) {
  const statusStyle = {
    approved: {
      bg: "#00C853",
      label: "✓ APPROVED",
    },
    rejected: {
      bg: "#FF2B2B",
      label: "✕ DITOLAK",
    },
    expired: {
      bg: "#9E9E9E",
      label: "⏱ EXPIRED",
    },
    pending: {
      bg: "#FF6D00",
      label: "⏳ PENDING",
    },
  }[req.status] || {
    bg: "#9E9E9E",
    label: req.status?.toUpperCase(),
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "14px 16px",
        borderBottom: "3px solid #0D0D0D",
        background: "#FAFAFA",
      }}
    >
      <div
        style={{
          background: statusStyle.bg,
          color: "#fff",
          border: "3px solid #0D0D0D",
          padding: "4px 12px",
          fontWeight: 800,
          fontSize: "11px",
          letterSpacing: ".08em",
          minWidth: "110px",
          textAlign: "center",
        }}
      >
        {statusStyle.label}
      </div>
      <div
        style={{
          flex: 1,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: "14px",
          }}
        >
          {req.nama_tamu}
        </div>
        <div
          style={{
            fontSize: "12px",
            opacity: 0.5,
            fontWeight: 700,
          }}
        >
          {req.perusahaan} · {req.keperluan}
        </div>
        {req.catatan_reject && (
          <div
            style={{
              fontSize: "11px",
              color: "#FF2B2B",
              fontWeight: 700,
              marginTop: "2px",
            }}
          >
            ↳ {req.catatan_reject}
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "13px",
          fontWeight: 700,
          opacity: 0.45,
        }}
      >
        {new Date(req.created_at).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        WIB
      </div>
    </div>
  );
}
export default function HostDashboard() {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [rejectModal, setRejectModal] = useState(null);
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
    const today = new Date().toISOString().split("T")[0];
    const reqRef = ref(db, "guest_requests");
    const unsubscribe = onValue(reqRef, (snap) => {
      if (!snap.exists()) {
        setRequests([]);
        return;
      }
      const data = snap.val();
      const arr = Object.entries(data)
        .map(([id, val]) => ({
          id,
          ...val,
        }))
        .filter((r) => {
          const reqDate = new Date(r.created_at).toISOString().split("T")[0];
          const isForMe = !r.host_uid || r.host_uid === userProfile?.uid;
          return reqDate === today && isForMe;
        })
        .sort((a, b) => b.created_at - a.created_at);
      setRequests(arr);
    });
    return () => unsubscribe();
  }, [userProfile]);
  const pending = requests.filter((r) => r.status === "pending");
  const riwayat = requests.filter((r) => r.status !== "pending");
  const handleApprove = async (req) => {
    try {
      const reqRef = ref(db, `guest_requests/${req.id}`);
      await update(reqRef, {
        status: "approved",
        resolved_at: Date.now(),
        resolved_by_uid: userProfile?.uid,
        resolved_by: userProfile?.nama || "Host",
      });
      toast.success(`✓ ${req.nama_tamu} disetujui masuk!`);
    } catch (err) {
      toast.error("Gagal approve. Cek koneksi.");
    }
  };
  const handleRejectConfirm = async (req, catatan) => {
    try {
      const reqRef = ref(db, `guest_requests/${req.id}`);
      await update(reqRef, {
        status: "rejected",
        catatan_reject: catatan,
        resolved_at: Date.now(),
        resolved_by_uid: userProfile?.uid,
        resolved_by: userProfile?.nama || "Host",
      });
      toast.error(`✕ ${req.nama_tamu} ditolak.`);
    } catch (err) {
      toast.error("Gagal reject. Cek koneksi.");
    }
  };
  const handleExpired = async (req) => {
    if (req.status !== "pending") return;
    try {
      const reqRef = ref(db, `guest_requests/${req.id}`);
      await update(reqRef, {
        status: "expired",
        resolved_at: Date.now(),
      });
      toast.error(`⏱ Request untuk ${req.nama_tamu} sudah expired.`);
    } catch (err) {
      console.error("Gagal update expired:", err);
    }
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#E3F2FD",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
        @keyframes pulse-border { 0%,100%{box-shadow:6px 6px 0 #0D0D0D} 50%{box-shadow:6px 6px 0 #FF2B2B} }
        .pending-card { animation: pulse-border 2s infinite; }
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
          background: "#1565C0",
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
                color: "#90CAF9",
              }}
            >
              HOST DASHBOARD
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontWeight: 700,
                fontSize: "13px",
                color: "#fff",
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
          {pending.length > 0 && (
            <div
              style={{
                background: "#FF2B2B",
                color: "#fff",
                border: "3px solid #0D0D0D",
                padding: "6px 16px",
                fontWeight: 900,
                fontSize: "13px",
                animation: "pulse-border 1s infinite",
              }}
            >
              ⚠ {pending.length} PERMINTAAN MASUK
            </div>
          )}
          <div
            style={{
              background: "#fff",
              border: "3px solid #0D0D0D",
              padding: "8px 14px",
              fontWeight: 800,
              fontSize: "13px",
            }}
          >
            {userProfile?.nama || "Host"}
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
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              label: "REQUEST HARI INI",
              value: requests.length,
              bg: "#fff",
            },
            {
              label: "DISETUJUI",
              value: requests.filter((r) => r.status === "approved").length,
              bg: "#00C853",
            },
            {
              label: "DITOLAK / EXPIRED",
              value: requests.filter((r) => ["rejected", "expired"].includes(r.status)).length,
              bg: "#FFCDD2",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                ...S.nbCard,
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
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: "13px",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              opacity: 0.45,
              marginBottom: "12px",
            }}
          >
            {pending.length > 0
              ? `⚡ ${pending.length} PERMINTAAN MENUNGGU RESPONS`
              : "TIDAK ADA PERMINTAAN SAAT INI"}
          </div>

          {pending.length === 0 ? (
            <div
              style={{
                ...S.nbCard,
                padding: "48px",
                textAlign: "center",
                opacity: 0.3,
                fontWeight: 800,
                fontSize: "16px",
                textTransform: "uppercase",
                letterSpacing: ".1em",
              }}
            >
              ✓ Semua clear — tidak ada tamu go-show pending
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {pending.map((req) => (
                <div key={req.id} className="pending-card">
                  <RequestCard
                    req={req}
                    onApprove={handleApprove}
                    onReject={(r) => setRejectModal(r)}
                    onExpired={handleExpired}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {riwayat.length > 0 && (
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: "13px",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                opacity: 0.45,
                marginBottom: "8px",
              }}
            >
              RIWAYAT HARI INI ({riwayat.length})
            </div>
            <div
              style={{
                ...S.nbCard,
                padding: 0,
              }}
            >
              {riwayat.map((req) => (
                <RiwayatCard key={req.id} req={req} />
              ))}
            </div>
          </div>
        )}
      </div>

      {rejectModal && (
        <ModalReject
          request={rejectModal}
          onClose={() => setRejectModal(null)}
          onConfirm={handleRejectConfirm}
        />
      )}
    </div>
  );
}
const S = {
  nbCard: {
    background: "#FAFAFA",
    border: "4px solid #0D0D0D",
    boxShadow: "6px 6px 0 #0D0D0D",
    borderRadius: 0,
  },
  heading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 900,
    fontSize: "20px",
    textTransform: "uppercase",
    letterSpacing: "-.01em",
  },
  btnGreen: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    cursor: "pointer",
    borderRadius: 0,
    border: "3px solid #0D0D0D",
    background: "#00C853",
    color: "#0D0D0D",
    boxShadow: "4px 4px 0 #0D0D0D",
  },
  btnRed: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    cursor: "pointer",
    borderRadius: 0,
    border: "3px solid #0D0D0D",
    background: "#FF2B2B",
    color: "#fff",
    boxShadow: "4px 4px 0 #0D0D0D",
  },
  btnBlack: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    cursor: "pointer",
    borderRadius: 0,
    border: "3px solid #0D0D0D",
    background: "#0D0D0D",
    color: "#FFE135",
    boxShadow: "4px 4px 0 rgba(255,225,53,0.4)",
  },
  btnWhite: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    cursor: "pointer",
    borderRadius: 0,
    border: "3px solid #0D0D0D",
    background: "#fff",
    color: "#0D0D0D",
    boxShadow: "4px 4px 0 #0D0D0D",
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
    borderRadius: 0,
    boxShadow: "3px 3px 0 #0D0D0D",
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontWeight: 800,
    fontSize: "11px",
    letterSpacing: ".09em",
    marginBottom: "6px",
    opacity: 0.8,
    textTransform: "uppercase",
    fontFamily: "'Space Grotesk', sans-serif",
  },
};
