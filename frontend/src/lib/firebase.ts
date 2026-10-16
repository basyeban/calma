import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  push,
  remove,
  onValue,
  onChildAdded,
  Database,
  DatabaseReference,
} from "firebase/database";
import { getAuth, Auth } from "firebase/auth";

// Konfigurasi Firebase dari Environment Variables dengan fallback default
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCalmaAppRealtime2026SecureKey",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "calma-app.firebaseapp.com",
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://calma-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "calma-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "calma-app.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "109283746501",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:109283746501:web:9c8b7a6d5e4f3a2b1c",
};

// Inisialisasi Firebase App (Singleton)
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inisialisasi Firebase Realtime Database
export const rtdb: Database = getDatabase(app);

// Inisialisasi Firebase Auth
export const auth: Auth = getAuth(app);

/**
 * Helper timeout internal untuk mencegah fetch ke Firebase menggantung selamanya
 */
function withTimeout<T>(promise: Promise<T>, ms: number = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Firebase Timeout")), ms))
  ]);
}

/**
 * =========================================================================
 * REALTIME SIGNALING CHANNEL (Pengganti Supabase Realtime Channel)
 * Digunakan untuk WebRTC Signaling & Panggilan Dokter-Pasien
 * =========================================================================
 */
export class RealtimeChannel {
  public channelName: string;
  private eventsRef: DatabaseReference;
  private listeners: Map<string, Array<(payload: any) => void>> = new Map();
  private unsubscribes: Array<() => void> = [];
  private startTime: number = Date.now();

  constructor(channelName: string) {
    this.channelName = channelName.replace(/[^a-zA-Z0-9_-]/g, "_");
    this.eventsRef = ref(rtdb, `signaling/${this.channelName}/events`);
  }

  /**
   * Mendaftarkan listener untuk event tertentu (misal: 'broadcast', 'doctor-calling', 'offer', dll)
   */
  on(
    type: string,
    filterOrHandler: { event: string } | ((payload: any) => void),
    maybeHandler?: (payload: any) => void
  ): RealtimeChannel {
    let eventName = "*";
    let handler: (payload: any) => void;

    if (typeof filterOrHandler === "object" && filterOrHandler.event) {
      eventName = filterOrHandler.event;
      handler = maybeHandler || (() => {});
    } else if (typeof filterOrHandler === "function") {
      handler = filterOrHandler;
    } else {
      handler = maybeHandler || (() => {});
    }

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(handler);

    return this;
  }

  /**
   * Mengirimkan sinyal broadcast ke channel ini
   */
  async send(message: { type?: string; event: string; payload: any }): Promise<void> {
    try {
      const eventItemRef = push(this.eventsRef);
      await set(eventItemRef, {
        type: message.type || "broadcast",
        event: message.event,
        payload: message.payload,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(`[Firebase RealtimeChannel] Gagal kirim sinyal ke ${this.channelName}:`, err);
    }
  }

  /**
   * Mengaktifkan subscription mendengarkan event yang masuk secara realtime
   */
  async subscribe(callback?: (status: string) => void): Promise<RealtimeChannel> {
    try {
      this.startTime = Date.now() - 1000;
      
      const unsubscribe = onChildAdded(this.eventsRef, (snapshot) => {
        const val = snapshot.val();
        if (!val) return;
        
        if (val.timestamp && val.timestamp < this.startTime - 2000) return;

        const eventName = val.event;
        const payloadData = val.payload;

        if (this.listeners.has(eventName)) {
          this.listeners.get(eventName)!.forEach((cb) => {
            try {
              cb(payloadData);
            } catch (e) {
              console.error("[Firebase RealtimeChannel] Error in event callback:", e);
            }
          });
        }

        if (this.listeners.has("*")) {
          this.listeners.get("*")!.forEach((cb) => {
            try {
              cb(val);
            } catch (e) {
              console.error("[Firebase RealtimeChannel] Error in wildcard callback:", e);
            }
          });
        }
      });

      this.unsubscribes.push(unsubscribe);

      if (callback) {
        callback("SUBSCRIBED");
      }
    } catch (err) {
      console.error(`[Firebase RealtimeChannel] Gagal subscribe ke ${this.channelName}:`, err);
      if (callback) {
        callback("CHANNEL_ERROR");
      }
    }

    return this;
  }

  /**
   * Mematikan subscription dan membersihkan listener
   */
  unsubscribe(): void {
    this.unsubscribes.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    });
    this.unsubscribes = [];
    this.listeners.clear();
  }
}

