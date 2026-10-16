
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  onChildAdded,
  onValue,
  push,
  ref,
  remove,
  set,
} from "firebase/database";

import { realtimeDb } from "@/lib/firebase-video-call";

type Role = "doctor" | "patient";

type Props = {
  consultationId: string;
  role: Role;
};

type SignalDescription = {
  type: RTCSdpType;
  sdp?: string;
};

const rtcConfiguration: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export default function ConsultationVideoCall({
  consultationId,
  role,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startedRef = useRef(false);
  const pendingCandidatesRef =
    useRef<RTCIceCandidateInit[]>([]);

  const unsubscribersRef = useRef<Array<() => void>>([]);

  const [status, setStatus] = useState("Belum terhubung");
  const [isStarted, setIsStarted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [error, setError] = useState("");

  const roomId = consultationId.trim();

  const cleanup = useCallback(() => {
    unsubscribersRef.current.forEach((unsubscribe) => {
      unsubscribe();
    });
    unsubscribersRef.current = [];

    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    pendingCandidatesRef.current = [];
    startedRef.current = false;
    setIsStarted(false);
  }, []);

  const addPendingCandidates = useCallback(async () => {
    const peer = peerRef.current;

    if (!peer?.remoteDescription) return;

    const pending = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of pending) {
      try {
        await peer.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("Gagal menambahkan ICE candidate:", err);
      }
    }
  }, []);

  const startCall = useCallback(async () => {
    if (!roomId) {
      setError("ID konsultasi tidak ditemukan.");
      return;
    }

    if (startedRef.current) return;

    startedRef.current = true;
    setError("");
    setStatus("Menyiapkan kamera dan mikrofon...");

    try {
      // Hanya dokter yang membersihkan ruang lama.
      // Lakukan sebelum memasang listener atau membuat offer.
      if (role === "doctor") {
        await remove(ref(realtimeDb, `calls/${roomId}`));
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      streamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = new RTCPeerConnection(rtcConfiguration);
      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setStatus("Menerima media dari lawan bicara");
      };

      peer.onconnectionstatechange = () => {
        switch (peer.connectionState) {
          case "connected":
            setStatus("Panggilan terhubung");
            break;
          case "connecting":
            setStatus("Menghubungkan...");
            break;
          case "disconnected":
            setStatus("Koneksi terputus sementara");
            break;
          case "failed":
            setStatus(
              "Koneksi gagal. Periksa jaringan atau konfigurasi TURN."
            );
            break;
          case "closed":
            setStatus("Panggilan berakhir");
            break;
        }
      };

      const ownCandidatesRef = ref(
        realtimeDb,
        `calls/${roomId}/candidates/${role}`
      );

      const otherRole: Role =
        role === "doctor" ? "patient" : "doctor";

      const otherCandidatesRef = ref(
        realtimeDb,
        `calls/${roomId}/candidates/${otherRole}`
      );

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          void push(
            ownCandidatesRef,
            event.candidate.toJSON()
          ).catch((err) => {
            console.error("Gagal mengirim ICE candidate:", err);
          });
        }
      };

      // onChildAdded menangani kandidat satu per satu,
      // bukan memproses seluruh daftar berulang kali.
      const candidateUnsubscribe = onChildAdded(
        otherCandidatesRef,
        async (snapshot) => {
          const candidate =
            snapshot.val() as RTCIceCandidateInit | null;

          const currentPeer = peerRef.current;
          if (!candidate || !currentPeer) return;

          try {
            if (currentPeer.remoteDescription) {
              await currentPeer.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            } else {
              pendingCandidatesRef.current.push(candidate);
            }
          } catch (err) {
            console.error("Gagal memproses ICE candidate:", err);
          }
        }
      );

      unsubscribersRef.current.push(candidateUnsubscribe);

      // Mendengarkan panggilan berakhir dari pihak lain.
      const statusUnsubscribe = onValue(
        ref(realtimeDb, `calls/${roomId}/status`),
        (snapshot) => {
          if (
            snapshot.val() === "ended" &&
            startedRef.current
          ) {
            cleanup();
            setStatus("Panggilan diakhiri oleh pihak lain");
          }
        }
      );

      unsubscribersRef.current.push(statusUnsubscribe);

      if (role === "doctor") {
        setStatus("Memanggil pasien...");

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        await set(ref(realtimeDb, `calls/${roomId}/offer`), {
          type: offer.type,
          sdp: offer.sdp,
        } satisfies SignalDescription);

        const answerUnsubscribe = onValue(
          ref(realtimeDb, `calls/${roomId}/answer`),
          async (snapshot) => {
            const answer =
              snapshot.val() as SignalDescription | null;

            const currentPeer = peerRef.current;

            if (
              !answer ||
              !currentPeer ||
              currentPeer.remoteDescription
            ) {
              return;
            }

            try {
              await currentPeer.setRemoteDescription(
                new RTCSessionDescription(answer)
              );

              await addPendingCandidates();
              setStatus("Jawaban pasien diterima");
            } catch (err) {
              console.error("Gagal memproses jawaban:", err);
              setError("Gagal memproses jawaban dari pasien.");
            }
          }
        );

        unsubscribersRef.current.push(answerUnsubscribe);
      } else {
        setStatus("Menunggu offer dari dokter...");

        const offerUnsubscribe = onValue(
          ref(realtimeDb, `calls/${roomId}/offer`),
          async (snapshot) => {
            const offer =
              snapshot.val() as SignalDescription | null;

            const currentPeer = peerRef.current;

            if (
              !offer ||
              !currentPeer ||
              currentPeer.remoteDescription
            ) {
              return;
            }

            try {
              await currentPeer.setRemoteDescription(
                new RTCSessionDescription(offer)
              );

              await addPendingCandidates();

              const answer = await currentPeer.createAnswer();
              await currentPeer.setLocalDescription(answer);

              await set(
                ref(realtimeDb, `calls/${roomId}/answer`),
                {
                  type: answer.type,
                  sdp: answer.sdp,
                } satisfies SignalDescription
              );

              setStatus("Mengirim jawaban ke dokter...");
            } catch (err) {
              console.error("Gagal menjawab offer:", err);
              setError("Gagal menjawab panggilan dokter.");
            }
          }
        );

        unsubscribersRef.current.push(offerUnsubscribe);
      }

      setIsStarted(true);
    } catch (err) {
      console.error("Gagal memulai konsultasi:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengakses kamera atau mikrofon."
      );

      cleanup();
      setStatus("Gagal memulai panggilan");
    }
  }, [roomId, role, cleanup, addPendingCandidates]);

  const endCall = useCallback(async () => {
    try {
      await set(ref(realtimeDb, `calls/${roomId}/status`), "ended");
    } catch (err) {
      console.error("Gagal memperbarui status panggilan:", err);
    }

    cleanup();
    setStatus("Panggilan berakhir");
  }, [roomId, cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setCameraEnabled(track.enabled);
  };

  const toggleMicrophone = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setMicEnabled(track.enabled);
  };

  return (
    <section className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Konsultasi Video Calma
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            ID konsultasi: {roomId}
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
          {status}
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-slate-900">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full object-cover"
          />
          <p className="px-3 py-2 text-sm text-white">
            Anda ({role === "doctor" ? "Dokter" : "Pasien"})
          </p>
        </div>

        <div className="overflow-hidden rounded-xl bg-slate-900">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="aspect-video w-full object-cover"
          />
          <p className="px-3 py-2 text-sm text-white">
            Lawan bicara
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {!isStarted ? (
          <button
            type="button"
            onClick={startCall}
            className="rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
          >
            {role === "doctor" ? "Mulai Panggilan" : "Gabung Panggilan"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={toggleCamera}
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              {cameraEnabled ? "Matikan Kamera" : "Aktifkan Kamera"}
            </button>

            <button
              type="button"
              onClick={toggleMicrophone}
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              {micEnabled ? "Matikan Mikrofon" : "Aktifkan Mikrofon"}
            </button>

            <button
              type="button"
              onClick={endCall}
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              Akhiri Panggilan
            </button>
          </>
        )}
      </div>
    </section>
  );
}
