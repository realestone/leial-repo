import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

const KEY = "leial:user_id";

async function storageGet(key: string) {
  if (Platform.OS === "web") return Promise.resolve(localStorage.getItem(key));
  return AsyncStorage.getItem(key);
}
async function storageSet(key: string, val: string) {
  if (Platform.OS === "web") { localStorage.setItem(key, val); return; }
  return AsyncStorage.setItem(key, val);
}
async function storageRemove(key: string) {
  if (Platform.OS === "web") { localStorage.removeItem(key); return; }
  return AsyncStorage.removeItem(key);
}

export async function getOrCreateUserId(displayName = "Guest") {
  const existing = await storageGet(KEY);
  if (existing) return existing;

  const created = await api<{ id: string }>("/users", {
    method: "POST",
    body: JSON.stringify({ role: "customer", display_name: displayName }),
  });

  await storageSet(KEY, created.id);
  return created.id;
}

export function currentUserId() {
  return storageGet(KEY);
}

export function resetUser() {
  return storageRemove(KEY);
}