/**
 * Factory function untuk membuat channel Firebase Realtime
 */
export function realtimeChannel(name: string): RealtimeChannel {
  return new RealtimeChannel(name);
}

/**
 * Helper untuk menghapus channel
 */
export function removeRealtimeChannel(channel: RealtimeChannel | any): void {
  if (channel && typeof channel.unsubscribe === "function") {
    channel.unsubscribe();
  }
}

/**
 * =========================================================================
 * REALTIME CALL & PRESENCE SERVICES
 * =========================================================================
 */
export async function sendDoctorCall(consultationId: number | string): Promise<void> {
  const callData = {
    status: "calling",
    consultationId: Number(consultationId),
    timestamp: Date.now(),
  };

  await set(ref(rtdb, `calls/${consultationId}`), callData);
  await set(ref(rtdb, `active_calls/${consultationId}`), callData);
  await update(ref(rtdb, `consultations/${consultationId}`), {
    status: "calling",
    called_at: new Date().toISOString(),
  });
}

export function listenIncomingCalls(
  consultationId: number | string,
  onIncomingCall: (data: any) => void
): () => void {
  const specificRef = ref(rtdb, `calls/${consultationId}`);
  const globalRef = ref(rtdb, `active_calls/${consultationId}`);

  const unsubSpecific = onValue(specificRef, (snapshot) => {
    const val = snapshot.val();
    if (val && val.status === "calling") {
      onIncomingCall(val);
    }
  });

  const unsubGlobal = onValue(globalRef, (snapshot) => {
    const val = snapshot.val();
    if (val && val.status === "calling") {
      onIncomingCall(val);
    }
  });

  return () => {
    unsubSpecific();
    unsubGlobal();
  };
}

export async function clearDoctorCall(consultationId: number | string): Promise<void> {
  await remove(ref(rtdb, `calls/${consultationId}`));
  await remove(ref(rtdb, `active_calls/${consultationId}`));
}

/**
 * =========================================================================
 * REALTIME DATABASE CRUD & QUERY ADAPTER (Kompatibel dengan UI Calma)
 * =========================================================================
 */
const DEFAULT_DOCTORS = [
  {
    id: 6,
    full_name: "Dr. Danuar Ilham, Sp.KJ",
    name: "Dr. Danuar Ilham, Sp.KJ",
    title: "Psikiatri Dewasa & Adiksi",
    specialization: "Mood & Stres",
    role: "doctor",
    email: "danuar.ilham@sp.kj",
    priceNum: 250000,
    price: "Rp 250.000",
    avatar: "DI",
    rating: "4.9",
    tags: ["Kecemasan", "Stres Kerja"],
    img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=500",
    bookedTimes: ["10:30"],
  },
  {
    id: 9,
    full_name: "dr. Vicky, Sp.KJ",
    name: "dr. Vicky, Sp.KJ",
    title: "Spesialis Psikiatri Anak & Remaja",
    specialization: "Anak & Remaja",
    role: "doctor",
    email: "vicky@sp.kj",
    priceNum: 275000,
    price: "Rp 275.000",
    avatar: "DV",
    rating: "4.9",
    tags: ["Tumbuh Kembang", "Trauma Remaja"],
    img: "https://images.unsplash.com/photo-1594824813575-f938d8794c48?q=80&w=500",
    bookedTimes: ["14:00"],
  },
  {
    id: 12,
    full_name: "Dr. Farida Utama, Sp.KJ",
    name: "Dr. Farida Utama, Sp.KJ",
    title: "Spesialis Kesehatan Jiwa & Adiksi",
    specialization: "Depresi & Burnout",
    role: "doctor",
    email: "farida.utama@calma.com",
    priceNum: 300000,
    price: "Rp 300.000",
    avatar: "FU",
    rating: "4.8",
    tags: ["Burnout", "Insomnia"],
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=500",
    bookedTimes: ["09:00"],
  },
];

