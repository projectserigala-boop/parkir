import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../firebaseConfig";
const pesanError = {
  "auth/invalid-credential": "Email atau password salah",
  "auth/invalid-email": "Format email tidak valid",
  "auth/user-disabled": "Akun ini dinonaktifkan",
  "auth/too-many-requests": "Terlalu banyak percobaan, coba lagi nanti",
  "auth/network-request-failed": "Koneksi internet bermasalah",
};
const field = {
  width: "100%",
  padding: "14px 16px",
  border: "3px solid #0D0D0D",
  borderRadius: 0,
  background: "#FFFFFF",
  fontSize: "16px",
  fontWeight: 700,
  fontFamily: "'Space Grotesk', sans-serif",
  outline: "none",
};
const label = {
  display: "block",
  marginBottom: "6px",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: ".1em",
  textTransform: "uppercase",
};
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      toast.error(pesanError[err.code] || "Gagal masuk, coba lagi");
      setLoading(false);
    }
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFE135",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800;900&display=swap');`}</style>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#F5F5F5",
          border: "4px solid #0D0D0D",
          boxShadow: "8px 8px 0 #0D0D0D",
          padding: "32px 28px",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#0D0D0D",
            color: "#FFE135",
            padding: "8px 16px",
            fontSize: "24px",
            fontWeight: 900,
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          SmartGate
        </div>
        <p
          style={{
            margin: "12px 0 28px",
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".06em",
          }}
        >
          Sistem keluar-masuk kendaraan pabrik
        </p>

        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <label htmlFor="email" style={label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={field}
          />
        </div>

        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <label htmlFor="password" style={label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={field}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            background: "#0D0D0D",
            color: "#FFE135",
            border: "3px solid #0D0D0D",
            borderRadius: 0,
            fontSize: "16px",
            fontWeight: 900,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            fontFamily: "inherit",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
