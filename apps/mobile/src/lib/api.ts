import { Platform } from "react-native";

// Detect a good default host for each platform:
function detectHost() {
  if (Platform.OS === "web") {
    // When running on http://localhost:19006 (Expo Web), call backend on the same machine.
    return window.location.hostname; // "localhost" or your LAN IP
  }
  // On emulators, "10.0.2.2" (Android) forwards to host's localhost.
  // On real phone, use your PC's LAN IP (same Wi-Fi).
  return Platform.OS === "android" ? "10.0.2.2" : "YOUR_LAN_IP";
}

const HOST = detectHost();
export const BASE_URL = `http://${HOST}:4000`;

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (res.status === 204) return {} as T;
  let body: any = null;
  try { body = await res.json(); } catch {}
  if (!res.ok) throw new Error(body?.error || res.statusText);
  return body as T;
}
