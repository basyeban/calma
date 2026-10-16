# 🏥 Dokumentasi Sistem Layanan Kesehatan & Konsultasi Online

Sistem berbasis web/aplikasi ini dirancang untuk memfasilitasi konsultasi kesehatan, manajemen perawatan pasien, serta pengolahan transaksi dan pengguna secara terintegrasi. Sistem ini mendukung 3 peran utama (Role): **Pasien**, **Dokter**, dan **Admin**.

---

## 🔑 Kredensial Akun Pengujian (Demo Login)

| Role | Username / Email | Password | Akses Utama |
| :--- | :--- | :--- | :--- |
| **Pasien** | `pasien@gmail.com` | `Pasien` | Tes mandiri, konsultasi, terapi pernapasan, unduh rekam medis |
| **Dokter** | `dokter@gmail.com` | `Dokter` | Layanan konsultasi, pengisian rekam medis/resep, pengajuan pencairan dana |
| **Admin** | `admin` | `adminudb` | Manajemen akun pengguna, persetujuan (*approval*) finansial |

---

## 👥 Penjelasan Rinci Hak Akses & Fitur Per Role

### 1. 🩺 Role: Pasien
Pasien merupakan pengguna akhir yang membutuhkan layanan pemeriksaan awal, konsultasi profesional, dan modul relaksasi mandiri.

* **Pemeriksaan & Tes Mandiri:**
  * Akses ke berbagai instrumen tes kesehatan mental/fisik mandiri yang tersedia di *dashboard* pasien.
  * Hasil tes awal dijadikan acuan acuan sebelum memulai sesi konsultasi.
* **Layanan Konsultasi Interaktif:**
  * **Chat Real-time:** Sesi pesan instan dengan dokter pilihan.
  * **Panggilan Video (Video Call):** Konsultasi tatap muka secara virtual menggunakan koneksi *encrypted audio/video stream*.
* **Manajemen Rekam Medis & Diagnosa:**
  * Melihat riwayat konsultasi, diagnosa dokter, dan catatan perkembangan kesehatan.
  * **Unduh Laporan PDF:** Mampu mengunduh hasil konsultasi dan resep obat dalam format dokumen PDF resmi untuk dicetak atau disimpan.
* **Fitur Terapi Pernapasan (Relaksasi 4-7-8):**
  * Fitur interaktif panduan pernapasan teknik **4-7-8** (Tarik napas 4 detik, tahan 7 detik, hembuskan 8 detik).
  * Dirancang khusus untuk membantu menurunkan tingkat kecemasan, kecemasan berlebih, dan manajemen stres secara mandiri.

---

### 2. 👨‍⚕️ Role: Dokter
Dokter bertindak sebagai penyedia layanan medis yang mengelola konsultasi, diagnosa pasien, serta transaksi keuangan pribadi.

* **Manajemen Antrean Pasien:**
  * Menerima dan melihat seluruh dafatar antrean pasien yang telah dijadwalkan secara *real-time*.
  * Mengatur status ketersediaan (*Online/Offline*).
* **Pelaksanaan Konsultasi:**
  * Memulai dan mengakhiri sesi konsultasi via *Chat* atau *Video Call*.
  * Mengakses riwayat tes awal pasien sebelum atau selama konsultasi berlangsung.
* **Pengisian Catatan Medis & Resep (Medical Records):**
  * Mengisi form hasil konsultasi, diagnosa akhir, perkembangan kesehatan pasien (*progress notes*), serta rekomendasi obat-obatan/tindakan.
  * Data yang diinput dokter akan langsung tergenerasi menjadi dokumen PDF di sisi Pasien.
* **Pengajuan Pencairan Dana (Withdrawal):**
  * Fitur dompet/pendapatan dokter dari hasil konsultasi.
  * Mengajukan penarikan dana (*payout request*) hasil layanan konsultasi ke pihak Admin.

---

### 3. 🛡️ Role: Admin
Admin bertanggung jawab atas keberlangsungan operasional platform, keamanan data pengguna, dan manajemen keuangan sistem.

* **Manajemen Pengguna (User Management):**
  * Melihat, memantau, dan mengelola seluruh data akun (*Pasien* dan *Dokter*).
  * Mengatur status akun (Aktif / Nonaktif).
* **Pendaftaran Dokter Baru (Doctor Onboarding):**
  * Menambahkan akun dokter baru ke dalam sistem, lengkap dengan profil, spesialisasi, dan kredensial login.
* **Verifikasi & Persetujuan Pencairan Dana (Payout Approval):**
  * Memeriksa daftar pengajuan pencairan dana yang dikirimkan oleh dokter.
  * Melakukan verifikasi transaksi dan melakukan persetujuan (*ACC*) atau penolakan pengajuan dana.

---

## 🔄 Alur Kerja Sistem (Workflow Summary)

```text
[ PASIEN ] ────────► Mengikuti Tes Mandiri / Latihan Pernapasan 4-7-8
    │
    ├──────────────► Memilih Dokter & Masuk Antrean
    │
    ▼
[ DOKTER ] ────────► Menerima Antrean & Memulai Konsultasi (Chat / Video Call)
    │
    ├──────────────► Mengisi Diagnosa, Perkembangan, & Resep Obat
    │
    ▼
[ PASIEN ] ────────► Melihat Hasil & Mengunduh Ringkasan Konsultasi (PDF)
    │
[ DOKTER ] ────────► Mengajukan Pencairan Dana Hasil Konsultasi
    │
    ▼
[ ADMIN  ] ────────► Memverifikasi & Melakukan ACC Pencairan Dana Dokter