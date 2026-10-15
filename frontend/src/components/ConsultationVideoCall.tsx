"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
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
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export default function ConsultationVideoCall({
  consultationId,
  role,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const startedRef = useRef(false);
  const remoteDescriptionReadyRef = useRef(false);

  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const unsubscribersRef = useRef<Array<() => void>>([]);

  const [status, setStatus] = useState("Belum terhubung");
  const [isStarted, setIsStarted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [error, setError] = useState("");

  const roomId = consultationId.trim();

  const roomRef = useCallback(() => {
    return ref(realtimeDb, `calls/${roomId}`);
  }, [roomId]);

  const stopMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    localStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    unsubscribersRef.current.forEach((unsubscribe) => {
      unsubscribe();
    });

    unsubscribersRef.current = [];

    peerRef.current?.close();
    peerRef.current = null;

    stopMedia();

    pendingCandidatesRef.current = [];
    remoteDescriptionReadyRef.current = false;
    startedRef.current = false;

    setIsStarted(false);
  }, [stopMedia]);

  const addPendingCandidates = useCallback(async () => {
    const peer = peerRef.current;

    if (!peer?.remoteDescription) {
      return;
    }

    remoteDescriptionReadyRef.current = true;

    const candidates = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of candidates) {
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

    if (startedRef.current) {
      return;
    }

    startedRef.current = true;
    setError("");
    setStatus("Meminta akses kamera dan mikrofon...");

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = new RTCPeerConnection(rtcConfiguration);
      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.ontrack = (event) => {
        const remoteStream = event.streams[0];

        if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        setStatus("Terhubung dengan lawan bicara");
      };

      peer.onconnectionstatechange = () => {
        const connectionState = peer.connectionState;

        if (connectionState === "connected") {
          setStatus("Panggilan terhubung");
        } else if (connectionState === "connecting") {
          setStatus("Menghubungkan...");
        } else if (connectionState === "disconnected") {
          setStatus("Koneksi terputus sementara");
        } else if (connectionState === "failed") {
          setStatus(
            "Koneksi gagal. Jaringan mungkin membutuhkan server TURN."
          );
        } else if (connectionState === "closed") {
          setStatus("Panggilan berakhir");
        }
      };

      const callRef = roomRef();
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

      peer.onicecandidate = async (event) => {
        if (event.candidate) {
          await push(ownCandidatesRef, event.candidate.toJSON());
        }
      };

      const candidateUnsubscribe = onValue(
        otherCandidatesRef,
        async (snapshot) => {
          const candidates = snapshot.val();

          if (!candidates) {
            return;
          }

          for (const candidate of Object.values(
            candidates
          ) as RTCIceCandidateInit[]) {
            const peerConnection = peerRef.current;

            if (!peerConnection) {
              return;
            }

            try {
              if (
                remoteDescriptionReadyRef.current &&
                peerConnection.remoteDescription
              ) {
                await peerConnection.addIceCandidate(
                  new RTCIceCandidate(candidate)
                );
              } else {
                pendingCandidatesRef.current.push(candidate);
              }
            } catch (err) {
              console.error(
                "Gagal memproses ICE candidate:",
                err
              );
            }
          }
        }
      );

      unsubscribersRef.current.push(candidateUnsubscribe);

      if (role === "doctor") {
        setStatus("Membuat ruang panggilan...");

        // Bersihkan sinyal lama untuk ruang ini.
        await remove(ref(realtimeDb, `calls/${roomId}`));

        // Hapus listener kandidat lama dan pasang kembali.
        // Peer tetap digunakan untuk koneksi yang baru.
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

            if (
              !answer ||
              !peerRef.current ||
              peerRef.current.remoteDescription
            ) {
              return;
            }

            try {
              await peerRef.current.setRemoteDescription(
                new RTCSessionDescription(answer)
              );

              await addPendingCandidates();
              setStatus("Jawaban diterima, menghubungkan...");
            } catch (err) {
              console.error("Gagal menerima jawaban:", err);
              setError("Gagal memproses jawaban panggilan.");
            }
          }
        );

        unsubscribersRef.current.push(answerUnsubscribe);
      } else {
        setStatus("Menunggu dokter memulai panggilan...");

        const offerUnsubscribe = onValue(
          ref(realtimeDb, `calls/${roomId}/offer`),
          async (snapshot) => {
            const offer =
              snapshot.val() as SignalDescription | null;

            if (
              !offer ||
              !peerRef.current ||
              peerRef.current.remoteDescription
            ) {
              return;
            }

            try {
              await peerRef.current.setRemoteDescription(
                new RTCSessionDescription(offer)
              );

              await addPendingCandidates();

              const answer = await peerRef.current.createAnswer();
              await peerRef.current.setLocalDescription(answer);

              await set(
                ref(realtimeDb, `calls/${roomId}/answer`),
                {
                  type: answer.type,
                  sdp: answer.sdp,
                } satisfies SignalDescription
              );

              setStatus("Mengirim jawaban panggilan...");
            } catch (err) {
              console.error("Gagal menjawab panggilan:", err);
              setError("Gagal menerima panggilan dari dokter.");
            }
          }
        );

        unsubscribersRef.current.push(offerUnsubscribe);
      }

      setIsStarted(true);
    } catch (err) {
      console.error("Gagal memulai video call:", err);

      const message =
        err instanceof Error ? err.message : "Kesalahan tidak diketahui";

      setError(
        `Tidak dapat memulai video call: ${message}. Pastikan izin kamera dan mikrofon diberikan.`
      );

      cleanup();
      setStatus("Gagal memulai panggilan");
    }
  }, [
    roomId,
    role,
    roomRef,
    addPendingCandidates,
    cleanup,
  ]);

  const endCall = useCallback(async () => {
    try {
      await set(
        ref(realtimeDb, `calls/${roomId}/status`),
        "ended"
      );
    } catch (err) {
      console.error("Gagal memperbarui status panggilan:", err);
    }

    cleanup();
    setStatus("Panggilan berakhir");
  }, [roomId, cleanup]);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const statusUnsubscribe = onValue(
      ref(realtimeDb, `calls/${roomId}/status`),
      (snapshot) => {
        if (
          snapshot.val() === "ended" &&
          startedRef.current
        ) {
          cleanup();
          setStatus("Panggilan diakhiri oleh salah satu pihak");
        }
      }
    );

    return () => {
      statusUnsubscribe();
      cleanup();
    };
  }, [roomId, cleanup]);

  const toggleCamera = () => {
    const track = localStreamRef.current
      ?.getVideoTracks()[0];

    if (!track) {
      return;
    }

    track.enabled = !track.enabled;
    setCameraEnabled(track.enabled);
  };

  const toggleMicrophone = () => {
    const track = localStreamRef.current
      ?.getAudioTracks()[0];

    if (!track) {
      return;
    }

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
            Kamera saya ({role === "doctor" ? "Dokter" : "Pasien"})
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
            {role === "doctor"
              ? "Mulai Panggilan"
              : "Gabung Panggilan"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={toggleCamera}
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              {cameraEnabled
                ? "Matikan Kamera"
                : "Aktifkan Kamera"}
            </button>

            <button
              type="button"
              onClick={toggleMicrophone}
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              {micEnabled
                ? "Matikan Mikrofon"
                : "Aktifkan Mikrofon"}
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