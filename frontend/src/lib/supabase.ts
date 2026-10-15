// Re-export dari Firebase Realtime Client untuk migrasi lancar
import { firebaseClient, realtimeChannel, removeRealtimeChannel, rtdb, auth } from "./firebase";

export const supabase = firebaseClient;
export { realtimeChannel, removeRealtimeChannel, rtdb, auth };
export default firebaseClient;