const DEFAULT_PAYOUTS = [
  {
    id: 1,
    doctor_id: 6,
    doctor_name: "Dr. Danuar Ilham, Sp.KJ",
    doctor_specialty: "Psikiatri Dewasa & Adiksi",
    bank_name: "Bank Mandiri",
    account_number: "1380029381029",
    amount: 5000000,
    status: "approved",
    created_at: "2026-10-10T10:00:00.000Z",
    approved_at: "2026-10-11T12:00:00.000Z",
  },
  {
    id: 2,
    doctor_id: 6,
    doctor_name: "Dr. Danuar Ilham, Sp.KJ",
    doctor_specialty: "Psikiatri Dewasa & Adiksi",
    bank_name: "Bank Mandiri",
    account_number: "1380029381029",
    amount: 3500000,
    status: "pending",
    created_at: "2026-10-14T08:30:00.000Z",
  },
  {
    id: 3,
    doctor_id: 9,
    doctor_name: "dr. Vicky, Sp.KJ",
    doctor_specialty: "Psikiatri Anak & Remaja",
    bank_name: "BCA",
    account_number: "0882910391",
    amount: 4200000,
    status: "pending",
    created_at: "2026-10-14T11:20:00.000Z",
  },
];

export const firebaseService = {
  async getDoctors(): Promise<any[]> {
    try {
      const snapshot = await withTimeout(get(ref(rtdb, "users")), 2500);
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = Object.keys(val)
          .map((k) => ({ id: isNaN(Number(k)) ? k : Number(k), ...val[k] }))
          .filter((u) => u.role === "doctor");
        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn("[Firebase] Menggunakan fallback data dokter (Timeout/Empty):", e);
    }
    return DEFAULT_DOCTORS;
  },

  async getUpcomingPatientSession(): Promise<any | null> {
    try {
      const snapshot = await withTimeout(get(ref(rtdb, "consultations")), 2500);
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = Object.keys(val)
          .map((k) => ({ id: isNaN(Number(k)) ? k : Number(k), ...val[k] }))
          .filter((c) => c.status === "scheduled" || c.status === "calling");

        if (list.length > 0) {
          const session = list[0];
          const doctors = await this.getDoctors();
          const doc = doctors.find((d) => d.id === session.doctor_id) || DEFAULT_DOCTORS[0];

          return {
            id: session.id || 4029,
            doctorName: doc.full_name || doc.name,
            doctorTitle: doc.title,
            date: session.consultation_date || "Hari Ini",
            time: session.consultation_time ? `${session.consultation_time} WIB` : "14:00 WIB",
            avatar: doc.avatar || "DR",
          };
        }
      }
    } catch (e) {
      console.warn("[Firebase] Mengambil fallback sesi mendatang:", e);
    }

    return {
      id: 4029,
      doctorName: "Dr. Danuar Ilham, Sp.KJ",
      doctorTitle: "Spesialis Psikiatri Dewasa & Adiksi",
      date: "Hari Ini, 15 Okt 2026",
      time: "14:00 WIB",
      avatar: "DI",
    };
  },

async createConsultation(payload: {
  doctor_id: number;
  consultation_time: string;
  consultation_date: string;
  status: string;
  patient_name: string;
}): Promise<{ id: number }> {
  const newId = Date.now();

  const dataWithId = {
    id: newId,
    ...payload,
    created_at: new Date().toISOString(),
  };

  try {
    await withTimeout(
      set(ref(rtdb, `consultations/${newId}`), dataWithId),
      10000
    );

    return { id: newId };
  } catch (error) {
    console.error("[Firebase] Gagal menyimpan konsultasi:", error);
    throw new Error(
      "Gagal menyimpan konsultasi ke Firebase. Periksa koneksi dan aturan keamanan database."
    );
  }
},

