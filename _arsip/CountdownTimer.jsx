// ============================================================
//  src/components/CountdownTimer.jsx
//  Komponen timer countdown — menampilkan sisa waktu sebelum
//  request go-show otomatis dieskalasi ke Admin.
//  Dipakai di SecurityDashboard dan HostDashboard.
// ============================================================

import React, { useState, useEffect } from "react";

export default function CountdownTimer({ expireAt, style = {} }) {
  const [sisa, setSisa] = useState(0); // sisa waktu dalam detik

  useEffect(() => {
    const hitung = () => {
      const sisaMs = expireAt - Date.now();
      setSisa(Math.max(0, Math.floor(sisaMs / 1000)));
    };

    hitung();
    const interval = setInterval(hitung, 1000);
    return () => clearInterval(interval);
  }, [expireAt]);

  // Format: MM:SS
  const menit = String(Math.floor(sisa / 60)).padStart(2, "0");
  const detik = String(sisa % 60).padStart(2, "0");

  // Warna berdasarkan sisa waktu
  const isKritis   = sisa <= 60;   // merah jika < 1 menit
  const isPeringatan = sisa <= 120; // kuning jika < 2 menit

  const warna = isKritis
    ? { bg: "#FF2B2B", text: "#fff" }
    : isPeringatan
    ? { bg: "#FF6D00", text: "#fff" }
    : { bg: "#0D0D0D", text: "#FFE135" };

  if (sisa === 0) {
    return (
      <span
        style={{
          fontFamily:    "'JetBrains Mono', monospace",
          fontWeight:    700,
          fontSize:      "13px",
          background:    "#6b7280",
          color:         "#fff",
          padding:       "3px 10px",
          border:        "2px solid #374151",
          letterSpacing: ".05em",
          ...style,
        }}
      >
        EXPIRED
      </span>
    );
  }

  return (
    <span
      style={{
        fontFamily:    "'JetBrains Mono', monospace",
        fontWeight:    700,
        fontSize:      "14px",
        background:    warna.bg,
        color:         warna.text,
        padding:       "3px 10px",
        border:        `2px solid ${warna.bg}`,
        letterSpacing: ".05em",
        display:       "inline-flex",
        alignItems:    "center",
        gap:           "4px",
        animation:     isKritis ? "pulse 1s ease-in-out infinite" : "none",
        ...style,
      }}
    >
      ⏱ {menit}:{detik}
    </span>
  );
}
