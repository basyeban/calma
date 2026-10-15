const fs = require('fs');
const path = require('path');

const structure = [
  // Backend
  "backend/app/__init__.py",
  "backend/app/main.py",
  "backend/app/core/config.py",
  "backend/app/core/security.py",
  "backend/app/db/session.py",
  "backend/app/db/base_class.py",
  "backend/app/models/user.py",
  "backend/app/models/doctor_profile.py",
  "backend/app/models/patient_profile.py",
  "backend/app/models/screening.py",
  "backend/app/models/consultation.py",
  "backend/app/models/medical_record.py",
  "backend/app/models/financial.py",
  "backend/app/models/patient.py",
  "backend/app/schemas/user.py",
  "backend/app/schemas/consultation.py",
  "backend/app/schemas/medical_record.py",
  "backend/app/schemas/screening.py",
  "backend/app/schemas/patient.py",
  "backend/app/api/auth.py",
  "backend/app/api/users.py",
  "backend/app/api/doctors.py",
  "backend/app/api/screenings.py",
  "backend/app/api/consultations.py",
  "backend/app/api/medical_records.py",
  "backend/app/api/financials.py",
  "backend/app/api/patient.py",
  "backend/.env",
  "backend/requirements.txt",
  "backend/Dockerfile",

  // Frontend
  "frontend/src/app/(auth)/login/page.tsx",
  "frontend/src/app/(auth)/register/page.tsx",
  "frontend/src/app/(dashboard)/layout.tsx",
  "frontend/src/app/(dashboard)/patient/layout.tsx",
  "frontend/src/app/(dashboard)/patient/dashboard/page.tsx",
  "frontend/src/app/(dashboard)/patient/area/page.tsx",
  "frontend/src/app/(dashboard)/patient/screening/page.tsx",
  "frontend/src/app/(dashboard)/patient/consultation/page.tsx",
  "frontend/src/app/(dashboard)/patient/history/page.tsx",
  "frontend/src/app/(dashboard)/patient/settings/page.tsx",
  "frontend/src/app/(dashboard)/doctor/dashboard/page.tsx",
  "frontend/src/app/(dashboard)/doctor/queue/page.tsx",
  "frontend/src/app/(dashboard)/doctor/schedule/page.tsx",
  "frontend/src/app/(dashboard)/doctor/live-session/[id]/page.tsx",
  "frontend/src/app/(dashboard)/admin/dashboard/page.tsx",
  "frontend/src/app/(dashboard)/admin/users/page.tsx",
  "frontend/src/app/(dashboard)/admin/add-doctor/page.tsx",
  "frontend/src/app/(dashboard)/admin/financials/page.tsx",
  "frontend/src/app/(dashboard)/admin/settings/page.tsx",
  "frontend/src/app/page.tsx",
  "frontend/src/app/layout.tsx",
  "frontend/src/lib/api.ts",
  "frontend/src/lib/auth.ts",
  "frontend/.env.local",
  "frontend/package.json",
  "frontend/tailwind.config.js"
];

console.log("🚀 Membuat folder dan file...");

structure.forEach((filepath) => {
  const absolutePath = path.join(__dirname, filepath);
  const dir = path.dirname(absolutePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(absolutePath)) {
    fs.writeFileSync(absolutePath, "");
  }
});

console.log("✅ Selesai! Semua struktur folder dan file berhasil dibuat.");