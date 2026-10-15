"use client";

import { useEffect, useState } from "react";

interface Consultation {
  id: string;
  code: string;
  patient_id: string;
  scheduled_at: string;
  status: string;
  price: number;
}

export default function DoctorQueuePage() {
  const [queue, setQueue] = useState<Consultation[]>([]);

  useEffect(() => {
    // Panggil API FastAPI backend
    fetch("http://localhost:8000/api/consultations/doctor/DOC_123/today")
      .then((res) => res.json())
      .then((resData) => setQueue(resData.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-teal-800">Antrean Pasien Hari Ini</h1>
          <p className="text-gray-500 text-sm">Daftar konsultasi yang dijadwalkan untuk hari ini</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          Perbarui
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-teal-50 text-teal-900 border-b border-teal-100">
            <tr>
              <th className="p-4">Kode Sesi</th>
              <th className="p-4">Jadwal Jam</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Belum ada antrean untuk hari ini.
                </td>
              </tr>
            ) : (
              queue.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold text-teal-700">{item.code}</td>
                  <td className="p-4">{new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`/doctor/live-session/${item.id}`}
                      className="px-3 py-1.5 bg-teal-600 text-white text-xs rounded-md hover:bg-teal-700 inline-block"
                    >
                      Mulai Sesi
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}