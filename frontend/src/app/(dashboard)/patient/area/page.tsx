"use client";

import { useState } from "react";
import { 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  Activity, 
  HelpCircle,
  FileText
} from "lucide-react";

// Definisi Pertanyaan untuk Setiap Sub-Tes Skrining
const testQuestions: Record<string, { title: string; questions: string[] }> = {
  phq9: {
    title: "PHQ-9 (Skrining Depresi)",
    questions: [
      "Kurang berminat atau bersemangat dalam melakukan sesuatu?",
      "Merasa murung, depresi, atau putus asa?",
      "Sulit tidur atau mudah terbangun, atau terlalu banyak tidur?",
      "Merasa lelah atau kurang bertenaga?",
      "Kurang nafsu makan atau makan terlalu banyak?",
      "Merasa buruk tentang diri sendiri — atau merasa gagal atau telah mengecewakan diri sendiri atau keluarga?",
      "Sulit berkonsentrasi pada sesuatu, seperti membaca koran atau menonton televisi?",
      "Bergerak atau berbicara sangat lambat, atau sebaliknya — gelisah/bolak-balik bergerak lebih sering dari biasanya?",
      "Pikiran bahwa Anda lebih baik mati atau ingin melukai diri sendiri dengan cara apa pun?"
    ]
  },
  gad7: {
    title: "GAD-7 (Skrining Kecemasan)",
    questions: [
      "Merasa gugup, cemas, atau tegang?",
      "Tidak mampu menghentikan atau mengendalikan kekhawatiran?",
      "Terlalu khawatir tentang berbagai hal yang berbeda?",
      "Kesulitan untuk santai?",
      "Begitu gelisah sehingga sulit untuk duduk tenang?",
      "Menjadi mudah marah atau lekas tersinggung?",
      "Merasa takut seolah-olah sesuatu yang buruk akan terjadi?"
    ]
  },
  pss: {
    title: "PSS (Skala Stres)",
    questions: [
      "Seberapa sering Anda merasa kesal karena sesuatu yang terjadi secara tak terduga?",
      "Seberapa sering Anda merasa tidak mampu mengontrol hal-hal penting dalam hidup Anda?",
      "Seberapa sering Anda merasa gugup dan stres?",
      "Seberapa sering Anda merasa yakin terhadap kemampuan diri sendiri dalam menangani masalah pribadi?"
    ]
  },
  dass21: {
    title: "DASS-21 (Komprehensif)",
    questions: [
      "Saya merasa sulit untuk tenang?",
      "Saya menyadari mulut saya terasa kering?",
      "Saya sama sekali tidak dapat merasakan perasaan positif?",
      "Saya mengalami kesulitan bernapas (misalnya: napas cepat, terengah-engah tanpa aktivitas fisik)?",
      "Saya merasa sepertinya tidak kuat lagi untuk mengambil inisiatif melakukan sesuatu?",
      "Saya cenderung bereaksi berlebihan terhadap situasi?",
      "Saya merasakan gemetar (misalnya: pada tangan)?"
    ]
  }
};

const options = [
  { label: "Tidak Pernah", score: 0 },
  { label: "Kadang-kadang", score: 1 },
  { label: "Sering", score: 2 },
  { label: "Hampir Setiap Hari", score: 3 },
];

