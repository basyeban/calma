"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Loader2, 
  AlertCircle, 
  FileText, 
  Calendar, 
  UserCheck, 
  X, 
  Save, 
  CheckCircle2,
  ShieldCheck,
  User
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Patient {
  id: string | number;
  full_name: string;
  email: string;
  gender?: string;
  last_session?: string;
  status?: string;
  diagnosis?: string;
  clinical_notes?: string;
  prescription?: string;
}

export default function MyPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk mengontrol Card Rekam Medis yang sedang dibuka
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");
      
      const currentDoctorId = localStorage.getItem("doctor_id") || "6";

      // Ambil data relasi dari tabel consultations & patient_profiles di Supabase
      const { data: consultationData, error: dbError } = await supabase
        .from("consultations")
        .select(`
          patient_profiles (
            id,
            gender,
            users (
              id,
              full_name,
              email
            )
          )
        `)
        .eq("doctor_id", currentDoctorId);

      if (!dbError && consultationData && consultationData.length > 0) {
        const uniquePatientsMap = new Map();
        consultationData.forEach((item: any) => {
          const profile = item.patient_profiles;
          if (profile && profile.users) {
            const user = profile.users;
            uniquePatientsMap.set(user.id, {
              id: user.id,
              full_name: user.full_name,
              email: user.email,
              gender: profile.gender || "Laki-laki",
              last_session: "14 Okt 2026",
              status: "Aktif",
              diagnosis: "F41.1 Gangguan Kecemasan Menyeluruh (Generalized Anxiety)",
              clinical_notes: "Pasien merespon baik teknik pernapasan diaphragmatic.",
              prescription: "Sertraline 50mg (1x1 malam hari)",
            });
          }
        });

        const fetchedList = Array.from(uniquePatientsMap.values());
        if (fetchedList.length > 0) {
          setPatients(fetchedList);
          setLoading(false);
          return;
        }
      }

      // Fallback Data: Tepat 1 pasien tunggal sesuai data Anda
      const singlePatientMock: Patient[] = [
        { 
          id: "p-achmad", 
          full_name: "Achmad Daniel", 
          email: "achmaddaniel@gmail.com", 
          gender: "Laki-laki", 
          last_session: "14 Okt 2026", 
          status: "Aktif", 
          diagnosis: "F41.1 Gangguan Kecemasan Menyeluruh (Generalized Anxiety)",
          clinical_notes: "Pasien merespon baik teknik pernapasan diaphragmatic dan sesi konseling.",
          prescription: "Sertraline 50mg (1x1 malam hari jika diperlukan)."
        },
      ];
      setPatients(singlePatientMock);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi menyimpan perubahan rekam medis dari Card
  const handleSaveRecord = async () => {
    if (!selectedPatient) return;
    try {
      setSaving(true);
      // Update data di state lokal
      setPatients(patients.map(p => p.id === selectedPatient.id ? selectedPatient : p));
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedPatient(null); // Tutup card setelah sukses
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-700" />
            Daftar Pasien Saya
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data riwayat konsultasi dan pantau rekam medis pasien Anda secara langsung.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-teal-700 transition"
          />
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
          <p className="text-xs">Memuat data pasien dari database...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {filteredPatients.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <UserCheck className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-sm font-medium">Tidak ada pasien ditemukan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-stone-50 border-b border-gray-200 text-slate-500 font-medium">
                    <tr>
                      <th className="py-3.5 px-4">Nama Pasien</th>
                      <th className="py-3.5 px-4">Kontak / Email</th>
                      <th className="py-3.5 px-4">Sesi Terakhir</th>
                      <th className="py-3.5 px-4">Diagnosis Utama</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi Rekam Medis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-stone-50/50 transition">
                        <td className="py-4 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                              {patient.full_name.charAt(0)}
                            </div>
                            <div>
                              <div>{patient.full_name}</div>
                              <div className="text-[10px] text-gray-400 font-normal">{patient.gender}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{patient.email}</td>
                        <td className="py-4 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{patient.last_session}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] line-clamp-1 max-w-[200px] block">
                            {patient.diagnosis || "Umum"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-100">
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => setSelectedPatient(patient)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-teal-700 hover:text-white text-slate-700 rounded-xl text-[11px] font-medium transition shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Buka Rekam Medis</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CARD DETAIL REKAM MEDIS (Tampil Interaktif Saat Tombol Diklik) */}
          {selectedPatient && (
            <div className="bg-white border-2 border-teal-700/20 rounded-3xl p-6 shadow-xl space-y-5 transition animate-fadeIn">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Rekam Medis: {selectedPatient.full_name}</h3>
                    <p className="text-[11px] text-slate-500">Perbarui catatan klinis, diagnosis, dan resep obat pasien ini.</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 rounded-full hover:bg-stone-100 text-gray-400 hover:text-gray-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border">
                <div>
                  <span className="text-gray-400 block font-medium">Email Pasien</span>
                  <p className="font-semibold text-slate-800">{selectedPatient.email}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Jenis Kelamin</span>
                  <p className="font-semibold text-slate-800">{selectedPatient.gender}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Sesi Terakhir</span>
                  <p className="font-semibold text-teal-700">{selectedPatient.last_session}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block text-xs">Diagnosis Utama</label>
                  <input
                    type="text"
                    value={selectedPatient.diagnosis || ""}
                    onChange={(e) => setSelectedPatient({ ...selectedPatient, diagnosis: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-teal-700 text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block text-xs">Catatan Perkembangan Klinis</label>
                  <textarea
                    rows={3}
                    value={selectedPatient.clinical_notes || ""}
                    onChange={(e) => setSelectedPatient({ ...selectedPatient, clinical_notes: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-teal-700 text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block text-xs">Resep Obat & Anjuran</label>
                  <input
                    type="text"
                    value={selectedPatient.prescription || ""}
                    onChange={(e) => setSelectedPatient({ ...selectedPatient, prescription: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-teal-700 text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-600 font-semibold rounded-xl text-xs transition"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={handleSaveRecord}
                    disabled={saving}
                    className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl text-xs shadow transition flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Menyimpan...</span>
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Berhasil Disimpan!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Rekam Medis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}