async createPayment(payload: {
  consultation_id: number;
  doctor_name: string;
  amount: number;
  payment_method: string;
  proof_url: string;
  status: string;
}): Promise<{ id: number }> {
  const paymentId = Date.now();

  const paymentData = {
    id: paymentId,
    ...payload,
    created_at: new Date().toISOString(),
  };

  try {
    await withTimeout(
      set(ref(rtdb, `payments/${paymentId}`), paymentData),
      10000
    );

    return { id: paymentId };
  } catch (error) {
    console.error("[Firebase] Gagal menyimpan pembayaran:", error);
    throw new Error(
      "Gagal menyimpan pembayaran ke Firebase. Periksa koneksi dan aturan keamanan database."
    );
  }
},

  async getPayouts(doctorId?: number | string): Promise<any[]> {
    try {
      const snapshot = await withTimeout(get(ref(rtdb, "payouts")), 2500);
      if (snapshot.exists()) {
        const val = snapshot.val();
        let list = Object.keys(val).map((k) => ({
          id: isNaN(Number(k)) ? k : Number(k),
          ...val[k],
        }));

        if (doctorId) {
          list = list.filter((p) => String(p.doctor_id) === String(doctorId));
        }

        list.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );

        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn("[Firebase] Gagal mengambil payouts, menggunakan fallback:", e);
    }

    if (doctorId) {
      return DEFAULT_PAYOUTS.filter((p) => String(p.doctor_id) === String(doctorId));
    }
    return DEFAULT_PAYOUTS;
  },

  async updatePayoutStatus(id: number | string, status: "approved" | "rejected"): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (status === "approved") {
      updateData.approved_at = new Date().toISOString();
    }

    await update(ref(rtdb, `payouts/${id}`), updateData);
  },

  async createPayout(payload: any): Promise<any> {
    const newId = Date.now();
    const item = {
      id: newId,
      ...payload,
      created_at: new Date().toISOString(),
    };
    await set(ref(rtdb, `payouts/${newId}`), item);
    return item;
  },

  async getDoctorSchedule(doctorId: string | number, date: string): Promise<any | null> {
    try {
      const key = `${doctorId}_${date.replace(/-/g, "")}`;
      const snapshot = await withTimeout(get(ref(rtdb, `doctor_schedules/${key}`)), 2500);
      if (snapshot.exists()) {
        return snapshot.val();
      }
    } catch (e) {
      console.warn("[Firebase] Gagal get doctor schedule:", e);
    }
    return null;
  },

  async saveDoctorSchedule(
    doctorId: string | number,
    date: string,
    availableSlots: any[],
    consultationFee: number
  ): Promise<void> {
    const key = `${doctorId}_${date.replace(/-/g, "")}`;
    await set(ref(rtdb, `doctor_schedules/${key}`), {
      doctor_id: doctorId,
      date,
      available_slots: availableSlots,
      consultation_fee: consultationFee,
      updated_at: new Date().toISOString(),
    });
  },

  async completeConsultation(
    consultationId: string | number,
    data: { diagnosis?: string; treatment_notes?: string; prescription?: string }
  ): Promise<void> {
    await update(ref(rtdb, `consultations/${consultationId}`), {
      status: "completed",
      ...data,
      completed_at: new Date().toISOString(),
    });

    await clearDoctorCall(consultationId);
  },
};

/**
 * =========================================================================
 * UNIVERSAL FIREBASE REALTIME ADAPTER
 * =========================================================================
 */
class FirebaseQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderField: string | null = null;
  private isAscending: boolean = true;
  private limitCount: number | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields?: string): this {
    return this;
  }

  eq(field: string, value: any): this {
    this.filters.push((item) => String(item[field]) === String(value));
    return this;
  }

  or(conditions: string): this {
    return this;
  }

  order(field: string, options?: { ascending?: boolean }): this {
    this.orderField = field;
    this.isAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  async single(): Promise<{ data: any; error: any }> {
    const res = await this.execute();
    return {
      data: res.data && res.data.length > 0 ? res.data[0] : null,
      error: res.error,
    };
  }

  async then(resolve: (value: { data: any; error: any }) => void, reject?: (reason: any) => void) {
    try {
      const result = await this.execute();
      resolve(result);
    } catch (err) {
      if (reject) reject(err);
      else resolve({ data: null, error: err });
    }
  }

  private async execute(): Promise<{ data: any[] | null; error: any }> {
    try {
      let data: any[] = [];

      if (this.tableName === "users") {
        data = await firebaseService.getDoctors();
      } else if (this.tableName === "payouts") {
        data = await firebaseService.getPayouts();
      } else if (this.tableName === "consultations") {
        try {
          const snapshot = await withTimeout(get(ref(rtdb, "consultations")), 2500);
          if (snapshot.exists()) {
            const val = snapshot.val();
            data = Object.keys(val).map((k) => ({
              id: isNaN(Number(k)) ? k : Number(k),
              ...val[k],
            }));
          }
        } catch (e) {
          // gunakan fallback jika timeout
        }

        if (data.length === 0) {
          data = [
            {
              id: 4029,
              doctor_id: 6,
              consultation_date: "2026-10-15",
              consultation_time: "14:00",
              status: "scheduled",
              patient_name: "Achmad Daniel",
              users: {
                id: 6,
                full_name: "Dr. Danuar Ilham, Sp.KJ",
                email: "danuar.ilham@sp.kj",
              },
            },
          ];
        }
      } else {
        try {
          const snapshot = await withTimeout(get(ref(rtdb, this.tableName)), 2500);
          if (snapshot.exists()) {
            const val = snapshot.val();
            data = Object.keys(val).map((k) => ({
              id: isNaN(Number(k)) ? k : Number(k),
              ...val[k],
            }));
          }
        } catch (e) {
          // ignore timeout
        }
      }

      for (const filter of this.filters) {
        data = data.filter(filter);
      }

      if (this.orderField) {
        data.sort((a, b) => {
          const valA = a[this.orderField!];
          const valB = b[this.orderField!];
          if (valA < valB) return this.isAscending ? -1 : 1;
          if (valA > valB) return this.isAscending ? 1 : -1;
          return 0;
        });
      }

      if (this.limitCount) {
        data = data.slice(0, this.limitCount);
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async insert(rows: any[]): Promise<{ data: any; error: any; select: () => any }> {
    try {
      const row = rows[0] || {};
      const newId = row.id || Date.now();
      const payload = { ...row, id: newId, created_at: new Date().toISOString() };

      await set(ref(rtdb, `${this.tableName}/${newId}`), payload);

      return {
        data: payload,
        error: null,
        select: () => ({
          single: async () => ({ data: payload, error: null }),
        }),
      };
    } catch (err) {
      return {
        data: null,
        error: err,
        select: () => ({
          single: async () => ({ data: null, error: err }),
        }),
      };
    }
  }

  async update(values: any): Promise<{ eq: (field: string, val: any) => Promise<{ error: any }> }> {
    return {
      eq: async (field: string, val: any) => {
        try {
          if (field === "id") {
            await update(ref(rtdb, `${this.tableName}/${val}`), values);
            return { error: null };
          }
          const snapshot = await withTimeout(get(ref(rtdb, this.tableName)), 2500);
          if (snapshot.exists()) {
            const all = snapshot.val();
            for (const key of Object.keys(all)) {
              if (String(all[key][field]) === String(val)) {
                await update(ref(rtdb, `${this.tableName}/${key}`), values);
              }
            }
          }
          return { error: null };
        } catch (err) {
          return { error: err };
        }
      },
    };
  }

  async upsert(values: any): Promise<{ error: any }> {
    try {
      const id = values.id || `${values.doctor_id}_${values.date || Date.now()}`;
      await set(ref(rtdb, `${this.tableName}/${id}`), values);
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }
}

export const firebaseClient = {
  channel: (name: string) => realtimeChannel(name),
  removeChannel: (channel: RealtimeChannel | any) => removeRealtimeChannel(channel),
  from: (table: string) => new FirebaseQueryBuilder(table),
};

export const realtimeDb = firebaseClient;