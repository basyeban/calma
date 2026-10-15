"use client";

import { useState, useRef, useEffect } from "react";
import {
  Video,
  MessageSquare,
  Star,
  CheckCircle2,
  Send,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  PhoneCall,
  Loader2,
  Sparkles,
  ArrowRight,
  Clock,
  QrCode,
  Building,
  ShieldCheck,
  ArrowLeft,
  UploadCloud,
  FileCheck,
  Image as ImageIcon
} from "lucide-react";
import { realtimeChannel, removeRealtimeChannel, firebaseService, listenIncomingCalls } from "@/lib/firebase";

export default function PatientConsultationPage() {
  const [activeTab, setActiveTab] = useState<"booking" | "payment" | "waiting" | "live">("booking");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Booking states
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [bookedDoctor, setBookedDoctor] = useState<any>(null);
  const [consultationId, setConsultationId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<"video" | "chat">("video");
  const [selectedDate, setSelectedDate] = useState("2026-10-15");
  const [selectedTime, setSelectedTime] = useState("09:00");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "bca">("qris");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Form Unggah Bukti Pembayaran State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Incoming Call State
  const [isIncomingCall, setIsIncomingCall] = useState(false);

  // WebRTC & Media States
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const [messages, setMessages] = useState([
    { id: 1, sender: "doctor", text: "Halo, selamat pagi. Bagaimana kabar dan perasaan kamu hari ini?", time: "10:01" },
    { id: 2, sender: "patient", text: "Pagi Dok. Hari ini merasa sedikit lebih tenang.", time: "10:02" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const availableTimeSlots = ["09:00", "10:30", "14:00", "15:30"];

  // Fetch daftar dokter dari Firebase Realtime Database
  useEffect(() => {
    async function fetchDoctorsAndBookings() {
      try {
        setLoadingDoctors(true);
        const doctorsData = await firebaseService.getDoctors();

        if (!doctorsData || doctorsData.length === 0) {
          const fallback = [
            { 
              id: 6, 
              name: "Dr. Danuar Ilham, Sp.KJ", 
              title: "Psikiatri Dewasa & Adiksi", 
              priceNum: 250000,
              price: "Rp 250.000", 
              avatar: "DI",
              bookedTimes: ["10:30"] 
            },
            { 
              id: 9, 
              name: "dr. vicky, SP.KJ", 
              title: "Psikiatri Anak & Remaja", 
              priceNum: 250000,
              price: "Rp 250.000", 
              avatar: "VK",
              bookedTimes: ["14:00"] 
            }
          ];
          setDoctors(fallback);
          setSelectedDoctor(fallback[0]);
        } else {
          const formatted = doctorsData.map((doc: any) => ({
            id: doc.id,
            name: doc.full_name || doc.name || "Dokter Spesialis",
            title: doc.title || "Spesialis Kesehatan Jiwa & Psikiatri",
            priceNum: doc.priceNum || 250000,
            price: doc.price || "Rp 250.000",
            avatar: doc.avatar || (doc.full_name ? doc.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "DR"),
            bookedTimes: doc.bookedTimes || ["10:30"]
          }));

          setDoctors(formatted);
          setSelectedDoctor(formatted[0]);
        }
      } catch (err) {
        console.error("Gagal mengambil data dokter dari Firebase:", err);
      } finally {
        setLoadingDoctors(false);
      }
    }

    fetchDoctorsAndBookings();
  }, []);

  const isTimeSlotBooked = (doctor: any, time: string) => {
    if (!doctor || !doctor.bookedTimes) return false;
    return doctor.bookedTimes.includes(time);
  };

  const isCurrentSelectionBooked = isTimeSlotBooked(selectedDoctor, selectedTime);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  // SYSTEM NOTIFIKASI PANGGILAN REAL-TIME PASIEN
  useEffect(() => {
    if (activeTab === "waiting") {
      const activeId = consultationId || Number(localStorage.getItem("active_consultation_id")) || 4029;
      const roomId = `ROOM-CLM-${activeId}`;

      const unsubscribeIncoming = listenIncomingCalls(activeId, (data) => {
        setIsIncomingCall(true);
      });

      const channel = realtimeChannel(`consultation_${roomId}`);
      channelRef.current = channel;

      channel
        .on("broadcast", { event: "doctor-calling" }, (payload) => {
          setIsIncomingCall(true);
        })
        .subscribe();

      const globalChannel = realtimeChannel("global_consultation_calls");
      globalChannel
        .on("broadcast", { event: "doctor-calling" }, (payload) => {
          setIsIncomingCall(true);
        })
        .subscribe();

      return () => {
        unsubscribeIncoming();
        removeRealtimeChannel(channel);
        removeRealtimeChannel(globalChannel);
      };
    }
  }, [activeTab, consultationId]);

  // Inisialisasi WebRTC Pasien saat Masuk Tab Live
  useEffect(() => {
    if (activeTab === "live") {
      startWebRTCAndMedia();
      const timer = setInterval(() => setSeconds((p) => p + 1), 1000);
      return () => {
        clearInterval(timer);
        cleanupWebRTC();
      };
    }
  }, [activeTab]);

  const startWebRTCAndMedia = async () => {
    try {
      setErrorMsg(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (localVideoRef.current) localVideoRef.current.srcObject = mediaStream;

      const activeId = consultationId || Number(localStorage.getItem("active_consultation_id")) || 4029;
      const roomId = `ROOM-CLM-${activeId}`;
      
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = pc;

      mediaStream.getTracks().forEach((track) => pc.addTrack(track, mediaStream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.classList.remove("hidden");
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          channelRef.current?.send({
            type: "broadcast",
            event: "ice-candidate",
            payload: { candidate: event.candidate, sender: "patient" },
          });
        }
      };

      const channel = realtimeChannel(`consultation_${roomId}`);
      channelRef.current = channel;

      channel
        .on("broadcast", { event: "offer" }, async ({ payload }) => {
          if (!peerConnectionRef.current) return;
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          channel.send({
            type: "broadcast",
            event: "answer",
            payload: { answer, sender: "patient" },
          });
        })
        .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
          if (payload.sender !== "patient" && payload.candidate && pc.remoteDescription) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch (e) {
              console.error("[PASIEN] Error Candidate:", e);
            }
          }
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            channel.send({
              type: "broadcast",
              event: "patient-ready",
              payload: { roomId },
            });
          }
        });

    } catch (err: any) {
      console.error("WebRTC Pasien Error:", err);
      setErrorMsg("Izin kamera atau mikrofon ditolak/tidak tersedia.");
    }
  };

  const cleanupWebRTC = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current.classList.add("hidden");
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (channelRef.current) {
      removeRealtimeChannel(channelRef.current);
      channelRef.current = null;
    }
    setIsIncomingCall(false);
  };

  const toggleVideo = () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoOn(track.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const track = stream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMicOn(track.enabled);
      }
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: "patient",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, newMsg]);
    setInputMessage("");
  };

  const handleProceedToPayment = () => {
    if (!selectedDoctor) {
      alert("Silakan pilih dokter terlebih dahulu.");
      return;
    }
    if (isCurrentSelectionBooked) {
      alert("Jadwal pada jam ini sudah terisi. Silakan pilih jam lain.");
      return;
    }
    setBookedDoctor(selectedDoctor);
    setActiveTab("payment");
  };

  // FUNGSI PENGIRIMAN PEMBAYARAN DENGAN PROTEKSI TIMEOUT 3 DETIK
  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !uploadPreview) {
      alert("Silakan unggah foto / screenshot bukti transfer terlebih dahulu.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const savePromise = (async () => {
        const consultData = await firebaseService.createConsultation({
          doctor_id: Number(bookedDoctor?.id || 6),
          consultation_time: selectedTime,
          consultation_date: selectedDate,
          status: "scheduled",
          patient_name: "Achmad Daniel"
        });

        const consultId = consultData?.id || Date.now();
        setConsultationId(consultId);
        localStorage.setItem("active_consultation_id", String(consultId));

        await firebaseService.createPayment({
          consultation_id: consultId,
          doctor_name: bookedDoctor?.name || "Dr. Danuar Ilham, Sp.KJ",
          amount: bookedDoctor?.priceNum || 250000,
          payment_method: paymentMethod.toUpperCase(),
          proof_url: uploadPreview || "https://placeholder.com/proof.jpg",
          status: "pending_verification"
        });
      })();

      // Race antara proses simpan database dengan timeout 3 detik
      await Promise.race([
        savePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout saving data")), 3000))
      ]);

    } catch (err: any) {
      console.warn("Gagal menyimpan ke Firebase (Timeout/Error), menggunakan fallback lokal:", err);
      const fallbackId = 4029;
      setConsultationId(fallbackId);
      localStorage.setItem("active_consultation_id", String(fallbackId));
    } finally {
      setIsProcessingPayment(false);
      setActiveTab("waiting");
    }
  };

  const handleAcceptCall = () => {
    setIsIncomingCall(false);
    setSeconds(0);
    setActiveTab("live");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 font-sans text-slate-800 bg-slate-50/50 min-h-screen relative">
      
      {/* Header Utama */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Layanan Profesional
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Konsultasi Kesehatan Mental</h1>
          <p className="text-xs text-slate-500 mt-0.5">Jadwalkan sesi, selesaikan pembayaran, dan tunggu panggilan video dari psikiater.</p>
        </div>

        {activeTab !== "payment" && activeTab !== "waiting" && (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab("booking")} 
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "booking" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              Jadwalkan Sesi
            </button>
            <button 
              onClick={() => {
                if (!bookedDoctor) {
                  alert("Anda belum menyelesaikan pembayaran atau konfirmasi jadwal.");
                  setActiveTab("booking");
                  return;
                }
                setActiveTab("waiting");
              }} 
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === "live" ? "bg-teal-700 text-white shadow-md shadow-teal-700/20" : "text-slate-600 hover:text-slate-900"}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Status Sesi
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: BOOKING */}
      {activeTab === "booking" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Pilih Psikiater / Dokter</h2>
            
            {loadingDoctors ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> Memuat daftar dokter...
              </div>
            ) : (
              doctors.map((doc) => (
                <div 
                  key={doc.id} 
                  onClick={() => {
                    setSelectedDoctor(doc);
                    const availableSlot = availableTimeSlots.find((t) => !isTimeSlotBooked(doc, t));
                    if (availableSlot) setSelectedTime(availableSlot);
                  }} 
                  className={`p-5 rounded-3xl border cursor-pointer transition-all bg-white flex items-center gap-4 ${
                    selectedDoctor?.id === doc.id 
                      ? "border-teal-500 ring-2 ring-teal-500/10 shadow-md" 
                      : "border-slate-100 hover:border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                    {doc.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{doc.name}</h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{doc.title}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg">
                        {doc.price} / Sesi
                      </span>
                      <span className="text-[11px] text-amber-500 font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9 (Review)
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detail Ringkasan Sesi</h2>

              {selectedDoctor && (
                <div className={`p-4 rounded-2xl border transition-all space-y-1.5 ${
                  isCurrentSelectionBooked ? "bg-amber-50/60 border-amber-200" : "bg-teal-50/50 border-teal-100"
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                      Dokter Pilihan
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isCurrentSelectionBooked ? "bg-amber-200 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {isCurrentSelectionBooked ? "Jam Ini Terisi" : "Tersedia"}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-slate-900">{selectedDoctor.name}</p>
                  <p className="text-xs text-slate-500">{selectedDoctor.title}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">Metode Konsultasi:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedType("video")}
                    className={`py-3 px-4 rounded-2xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                      selectedType === "video" ? "bg-teal-700 text-white border-teal-700 shadow" : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <Video className="w-4 h-4" /> Video Call
                  </button>
                  <button
                    onClick={() => setSelectedType("chat")}
                    className={`py-3 px-4 rounded-2xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                      selectedType === "chat" ? "bg-teal-700 text-white border-teal-700 shadow" : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" /> Live Chat
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">Pilih Jam Sesi:</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableTimeSlots.map((timeSlot) => {
                    const isBooked = isTimeSlotBooked(selectedDoctor, timeSlot);
                    const isSelected = selectedTime === timeSlot;

                    return (
                      <button
                        key={timeSlot}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(timeSlot)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          isBooked
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed line-through"
                            : isSelected
                            ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                            : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>{timeSlot} WIB</span>
                        {isBooked ? (
                          <span className="text-[9px] no-underline font-normal bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            Terisi
                          </span>
                        ) : isSelected ? (
                          <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded">Dipilih</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button 
              onClick={handleProceedToPayment} 
              disabled={isCurrentSelectionBooked}
              className={`w-full py-3.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                isCurrentSelectionBooked 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-700/20"
              }`}
            >
              {isCurrentSelectionBooked ? "Pilih Jam Yang Masih Kosong" : "Lanjutkan ke Pembayaran"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PEMBAYARAN */}
      {activeTab === "payment" && (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <button 
              onClick={() => setActiveTab("booking")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Jadwal
            </button>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-[11px] font-semibold border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Pembayaran Terverifikasi Admin
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Selesaikan Pembayaran & Unggah Bukti</h2>
            <p className="text-xs text-slate-500">Pilih metode pembayaran, lalu unggah resi/bukti transaksi langsung ke admin.</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Dokter Spesialis:</span>
              <span className="font-bold text-slate-800">{bookedDoctor?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Waktu Sesi:</span>
              <span className="font-bold text-slate-800">{selectedDate}, {selectedTime} WIB</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Metode Layanan:</span>
              <span className="font-bold text-slate-800 uppercase">{selectedType} Call</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-900">Total Tagihan Pembayaran:</span>
              <span className="text-lg font-extrabold text-teal-800">{bookedDoctor?.price}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 block">Pilih Metode Pembayaran:</label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setPaymentMethod("qris")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  paymentMethod === "qris" ? "border-teal-600 bg-teal-50/40 ring-2 ring-teal-600/10" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">QRIS (Instant)</p>
                  <p className="text-[10px] text-slate-500">Scan via GoPay, OVO, BCA, dll</p>
                </div>
              </div>

              <div 
                onClick={() => setPaymentMethod("bca")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  paymentMethod === "bca" ? "border-teal-600 bg-teal-50/40 ring-2 ring-teal-600/10" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Virtual Account BCA</p>
                  <p className="text-[10px] text-slate-500">Transfer otomatis via m-BCA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
            {paymentMethod === "qris" ? (
              <div className="space-y-4 text-center">
                <div className="max-w-xs mx-auto bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-md space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-rose-600 tracking-wider">QRIS</span>
                      <span className="text-[9px] text-slate-400 font-semibold">| Standar Nasional</span>
                    </div>
                    <div className="bg-rose-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded tracking-widest uppercase">
                      GPN
                    </div>
                  </div>

                  <div className="text-center space-y-0.5">
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">CALMA MENTAL HEALTH</h3>
                    <p className="text-[10px] text-slate-400 font-medium">NMID: ID1020261015099</p>
                  </div>

                  <div className="relative p-3 bg-white rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
                    <div className="relative w-44 h-44 bg-slate-900 rounded-xl p-2.5 flex flex-col justify-between items-center shadow-md">
                      <div className="w-full flex justify-between">
                        <div className="w-10 h-10 bg-white border-4 border-slate-900 rounded-sm flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-900 rounded-xs" />
                        </div>
                        <div className="w-10 h-10 bg-white border-4 border-slate-900 rounded-sm flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-900 rounded-xs" />
                        </div>
                      </div>

                      <div className="my-auto bg-white border-2 border-slate-900 rounded-lg px-2.5 py-1 text-[10px] font-black text-teal-800 tracking-wider shadow-sm z-10">
                        CALMA
                      </div>

                      <div className="w-full flex justify-between">
                        <div className="w-10 h-10 bg-white border-4 border-slate-900 rounded-sm flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-900 rounded-xs" />
                        </div>
                        <div className="w-7 h-7 bg-white rounded-sm grid grid-cols-2 gap-0.5 p-1">
                          <div className="bg-slate-900" />
                          <div className="bg-slate-900" />
                          <div className="bg-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 text-[10px] text-slate-400 font-medium">
                    Dicetak oleh: <span className="font-bold text-slate-700">PT Calma Indonesia Sejahtera</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Scan QRIS di atas menggunakan aplikasi perbankan atau e-Wallet Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Virtual Account BCA</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono tracking-wider">8801928301928301</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => alert("Nomor Virtual Account BCA Calma berhasil disalin!")}
                    className="px-3 py-1.5 bg-teal-700 text-white text-[11px] font-semibold rounded-lg hover:bg-teal-800 transition"
                  >
                    Salin
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lakukan transfer sebesar {bookedDoctor?.price} ke nomor Virtual Account di atas.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmitPaymentProof} className="p-6 bg-stone-50/80 rounded-2xl border border-stone-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-teal-700" /> Unggah Bukti Pembayaran Ke Admin
            </h3>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 block">Unggah Foto / Screenshot Resi Transfer *</label>
              <div className="relative border-2 border-dashed border-slate-300 hover:border-teal-600 bg-white rounded-2xl p-6 text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {uploadPreview ? (
                  <div className="flex items-center justify-center gap-3">
                    <img src={uploadPreview} alt="Preview Bukti" className="w-14 h-14 object-cover rounded-xl border border-slate-200" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> {selectedFile?.name || "Bukti_Pembayaran.jpg"}
                      </p>
                      <p className="text-[10px] text-teal-600 font-semibold">Klik untuk mengganti foto resi</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <ImageIcon className="w-7 h-7 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-700">Pilih atau Seret Foto Resi di Sini</p>
                    <p className="text-[10px] text-slate-400">Format JPG, PNG, atau JPEG (Maks. 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessingPayment}
              className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mengirim Bukti Pembayaran...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Kirim Bukti Pembayaran & Masuk Ruang Tunggu
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: RUANG TUNGGU */}
      {activeTab === "waiting" && (
        <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-xl text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-75" />
            <div className="w-20 h-20 bg-teal-700 text-white rounded-full flex items-center justify-center shadow-lg relative z-10">
              <PhoneCall className="w-8 h-8 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Menunggu Panggilan Dokter
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Bukti Pembayaran Berhasil Dikirim!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Tim admin sedang memverifikasi transaksi Anda. Silakan tetap berada di halaman ini. <br />
              <span className="font-semibold text-slate-800">{bookedDoctor?.name}</span> (SESI ID: #{consultationId || localStorage.getItem("active_consultation_id") || 4029}) akan segera menghubungi Anda melalui video call.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 max-w-sm mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Dokter:</span>
              <span className="font-bold text-slate-800">{bookedDoctor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Jadwal Sesi:</span>
              <span className="font-bold text-slate-800">{selectedDate}, {selectedTime} WIB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status Transaksi:</span>
              <span className="font-bold text-amber-600 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Verifikasi Admin
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POP-UP PANGGILAN MASUK */}
      {isIncomingCall && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center space-y-6 border border-slate-100">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full bg-teal-800 text-white font-bold text-xl flex items-center justify-center shadow-xl ring-4 ring-teal-100">
                {bookedDoctor?.avatar || "DR"}
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-rose-600 text-xs font-bold tracking-wider uppercase">
                <PhoneCall className="w-4 h-4 animate-bounce" /> Panggilan Video Masuk
              </div>
              <h3 className="text-lg font-bold text-slate-900">{bookedDoctor?.name || "Dr. Danuar Ilham, Sp.KJ"}</h3>
              <p className="text-xs text-slate-400">Psikiatri Dewasa & Adiksi</p>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              Dokter siap memulai sesi konsultasi video call bersama Anda.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsIncomingCall(false)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <PhoneOff className="w-4 h-4 text-rose-600" /> Tolak
              </button>
              <button
                onClick={handleAcceptCall}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 animate-pulse"
              >
                <PhoneCall className="w-4 h-4" /> Terima
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE SESSION */}
      {activeTab === "live" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium">
                {errorMsg}
              </div>
            )}
            <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video shadow-xl flex items-center justify-center border border-slate-800">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover hidden" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-2" />
                <p className="text-xs">Menunggu video dari <span className="text-white font-semibold">{bookedDoctor?.name}</span>...</p>
              </div>

              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-2xl flex items-center gap-3 z-20 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                  {bookedDoctor?.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">{bookedDoctor?.name}</p>
                  <p className="text-[10px] text-teal-400 mt-0.5">{bookedDoctor?.title}</p>
                </div>
              </div>

              <div className="absolute top-4 right-4 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full z-20 flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE • {formatTime(seconds)}
              </div>

              <div className="absolute bottom-20 right-5 w-40 h-28 bg-slate-900 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl z-20">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl z-30 border border-white/10">
                <button onClick={toggleMic} className={`p-2.5 rounded-xl text-white transition-colors ${isMicOn ? "bg-white/20 hover:bg-white/30" : "bg-rose-500"}`}>
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button onClick={toggleVideo} className={`p-2.5 rounded-xl text-white transition-colors ${isVideoOn ? "bg-white/20 hover:bg-white/30" : "bg-rose-500"}`}>
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => {
                    cleanupWebRTC();
                    setActiveTab("booking");
                  }} 
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <PhoneOff className="w-3.5 h-3.5" /> Akhiri Sesi
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                <MessageSquare className="w-4 h-4 text-teal-600" /> Chat dengan {bookedDoctor?.name}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 text-xs bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.sender === "patient" ? "items-end" : "items-start"}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] ${m.sender === "patient" ? "bg-teal-700 text-white rounded-br-xs" : "bg-white border border-slate-200 shadow-sm text-slate-800 rounded-bl-xs"}`}>
                    <p className="leading-relaxed">{m.text}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-1">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder={`Kirim pesan ke ${bookedDoctor?.name}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-slate-50 text-xs px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-600 transition-all"
              />
              <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}