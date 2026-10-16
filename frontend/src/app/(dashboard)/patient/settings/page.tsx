"use client";

import { useState, useRef, ChangeEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  Lock,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  Loader2,
  FileText,
  Calendar,
} from "lucide-react";

function PatientSettingsContent() {
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab") as
    | "profile"
    | "security"
    | "notifications"
    | "privacy"
    | null;

  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "notifications" | "privacy"
  >("profile");

  useEffect(() => {
    if (
      tabQuery &&
      ["profile", "security", "notifications", "privacy"].includes(tabQuery)
    ) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // State Profil Penuh
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    birthDate: "",
    gender: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State Keamanan
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // State Notifikasi
  const [notifications, setNotifications] = useState({
    consultationReminders: true,
    medicationReminders: true,
    emailReports: true,
    smsAlerts: false,
  });

  // State Privasi Data
  const [privacy, setPrivacy] = useState({
    shareHistoryWithDoctors: true,
    shareScreeningAnalytics: true,
    profileVisibility: "doctors_only",
  });

  // Ambil data profil langsung dari database backend dengan parsing tanggal yang akurat
  useEffect(() => {
    async function fetchUserSettings() {
      try {
        setIsLoadingProfile(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const token = localStorage.getItem("patient_token") || localStorage.getItem("token");

        const defaultName = localStorage.getItem("patient_name") || "ilham";
        const defaultEmail = localStorage.getItem("patient_email") || "ilham@gmail.com";
        const defaultBirth = localStorage.getItem("patient_birth_date") || "2007-01-16";
        const defaultGender = localStorage.getItem("patient_gender") || "Laki-laki";

        if (!token) {
          setProfileData({
            fullName: defaultName,
            email: defaultEmail,
            birthDate: defaultBirth,
            gender: defaultGender,
          });
          setIsLoadingProfile(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/patient/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          const u = result.data || result.user || result;

          // Ekstraksi tanggal lahir secara presisi ke format YYYY-MM-DD
          const rawDate = u.birth_date || u.birthDate || u.tanggal_lahir || u.date_of_birth || defaultBirth;
          const formattedDate = rawDate ? String(rawDate).split("T")[0] : defaultBirth;

          setProfileData({
            fullName: u.full_name || u.fullName || u.name || defaultName,
            email: u.email || defaultEmail,
            birthDate: formattedDate,
            gender: u.gender || u.jenis_kelamin || defaultGender,
          });

          if (u.profile_image || u.profileImage || u.avatar) {
            setProfileImage(u.profile_image || u.profileImage || u.avatar);
          }
        } else {
          setProfileData({
            fullName: defaultName,
            email: defaultEmail,
            birthDate: defaultBirth,
            gender: defaultGender,
          });
        }
      } catch (error) {
        console.error("Gagal memuat pengaturan:", error);
        setProfileData({
          fullName: "ilham",
          email: "ilham@gmail.com",
          birthDate: "2007-01-16",
          gender: "Laki-laki",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchUserSettings();
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Mohon pilih file gambar yang valid (JPG, PNG, WebP).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("patient_token") || localStorage.getItem("token");

      if (token) {
        await fetch(`${apiUrl}/api/patient/profile`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: profileData.fullName,
            birth_date: profileData.birthDate,
            gender: profileData.gender,
            ...(newPassword ? { new_password: newPassword, current_password: currentPassword } : {}),
          }),
        });
      }

      localStorage.setItem("full_name", profileData.fullName);
      localStorage.setItem("patient_name", profileData.fullName);
      localStorage.setItem("patient_email", profileData.email);
      localStorage.setItem("patient_birth_date", profileData.birthDate);
      localStorage.setItem("patient_gender", profileData.gender);
      window.dispatchEvent(new Event("profileUpdated"));

      setIsSaved(true);
      if (activeTab === "security") {
        setCurrentPassword("");
        setNewPassword("");
      }

      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Gagal menyimpan pengaturan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profil Diri", icon: User },
    { id: "security", label: "Keamanan", icon: Shield },
    { id: "notifications", label: "Notifikasi", icon: Bell },
    { id: "privacy", label: "Privasi Data", icon: Lock },
  ] as const;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">Pengaturan Akun</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola preferensi profil, keamanan, notifikasi pengingat terapi, dan privasi rekam medis Anda.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-200 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Pengaturan berhasil diperbarui!</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === "profile" && (
          <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-teal-700 font-bold text-sm">
              <User className="w-4 h-4" />
              <h2>Informasi Profil Akun Aktif</h2>
            </div>

            {isLoadingProfile ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                  <div className="relative group self-center sm:self-auto">
                    <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xl border-2 border-teal-600/20 overflow-hidden shadow-inner">
                      {profileImage ? (
                        <img src={profileImage} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        <span>
                          {profileData.fullName
                            ? profileData.fullName
                                .split(" ")
                                .filter(Boolean)
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()
                            : "IL"}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" /> Ubah Foto
                      </button>

                      {profileImage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-1.5 border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">Format JPG, PNG, atau WebP maks 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Nama Lengkap</label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 outline-none text-slate-700 font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Email (Akun Login)</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-100 text-slate-500 cursor-not-allowed outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={profileData.birthDate}
                      onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 outline-none text-slate-700 font-medium bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Jenis Kelamin</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 outline-none text-slate-700 font-medium bg-white"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* Tab Keamanan */}
        {activeTab === "security" && (
          <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-teal-700 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <h2>Keamanan & Kata Sandi</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 outline-none text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 outline-none text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab Notifikasi */}
        {activeTab === "notifications" && (
          <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-teal-700 font-bold text-sm">
              <Bell className="w-4 h-4" />
              <h2>Pengaturan Notifikasi & Pengingat Terapi</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" /> Pengingat Jadwal Konsultasi
                  </label>
                  <p className="text-[11px] text-slate-500">Terima notifikasi 30 menit sebelum sesi video call dimulai.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.consultationReminders}
                  onChange={(e) => setNotifications({ ...notifications, consultationReminders: e.target.checked })}
                  className="w-4 h-4 accent-teal-700 rounded cursor-pointer"
                />
              </div>
            </div>
          </section>
        )}

        {/* Tab Privasi */}
        {activeTab === "privacy" && (
          <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-teal-700 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <h2>Privasi Data & Rekam Medis</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" /> Akses Rekam Medis oleh Dokter Terverifikasi
                  </label>
                  <p className="text-[11px] text-slate-500">Mengizinkan psikiater yang Anda pilih untuk melihat riwayat.</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.shareHistoryWithDoctors}
                  onChange={(e) => setPrivacy({ ...privacy, shareHistoryWithDoctors: e.target.checked })}
                  className="w-4 h-4 accent-teal-700 rounded cursor-pointer"
                />
              </div>
            </div>
          </section>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isSaved}
            className={`w-full sm:w-auto font-semibold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              isSaved
                ? "bg-emerald-600 text-white cursor-default"
                : isSubmitting
                ? "bg-slate-400 text-white cursor-not-allowed"
                : "bg-teal-700 hover:bg-teal-800 text-white active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Berhasil Disimpan!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PatientSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
        </div>
      }
    >
      <PatientSettingsContent />
    </Suspense>
  );
}