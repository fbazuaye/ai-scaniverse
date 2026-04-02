import { useEffect, useState, useCallback, useRef } from "react";
import { syncPendingScans, getPendingScans, type PendingScan } from "@/lib/offlineSync";
import { useToast } from "@/hooks/use-toast";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const syncingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    try {
      const pending = await getPendingScans();
      setPendingCount(pending.length);
    } catch {
      // IndexedDB might not be available
    }
  }, []);

  const doSync = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      const { synced, failed } = await syncPendingScans();
      if (synced > 0) {
        toast({
          title: "Offline Scans Synced",
          description: `${synced} scan(s) uploaded successfully.${failed > 0 ? ` ${failed} failed.` : ""}`,
        });
      }
      await refreshPendingCount();
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [toast, refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({ title: "Back Online", description: "Syncing offline scans..." });
      doSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline",
        description: "Scans will be saved locally and synced when you reconnect.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial sync check
    refreshPendingCount();
    if (navigator.onLine) doSync();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [doSync, refreshPendingCount, toast]);

  return { isOnline, pendingCount, isSyncing, doSync, refreshPendingCount };
}
