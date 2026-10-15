"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onValue, ref } from "firebase/database";
import { realtimeDb } from "@/lib/firebase-video-call";

type Consultation = {
  id: string;
  doctorName?: string;
};

type Props = {
  consultations: Consultation[];
};

export default function PatientCallNotification({
  consultations,
}: Props) {
  const router = useRouter();

  const [incomingCall, setIncomingCall] =
    useState<Consultation | null>(null);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    for (const consultation of consultations) {
      const statusRef = ref(
        realtimeDb,
        `calls/${consultation.id}/status`
      );

      const unsubscribe = onValue(statusRef, (snapshot) => {
        const status = snapshot.val();

        if (status === "ringing") {
          setIncomingCall(consultation);
        } else {
          setIncomingCall((current) =>
            current?.id === consultation.id ? null : current
          );
        }
      });

      unsubscribers.push(unsubscribe);
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [consultations]);

  if (!incomingCall) {
    return null;
  }

  const answerCall = () => {
    router.push(
      `/patient/consultation/${encodeURIComponent(incomingCall.id)}`
    );
  };

  const dismissNotification = () => {
    setIncomingCall(null);
  };

  return (
    <div className="fixed inset-x-4 top-4 z-[100] mx-auto max-w-lg">
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-2xl border border-teal-200 bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-2xl">
            📞
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900">
              Panggilan Konsultasi Masuk
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {incomingCall.doctorName
                ? `Dr. ${incomingCall.doctorName}`
                : "Dokter kamu"}{" "}
              sedang mengundang kamu untuk memulai konsultasi.
            </p>

            <p className="mt-2 text-xs text-slate-500">
              ID konsultasi: {incomingCall.id}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={answerCall}
                className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Angkat Panggilan
              </button>

              <button
                type="button"
                onClick={dismissNotification}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}