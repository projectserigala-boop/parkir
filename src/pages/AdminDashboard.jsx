import React, { useState, useEffect, useCallback } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
const TIMEOUT_MS = 5 * 60 * 1000;
function MiniCountdown({ createdAt, status }) {
  const [sisa, setSisa] = useState(TIMEOUT_MS);
  useEffect(() => {
    if (status !== "pending") return;
    const tick = () => {
      const elapsed = Date.now() - createdAt;
      setSisa(Math.max(0, TIMEOUT_MS - elapsed));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt, status]);
  if (status !== "pending") return null;
  const totalSecs = Math.ceil(sisa / 1000);
  const mnt = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const pct = sisa / TIMEOUT_MS;
  const col = pct > 0.5 ? "#00C853" : pct > 0.2 ? "#FF6D00" : "#FF2B2B";
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono',monospace",
        fontWeight: 700,
        fontSize: "12px",
        color: col,
        background: "#0D0D0D",
        padding: "2px 8px",
        border: `2px solid ${col}`,
      }}
    >
      {String(mnt).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}
function ModalReject({ request, onClose, onConfirm }) {
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    setLoading(true);
    await onConfirm(request, catatan || "Ditolak oleh admin");
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
          TOLAK PERMINTAAN (ADMIN)
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
            }}
          >
            {request.nama_tamu}
          </div>
          <div
            style={{
              fontSize: "12px",
              opacity: 0.6,
            }}
          >
            {request.perusahaan} · {request.keperluan}
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
          placeholder="Tulis alasan penolakan..."
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
function RequestRow({ req, onApprove, onReject, onExpired }) {
  const [didExpire, setDidExpire] = useState(false);
  useEffect(() => {
    if (req.status !== "pending" || didExpire) return;
    const remaining = TIMEOUT_MS - (Date.now() - req.created_at);
    if (remaining <= 0) {
      setDidExpire(true);
      onExpired(req);
      return;
    }
    const id = setTimeout(() => {
      setDidExpire(true);
      onExpired(req);
    }, remaining);
    return () => clearTimeout(id);
  }, [req, didExpire, onExpired]);
  const statusConfig = {
    pending: {
      bg: "#FF6D00",
      color: "#fff",
      label: "⏳ PENDING",
    },
    approved: {
      bg: "#00C853",
      color: "#0D0D0D",
      label: "✓ APPROVED",
    },
    rejected: {
      bg: "#FF2B2B",
      color: "#fff",
      label: "✕ DITOLAK",
    },
    expired: {
      bg: "#9E9E9E",
      color: "#fff",
      label: "⏱ EXPIRED",
    },
  }[req.status] || {
    bg: "#9E9E9E",
    color: "#fff",
    label: req.status?.toUpperCase(),
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 110px 90px 200px",
        gap: "0",
        borderBottom: "3px solid #0D0D0D",
        alignItems: "center",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderRight: "2px solid #E0E0E0",
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
            fontSize: "11px",
            opacity: 0.5,
            fontWeight: 700,
          }}
        >
          {req.perusahaan || "—"}
        </div>
      </div>

      <div
        style={{
          padding: "12px 16px",
          borderRight: "2px solid #E0E0E0",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          {req.keperluan}
        </div>
      </div>

      <div
        style={{
          padding: "12px 16px",
          borderRight: "2px solid #E0E0E0",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          Host: {req.host_nama || "—"}
        </div>
        <div
          style={{
            fontSize: "11px",
            opacity: 0.45,
            fontWeight: 700,
          }}
        >
          Security: {req.security_nama || "—"}
        </div>
      </div>

      <div
        style={{
          padding: "12px 8px",
          borderRight: "2px solid #E0E0E0",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: statusConfig.bg,
            color: statusConfig.color,
            border: "2px solid #0D0D0D",
            padding: "4px 8px",
            fontWeight: 800,
            fontSize: "10px",
            letterSpacing: ".07em",
            display: "inline-block",
          }}
        >
          {statusConfig.label}
        </div>
      </div>

      <div
        style={{
          padding: "12px 8px",
          borderRight: "2px solid #E0E0E0",
          textAlign: "center",
        }}
      >
        {req.status === "pending" ? (
          <MiniCountdown createdAt={req.created_at} status={req.status} />
        ) : (
          <span
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontWeight: 700,
              fontSize: "12px",
              opacity: 0.45,
            }}
          >
            {new Date(req.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      <div
        style={{
          padding: "8px 12px",
          display: "flex",
          gap: "8px",
          justifyContent: "center",
        }}
      >
        {req.status === "pending" ? (
          <>
            <button
              onClick={() => onApprove(req)}
              style={{
                ...S.btnGreen,
                padding: "8px 12px",
                fontSize: "11px",
              }}
            >
              ✓ OK
            </button>
            <button
              onClick={() => onReject(req)}
              style={{
                ...S.btnRed,
                padding: "8px 12px",
                fontSize: "11px",
              }}
            >
              ✕ TOLAK
            </button>
          </>
        ) : (
          <span
            style={{
              fontSize: "11px",
              opacity: 0.35,
              fontWeight: 700,
            }}
          >
            {req.resolved_by ? `→ ${req.resolved_by}` : "—"}
          </span>
        )}
      </div>
    </div>
  );
}
export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
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
          const d = new Date(r.created_at).toISOString().split("T")[0];
          return d === today;
        })
        .sort((a, b) => b.created_at - a.created_at);
      setRequests(arr);
    });
    return () => unsubscribe();
  }, []);
  const pending = requests.filter((r) => r.status === "pending");
  const semua = requests;
  const displayed = activeTab === "pending" ? pending : semua;
  const handleApprove = async (req) => {
    try {
      await update(ref(db, `guest_requests/${req.id}`), {
        status: "approved",
        resolved_at: Date.now(),
        resolved_by_uid: userProfile?.uid,
        resolved_by: userProfile?.nama || "Admin",
      });
      toast.success(`✓ ${req.nama_tamu} diapprove oleh Admin`);
    } catch (err) {
      toast.error("Gagal approve.");
    }
  };
  const handleRejectConfirm = async (req, catatan) => {
    try {
      await update(ref(db, `guest_requests/${req.id}`), {
        status: "rejected",
        catatan_reject: catatan,
        resolved_at: Date.now(),
        resolved_by_uid: userProfile?.uid,
        resolved_by: userProfile?.nama || "Admin",
      });
      toast.error(`✕ ${req.nama_tamu} ditolak oleh Admin`);
    } catch (err) {
      toast.error("Gagal reject.");
    }
  };
  const handleExpired = useCallback(async (req) => {
    if (req.status !== "pending") return;
    try {
      await update(ref(db, `guest_requests/${req.id}`), {
        status: "expired",
        resolved_at: Date.now(),
      });
    } catch (err) {
      console.error("Gagal update expired:", err);
    }
  }, []);
  const stats = {
    total: requests.length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    expired: requests.filter((r) => r.status === "expired").length,
    pending: pending.length,
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F5F5",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
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
          background: "#0D0D0D",
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
              background: "#FFE135",
              padding: "8px 16px",
              border: "3px solid #FFE135",
            }}
          >
            <span
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#0D0D0D",
                letterSpacing: "-.02em",
              }}
            >
              SMART
              <span
                style={{
                  background: "#FF2B2B",
                  color: "#fff",
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
                color: "#FFE135",
              }}
            >
              ADMIN DASHBOARD — GUEST MONITORING
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontWeight: 700,
                fontSize: "13px",
                color: "#aaa",
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
                border: "3px solid #FFE135",
                padding: "6px 16px",
                fontWeight: 900,
                fontSize: "13px",
                animation: "blink 1s infinite",
              }}
            >
              ⚠ {pending.length} PENDING GO-SHOW
            </div>
          )}
          <div
            style={{
              background: "#FFE135",
              border: "3px solid #FFE135",
              padding: "8px 14px",
              fontWeight: 800,
              fontSize: "13px",
              color: "#0D0D0D",
            }}
          >
            ADMIN: {userProfile?.nama || "Admin"}
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
            gridTemplateColumns: "repeat(5,1fr)",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              label: "TOTAL REQUEST",
              value: stats.total,
              bg: "#fff",
            },
            {
              label: "PENDING",
              value: stats.pending,
              bg: "#FF6D00",
              color: "#fff",
            },
            {
              label: "APPROVED",
              value: stats.approved,
              bg: "#00C853",
            },
            {
              label: "DITOLAK",
              value: stats.rejected,
              bg: "#FF2B2B",
              color: "#fff",
            },
            {
              label: "EXPIRED",
              value: stats.expired,
              bg: "#9E9E9E",
              color: "#fff",
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
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: ".08em",
                  opacity: 0.65,
                  marginBottom: "6px",
                  color: s.color || "#0D0D0D",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "44px",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: s.color || "#0D0D0D",
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
            gap: "4px",
            borderBottom: "4px solid #0D0D0D",
            marginBottom: "0",
          }}
        >
          {[
            {
              key: "pending",
              label: `⚡ PENDING (${stats.pending})`,
            },
            {
              key: "semua",
              label: `📋 SEMUA HARI INI (${stats.total})`,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                background: activeTab === t.key ? "#FFE135" : "#0D0D0D",
                color: activeTab === t.key ? "#0D0D0D" : "#FFE135",
                border: "3px solid #0D0D0D",
                borderBottom: activeTab === t.key ? "3px solid #FFE135" : "3px solid #0D0D0D",
                padding: "10px 22px",
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 800,
                fontSize: "12px",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 110px 90px 200px",
            background: "#0D0D0D",
            color: "#FFE135",
            borderLeft: "4px solid #0D0D0D",
            borderRight: "4px solid #0D0D0D",
          }}
        >
          {["NAMA TAMU", "KEPERLUAN", "REQUESTED BY", "STATUS", "TIMER", "AKSI"].map((h) => (
            <div
              key={h}
              style={{
                padding: "10px 16px",
                fontWeight: 800,
                fontSize: "10px",
                letterSpacing: ".1em",
                borderRight: "2px solid #333",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        <div
          style={{
            ...S.nbCard,
            borderTop: "none",
            padding: 0,
          }}
        >
          {displayed.length === 0 ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                opacity: 0.3,
                fontWeight: 800,
                fontSize: "16px",
                textTransform: "uppercase",
                letterSpacing: ".1em",
              }}
            >
              {activeTab === "pending"
                ? "✓ Tidak ada request pending saat ini"
                : "Belum ada request hari ini"}
            </div>
          ) : (
            displayed.map((req) => (
              <RequestRow
                key={req.id}
                req={req}
                onApprove={handleApprove}
                onReject={(r) => setRejectModal(r)}
                onExpired={handleExpired}
              />
            ))
          )}
        </div>
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