export default function PatientAreaPage() {
  // State untuk Interaksi Tes Skrining
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);

  const tests = [
    { 
      id: "phq9", 
      title: "PHQ-9 Depresi", 
      duration: "5 Menit", 
      category: "Depresi", 
      desc: "Skrining klinis tingkat keparahan gejala depresi berdasarkan pengalaman 2 minggu terakhir." 
    },
    { 
      id: "gad7", 
      title: "GAD-7 Kecemasan", 
      duration: "5 Menit", 
      category: "Kecemasan", 
      desc: "Mengukur indikasi dan tingkat gangguan kecemasan umum secara berkala." 
    },
    { 
      id: "pss", 
      title: "PSS Skala Stres", 
      duration: "4 Menit", 
      category: "Stres", 
      desc: "Perceived Stress Scale untuk mengukur beban stres psikologis harian Anda." 
    },
    { 
      id: "dass21", 
      title: "DASS-21 Komprehensif", 
      duration: "12 Menit", 
      category: "Komprehensif", 
      desc: "Skrining komprehensif mengukur tiga aspek emosional utama (depresi, kecemasan, dan stres)." 
    }
  ];

  const handleStartTest = (id: string) => {
    setActiveTestId(id);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTestCompleted(false);
  };

  const handleSelectAnswer = (score: number) => {
    const updatedAnswers = [...answers, score];
    setAnswers(updatedAnswers);

    const currentTestObj = activeTestId ? testQuestions[activeTestId] : null;
    if (currentTestObj && currentQuestionIndex + 1 < currentTestObj.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setTestCompleted(true);
    }
  };

  const totalScore = answers.reduce((a, b) => a + b, 0);

  const getResultInterpretation = (score: number) => {
    if (score <= 4) return { text: "Normal / Ringan", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score <= 9) return { text: "Sedang", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { text: "Memerlukan Perhatian Profesional", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16 px-4 sm:px-6 font-sans text-slate-800 bg-slate-50/50 min-h-screen">
      
      {/* ================= BANNER HEADLINE SKRINING ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 p-6 sm:p-10 text-white shadow-xl shadow-teal-900/10">
        <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 w-48 h-48 rounded-full bg-teal-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-100 text-xs font-medium border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Evaluasi Klinis Mandiri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Tes Skrining Kesehatan Mental
          </h1>
          <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed">
            Pahami kondisi emosional dan tingkat stres Anda secara objektif menggunakan modul instrumen skrining tervalidasi klinis.
          </p>
        </div>
      </div>

      {/* ================= WIDGET EDUKASI & INFORMASI ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Privasi 100% Terjaga</h3>
            <p className="text-xs text-slate-500 mt-0.5">Hasil tes tersimpan secara aman dan bersifat rahasia.</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Standar Klinis</h3>
            <p className="text-xs text-slate-500 mt-0.5">Menggunakan metode pengukuran baku seperti PHQ-9 & GAD-7.</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Evaluasi Berkala</h3>
            <p className="text-xs text-slate-500 mt-0.5">Lakukan evaluasi mingguan untuk memantau kemajuan emosional.</p>
          </div>
        </div>
      </div>

      {/* ================= MODAL / TAMPILAN INTERAKTIF TES SKRINING ================= */}
      {activeTestId && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-white/20 relative">
            
            {/* Tombol Tutup */}
            <button 
              onClick={() => setActiveTestId(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-xs font-bold bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            >
              ✕
            </button>

            {!testCompleted ? (
              <div>
                <div className="flex flex-col items-center text-xs font-semibold text-teal-700 mb-3 uppercase tracking-wider">
                  <span>{testQuestions[activeTestId].title}</span>
                  <span className="text-slate-400 font-normal mt-0.5">
                    Soal {currentQuestionIndex + 1} dari {testQuestions[activeTestId].questions.length}
                  </span>
                </div>

                {/* Progress Bar Modern */}
                <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${((currentQuestionIndex + 1) / testQuestions[activeTestId].questions.length) * 100}%` }}
                  />
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-6 leading-relaxed text-center">
                  {testQuestions[activeTestId].questions[currentQuestionIndex]}
                </h3>

                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(opt.score)}
                      className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-teal-400 hover:bg-teal-50/40 text-xs sm:text-sm font-medium text-slate-700 transition-all duration-200 flex justify-between items-center group shadow-sm hover:shadow"
                    >
                      <span>{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Skrining Selesai</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
                    Terima kasih telah meluangkan waktu untuk mengevaluasi kesehatan mentalmu hari ini.
                  </p>
                </div>

                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 max-w-xs mx-auto">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Total Skor Anda</span>
                  <span className="text-4xl font-black text-slate-900 tracking-tight">{totalScore}</span>
                  <div className={`mt-3 px-3.5 py-1.5 rounded-xl text-xs font-bold border inline-block ${getResultInterpretation(totalScore).color}`}>
                    {getResultInterpretation(totalScore).text}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleStartTest(activeTestId)}
                    className="flex-1 py-3 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Ulangi Tes
                  </button>
                  <button
                    onClick={() => setActiveTestId(null)}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-2xl text-xs font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= PILIHAN MODUL SKRINING ================= */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pilih Modul Skrining</h2>
          <p className="text-slate-500 text-sm mt-1">Pilih kuesioner yang sesuai dengan aspek emosional yang ingin Anda evaluasi hari ini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tests.map((test) => (
            <div key={test.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 flex flex-col justify-between space-y-5 group">
              <div>
                <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-xl text-slate-600 font-medium">{test.category}</span>
                  <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-slate-400" /> {test.duration}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-teal-700 transition-colors">{test.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{test.desc}</p>
              </div>
              <button 
                onClick={() => handleStartTest(test.id)}
                className="w-full py-3 bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 rounded-2xl text-xs font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 group/btn"
              >
                Mulai Tes <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SEKSI PANDUAN INTERPRETASI SKOR ================= */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Panduan Interpretasi Skor</h3>
            <p className="text-xs text-slate-500">Memahami hasil pengukuran skrining mandiri secara umum.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
            <span className="font-bold text-emerald-800 block text-sm">Skor 0 - 4: Normal / Ringan</span>
            <p className="text-emerald-700/80 leading-relaxed">
              Kondisi emosional cenderung stabil. Pertahankan gaya hidup sehat, waktu tidur teratur, dan manajemen stres harian.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
            <span className="font-bold text-amber-800 block text-sm">Skor 5 - 9: Sedang</span>
            <p className="text-amber-700/80 leading-relaxed">
              Terdapat indikasi beban stres atau kecemasan ringan-sedang. Disarankan melatih pernapasan mandiri dan meditasi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1">
            <span className="font-bold text-rose-800 block text-sm">Skor 10+: Memerlukan Perhatian</span>
            <p className="text-rose-700/80 leading-relaxed">
              Indikasi gejala memerlukan penanganan lebih lanjut. Pertimbangkan untuk berkonsultasi dengan profesional medis.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}