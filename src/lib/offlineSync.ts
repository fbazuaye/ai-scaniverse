import { supabase } from "@/integrations/supabase/client";

const DB_NAME = "ai-scanpro-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-scans";

export interface PendingScan {
  id: string;
  title: string;
  description: string;
  scanType: string;
  files: { name: string; type: string; data: ArrayBuffer }[];
  createdAt: number;
  status: "pending" | "syncing" | "failed";
  error?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveScanOffline(scan: PendingScan): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(scan);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingScans(): Promise<PendingScan[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function removePendingScan(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updatePendingScan(id: string, updates: Partial<PendingScan>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result) {
        store.put({ ...getReq.result, ...updates });
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function uploadPendingScan(scan: PendingScan): Promise<boolean> {
  try {
    await updatePendingScan(scan.id, { status: "syncing" });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Create main scan record
    const { data: scanData, error: scanError } = await supabase
      .from("scans")
      .insert({
        user_id: user.id,
        title: scan.title,
        description: scan.description,
        content_type: scan.scanType,
        file_path: "",
      })
      .select()
      .single();

    if (scanError) throw scanError;

    // Upload each file
    for (let i = 0; i < scan.files.length; i++) {
      const f = scan.files[i];
      const fileExt = f.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
      const blob = new Blob([f.data], { type: f.type });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("scans")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { error: docError } = await supabase
        .from("scan_documents")
        .insert({
          scan_id: scanData.id,
          file_path: uploadData.path,
          file_name: f.name,
          file_size: f.data.byteLength,
          file_type: f.type,
        });

      if (docError) throw docError;
    }

    await removePendingScan(scan.id);
    return true;
  } catch (error: any) {
    console.error("Background sync failed for scan:", scan.id, error);
    await updatePendingScan(scan.id, { status: "failed", error: error.message });
    return false;
  }
}

export async function syncPendingScans(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingScans();
  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const scan of pending) {
    const success = await uploadPendingScan(scan);
    if (success) synced++;
    else failed++;
  }

  return { synced, failed };
}

// Check if we're online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Convert File to storable format
export async function fileToStorable(file: File): Promise<{ name: string; type: string; data: ArrayBuffer }> {
  const data = await file.arrayBuffer();
  return { name: file.name, type: file.type, data };
}
