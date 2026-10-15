"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, ArrowRight, ShieldCheck, Flame } from "lucide-react";

const BURNOUT_QUESTIONS = [
  "Merasa terkuras secara emosional dan kehabisan tenaga di penghujung hari?",
  "Merasa lelah secara fisik maupun mental saat pertama kali bangun tidur dan harus menghadapi hari baru?",
  "Merasa bahwa pekerjaan atau aktivitas harian Anda sangat membebani dan melelahkan?",
  "Kehilangan antusiasme atau motivasi terhadap hal-hal yang biasanya Anda sukai?",
  "Merasa sinis, dingin, atau tidak peduli terhadap orang lain di sekitar Anda?",
  "Merasa tidak lagi produktif atau kesulitan menyelesaikan tugas-tugas seperti biasanya?",
  "Sering mengalami sakit kepala, ketegangan otot, atau gangguan fisik akibat stres?"
];

export default function ScreeningPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  
  // State untuk menampilkan hasil skrining secara instan
  const [resultData, setResultData] = useState<{
    totalScore: number;
    category: string;
    description: string;
    color: string;
  } | null>(null);

  const handleSelect = (qIdx: number, val: number) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: val }));
  };

  const getBurnoutInterpretation = (score: number) => {
    if (score <= 6) {
      return {
        category: "Tingkat Burnout Rendah (Seimbang)",
        description: "Kondisi energi dan mental Anda relatif terjaga dengan baik. Pertahankan keseimbangan antara aktivitas dan waktu istirahat.",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200"
      };
    } else if (score <= 14) {
      return {
        category: "Risiko Burnout Sedang",
        description: "Anda mulai merasakan tanda-tanda kelelahan kronis. Mulailah menetapkan batasan waktu, kurangi beban berlebih, dan prioritaskan istirahat.",
        color: "text-amber-700 bg-amber-50 border-amber-200"
      };
    } else {
      return {
        category: "Burnout Tinggi (Memerlukan Perhatian Serius)",
        description: "Skor mengindikasikan tingkat kelelahan dan kejenuhan yang parah. Sangat disarankan untuk beristirahat total dan berkonsultasi dengan profesional.",
        color: "text-rose-700 bg-rose-50 border-rose-200"
      };
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < BURNOUT_QUESTIONS.length) {
      alert("Harap jawab semua pertanyaan terlebih dahulu sebelum melihat hasil.");
      return;
    }

    setLoading(true);
    
    // Hitung total skor secara instan di sisi klien
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const interpretation = getBurnoutInterpretation(totalScore);

    const payload = {
      patient_id: "USER_PATIENT_ID", // Ambil dari JWT / LocalStorage / Context
      test_type: "burnout",
      answers: Object.entries(answers).map(([qId, val]) => ({
        question_id: parseInt(qId),
        score_value: val
      }))
    };

    try {
      // Simulasi pengiriman data ke backend (FastAPI)
      const res = await fetch("http://localhost:8000/api/screenings/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // Tampilkan hasil secara instan di UI
      setTimeout(() => {
        setResultData({
          totalScore,
          category: interpretation.category,
          description: interpretation.description,
          color: interpretation.color
        });
        setLoading(false);
      }, 600);

    } catch (err) {
      console.error(err);
      const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
      const interpretation = getBurnoutInterpretation(totalScore);
      setResultData({
        totalScore,
        category: interpretation.category,
        description: interpretation.description,
        color: interpretation.color
      });
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResultData(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-7 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-9xl">💻</div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-medium tracking-wide uppercase">
          <Flame className="w-3.5 h-3.5 text-amber-400" /> Skrining Kelelahan & Kejenuhan
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold mt-3 mb-2">
          Tes Skrining Burnout
        </h1>
        <p className="text-teal-100 text-xs sm:text-sm font-light max-w-xl leading-relaxed">
          Ukur tingkat kejenuhan fisik, emosional, dan mental akibat tekanan pekerjaan atau aktivitas harian Anda.
        </p>
      </div>

      {/* JIKA HASIL SUDAH KELUAR */}
      {resultData ? (
        <div className="bg-white p-8 rounded-3xl border border-teal-100 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hasil Asesmen Burnout</span>
            {/* Hanya menampilkan angka skor total saja tanpa teks tambahan */}
            <h2 className="text-3xl font-serif font-bold text-slate-900 mt-1">{resultData.totalScore}</h2>
          </div>

          <div className={`p-4 rounded-2xl border max-w-lg mx-auto ${resultData.color} space-y-1 shadow-sm`}>
            <span className="text-xs font-bold uppercase tracking-wider block">Tingkat Kelelahan:</span>
            <h4 className="font-bold text-base">{resultData.category}</h4>
            <p className="text-xs mt-2 leading-relaxed opacity-90">{resultData.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Ulangi Tes
            </button>
            <button
              onClick={() => router.push("/patient/consultation")}
              className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-semibold transition shadow-md flex items-center justify-center gap-2"
            >
              Konsultasi Solusi Burnout dengan Dokter <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* FORM PERTANYAAN BURNOUT */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Progres: {Object.keys(answers).length} dari {BURNOUT_QUESTIONS.length} terjawab</span>
            <span className="flex items-center gap-1 text-teal-700"><ShieldCheck className="w-4 h-4" /> Data Privat & Aman</span>
          </div>

          {BURNOUT_QUESTIONS.map((q, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-teal-200 transition">
              <p className="text-sm font-bold text-slate-800 mb-4 flex items-start gap-2">
                <span className="w-6 h-6 bg-teal-50 text-teal-800 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                  {idx + 1}
                </span>
                {q}
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: "Tidak Pernah", val: 0 },
                  { label: "Jarang", val: 1 },
                  { label: "Sering", val: 2 },
                  { label: "Hampir Setiap Hari", val: 3 }
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleSelect(idx, opt.val)}
                    className={`p-3 text-xs rounded-xl border font-medium transition-all text-center ${
                      answers[idx] === opt.val
                        ? "bg-teal-700 text-white border-teal-700 shadow-md scale-[1.02]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50/50 hover:border-teal-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menganalisis Tingkat Burnout...
              </span>
            ) : (
              <>
                Kirim & Lihat Hasil Burnout <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}