// ============================================================
//  src/hooks/useGuestRequests.js
//  Hook reusable — logika inti untuk Guest Request (go-show).
//  Dipakai oleh SecurityDashboard, HostDashboard, dan AdminPanel.
//
//  Struktur node Firebase yang dipakai:
//  guest_requests/{id}:
//    nama_tamu       : string
//    perusahaan      : string (opsional)
//    host_id         : string (uid host yang dituju)
//    host_nama       : string
//    security_id     : string (uid security yang input)
//    security_nama   : string
//    catatan         : string
//    timestamp_create: number (ms, dari Date.now())
//    timestamp_expire: number (ms, create + 5 menit)
//    status          : "pending" | "approved" | "rejected" | "expired" | "escalated"
//    decided_by      : string (uid yang approve/reject, opsional)
//    decided_at      : number (ms, opsional)
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { ref, onValue, push, update, serverTimestamp, get } from "firebase/database";
import { db } from "../firebaseConfig";

const TIMEOUT_MS = 5 * 60 * 1000; // 5 menit dalam milidetik

export function useGuestRequests({ role, uid }) {
  const [requests,      setRequests]      = useState([]); // semua request yang relevan
  const [timedOutAlert, setTimedOutAlert] = useState([]); // request yang sudah expired, untuk admin

  // ── Ambil data dari Firebase secara realtime ───────────────
  useEffect(() => {
    if (!uid) return;

    const reqRef = ref(db, "guest_requests");
    const unsubscribe = onValue(reqRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRequests([]);
        setTimedOutAlert([]);
        return;
      }

      const data = snapshot.val();
      const arr = Object.entries(data).map(([id, val]) => ({ id, ...val }));

      // ── Logika timeout: cek setiap request yang masih 'pending' ──
      // Jika sudah melewati timestamp_expire, update statusnya di Firebase
      const now = Date.now();
      arr.forEach(async (req) => {
        if (req.status === "pending" && req.timestamp_expire && now > req.timestamp_expire) {
          // Otomatis ubah ke "escalated" (eskalasi ke admin)
          const updateRef = ref(db, `guest_requests/${req.id}`);
          await update(updateRef, {
            status:       "escalated",
            escalated_at: now,
          });
        }
      });

      // ── Filter berdasarkan role ──────────────────────────────
      let filtered = arr;

      if (role === "security") {
        // Security hanya lihat request yang dia buat hari ini
        const todayStart = new Date().setHours(0, 0, 0, 0);
        filtered = arr.filter((r) => r.security_id === uid && r.timestamp_create > todayStart);
      }

      if (role === "employee") {
        // Host hanya lihat request yang ditujukan ke dia, status pending
        filtered = arr.filter((r) => r.host_id === uid && r.status === "pending");
      }

      if (role === "admin") {
        // Admin lihat semua yang escalated (timeout) atau pending lama
        const escalated = arr.filter((r) => r.status === "escalated");
        setTimedOutAlert(escalated);
        // Admin juga bisa lihat semua request
        filtered = arr.sort((a, b) => b.timestamp_create - a.timestamp_create);
      }

      setRequests(filtered.sort((a, b) => b.timestamp_create - a.timestamp_create));
    });

    return () => unsubscribe();
  }, [uid, role]);

  // ── Buat request baru (dipakai oleh Security) ─────────────
  const createRequest = useCallback(async ({ nama_tamu, perusahaan, catatan, host_id, host_nama, security_nama }) => {
    if (!uid) throw new Error("Tidak ada user");

    const now = Date.now();
    const reqRef = ref(db, "guest_requests");
    const newReq = {
      nama_tamu:        nama_tamu.trim(),
      perusahaan:       perusahaan?.trim() || "",
      catatan:          catatan?.trim() || "",
      host_id,
      host_nama,
      security_id:      uid,
      security_nama:    security_nama || "Security",
      timestamp_create: now,
      timestamp_expire: now + TIMEOUT_MS,  // ⏱️ 5 menit dari sekarang
      status:           "pending",
      decided_by:       null,
      decided_at:       null,
    };

    const result = await push(reqRef, newReq);
    return result.key; // kembalikan ID request yang baru dibuat
  }, [uid]);

  // ── Approve / Reject (dipakai oleh Host dan Admin) ────────
  const respondToRequest = useCallback(async ({ requestId, action, responderNama }) => {
    if (!["approved", "rejected"].includes(action)) return;

    const reqRef = ref(db, `guest_requests/${requestId}`);
    await update(reqRef, {
      status:      action,
      decided_by:  uid,
      decided_nama: responderNama || "User",
      decided_at:  Date.now(),
    });

    // Jika approved, Security akan lihat statusnya berubah secara realtime
    // (tidak perlu kirim notifikasi push, Firebase listener sudah handle ini)
  }, [uid]);

  // ── Ambil daftar host (karyawan) dari tabel users ─────────
  const [hosts, setHosts] = useState([]);
  useEffect(() => {
    const usersRef = ref(db, "users");
    get(usersRef).then((snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();
      const hostList = Object.entries(data)
        .map(([id, val]) => ({ uid: id, ...val }))
        .filter((u) => u.aktif && ["employee", "admin"].includes(u.role))
        .map((u) => ({ uid: u.uid, nama: u.nama, departemen: u.departemen || "" }));
      setHosts(hostList);
    });
  }, []);

  return {
    requests,       // data request yang sudah difilter sesuai role
    timedOutAlert,  // khusus admin: request yang sudah timeout/escalated
    hosts,          // daftar host untuk dropdown
    createRequest,  // fungsi buat request baru
    respondToRequest, // fungsi approve/reject
    TIMEOUT_MS,
  };
}
