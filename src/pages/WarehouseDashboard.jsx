import React, { useState, useEffect, useCallback } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
function formatDuration(ms) {
  if (!ms || ms <= 0) return "—";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}j ${m}m`;
  return `${m} menit`;
}
function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function ElapsedTimer({ since }) {
  const [elapsed, setElapsed] = useState(Date.now() - since);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - since), 10000);
    return () => clearInterval(id);
  }, [since]);
  const mins = Math.floor(elapsed / 60000);
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  const urgency = mins > 120 ? "critical" : mins > 60 ? "warning" : "normal";
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontWeight: 500,
        fontSize: "13px",
        color: urgency === "critical" ? "#C62828" : urgency === "warning" ? "#E65100" : "#1B3A6B",
        background:
          urgency === "critical" ? "#FFEBEE" : urgency === "warning" ? "#FFF3E0" : "transparent",
        padding: urgency !== "normal" ? "2px 8px" : "0",
        borderRadius: "2px",
        letterSpacing: ".04em",
      }}
    >
      {hrs > 0 ? `${hrs}j ${rem}m` : `${mins}m`}
    </span>
  );
}
function StatCard({ label, value, sub, accent, index }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #DDE3ED",
        borderTop: `3px solid ${accent}`,
        padding: "24px 28px",
        position: "relative",
        overflow: "hidden",
        animation: `fadeSlideUp 0.5s ease both`,
        animationDelay: `${index * 0.08}s`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "60px",
          height: "60px",
          background: accent,
          opacity: 0.05,
          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
        }}
      />
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "#8A96A8",
          fontFamily: "'Syne', sans-serif",
          marginBottom: "12px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "36px",
          fontWeight: 700,
          color: "#0D1B2E",
          fontFamily: "'Syne', sans-serif",
          lineHeight: 1,
          letterSpacing: "-.02em",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: "12px",
            color: "#8A96A8",
            marginTop: "8px",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
function StatusBadge({ vehicle }) {
  if (vehicle.processing_end) {
    return (
      <span
        style={{
          background: "#E8F5E9",
          color: "#2E7D32",
          border: "1px solid #A5D6A7",
          padding: "4px 12px",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: ".06em",
          fontFamily: "'DM Mono', monospace",
        }}
      >
        SELESAI
      </span>
    );
  }
  if (vehicle.processing_start) {
    return (
      <span
        style={{
          background: "#E3F2FD",
          color: "#1565C0",
          border: "1px solid #90CAF9",
          padding: "4px 12px",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: ".06em",
          fontFamily: "'DM Mono', monospace",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            background: "#1565C0",
            borderRadius: "50%",
            display: "inline-block",
            animation: "pulse 1.4s ease infinite",
          }}
        />
        PROSES
      </span>
    );
  }
  return (
    <span
      style={{
        background: "#FFF8E1",
        color: "#E65100",
        border: "1px solid #FFCC80",
        padding: "4px 12px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: ".06em",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      ANTRE
    </span>
  );
}
function ActionButton({ vehicle, onAction, loading }) {
  if (vehicle.processing_end) {
    return (
      <span
        style={{
          fontSize: "12px",
          color: "#8A96A8",
          fontFamily: "'DM Mono',monospace",
        }}
      >
        ✓ {formatTime(vehicle.processing_end)}
      </span>
    );
  }
  if (vehicle.processing_start) {
    return (
      <button
        onClick={() => onAction(vehicle, "end")}
        disabled={loading === vehicle.id}
        style={{
          background: "#0D1B2E",
          color: "#E8EDF5",
          border: "none",
          padding: "9px 20px",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: ".08em",
          fontFamily: "'Syne', sans-serif",
          cursor: loading === vehicle.id ? "wait" : "pointer",
          textTransform: "uppercase",
          transition: "all .2s",
          opacity: loading === vehicle.id ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#1B3A6B";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#0D1B2E";
        }}
      >
        {loading === vehicle.id ? "..." : "END PROCESS"}
      </button>
    );
  }
  return (
    <button
      onClick={() => onAction(vehicle, "start")}
      disabled={loading === vehicle.id}
      style={{
        background: "#1B3A6B",
        color: "#C8D8F0",
        border: "1px solid #2A5298",
        padding: "9px 20px",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: ".08em",
        fontFamily: "'Syne', sans-serif",
        cursor: loading === vehicle.id ? "wait" : "pointer",
        textTransform: "uppercase",
        transition: "all .2s",
        opacity: loading === vehicle.id ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#243F7A";
        e.currentTarget.style.color = "#E8EDF5";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#1B3A6B";
        e.currentTarget.style.color = "#C8D8F0";
      }}
    >
      {loading === vehicle.id ? "..." : "START PROCESS"}
    </button>
  );
}
export default function WarehouseDashboard() {
  const { userProfile } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [jamSekarang, setJamSekarang] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setJamSekarang(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      setTanggal(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const logsRef = ref(db, "logs");
    const unsubscribe = onValue(logsRef, (snap) => {
      if (!snap.exists()) {
        setVehicles([]);
        return;
      }
      const data = snap.val();
      const arr = Object.entries(data)
        .map(([id, val]) => ({
          id,
          ...val,
        }))
        .filter((v) => {
          const d = new Date(v.timestamp_in).toISOString().split("T")[0];
          return d === today && v.kategori === "Truk";
        })
        .sort((a, b) => a.timestamp_in - b.timestamp_in);
      setVehicles(arr);
    });
    return () => unsubscribe();
  }, []);
  const handleAction = async (vehicle, action) => {
    setLoadingId(vehicle.id);
    try {
      const logRef = ref(db, `logs/${vehicle.id}`);
      if (action === "start") {
        await update(logRef, {
          processing_start: Date.now(),
        });
        toast.success(`▶ Proses dimulai: ${vehicle.plat_nomor}`);
      } else {
        await update(logRef, {
          processing_end: Date.now(),
          status: "Keluar",
          timestamp_out: Date.now(),
        });
        toast.success(`✓ Proses selesai: ${vehicle.plat_nomor}`);
      }
    } catch (err) {
      toast.error("Gagal memperbarui status. Cek koneksi.");
    } finally {
      setLoadingId(null);
    }
  };
  const queue = vehicles.filter((v) => !v.processing_start);
  const processing = vehicles.filter((v) => v.processing_start && !v.processing_end);
  const done = vehicles.filter((v) => v.processing_end);
  const avgWaitMs =
    done.length > 0
      ? done.reduce((sum, v) => sum + (v.processing_end - v.timestamp_in), 0) / done.length
      : 0;
  const avgProcMs =
    done.length > 0
      ? done.reduce((sum, v) => sum + (v.processing_end - v.processing_start), 0) / done.length
      : 0;
  const displayed =
    {
      all: vehicles,
      queue: queue,
      processing: processing,
      done: done,
    }[filterTab] || vehicles;
  const cols = [
    {
      label: "PLAT NOMOR",
      width: "130px",
    },
    {
      label: "DRIVER",
      width: "1fr",
    },
    {
      label: "TUJUAN",
      width: "140px",
    },
    {
      label: "MASUK",
      width: "80px",
    },
    {
      label: "ANTRE SEJAK",
      width: "100px",
    },
    {
      label: "MULAI PROSES",
      width: "100px",
    },
    {
      label: "STATUS",
      width: "120px",
    },
    {
      label: "AKSI",
      width: "160px",
    },
  ];
  const gridCols = cols.map((c) => c.width).join(" ");
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EEF1F7",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .row-hover:hover {
          background: #F0F4FC !important;
        }
        .tab-btn:hover { opacity: 0.85; }
      `}</style>

      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          background: "linear-gradient(180deg, #1B3A6B 0%, #2A5298 50%, #1B3A6B 100%)",
          zIndex: 100,
        }}
      />

      <header
        style={{
          background: "#0D1B2E",
          borderBottom: "1px solid #1B2D44",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #2A5298, #1B3A6B)",
                border: "1px solid #3A6BC4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid #90B4E8",
                  borderRadius: "2px",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "16px",
                color: "#E8EDF5",
                letterSpacing: ".02em",
              }}
            >
              SMARTGATE
            </span>
          </div>

          <div
            style={{
              width: "1px",
              height: "28px",
              background: "#253650",
            }}
          />

          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "#5A7BA8",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              WAREHOUSE OPERATIONS
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "18px",
                fontWeight: 500,
                color: "#C8D8F0",
                letterSpacing: ".06em",
              }}
            >
              {jamSekarang}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#5A7BA8",
                textTransform: "capitalize",
              }}
            >
              {tanggal}
            </div>
          </div>

          <div
            style={{
              width: "1px",
              height: "36px",
              background: "#253650",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "#1B3A6B",
                border: "1px solid #2A5298",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                color: "#90B4E8",
              }}
            >
              {(userProfile?.nama || "W")[0].toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#C8D8F0",
                }}
              >
                {userProfile?.nama || "Warehouse"}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#5A7BA8",
                  letterSpacing: ".08em",
                }}
              >
                WAREHOUSE MANAGER
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#0A2540",
              border: "1px solid #1B3A6B",
              padding: "6px 12px",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                background: "#00E676",
                borderRadius: "50%",
                boxShadow: "0 0 6px #00E676",
                animation: "pulse 2s ease infinite",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#5A7BA8",
                letterSpacing: ".1em",
              }}
            >
              LIVE
            </span>
          </div>
        </div>
      </header>

      <main
        style={{
          padding: "32px 40px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <StatCard
            index={0}
            label="Total Truk Hari Ini"
            value={vehicles.length}
            sub={`${queue.length} sedang antre`}
            accent="#1B3A6B"
          />
          <StatCard
            index={1}
            label="Sedang Proses"
            value={processing.length}
            sub={
              processing.length > 0
                ? `${processing.map((v) => v.plat_nomor).join(", ")}`
                : "Tidak ada"
            }
            accent="#2A5298"
          />
          <StatCard
            index={2}
            label="Selesai Diproses"
            value={done.length}
            sub={
              done.length > 0
                ? `Terakhir: ${formatTime(done[done.length - 1]?.processing_end)}`
                : "Belum ada"
            }
            accent="#4CAF50"
          />
          <StatCard
            index={3}
            label="Rata-rata Waktu Tunggu"
            value={avgWaitMs > 0 ? formatDuration(avgWaitMs) : "—"}
            sub={avgProcMs > 0 ? `Proses: ${formatDuration(avgProcMs)}` : "Dari masuk → selesai"}
            accent="#E65100"
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "18px",
                color: "#0D1B2E",
                letterSpacing: "-.01em",
                margin: 0,
              }}
            >
              Antrian Truk
            </h2>
            <div
              style={{
                fontSize: "12px",
                color: "#8A96A8",
                marginTop: "2px",
              }}
            >
              Data real-time dari pos security
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "#DDE3ED",
              padding: "3px",
            }}
          >
            {[
              {
                key: "all",
                label: `Semua (${vehicles.length})`,
              },
              {
                key: "queue",
                label: `Antre (${queue.length})`,
              },
              {
                key: "processing",
                label: `Proses (${processing.length})`,
              },
              {
                key: "done",
                label: `Selesai (${done.length})`,
              },
            ].map((t) => (
              <button
                key={t.key}
                className="tab-btn"
                onClick={() => setFilterTab(t.key)}
                style={{
                  background: filterTab === t.key ? "#FFFFFF" : "transparent",
                  color: filterTab === t.key ? "#0D1B2E" : "#6A7B90",
                  border: "none",
                  padding: "7px 16px",
                  fontSize: "12px",
                  fontWeight: filterTab === t.key ? 600 : 500,
                  cursor: "pointer",
                  letterSpacing: ".04em",
                  fontFamily: "'Syne', sans-serif",
                  boxShadow: filterTab === t.key ? "0 1px 3px rgba(0,0,0,.12)" : "none",
                  transition: "all .15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #DDE3ED",
            marginTop: "12px",
            overflow: "hidden",
            animation: "fadeSlideUp .4s ease both",
            animationDelay: ".32s",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: gridCols,
              gap: "0",
              background: "#F4F6FB",
              borderBottom: "1px solid #DDE3ED",
            }}
          >
            {cols.map((col) => (
              <div
                key={col.label}
                style={{
                  padding: "12px 16px",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "#8A96A8",
                  fontFamily: "'Syne', sans-serif",
                  borderRight: "1px solid #E8ECF4",
                }}
              >
                {col.label}
              </div>
            ))}
          </div>

          {displayed.length === 0 ? (
            <div
              style={{
                padding: "64px",
                textAlign: "center",
                color: "#B0BAC8",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "12px",
                  opacity: 0.4,
                }}
              >
                🚛
              </div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                }}
              >
                Tidak ada truk saat ini
              </div>
              <div
                style={{
                  fontSize: "12px",
                  marginTop: "6px",
                }}
              >
                Data akan muncul otomatis ketika security mencatat kendaraan masuk
              </div>
            </div>
          ) : (
            displayed.map((vehicle, i) => {
              const isProcessing = vehicle.processing_start && !vehicle.processing_end;
              const isDone = !!vehicle.processing_end;
              return (
                <div
                  key={vehicle.id}
                  className="row-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    alignItems: "center",
                    borderBottom: "1px solid #EEF1F7",
                    background: isDone ? "#FAFBFD" : isProcessing ? "#F0F7FF" : "#FFFFFF",
                    transition: "background .15s",
                    animation: `fadeSlideUp .35s ease both`,
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  <div
                    style={{
                      padding: "16px",
                      borderRight: "1px solid #EEF1F7",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: 500,
                        fontSize: "14px",
                        color: "#0D1B2E",
                        letterSpacing: ".08em",
                      }}
                    >
                      {vehicle.plat_nomor}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#B0BAC8",
                        marginTop: "2px",
                      }}
                    >
                      🚛 TRUK
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRight: "1px solid #EEF1F7",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#1A2B40",
                      }}
                    >
                      {vehicle.nama_driver}
                    </div>
                    {vehicle.catatan && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#8A96A8",
                          marginTop: "2px",
                        }}
                      >
                        {vehicle.catatan}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRight: "1px solid #EEF1F7",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#4A5C72",
                        fontWeight: 500,
                      }}
                    >
                      {vehicle.tujuan}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRight: "1px solid #EEF1F7",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "13px",
                        color: "#4A5C72",
                      }}
                    >
                      {formatTime(vehicle.timestamp_in)}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRight: "1px solid #EEF1F7",
                    }}
                  >
                    {!vehicle.processing_start ? (
                      <ElapsedTimer since={vehicle.timestamp_in} />
                    ) : (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#B0BAC8",
                          fontFamily: "'DM Mono',monospace",
                        }}
                      >
                        —
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRight: "1px solid #EEF1F7",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "13px",
                        color: "#4A5C72",
                      }}
                    >
                      {formatTime(vehicle.processing_start)}
                    </div>
                    {vehicle.processing_end && (
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#8A96A8",
                          marginTop: "2px",
                        }}
                      >
                        → {formatTime(vehicle.processing_end)}
                        &nbsp;({formatDuration(vehicle.processing_end - vehicle.processing_start)})
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRight: "1px solid #EEF1F7",
                    }}
                  >
                    <StatusBadge vehicle={vehicle} />
                  </div>

                  <div
                    style={{
                      padding: "12px 16px",
                    }}
                  >
                    <ActionButton vehicle={vehicle} onAction={handleAction} loading={loadingId} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#B0BAC8",
            }}
          >
            Menampilkan {displayed.length} dari {vehicles.length} truk hari ini · Sinkronisasi
            real-time
          </div>
          {avgWaitMs > 0 && (
            <div
              style={{
                fontSize: "11px",
                color: "#5A7BA8",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Avg wait today: <strong>{formatDuration(avgWaitMs)}</strong>
              &nbsp;·&nbsp; Avg process: <strong>{formatDuration(avgProcMs)}</strong>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
