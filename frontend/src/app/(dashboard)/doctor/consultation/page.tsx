"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { realtimeChannel, removeRealtimeChannel, firebaseService } from "@/lib/firebase";
// Contoh ketika Dokter klik Panggil / Masuk Sesi
import { ref, update } from "firebase/database";
import { rtdb } from "@/lib/firebase";

const startCall = async (consultationId: string) => {
  const consultRef = ref(rtdb, `consultations/${consultationId}`);
  await update(consultRef, {
    status: "in_session", // Sinyal bahwa sesi aktif
    startedAt: Date.now()
  });
};

export default function DoctorLiveSessionPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter();
  
  // Unwrapping params safely for Next.js app router versions
  const resolvedParams = use(params instanceof Promise ? params : Promise.resolve(params));
  const consultationId = resolvedParams.id;
  const roomId = `ROOM-CLM-${consultationId}`;

  const [form, setForm] = useState({
    chief_complaint: "Mengeluhkan dada berdebar dan cemas berlebih saat malam hari.",
    diagnosis: "",
    treatment_notes: "",
    prescription: ""
  });
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    startDoctorWebRTC();
    return () => {
      cleanupWebRTC();
    };
  }, []);

  const startDoctorWebRTC = async () => {
    try {
      setErrorMsg(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      setStream(mediaStream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ],
      });
      peerConnectionRef.current = pc;

      mediaStream.getTracks().forEach((track) => pc.addTrack(track, mediaStream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.classList.remove("hidden");
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setIsConnected(true);
        } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          setIsConnected(false);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "ice-candidate",
            payload: { candidate: event.candidate, sender: "doctor" },
          });
        }
      };

      const channel = realtimeChannel(`consultation_${roomId}`);
      channelRef.current = channel;

      channel
        .on("broadcast", { event: "patient-ready" }, async () => {
          await sendOffer(pc, channel);
        })
        .on("broadcast", { event: "answer" }, async ({ payload }: { payload: any }) => {
          if (!peerConnectionRef.current) return;
          try {
            if (peerConnectionRef.current.signalingState !== "stable") {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
            }
          } catch (e) {
            console.error("[DOKTER] Error setting remote description (answer):", e);
          }
        })
        .on("broadcast", { event: "ice-candidate" }, async ({ payload }: { payload: any }) => {
          if (payload.sender !== "doctor" && payload.candidate && pc.remoteDescription) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch (e) {
              console.error("[DOKTER] Error adding ICE Candidate:", e);
            }
          }
        })
        .subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            await sendOffer(pc, channel);
          }
        });

    } catch (err) {
      console.error("Gagal inisialisasi media dokter:", err);
      setErrorMsg("Gagal mengakses kamera/mikrofon. Pastikan Anda telah memberikan izin pada browser.");
    }
  };

  const sendOffer = async (pc: RTCPeerConnection, channel: any) => {
    try {
      if (pc.signalingState === "closed") return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      channel.send({
        type: "broadcast",
        event: "offer",
        payload: { offer, sender: "doctor" },
      });
    } catch (err) {
      console.error("Gagal membuat Offer:", err);
    }
  };

  // Auto-retry offer jika belum terhubung
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        peerConnectionRef.current &&
        peerConnectionRef.current.connectionState !== "connected" &&
        channelRef.current
      ) {
        sendOffer(peerConnectionRef.current, channelRef.current);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
    setIsConnected(false);
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

  const handleSaveMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await firebaseService.completeConsultation(consultationId, {
        diagnosis: form.diagnosis,
        treatment_notes: form.treatment_notes,
        prescription: form.prescription
      });

      alert("Catatan Medis Berhasil Disimpan & Sesi Diakhiri!");
      cleanupWebRTC();
      router.push("/doctor/queue");
    } catch (err) {
      console.error("Gagal menyimpan rekam medis ke Firebase:", err);
      alert("Gagal menyimpan rekam medis ke database Firebase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 flex flex-col gap-6 font-sans text-slate-800">
      
      {/* Header Live Session */}
      <div className="bg-teal-900 text-white p-5 rounded-3xl flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="flex h-3 w-3 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          <div>
            <h1 className="font-bold text-base">Konsultasi Live — Sesi #{consultationId}</h1>
            <p className="text-xs text-teal-200">
              Pasien: Achmad Daniel {isConnected ? "• (Video Terhubung)" : "• (Menghubungkan...)"}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            cleanupWebRTC();
            router.push("/doctor/queue");
          }}
          className="bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
        >
          <PhoneOff className="w-3.5 h-3.5" /> Keluar Sesi
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stream Video & Informasi Pasien */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-slate-950 rounded-3xl aspect-video relative overflow-hidden shadow-xl flex items-center justify-center border border-slate-800">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover hidden" />
            
            {!isConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-950/80 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-2" />
                <p className="text-xs">Menghubungkan video call dengan pasien...</p>
              </div>
            )}

            {/* Inset Kamera Dokter */}
            <div className="absolute bottom-4 right-4 w-36 h-28 bg-slate-900 border-2 border-teal-500 rounded-2xl overflow-hidden shadow-2xl z-20">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
              <span className="absolute bottom-1.5 left-2 text-[9px] bg-slate-900/80 text-teal-300 px-1.5 py-0.5 rounded font-bold">Anda (Dokter)</span>
            </div>

            {/* Kontrol Audio/Video Dokter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl z-30 border border-white/10">
              <button onClick={toggleMic} className={`p-2.5 rounded-xl text-white transition-colors ${isMicOn ? "bg-white/20 hover:bg-white/30" : "bg-rose-500"}`}>
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button onClick={toggleVideo} className={`p-2.5 rounded-xl text-white transition-colors ${isVideoOn ? "bg-white/20 hover:bg-white/30" : "bg-rose-500"}`}>
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Keluhan Utama & Riwayat Singkat</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 italic">
              "{form.chief_complaint}"
            </p>
          </div>
        </div>

        {/* Form Catatan Medis */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-teal-100/60 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" /> Formulir Catatan Medis
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Catat diagnosis dan resep obat yang langsung tersimpan ke sistem.</p>
            </div>

            <form id="medical-form" onSubmit={handleSaveMedicalRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis / Ringkasan Konsultasi *</label>
                <textarea
                  required
                  rows={3}
                  className="w-full text-xs p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
                  placeholder="Masukkan diagnosis klinis atau evaluasi psikologis..."
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Penanganan & Saran</label>
                <textarea
                  rows={3}
                  className="w-full text-xs p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
                  placeholder="Latihan pernapasan, relaksasi otot, atau rencana sesi lanjutan..."
                  value={form.treatment_notes}
                  onChange={(e) => setForm({ ...form, treatment_notes: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resep Obat (Opsional)</label>
                <textarea
                  rows={3}
                  className="w-full text-xs p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-mono bg-slate-50/50"
                  placeholder="Nama Obat - Dosis - Aturan Pakai..."
                  value={form.prescription}
                  onChange={(e) => setForm({ ...form, prescription: e.target.value })}
                />
              </div>
            </form>
          </div>

          <button
            type="submit"
            form="medical-form"
            disabled={loading}
            className="w-full mt-6 bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 text-xs rounded-2xl shadow-lg shadow-teal-700/20 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan Rekam Medis...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Simpan Rekam Medis & Selesaikan Sesi
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}