# PROJECT_STATE — SmartGate Management

## Stack
React 18 (Create React App), Tailwind 3, Firebase Auth + Realtime Database, HashRouter, deploy via GitHub Actions ke GitHub Pages.

## Status
- Login (email/password), routing per peran, tombol Keluar: selesai
- Dashboard Security, Host, Warehouse, Admin: selesai dan terhubung ke rute
- Rules database mencakup users, logs, pre_registrations, guest_requests
- Build produksi lolos

## Peran dan rute
security → /security, employee → /host, warehouse → /warehouse, admin → /admin (admin boleh semua)

## Belum terintegrasi
CountdownTimer, GuestRequestModal, useGuestRequests, SecurityDashboard_PATCH, SecurityDashboard_GoShowAddition (di _arsip/)

## Aturan kode
Tanpa komentar penjelas. Nama fungsi global tidak diubah.
