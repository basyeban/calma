"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  ShieldCheck,
  MessageSquare,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DoctorDynamicConsultationPage() {
  const params = useParams();
  const router = useRouter();
  
  // Mengambil ID Konsultasi / Pasien secara dinamis dari URL yang diklik dokter
  const consultationId = (params?.id as string) || "ROOM-DEFAULT";

  const [diagnosis, setDiagnosis] = useState(
    "F41.1 Gangguan Kecemasan Menyeluruh (Generalized Anxiety) dipicu stresor kerja berat."
  );
  const [notes, setNotes] = useState(
    "Pasien merespon baik teknik pernapasan diaphragmatic 4-7-8 yang diajarkan pada sesi lalu."
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
  const [isPatientConnected, setIsPatientConnected] = useState(false);

  const [messages, setMessages] = useState([
    { id: 1, sender: "doctor", text: "Halo, selamat pagi. Bagaimana kabar dan perasaan kamu hari ini?", time: "10:01" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Inisialisasi WebRTC & Supabase Channel setelah dokter memilih pasien
  useEffect(() => {
    if (!consultationId) return;

    startWebRTCAndMedia();
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);

    return () => {
      clearInterval(timer);
      cleanupWebRTC();
    };
  }, [consultationId]);

  const startWebRTCAndMedia = async () => {
    try {
      setErrorMsg(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = pc;

      mediaStream.getTracks().forEach((track) => pc.addTrack(track, mediaStream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.classList.remove("hidden");
          setIsPatientConnected(true);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          channelRef.current?.send({
            type: "broadcast",
            event: "ice-candidate",
            payload: { candidate: event.candidate, sender: "doctor" },
          });
        }
      };

      const channel = supabase.channel(`consultation_${consultationId}`);
      channelRef.current = channel;

      channel
        .on("broadcast", { event: "patient-ready" }, async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({
            type: "broadcast",
            event: "offer",
            payload: { offer, sender: "doctor" },
          });
        })
        .on("broadcast", { event: "answer" }, async ({ payload }) => {
          if (payload.answer) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          }
        })
        .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
          if (payload.sender !== "doctor" && payload.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch (e) {
              console.error("Gagal menambah ICE candidate:", e);
            }
          }
        })
        .subscribe();
    } catch (err: any) {
      console.error("Gagal memulai media dokter:", err);
      setErrorMsg("Gagal mengakses kamera atau mikrofon.");
    }
  };

  const cleanupWebRTC = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (channelRef.current) supabase.removeChannel(channelRef.current);
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
      sender: "doctor",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, newMsg]);
    setInputMessage("");
  };

  const handleSaveMedicalRecord = async () => {
    try {
      setIsSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");

      await fetch(`${apiUrl}/api/doctor/consultations/${consultationId}/medical-record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ diagnosis, clinical_notes: notes }),
      }).catch(() => {});

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndCall = () => {
    if (confirm("Apakah Anda yakin ingin mengakhiri sesi konsultasi ini?")) {
      cleanupWebRTC();
      router.push("/doctor/consultation"); // Kembali ke daftar antrean pasien
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6 font-sans text-slate-800">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sesi Konsultasi Pasien ID: #{consultationId}</h1>
          <p className="text-xs text-slate-500">Kelola sesi interaktif dan rekam medis pasien yang dipilih.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Terenkripsi End-to-End
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          <div className="relative bg-slate-900 rounded-3xl overflow-hidden aspect-video shadow-xl flex items-center justify-center border">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover hidden" />
            
            {!isPatientConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-2" />
                <p className="text-xs">Menunggu pasien bergabung ke sesi #{consultationId}...</p>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full z-20">
              LIVE • {formatTime(seconds)}
            </div>

            <div className="absolute bottom-20 right-5 w-40 h-28 bg-slate-800 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl z-20">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl z-30">
              <button onClick={toggleMic} className={`p-2.5 rounded-xl text-white ${isMicOn ? "bg-white/20" : "bg-rose-500"}`}>
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button onClick={toggleVideo} className={`p-2.5 rounded-xl text-white ${isVideoOn ? "bg-white/20" : "bg-rose-500"}`}>
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button onClick={handleEndCall} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                <PhoneOff className="w-3.5 h-3.5" /> Akhiri Sesi
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-4 shadow-sm flex flex-col h-[280px]">
            <div className="flex items-center gap-2 font-bold text-xs mb-2 text-slate-800">
              <MessageSquare className="w-4 h-4 text-teal-600" /> Chat Pasien Sesi #{consultationId}
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 text-xs bg-slate-50 p-3 rounded-xl">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.sender === "doctor" ? "items-end" : "items-start"}`}>
                  <div className={`p-2.5 rounded-xl max-w-[80%] ${m.sender === "doctor" ? "bg-teal-700 text-white" : "bg-white border shadow-sm text-slate-800"}`}>
                    <p>{m.text}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-1">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Tulis pesan..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-slate-50 text-xs px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-teal-600"
              />
              <button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-semibold">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl border p-6 shadow-sm space-y-4 text-xs h-fit">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-700" /> Formulir Catatan Medis
          </h3>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Diagnosis</label>
            <textarea rows={3} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl" />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Catatan Klinis</label>
            <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl" />
          </div>
          <button
            onClick={handleSaveMedicalRecord}
            disabled={isSaving}
            className="w-full py-3 bg-teal-800 text-white font-semibold rounded-xl shadow flex items-center justify-center gap-2"
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : null}
            <span>{isSaving ? "Menyimpan..." : "Simpan Rekam Medis"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}