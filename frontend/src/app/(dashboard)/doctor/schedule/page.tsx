"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Loader2, Plus, Trash2, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DoctorSchedulePage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<number>(today.getDate());
  const [currentMonth, setCurrentMonth] = useState("Oktober 2026");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // State untuk tarif / harga konsultasi dokter
  const [consultationFee, setConsultationFee] = useState<string>("150000");

  // State untuk daftar slot waktu ketersediaan dokter pada tanggal yang dipilih
  const [scheduleSlots, setScheduleSlots] = useState<any[]>([]);

  // State untuk form tambah jam ketersediaan baru
  const [newTime, setNewTime] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const activeDays = [1, 2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 26, 27, 28, 29, 30];

  // Ambil data jadwal dari Supabase (booking) & localStorage (ketersediaan & tarif)
  useEffect(() => {
    async function fetchScheduleAndFee() {
      try {
        setLoading(true);
        const doctorId = localStorage.getItem("doctor_id") || "6"; 
        const formattedDate = `2026-10-${selectedDate < 10 ? "0" + selectedDate : selectedDate}`;

        // 1. Ambil data konsultasi yang sudah dibooking pasien pada tanggal tersebut dari Supabase
        const { data: consultationsData, error: consultationError } = await supabase
          .from("consultations")
          .select("*")
          .eq("doctor_id", doctorId)
          .eq("consultation_date", formattedDate);

        let bookedSlots: any[] = [];
        if (!consultationError && consultationsData) {
          bookedSlots = consultationsData.map((item: any, idx: number) => ({
            id: item.id || idx,
            time: item.time_slot || item.consultation_time || "10:00",
            patient: item.patient_name || "Pasien Terdaftar",
            type: "Konsultasi Video",
            status: "TERISI",
          }));
        }

        // 2. Ambil data ketersediaan & tarif dari localStorage browser agar aman
        const savedStorageKey = `doctor_schedule_${doctorId}_${formattedDate}`;
        const localSavedData = localStorage.getItem(savedStorageKey);

        let availableSlots: any[] = [];
        if (localSavedData) {
          const parsed = JSON.parse(localSavedData);
          if (parsed.consultation_fee) {
            setConsultationFee(parsed.consultation_fee.toString());
          }
          if (parsed.available_slots) {
            availableSlots = parsed.available_slots.filter(
              (slot: any) => slot.status === "TERSEDIA"
            );
          }
        } else {
          // Fallback slot default jika belum pernah disimpan
          availableSlots = [
            { id: 101, time: "09:00", patient: "Belum ada pasien", type: "", status: "TERSEDIA" },
            { id: 102, time: "13:00", patient: "Belum ada pasien", type: "", status: "TERSEDIA" },
          ];
        }

        // Gabungkan slot terisi dan slot tersedia tanpa tumpang tindih waktu
        const bookedTimes = bookedSlots.map((b) => b.time);
        const filteredAvailable = availableSlots.filter((slot) => !bookedTimes.includes(slot.time));

        setScheduleSlots([...bookedSlots, ...filteredAvailable]);
      } catch (err) {
        console.error("Gagal memuat jadwal:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchScheduleAndFee();
  }, [selectedDate]);

  // Fungsi untuk menambah jam ketersediaan baru
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;

    const newSlot = {
      id: Date.now(),
      time: newTime,
      patient: "Belum ada pasien",
      type: "",
      status: "TERSEDIA",
    };

    setScheduleSlots([...scheduleSlots, newSlot]);
    setNewTime("");
    setShowAddModal(false);
  };

  // Fungsi untuk menghapus slot jam ketersediaan
  const handleDeleteSlot = (id: number) => {
    setScheduleSlots(scheduleSlots.filter((slot) => slot.id !== id));
  };

  // Fungsi untuk menyimpan perubahan ketersediaan & tarif ke localStorage
  const handleSaveAvailability = async () => {
    try {
      setSaving(true);
      const doctorId = localStorage.getItem("doctor_id") || "6";
      const formattedDate = `2026-10-${selectedDate < 10 ? "0" + selectedDate : selectedDate}`;

      const slotsToSave = scheduleSlots.filter((slot) => slot.status === "TERSEDIA");
      const feeNumber = parseFloat(consultationFee) || 0;

      // Simpan ke localStorage
      const savedStorageKey = `doctor_schedule_${doctorId}_${formattedDate}`;
      const payload = {
        doctor_id: doctorId,
        schedule_date: formattedDate,
        available_slots: slotsToSave,
        consultation_fee: feeNumber,
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(savedStorageKey, JSON.stringify(payload));

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2500);
    } catch (err) {
      console.error("Gagal menyimpan ketersediaan:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans text-slate-800 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Jadwal Praktik & Tarif Konsultasi</h1>
        <p className="text-xs text-gray-500 mt-1">
          Atur jam ketersediaan praktik serta tentukan tarif harga konsultasi per sesi untuk pasien Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Picker */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">{currentMonth}</h3>
            <div className="flex space-x-1">
              <button className="p-1.5 border rounded-lg text-gray-500 hover:bg-stone-50"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1.5 border rounded-lg text-gray-500 hover:bg-stone-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-400">
            <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
          </div>

          {/* Grid Tanggal Oktober 2026 */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {[27, 28, 29, 30].map((d, index) => (
              <div key={`prev-${index}`} className="py-2.5 text-gray-300"></div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const isActive = activeDays.includes(day);
              const isSelected = day === selectedDate;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`py-2.5 rounded-xl font-medium transition ${
                    isSelected
                      ? "bg-slate-900 text-white shadow"
                      : isActive
                      ? "bg-stone-100 text-slate-800 hover:bg-stone-200"
                      : "text-gray-400 hover:bg-stone-50"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-6 pt-4 text-xs text-gray-500 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-200" />
              <span>Hari Praktik Aktif</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <span>Tanggal Terpilih</span>
            </div>
          </div>
        </div>

        {/* Schedule Sidebar & Edit Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">DETAIL JADWAL & TARIF</span>
              <h3 className="text-sm font-serif font-bold text-slate-900 mt-0.5">
                {selectedDate} Oktober 2026
              </h3>
            </div>

            {/* Input Harga / Tarif Konsultasi */}
            <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-xl border border-stone-100">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-teal-700" /> Tarif Konsultasi (Rp)
              </label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                placeholder="Contoh: 150000"
                className="w-full bg-white text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-teal-700 font-semibold text-slate-800"
              />
              <span className="text-[10px] text-gray-400 block">Tarif per 1 sesi pertemuan/video call.</span>
            </div>

            {loading ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                <span className="text-xs text-slate-400">Memuat slot waktu...</span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {scheduleSlots.map((slot) => (
                  <div key={slot.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{slot.time} WIB</span>
                        <span className="text-slate-600 font-medium">{slot.patient}</span>
                      </div>
                      {slot.type && <p className="text-[10px] text-gray-400 mt-0.5">{slot.type}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          slot.status === "TERISI" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {slot.status}
                      </span>
                      {slot.status === "TERSEDIA" && (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Hapus Jam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Form Tambah Jam Cepat */}
            {showAddModal ? (
              <div className="p-3 bg-stone-50 rounded-xl border border-gray-200 space-y-2">
                <span className="text-[11px] font-semibold text-slate-700 block">Tambah Jam Praktik (WIB)</span>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="flex-1 bg-white text-xs p-2 border rounded-lg outline-none focus:ring-1 focus:ring-teal-600"
                  />
                  <button
                    onClick={handleAddSlot}
                    className="bg-teal-700 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-teal-800"
                  >
                    Tambah
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="bg-gray-200 text-gray-600 px-2.5 py-2 rounded-lg text-xs"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-600 text-xs font-semibold flex items-center justify-center space-x-1 hover:bg-stone-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Jam Ketersediaan Baru</span>
              </button>
            )}
          </div>

          <button
            onClick={handleSaveAvailability}
            disabled={saving}
            className="w-full bg-teal-800 hover:bg-teal-900 text-white text-xs font-medium py-3 rounded-xl transition shadow flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Menyimpan Ketersediaan & Tarif...</span>
              </>
            ) : successMsg ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Berhasil Disimpan!</span>
              </>
            ) : (
              <span>Simpan Perubahan Jadwal & Tarif</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}