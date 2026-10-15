"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Pill,
  Download,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  User,
} from "lucide-react";

export default function PatientHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [patientName, setPatientName] = useState("Achmad Daniel");
  const [loading, setLoading] = useState(true);
  const [selectedHistoryId, setSelectedHistoryId] = useState<any>(null);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPatientHistory() {
      try {
        setLoading(true);
        const fetchedData = [
          {
            id: "c-001",
            doctorName: "Dr. Danuar Ilham, Sp.KJ",
            doctorTitle: "Spesialis Kesehatan Jiwa / Psikiater",
            date: "03 Oktober 2026",
            time: "10:00 - 10:45 WIB",
            type: "Video Call",
            status: "Completed",
            diagnosis: "F41.1 Gangguan Kecemasan Menyeluruh (GAD)",
            summary:
              "Pasien melaporkan tingkat kecemasan yang membaik dibandingkan minggu lalu. Pola tidur mulai teratur meskipun masih sering terbangun saat dini hari.",
            recommendations: [
              "Lanjutkan meditasi pernapasan 10 menit setiap pagi.",
              "Batasi konsumsi kafein setelah pukul 14:00.",
              "Lakukan journal mingguan untuk melacak pemicu emosi.",
            ],
            prescription: [
              { name: "Sertraline HCl 50mg", dosage: "1x Sehari (Pagi)", duration: "30 Hari", notes: "Diminum sesudah makan" },
              { name: "Alprazolam 0.5mg", dosage: "1x Sehari (Bila Perlu)", duration: "10 Tablet", notes: "Hanya saat cemas berat" },
            ],
          },
          {
            id: "c-002",
            doctorName: "dr. Ardian",
            doctorTitle: "Psikiater Klinis & Konselor",
            date: "18 September 2026",
            time: "14:00 - 14:45 WIB",
            type: "Live Chat",
            status: "Completed",
            diagnosis: "F43.0 Reaksi Stres Akut",
            summary:
              "Konsultasi awal terkait tekanan pekerjaan dan gejala insomnia. Diberikan intervensi Cognitive Behavioral Therapy (CBT) dasar.",
            recommendations: [
              "Terapkan sleep hygiene secara konsisten.",
              "Batasan screen time 1 jam sebelum tidur.",
            ],
            prescription: [
              { name: "Melatonin 3mg", dosage: "1x Sehari (Malam)", duration: "14 Hari", notes: "Diminum 30 menit sebelum tidur" },
            ],
          }
        ];

        setHistoryData(fetchedData);
        if (fetchedData.length > 0) {
          setSelectedHistoryId(fetchedData[0].id);
        }
      } catch (err) {
        console.error("Gagal mengambil riwayat konsultasi:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPatientHistory();
  }, []);

  // Fungsi untuk Men-download / Mencetak Rekam Medis dengan Desain PDF Premium
  const handleDownloadPDF = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Rekam Medis & Resep - Calma Health</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: #ffffff; line-height: 1.6; }
              
              /* Kop Surat Modern */
              .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 25px; }
              .brand-title { font-size: 24px; font-weight: 700; color: #0d9488; margin: 0; letter-spacing: -0.5px; }
              .brand-subtitle { font-size: 11px; color: #64748b; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
              .doc-badge { text-align: right; font-size: 11px; color: #64748b; }
              .doc-badge span { font-weight: 600; color: #0f172a; display: block; }

              /* Informasi Pasien & Dokter */
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 16px 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px; }
              .info-box h4 { font-size: 11px; text-transform: uppercase; color: #64748b; margin: 0 0 4px 0; letter-spacing: 0.5px; }
              .info-box p { font-size: 13px; font-weight: 600; color: #0f172a; margin: 0; }

              /* Bagian Konten Rekam Medis */
              .section { margin-bottom: 20px; }
              .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0d9488; margin-bottom: 8px; letter-spacing: 0.5px; border-bottom: 1px solid #ccfbf1; padding-bottom: 4px; }
              
              .diagnosis-box { background: #ccfbf1; color: #115e59; padding: 12px 16px; border-radius: 8px; font-weight: 700; font-size: 14px; border: 1px solid #99f6e4; }
              .summary-box { background: #f8fafc; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #334155; border: 1px solid #e2e8f0; }
              
              ul { padding-left: 18px; margin: 5px 0; }
              li { font-size: 13px; color: #334155; margin-bottom: 6px; }

              /* Tabel Resep Obat */
              table { width: 100%; border-collapse: collapse; margin-top: 8px; }
              th { background: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; text-align: left; padding: 10px 12px; border: 1px solid #e2e8f0; }
              td { padding: 10px 12px; font-size: 12px; border: 1px solid #e2e8f0; color: #334155; }

              /* Footer Tanda Tangan */
              .footer-signature { margin-top: 40px; display: flex; justify-content: flex-end; }
              .signature-box { text-align: center; width: 220px; }
              .signature-space { height: 60px; }
              .doctor-name { font-weight: 700; font-size: 13px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
              .doctor-title { font-size: 11px; color: #64748b; margin-top: 4px; }
            </style>
          </head>
          <body>
            <!-- Kop Surat -->
            <div class="header-container">
              <div>
                <h1 class="brand-title">CALMA MENTAL HEALTH</h1>
                <p class="brand-subtitle">Platform Layanan Terpadu & Rekam Medis Elektronik</p>
              </div>
              <div class="doc-badge">
                Dokumen Resmi Klinik
                <span>No. Rekam Medis: #RM-${Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
            </div>

            <!-- Detail Pasien & Sesi -->
            <div class="info-grid">
              <div class="info-box">
                <h4>Informasi Pasien</h4>
                <p>${patientName}</p>
              </div>
              <div class="info-box">
                <h4>Dokter Pemeriksa</h4>
                <p>${activeRecord?.doctorName}</p>
              </div>
              <div class="info-box">
                <h4>Metode & Waktu Sesi</h4>
                <p>${activeRecord?.type} • ${activeRecord?.date} (${activeRecord?.time})</p>
              </div>
              <div class="info-box">
                <h4>Status Konsultasi</h4>
                <p style="color: #059669;">✔ Selesai (Completed)</p>
              </div>
            </div>

            <!-- Diagnosis -->
            <div class="section">
              <div class="section-title">Diagnosis Utama</div>
              <div class="diagnosis-box">${activeRecord?.diagnosis}</div>
            </div>

            <!-- Evaluasi Dokter -->
            <div class="section">
              <div class="section-title">Catatan Evaluasi Klinis</div>
              <div class="summary-box">${activeRecord?.summary}</div>
            </div>

            <!-- Rekomendasi -->
            <div class="section">
              <div class="section-title">Rekomendasi / Anjuran Terapi</div>
              <ul>
                ${activeRecord?.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
              </ul>
            </div>

            <!-- Resep Obat -->
            <div class="section">
              <div class="section-title">Resep Obat Digital (E-Prescription)</div>
              <table>
                <thead>
                  <tr>
                    <th>Nama Obat</th>
                    <th>Aturan Pakai</th>
                    <th>Catatan</th>
                    <th>Jumlah / Durasi</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeRecord?.prescription.map((med: any) => `
                    <tr>
                      <td><strong>${med.name}</strong></td>
                      <td>${med.dosage}</td>
                      <td>${med.notes}</td>
                      <td><strong>${med.duration}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Tanda Tangan Dokter -->
            <div class="footer-signature">
              <div class="signature-box">
                <p style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Pemeriksa, ${activeRecord?.date}</p>
                <div class="signature-space"></div>
                <div class="doctor-name">${activeRecord?.doctorName}</div>
                <div class="doctor-title">${activeRecord?.doctorTitle}</div>
              </div>
            </div>

            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const filteredData = historyData.filter((item) => {
    const matchesSearch =
      item.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const activeRecord = historyData.find((item) => item.id === selectedHistoryId) || historyData[0];

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Riwayat Sesi & Rekam Medis</h1>
          <p className="text-xs text-slate-500">
            Akses catatan diagnosis, resep obat digital, dan ringkasan konsultasi Anda dari database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari dokter atau diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 outline-none w-56 text-slate-700 bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === "all" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === "completed" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"
              }`}
            >
              Selesai
            </button>
            <button
              onClick={() => setFilterStatus("cancelled")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === "cancelled" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"
              }`}
            >
              Batal
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 text-xs">
              Memuat data riwayat dari Firebase...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 text-xs">
              Tidak ada riwayat sesi yang ditemukan.
            </div>
          ) : (
            filteredData.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedHistoryId(item.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedHistoryId === item.id
                    ? "bg-white border-teal-600 shadow-md ring-2 ring-teal-600/10"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      item.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {item.status === "Completed" ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Selesai
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Dibatalkan
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm mb-1">{item.doctorName}</h3>
                <p className="text-xs text-slate-500 mb-3">{item.doctorTitle}</p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.time}
                  </span>
                  <span className="text-teal-700 font-medium flex items-center gap-0.5">
                    Detail <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Kolom Kanan: Detail Rekam Medis */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          {!activeRecord || activeRecord.status === "Cancelled" ? (
            <div className="text-center py-12 space-y-3">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Sesi Ini Dibatalkan atau Belum Dipilih</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Silakan pilih riwayat sesi yang selesai untuk melihat rekam medis.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
                      Pasien: {patientName}
                    </span>
                  </div>
                  <h2 className="font-bold text-slate-800 text-base pt-1">Dokter: {activeRecord.doctorName}</h2>
                  <p className="text-xs text-slate-500">{activeRecord.doctorTitle}</p>
                  <p className="text-xs text-slate-400">Jadwal: {activeRecord.date} ({activeRecord.time})</p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh PDF
                </button>
              </div>

              <div ref={printRef} className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Diagnosis Utama
                  </span>
                  <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-900 font-bold text-xs">
                    {activeRecord.diagnosis}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Catatan Evaluasi Dokter
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {activeRecord.summary}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Rekomendasi / Anjuran
                  </span>
                  <ul className="space-y-2">
                    {activeRecord.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-teal-600" /> Resep Obat Digital
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Terverifikasi Dokter
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeRecord.prescription.map((med: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{med.name}</p>
                          <p className="text-[11px] text-slate-500">
                            - {med.dosage} <span className="text-slate-400">({med.notes})</span>
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-teal-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          {med.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}