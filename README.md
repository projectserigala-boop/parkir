# SmartGate Management

Sistem digital keluar-masuk kendaraan pabrik. React 18, Tailwind, Firebase Auth dan Realtime Database.

## Struktur

```
.github/workflows/deploy.yml   Deploy otomatis ke GitHub Pages
_arsip/                        Komponen yang belum terpasang di aplikasi
docs/firebaseStructure.js      Referensi struktur database
public/                        Template HTML, ikon, manifest
src/
  context/AuthContext.jsx      Status login global
  pages/                       Login, Security, Host, Warehouse, Admin
  App.jsx                      Routing dan proteksi peran
  firebaseConfig.js            Konfigurasi Firebase
database.rules.json            Aturan keamanan Realtime Database
```

## Deploy ke GitHub Pages

1. Buat repo baru di GitHub, lalu unggah seluruh isi folder ini ke branch `main`.
2. Settings → Pages → Source: **GitHub Actions**.
3. Push ke `main`. Workflow berjalan otomatis; alamatnya `https://USERNAME.github.io/NAMA-REPO/`.
4. Firebase Console → Authentication → Settings → Authorized domains → tambahkan `USERNAME.github.io`.
5. Firebase Console → Realtime Database → Rules → tempel isi `database.rules.json` lalu Publish.

## Membuat akun pertama

1. Authentication → Users → Add user (email dan password).
2. Realtime Database → tambahkan node `users/{UID akun tadi}`:

```json
{ "nama": "Nama Lengkap", "email": "email@contoh.com", "role": "admin", "aktif": true }
```

Peran yang tersedia: `admin`, `security`, `employee`, `warehouse`. Akun tanpa node `users` dianggap `employee`.

## Menjalankan lokal

```
npm install
npm start
```
