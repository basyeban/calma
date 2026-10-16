
"use client";

import { useEffect, useRef, useState } from "react";

interface VideoCallProps {
  onEnd?: () => void;
}

export default function VideoCall({ onEnd }: VideoCallProps) {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peer = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState("Belum terhubung");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    let active = true;

    async function initializeMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStream.current = stream;

        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }

        peer.current = new RTCPeerConnection({
          iceServers: [
            {
              urls: "stun:stun.l.google.com:19302",
            },
          ],
        });

        stream.getTracks().forEach((track) => {
          peer.current?.addTrack(track, stream);
        });

        peer.current.ontrack = (event) => {
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = event.streams[0];
          }
        };

        peer.current.onconnectionstatechange = () => {
          const connection = peer.current?.connectionState;

          if (connection === "connected") {
            setStatus("Terhubung");
          } else if (connection === "failed") {
            setStatus("Koneksi gagal");
          } else if (connection === "disconnected") {
            setStatus("Koneksi terputus");
          }
        };

        setStatus("Kamera aktif, menunggu pasangan");
      } catch (error) {
        console.error("Gagal mengakses kamera:", error);
        setStatus(
          "Kamera atau mikrofon tidak dapat diakses"
        );
      }
    }

    void initializeMedia();

    return () => {
      active = false;
      peer.current?.close();
      localStream.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  function toggleCamera() {
    const track = localStream.current
      ?.getVideoTracks()[0];

    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  }

  function toggleMic() {
    const track = localStream.current
      ?.getAudioTracks()[0];

    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }

  function endCall() {
    peer.current?.close();
    peer.current = null;

    localStream.current?.getTracks().forEach((track) => {
      track.stop();
    });

    localStream.current = null;

    if (localVideo.current) {
      localVideo.current.srcObject = null;
    }

    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }

    setStatus("Panggilan berakhir");
    onEnd?.();
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-gray-600">
        Status: {status}
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 font-semibold">
            Anda
          </p>
          <video
            ref={localVideo}
            autoPlay
            muted
            playsInline
            className="w-full rounded-xl bg-black aspect-video"
          />
        </div>

        <div>
          <p className="mb-2 font-semibold">
            Lawan bicara
          </p>
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            className="w-full rounded-xl bg-black aspect-video"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={toggleCamera}
          className="rounded-lg bg-gray-200 px-4 py-2"
        >
          {cameraOn ? "Matikan Kamera" : "Nyalakan Kamera"}
        </button>

        <button
          onClick={toggleMic}
          className="rounded-lg bg-gray-200 px-4 py-2"
        >
          {micOn ? "Matikan Mic" : "Nyalakan Mic"}
        </button>

        <button
          onClick={endCall}
          className="rounded-lg bg-red-600 px-4 py-2 text-white"
        >
          Akhiri Panggilan
        </button>
      </div>
    </section>
  );
}
