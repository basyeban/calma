"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Video,
  ClipboardCheck,
  Heart,
  Pill,
  ArrowRight,
  ShieldCheck,
  Quote,
  Menu,
  X,
  Star,
  ChevronDown,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  MessageSquare,
  BarChart3,
  BookOpen,
  Loader2,
} from "lucide-react";
import { realtimeDb, firebaseService } from "@/lib/firebase";

// Komponen SVG Kustom untuk Ikon Sosial Media
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"pasien" | "dokter" | "admin">("pasien");

  // State untuk Interaktif Mood Harian
  const [selectedMood, setSelectedMood] = useState<string>("Cemas");
  
  // State untuk Data Dokter dari Firebase Realtime & Filter
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("Semua");
  const [selectedPrice, setSelectedPrice] = useState<string>("Semua");
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  // Ambil data dokter langsung dari Firebase Realtime Database
  useEffect(() => {
    async function fetchDoctorsFromFirebase() {
      try {
        setLoadingDoctors(true);
        const data = await firebaseService.getDoctors();

        if (!data || data.length === 0) {
          setDoctorsList([
            {
              id: 1,
              name: "dr. Danuar Ilham",
              role: "Psikiater · Firebase",
              rating: "4.8",
              tags: ["Mood", "Stres kerja"],
              priceNum: 250000,
              price: "Rp250.000",
              spec: "Mood & Stres",
              img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=500"
            }
          ]);
        } else {
          const formattedDoctors = data.map((doc, idx) => ({
            id: doc.id,
            name: doc.full_name || doc.name || "Dokter Profesional",
            role: doc.email?.includes("sp.kj") ? "Psikiater · Firebase" : "Psikolog Klinis · Firebase",
            rating: doc.rating || "4.9",
            tags: doc.tags || ["Kecemasan", "Stres Kerja"],
            priceNum: doc.priceNum || (150000 + idx * 25000),
            price: doc.price || `Rp${(150000 + idx * 25000).toLocaleString("id-ID")}`,
            spec: doc.specialization || (idx % 2 === 0 ? "Kecemasan" : "Mood & Stres"),
            img: doc.img || (idx % 2 === 0 
              ? "https://images.unsplash.com/photo-1594824813575-f938d8794c48?q=80&w=500" 
              : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=500")
          }));
          setDoctorsList(formattedDoctors);
        }
      } catch (err) {
        console.error("Gagal memuat data dari Firebase Realtime Database:", err);
      } finally {
        setLoadingDoctors(false);
      }
    }

    fetchDoctorsFromFirebase();
  }, []);

  // State untuk Testimoni Carousel Sederhana
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonials = [
    {
      quote: "Aku mulai belajar bahwa tidak apa-apa meminta bantuan. Pelan-pelan, aku lebih memahami rasa cemas dan memberi ruang untuk diriku sendiri.",
      name: "Alya, 27 tahun",
      desc: "Cerita tentang kecemasan",
    },
    {
      quote: "Dulu aku merasa harus selalu kuat. Dalam perjalanan ini, aku belajar menetapkan batas dan menemukan kembali ritme hidup yang lebih seimbang.",
      name: "Bima, 32 tahun",
      desc: "Cerita tentang burnout",
    },
    {
      quote: "Punya ruang untuk didengar membantuku melihat perasaan dengan lebih jernih. Langkahku masih kecil, tapi sekarang aku tahu ke mana ingin melangkah.",
      name: "Dinda, 24 tahun",
      desc: "Cerita tentang mengenal diri",
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // State untuk Tes Mandiri 10 Pertanyaan Tanpa Login
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testAnswers, setTestAnswers] = useState<number[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);

  const testQuestions = [
    {
      question: "1. Seberapa sering Anda merasa sulit mengendalikan rasa khawatir dalam 2 minggu terakhir?",
      options: [
        { label: "Tidak pernah", score: 0 },
        { label: "Beberapa hari", score: 1 },
        { label: "Lebih dari separuh waktu", score: 2 },
        { label: "Hampir setiap hari", score: 3 },
      ],
    },
    {
      question: "2. Seberapa sering Anda merasa mudah tersinggung atau marah belakangan ini?",
      options: [
        { label: "Tidak pernah", score: 0 },
        { label: "Beberapa hari", score: 1 },
        { label: "Lebih dari separuh waktu", score: 2 },
        { label: "Hampir setiap hari", score: 3 },
      ],
    },
    {
      question: "3. Apakah Anda mengalami kesulitan untuk tidur atau tetap tidur karena pikiran yang menumpuk?",
      options: [
        { label: "Tidak pernah", score: 0 },
        { label: "Beberapa hari", score: 1 },
        { label: "Lebih dari separuh waktu", score: 2 },
        { label: "Hampir setiap hari", score: 3 },
      ],
    },
    {
      question: "4. Seberapa sering Anda merasa lelah atau kehilangan energi secara berlebihan tanpa sebab fisik yang jelas?",
      options: [
        { label: "Tidak pernah", score: 0 },
        { label: "Beberapa hari", score: 1 },
        { label: "Lebih dari separuh waktu", score: 2 },
        { label: "Hampir setiap hari", score: 3 },
      ],
    },
    {
      question: "5. Apakah Anda sering merasa sulit berkonsentrasi pada pekerjaan atau aktivitas sehari-hari?",
      options: [
        { label: "Tidak pernah", score: 0 },
        { label: "Beberapa hari", score: 1 },
        { label: "Lebih dari separuh waktu", score: 2 },
        { label: "Hampir setiap hari", score: 3 },
      ],
    },
    {
      question: "6. Seberapa sering Anda merasa pesimis atau kehilangan harapan terhadap masa depan?",
      options: [
        { label: "Tidak pernah", score: 0 },
        { label: "Beberapa hari", score: 1 },
        { label: "Lebih dari separuh waktu", score: 2 },
        { label: "Hampir setiap hari", score: 3 },
      ],
    },
    {
      question: "7. Apakah Anda cenderung menarik diri dari interaksi sosial dengan keluarga atau teman?",
      options: [
        { label: "Tidak pernah", score: 0 },
        { label: "Beberapa hari", score: 1 },
        { label: "Lebih dari separuh waktu", score: 2 },
        { label: "Hampir setiap hari", score: 3 },
      ],
    },
    {
      question: "8. Seberapa sering Anda merasakan ketegangan otot, sakit kepala, atau gelisah fisik (seperti jantung berdebar)?",
      options: [
        { label: "Tidak pernah", score: 0 },
        { label: "Beberapa hari", score: 1 },
        { label: "Lebih dari separuh waktu", score: 2 },
        { label: "Hampir setiap hari", score: 3 },
      ],
    },
    {
      question: "9. Apakah Anda merasa kesulitan menikmati hobi atau aktivitas yang biasanya Anda sukai?",
      options: [
        { label: "Tidak pernah", score: 0 },
        { label: "Beberapa hari", score: 1 },
        { label: "Lebih dari separuh waktu", score: 2 },
        { label: "Hampir setiap hari", score: 3 },
      ],
    },
    {
      question: "10. Seberapa sering Anda merasa bahwa beban hidup atau pekerjaan terlalu berat untuk ditanggung?",
      options: [
        { label: "Tidak pernah", score: 0 },
        { label: "Beberapa hari", score: 1 },
        { label: "Lebih dari separuh waktu", score: 2 },
        { label: "Hampir setiap hari", score: 3 },
      ],
    },
  ];

  const handleAnswerSelect = (score: number) => {
    const newAnswers = [...testAnswers, score];
    setTestAnswers(newAnswers);
    if (currentQuestion + 1 < testQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const totalScore = newAnswers.reduce((a, b) => a + b, 0);
      if (totalScore <= 8) {
        setTestResult("Tingkat stres dan kecemasan Anda tergolong ringan. Pertahankan pola hidup sehat dan luangkan waktu untuk relaksasi.");
      } else if (totalScore <= 18) {
        setTestResult("Tingkat stres Anda tergolong sedang. Pertimbangkan untuk berbagi cerita dengan orang terdekat atau mencoba teknik pernapasan terarah.");
      } else {
        setTestResult("Tingkat stres Anda cukup tinggi. Sangat disarankan untuk segera berkonsultasi dengan profesional psikolog atau psikiater guna mendapatkan dukungan yang tepat.");
      }
    }
  };

  const resetTest = () => {
    setIsTestActive(false);
    setCurrentQuestion(0);
    setTestAnswers([]);
    setTestResult(null);
  };

  const filteredDoctors = doctorsList.filter((doc) => {
    const matchSpec = selectedSpecialization === "Semua" || doc.spec === selectedSpecialization;
    let matchPrice = true;
    if (selectedPrice === "Under 200k") matchPrice = (doc.priceNum || 0) <= 200000;
    if (selectedPrice === "Above 200k") matchPrice = (doc.priceNum || 0) > 200000;
    return matchSpec && matchPrice;
  });

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans antialiased overflow-x-hidden scroll-smooth">
      
      {/* ================= 1. HERO SECTION DENGAN NAVBAR BERFUNGSI ================= */}
      <div id="beranda" className="relative bg-[#114b3e] text-white min-h-[580px] md:min-h-[640px] pb-24 md:pb-28">
        <div className="absolute inset-0 -z-0 bg-gradient-to-b from-[#0f4236] to-[#145648] opacity-90"></div>

        {/* Navbar Fungsional dengan Smooth Scroll */}
        <header className="max-w-6xl mx-auto px-4 sm:px-6 py-5 relative z-20">
          <div className="flex items-center justify-between">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <motion.span 
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="text-emerald-400 text-xl font-bold inline-block"
              >
                🌿
              </motion.span>
              <div className="text-2xl font-serif font-bold tracking-tight text-white">
                Calma
              </div>
            </motion.div>

            {/* Navigasi Desktop Fungsional */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-200">
              {[
                { name: "Beranda", href: "#beranda" },
                { name: "Layanan", href: "#layanan" },
                { name: "Tes Mandiri", href: "#tes-mandiri" },
                { name: "Cari Dokter", href: "#dokter" },
              ].map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + idx * 0.08 }}
                >
                  <a 
                    href={item.href} 
                    className="hover:text-white transition relative py-1 text-gray-300 hover:border-b-2 hover:border-white"
                  >
                    {item.name}
                  </a>
                </motion.div>
              ))}
            </nav>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="hidden md:flex items-center space-x-3"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm border border-white/40 rounded-full hover:bg-white/10 hover:border-white transition font-medium block"
                >
                  Masuk
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="px-5 py-2 text-sm bg-[#0b6e59] hover:bg-[#095a49] text-white font-medium rounded-full transition shadow-md block"
                >
                  Daftar
                </Link>
              </motion.div>
            </motion.div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </header>

        {/* Menu Dropdown Mobile */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden relative z-30 bg-[#0f4236] px-6 py-6 border-b border-emerald-800 space-y-4 text-center overflow-hidden shadow-2xl"
            >
              <nav className="flex flex-col space-y-3 text-sm text-gray-200">
                {[
                  { name: "Beranda", href: "#beranda" },
                  { name: "Layanan", href: "#layanan" },
                  { name: "Tes Mandiri", href: "#tes-mandiri" },
                  { name: "Cari Dokter", href: "#dokter" },
                ].map((menu, i) => (
                  <motion.div
                    key={menu.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <a 
                      href={menu.href} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-emerald-300 transition"
                    >
                      {menu.name}
                    </a>
                  </motion.div>
                ))}
              </nav>
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4 border-t border-emerald-800 flex flex-col space-y-2"
              >
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-sm border border-white/40 rounded-full text-center hover:bg-white/10 transition">
                  Masuk
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-sm bg-[#0b6e59] text-white font-medium rounded-full text-center shadow-md">
                  Daftar
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 mt-8 md:mt-12 relative z-10"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] md:text-xs font-medium text-emerald-100 mb-4 border border-white/15"
          >
            <span>✨</span>
            <span>Ruang aman untuk menjadi dirimu</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-normal tracking-wide mb-4 leading-tight">
            Temukan Ketenangan Jiwa<br />Bersama Profesional Terpercaya
          </h1>
          
          <p className="text-emerald-100 text-xs md:text-base max-w-xl mx-auto mb-8 font-light leading-relaxed">
            Tak perlu menghadapi semuanya sendiri. Temukan dukungan yang tepat untuk memahami perasaanmu, satu langkah kecil setiap hari.
          </p>

          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl md:rounded-full p-2.5 flex flex-col sm:flex-row items-center shadow-xl gap-2"
          >
            <div className="flex items-center w-full px-3 py-1.5 text-left">
              <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-teal-800 uppercase tracking-wider">Temukan dukunganmu</span>
                <input
                  type="text"
                  placeholder="Cari psikolog, psikiater, atau keluhanmu..."
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 outline-none text-xs sm:text-sm font-medium"
                />
              </div>
            </div>
            <a 
              href="#dokter"
              className="w-full sm:w-auto bg-[#0b6e59] hover:bg-[#095a49] text-white px-6 py-3 rounded-xl sm:rounded-full transition flex items-center justify-center shrink-0 font-medium text-xs sm:text-sm shadow-sm"
            >
              <span>Cari Profesional</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-emerald-100 font-light">
            <span className="flex items-center space-x-1.5"><span>🔒</span> <span>Privasi terjaga</span></span>
            <span className="flex items-center space-x-1.5"><span>👤</span> <span>Pendekatan personal</span></span>
            <span className="flex items-center space-x-1.5"><span>🌐</span> <span>Dari mana saja</span></span>
          </div>
        </motion.div>
      </div>


      {/* ================= MOOD CHECKER INTERAKTIF ================= */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-20 max-w-5xl mx-auto px-4 -mt-12 sm:-mt-14 mb-16"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xs">
            <h3 className="font-serif font-bold text-slate-800 text-base sm:text-lg mb-1">
              Bagaimana Perasaanmu Hari Ini?
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Mengenali perasaan adalah awal yang baik. Pilih kondisi yang paling mewakili dirimu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {[
              { label: "Cemas", emoji: "❓" },
              { label: "Sedih", emoji: "😔" },
              { label: "Burnout", emoji: "💻" }
            ].map((item) => {
              const isSelected = selectedMood === item.label;
              return (
                <motion.div 
                  key={item.label}
                  whileHover={{ scale: 1.03 }} 
                  whileTap={{ scale: 0.97 }} 
                  onClick={() => setSelectedMood(item.label)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-2xl cursor-pointer transition shadow-sm ${
                    isSelected 
                      ? "border-2 border-teal-700 bg-teal-50/50" 
                      : "border border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span className={`text-xs font-semibold ${isSelected ? "text-teal-900" : "text-gray-700"}`}>
                    {item.label}
                  </span>
                  {isSelected && <span className="text-teal-700 text-xs font-bold">✓</span>}
                </motion.div>
              );
            })}

            <a 
              href="#tes-mandiri"
              className="flex items-center space-x-1 text-xs font-semibold text-teal-800 hover:underline ml-auto md:ml-2 cursor-pointer"
            >
              <span>Mulai tes singkat</span>
              <span className="text-[10px]">± 3 menit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.section>


      {/* ================= LAYANAN KAMI ================= */}
      <section id="layanan" className="py-8 px-4 sm:px-6 max-w-6xl mx-auto mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            DUKUNGAN UNTUK SETIAP LANGKAH
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2 mb-2">
            Perawatan yang berpusat padamu.
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm max-w-xl">
            Dari mengenali perasaan hingga menemukan bantuan, pilih langkah yang paling nyaman untukmu.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: <Video className="w-5 h-5" />,
              title: "Konsultasi Online",
              desc: "Ruang bercerita yang nyaman bersama psikolog dan psikiater pilihanmu.",
              linkText: "Temukan profesional",
              href: "#dokter"
            },
            {
              icon: <ClipboardCheck className="w-5 h-5" />,
              title: "Tes Skrining",
              desc: "Kenali kondisi emosionalmu melalui asesmen awal yang mudah dipahami.",
              linkText: "Kenali dirimu",
              isModalTrigger: true,
            },
            {
              icon: <Heart className="w-5 h-5" />,
              title: "Terapi Berkelanjutan",
              desc: "Bangun kebiasaan sehat dengan rencana pendampingan yang personal.",
              linkText: "Lihat pendekatan terapi",
              href: "#layanan"
            },
            {
              icon: <Pill className="w-5 h-5" />,
              title: "Resep & Obat",
              desc: "Dukungan pengobatan sesuai evaluasi dan resep dari psikiater.",
              linkText: "Pelajari alurnya",
              href: "#layanan"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-6 bg-white rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-800 mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>
              {item.isModalTrigger ? (
                <a 
                  href="#tes-mandiri"
                  className="inline-flex items-center justify-between text-xs font-semibold text-teal-800 hover:text-teal-900 pt-3 border-t border-gray-100 group w-full text-left cursor-pointer"
                >
                  <span>{item.linkText}</span>
                  <ArrowRight className="w-4 h-4 -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </a>
              ) : (
                <a href={item.href || "#"} className="inline-flex items-center justify-between text-xs font-semibold text-teal-800 hover:text-teal-900 pt-3 border-t border-gray-100 group">
                  <span>{item.linkText}</span>
                  <ArrowRight className="w-4 h-4 -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </section>


      {/* ================= 4. TES MANDIRI 10 PERTANYAAN (TANPA LOGIN) ================= */}
      <section id="tes-mandiri" className="py-12 bg-teal-900 text-white px-4 sm:px-6 my-12">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            ASESMEN AWAL 10 PERTANYAAN TANPA LOGIN
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mt-2 mb-3">
            Tes Mandiri Tingkat Stres & Kecemasan
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-lg mx-auto mb-8 font-light">
            Jawab 10 pertanyaan di bawah ini untuk memahami kondisi emosionalmu secara menyeluruh saat ini.
          </p>

          {!isTestActive && !testResult && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button 
                onClick={() => setIsTestActive(true)}
                className="inline-flex items-center space-x-2 bg-white text-teal-900 font-semibold px-8 py-3 rounded-full text-xs sm:text-sm shadow-lg hover:bg-emerald-50 transition cursor-pointer"
              >
                <span>Mulai Tes Sekarang (10 Soal)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {isTestActive && !testResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-gray-800 p-6 sm:p-8 rounded-3xl shadow-2xl text-left max-w-xl mx-auto"
            >
              <div className="flex justify-between items-center mb-4 text-xs text-teal-800 font-semibold">
                <span>Pertanyaan {currentQuestion + 1} dari {testQuestions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / testQuestions.length) * 100)}% Selesai</span>
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg mb-6 text-slate-900">
                {testQuestions[currentQuestion].question}
              </h3>
              <div className="space-y-3">
                {testQuestions[currentQuestion].options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswerSelect(opt.score)}
                    className="w-full text-left p-3.5 rounded-2xl border border-gray-200 hover:border-teal-700 hover:bg-teal-50/50 text-xs sm:text-sm font-medium transition flex items-center justify-between group cursor-pointer"
                  >
                    <span>{opt.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-700 transition" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {testResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-gray-800 p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-xl mx-auto"
            >
              <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                ✨
              </div>
              <h3 className="font-serif font-bold text-lg mb-2 text-slate-900">Hasil Asesmen Singkat</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
                {testResult}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={resetTest}
                  className="px-5 py-2.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  Ulangi Tes
                </button>
                <a 
                  href="#dokter"
                  className="px-5 py-2.5 rounded-full bg-[#0b6e59] text-white text-xs font-semibold hover:bg-[#095a49] transition text-center"
                >
                  Cari Profesional Pendamping
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </section>


      {/* ================= 5. CARI DOKTER (DARI FIREBASE REALTIME DATABASE) ================= */}
      <section id="dokter" className="py-14 bg-stone-50/80 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                TEMUKAN PARTNER PERJALANANMU (FIREBASE REALTIME DATA)
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2 mb-2">
                Profesional dari Firebase Realtime Database. Untukmu.
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm">
                Data disinkronkan secara langsung dari <code className="bg-gray-200 px-1.5 py-0.5 rounded text-teal-900 font-mono text-xs">Firebase Realtime</code> dengan kriteria role dokter.
              </p>
            </div>
            <button 
              onClick={() => { setSelectedSpecialization("Semua"); setSelectedPrice("Semua"); }}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-teal-800 bg-white px-4 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition shadow-sm w-fit cursor-pointer"
            >
              <span>Reset Filter</span>
            </button>
          </motion.div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 relative">
            <div className="relative">
              <div 
                onClick={() => { setShowSpecDropdown(!showSpecDropdown); setShowPriceDropdown(false); }}
                className="flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-700 bg-gray-50/50 cursor-pointer hover:border-teal-700 transition"
              >
                <div>
                  <span className="block text-[10px] text-gray-400">Specialization</span>
                  <span className="font-medium text-slate-800">{selectedSpecialization === "Semua" ? "Semua spesialisasi" : selectedSpecialization}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSpecDropdown ? "rotate-180" : ""}`} />
              </div>

              {showSpecDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1">
                  {["Semua", "Kecemasan", "Mood & Stres", "Burnout"].map((spec) => (
                    <div 
                      key={spec}
                      onClick={() => { setSelectedSpecialization(spec); setShowSpecDropdown(false); }}
                      className="px-3 py-2 text-xs hover:bg-teal-50 text-gray-700 cursor-pointer transition"
                    >
                      {spec === "Semua" ? "Semua spesialisasi" : spec}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <div 
                onClick={() => { setShowPriceDropdown(!showPriceDropdown); setShowSpecDropdown(false); }}
                className="flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-700 bg-gray-50/50 cursor-pointer hover:border-teal-700 transition"
              >
                <div>
                  <span className="block text-[10px] text-gray-400">Price Range</span>
                  <span className="font-medium text-slate-800">
                    {selectedPrice === "Semua" ? "Semua rentang harga" : selectedPrice === "Under 200k" ? "Di bawah Rp200.000" : "Di atas Rp200.000"}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showPriceDropdown ? "rotate-180" : ""}`} />
              </div>

              {showPriceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1">
                  {[
                    { label: "Semua rentang harga", val: "Semua" },
                    { label: "Di bawah Rp200.000", val: "Under 200k" },
                    { label: "Di atas Rp200.000", val: "Above 200k" },
                  ].map((item) => (
                    <div 
                      key={item.val}
                      onClick={() => { setSelectedPrice(item.val); setShowPriceDropdown(false); }}
                      className="px-3 py-2 text-xs hover:bg-teal-50 text-gray-700 cursor-pointer transition"
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loadingDoctors ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-teal-800 animate-spin mb-3" />
              <p className="text-xs text-gray-500">Memuat data dari Firebase Realtime Database...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 text-xs">Tidak ada profesional yang sesuai dengan filter yang dipilih.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredDoctors.map((doc, idx) => (
                <motion.div
                  key={doc.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition flex flex-col"
                >
                  <div className="relative h-48 bg-stone-200 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      src={doc.img || "https://images.unsplash.com/photo-1594824813575-f938d8794c48?q=80&w=500"}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-teal-800 shadow-sm">
                      ✓ Firebase Verified
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base mb-0.5">{doc.name}</h3>
                      <p className="text-xs text-gray-500 mb-3">{doc.role}</p>
                      
                      <div className="flex items-center space-x-1.5 text-xs text-amber-500 font-semibold mb-3">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{doc.rating || "4.8"}</span>
                        <span className="text-gray-400 font-normal">Rating Firebase</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {(doc.tags || ["Kecemasan"]).map((tag: string, tIdx: number) => (
                          <span key={tIdx} className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg text-[11px] font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] text-gray-400">Mulai dari / sesi</span>
                        <span className="font-bold text-slate-900 text-sm">{doc.price || "Rp150.000"}</span>
                      </div>
                      <Link href="/login" className="bg-[#0b6e59] hover:bg-[#095a49] text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm">
                        Buat Janji
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* ================= EKOSISTEM PASIEN, DOKTER, ADMIN ================= */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            SATU EKOSISTEM, SALING TERHUBUNG
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2 mb-2">
            Pendampingan yang terasa menyatu.
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm max-w-xl mx-auto">
            Pasien, Dokter, dan Admin terhubung dalam satu ruang—agar perhatian tetap tertuju pada proses pemulihan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-stone-50/50 p-6 sm:p-8 rounded-3xl border border-gray-200/60">
          <div className="lg:col-span-4 space-y-6">
            <div className="flex bg-gray-200/70 p-1.5 rounded-2xl">
              {(["pasien", "dokter", "admin"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl capitalize transition relative cursor-pointer ${
                    activeTab === tab ? "text-white" : "text-gray-600 hover:text-slate-900"
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-[#0b6e59] rounded-xl -z-10 shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {tab}
                </button>
              ))}
            </div>

            <div>
              <h3 className="font-serif font-bold text-slate-900 text-xl mb-3">
                {activeTab === "pasien" && "Perjalananmu, dalam satu ruang personal."}
                {activeTab === "dokter" && "Kelola catatan klinis dan jadwal praktik pasien."}
                {activeTab === "admin" && "Pastikan kelancaran operasional dan keamanan ekosistem."}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                {activeTab === "pasien" && "Pantau mood, kelola jadwal, dan simpan refleksimu dengan antarmuka yang ramah dan menenangkan."}
                {activeTab === "dokter" && "Akses riwayat sesi pasien secara aman, susun rencana terapi, dan berikan resep digital."}
                {activeTab === "admin" && "Verifikasi akun profesional, pantau kapasitas sistem, dan pastikan kepatuhan privasi data."}
              </p>

              <ul className="space-y-3 text-xs text-gray-700 font-medium">
                <li className="flex items-center space-x-2">
                  <span className="text-teal-800 font-bold">✓</span>
                  <span>{activeTab === "pasien" ? "Jadwal sesi yang mudah dikelola" : activeTab === "dokter" ? "Dashboard rekam medis terintegrasi" : "Panel kontrol sistem terpusat"}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-teal-800 font-bold">✓</span>
                  <span>{activeTab === "pasien" ? "Jurnal mood untuk memahami pola" : activeTab === "dokter" ? "Manajemen ketersediaan waktu praktis" : "Manajemen verifikasi mitra instan"}</span>
                </li>
              </ul>
            </div>

            <p className="text-[10px] text-gray-400">Tampilan konseptual · Data contoh</p>
          </div>

          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600 font-bold">🌿</span>
                <span className="font-serif font-bold text-slate-800 capitalize">Calma ({activeTab})</span>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-semibold">
                PRATINJAU DEMO
              </span>
            </div>

            {activeTab === "pasien" && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Selamat pagi, Alya ☀️</h4>
                    <p className="text-[11px] text-gray-400">Setiap langkah kecil memiliki arti.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 border rounded-xl bg-white">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Sesi bulan ini</span>
                    <span className="font-bold text-slate-800 text-sm">3 sesi</span>
                  </div>
                  <div className="p-3 border rounded-xl bg-white">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Mood hari ini</span>
                    <span className="font-bold text-teal-800 text-xs flex items-center">💚 Lebih tenang</span>
                  </div>
                  <div className="p-3 border rounded-xl bg-white">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Jurnal harian</span>
                    <span className="font-bold text-slate-800 text-sm">7 hari</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "dokter" && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Dr. Nadia Putri, M.Psi. 🩺</h4>
                    <p className="text-[11px] text-gray-400">4 Sesi konsultasi terjadwal hari ini.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 border rounded-xl bg-white">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Pasien Aktif</span>
                    <span className="font-bold text-slate-800 text-sm">24 orang</span>
                  </div>
                  <div className="p-3 border rounded-xl bg-white">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Sesi Hari Ini</span>
                    <span className="font-bold text-teal-800 text-xs">4 Sesi</span>
                  </div>
                  <div className="p-3 border rounded-xl bg-white">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Catatan Selesai</span>
                    <span className="font-bold text-slate-800 text-sm">100%</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "admin" && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Panel Kontrol Admin ⚙️</h4>
                    <p className="text-[11px] text-gray-400">Semua sistem operasional berjalan normal.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 border rounded-xl bg-white">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Total Pengguna</span>
                    <span className="font-bold text-slate-800 text-sm">12.450</span>
                  </div>
                  <div className="p-3 border rounded-xl bg-white">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Mitra Dokter</span>
                    <span className="font-bold text-teal-800 text-xs">210 Aktif</span>
                  </div>
                  <div className="p-3 border rounded-xl bg-white">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Status Sistem</span>
                    <span className="font-bold text-emerald-700 text-xs">Aman & Stabil</span>
                  </div>
                </div>
              </>
            )}

            <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="bg-[#0b6e59] text-white p-2 rounded-lg text-center font-bold leading-none">
                  <span className="text-[9px] block uppercase">Okt</span>
                  <span className="text-sm">08</span>
                </div>
                <div>
                  <h5 className="font-bold text-slate-800">Sesi bersama Nadia Putri</h5>
                  <p className="text-[11px] text-gray-500">Kamis, 10.00-11.00 · Konsultasi video</p>
                </div>
              </div>
              <Link href="/login" className="bg-[#0b6e59] text-white px-3 py-1.5 rounded-lg font-medium text-[11px] hover:bg-[#095a49] transition">
                Lihat sesi
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ================= STATISTIK HIJAU ================= */}
      <section className="bg-[#114b3e] text-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="text-center md:text-left">
            <span className="text-[11px] font-semibold tracking-wider text-emerald-300 uppercase block mb-1">
              LANGKAH KECIL. MAKNA YANG BESAR.
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold">50.000+ Sesi</h3>
            <p className="text-xs text-emerald-100 mt-1">Ruang untuk didengar dan dipahami</p>
          </div>
          <div className="border-t md:border-t-0 md:border-l border-emerald-800/80 pt-6 md:pt-0 md:pl-12 text-center md:text-left">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold">200+ Dokter</h3>
            <p className="text-xs text-emerald-100 mt-1">Gambaran jejaring profesional</p>
          </div>
          <div className="border-t md:border-t-0 md:border-l border-emerald-800/80 pt-6 md:pt-0 md:pl-12 text-center md:text-left">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold">100% Privasi</h3>
            <p className="text-xs text-emerald-100 mt-1">Prinsip desain yang mengutamakan privasi</p>
          </div>
        </div>
      </section>


      {/* ================= TESTIMONI ================= */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              SETIAP PERJALANAN PUNYA CERITA
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2 mb-2">
              Tak sendiri dalam perjalanan ini.
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={prevTestimonial} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button onClick={nextTestimonial} className="w-10 h-10 rounded-full bg-teal-800 text-white flex items-center justify-center hover:bg-teal-900 transition cursor-pointer">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="p-8 bg-stone-50/70 rounded-3xl border border-gray-200 flex flex-col md:flex-row items-center gap-8 mb-8 shadow-sm"
          >
            <div className="w-24 h-24 rounded-full bg-stone-300 overflow-hidden shrink-0">
              <img
                src={`https://images.unsplash.com/photo-${1500000000000 + currentTestimonial * 12345}?q=80&w=200`}
                alt={testimonials[currentTestimonial].name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <p className="text-sm md:text-base text-gray-700 leading-relaxed italic mb-4">
                "{testimonials[currentTestimonial].quote}"
              </p>
              <h4 className="font-bold text-sm text-slate-900">{testimonials[currentTestimonial].name}</h4>
              <p className="text-xs text-gray-400">{testimonials[currentTestimonial].desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>


      {/* ================= FOOTER ================= */}
      <footer className="bg-[#0f4236] text-white pt-12 pb-8 px-4 sm:px-6 text-xs border-t border-emerald-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold text-lg">🌿</span>
              <span className="font-serif font-bold text-xl text-white">Calma</span>
            </div>
            <p className="text-emerald-100 text-xs max-w-sm leading-relaxed font-light">
              Ruang untuk didengar, dipahami, dan bertumbuh. Ketenangan dimulai dari satu langkah kecil.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Jelajahi</h4>
            <ul className="space-y-2 text-emerald-100 font-light text-xs">
              <li><a href="#beranda" className="hover:text-white">Beranda</a></li>
              <li><a href="#layanan" className="hover:text-white">Layanan</a></li>
              <li><a href="#tes-mandiri" className="hover:text-white">Tes Mandiri</a></li>
              <li><a href="#dokter" className="hover:text-white">Cari Dokter</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-6 border-t border-emerald-800/80 text-emerald-200/70 text-[10px] text-center">
          <p>© 2026 Calma · Terintegrasi dengan Firebase Realtime Backend.</p>
        </div>
      </footer>

    </div>
  );
}