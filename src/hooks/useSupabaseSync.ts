import { useState, useEffect, useCallback } from 'react';
import {
  initSupabaseConfig,
  getSupabaseConfig,
  setSupabaseConfig,
  getSupabaseClient,
  testSupabaseConnection,
  uploadStateToSupabase,
  downloadStateFromSupabase,
  SupabaseConfig,
} from '../lib/supabase';

export interface UseSupabaseSyncReturn {
  config: SupabaseConfig;
  isConnected: boolean;
  isConfigured: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  saveConfig: (url: string, key: string) => Promise<{ success: boolean; error?: string }>;
  testConnection: (url?: string, key?: string) => Promise<{ success: boolean; message: string; latencyMs?: number }>;
  syncNow: () => Promise<{ success: boolean; message: string }>;
  pullFromCloud: () => Promise<{ success: boolean; stateData?: any; message: string }>;
}

export function useSupabaseSync(
  familyId: string,
  currentState: any,
  onStateRestored?: (state: any) => void
): UseSupabaseSyncReturn {
  const [config, setConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('famiglia_supabase_last_sync');
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize and check connection on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const cfg = await initSupabaseConfig();
      if (!mounted) return;
      setConfig(cfg);

      if (cfg.isConfigured) {
        const testRes = await testSupabaseConnection(cfg.url, cfg.anonKey);
        if (!mounted) return;
        setIsConnected(testRes.success);
        if (!testRes.success) {
          setErrorMessage(testRes.message);
        } else {
          setErrorMessage(null);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Save new configuration
  const saveConfig = useCallback(async (url: string, key: string) => {
    const res = setSupabaseConfig(url, key);
    if (!res.success) {
      setErrorMessage(res.error || 'Errore di configurazione');
      return { success: false, error: res.error };
    }

    const newCfg = getSupabaseConfig();
    setConfig(newCfg);

    if (newCfg.isConfigured) {
      setIsSyncing(true);
      const testRes = await testSupabaseConnection(newCfg.url, newCfg.anonKey);
      setIsConnected(testRes.success);
      setIsSyncing(false);

      if (!testRes.success) {
        setErrorMessage(testRes.message);
        return { success: false, error: testRes.message };
      }
      setErrorMessage(null);
      return { success: true };
    } else {
      setIsConnected(false);
      setErrorMessage(null);
      return { success: true };
    }
  }, []);

  // Test connection
  const testConnection = useCallback(async (url?: string, key?: string) => {
    return await testSupabaseConnection(url, key);
  }, []);

  // Push local state to Supabase
  const syncNow = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Database Supabase non configurato.' };
    }

    setIsSyncing(true);
    setErrorMessage(null);
    try {
      const res = await uploadStateToSupabase(familyId, currentState);
      setIsSyncing(false);
      if (res.success) {
        setIsConnected(true);
        setLastSyncedAt(res.syncedAt || new Date().toISOString());
        return { success: true, message: 'Dati sincronizzati con successo su Supabase!' };
      } else {
        setErrorMessage(res.error || 'Errore di upload');
        return { success: false, message: res.error || 'Errore di upload su Supabase' };
      }
    } catch (err: any) {
      setIsSyncing(false);
      setErrorMessage(err.message);
      return { success: false, message: err.message };
    }
  }, [familyId, currentState]);

  // Pull cloud state from Supabase
  const pullFromCloud = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Database Supabase non configurato.' };
    }

    setIsSyncing(true);
    setErrorMessage(null);
    try {
      const res = await downloadStateFromSupabase(familyId);
      setIsSyncing(false);
      if (res.success && res.stateData) {
        setIsConnected(true);
        if (res.updatedAt) setLastSyncedAt(res.updatedAt);
        if (onStateRestored) {
          onStateRestored(res.stateData);
        }
        return {
          success: true,
          stateData: res.stateData,
          message: 'Dati scaricati con successo da Supabase!',
        };
      } else {
        setErrorMessage(res.error || 'Nessun dato trovato');
        return { success: false, message: res.error || 'Nessun dato trovato su Supabase' };
      }
    } catch (err: any) {
      setIsSyncing(false);
      setErrorMessage(err.message);
      return { success: false, message: err.message };
    }
  }, [familyId, onStateRestored]);

  // Realtime subscription when connected
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client || !config.isConfigured || !isConnected) return;

    try {
      const channel = client
        .channel(`family_state_changes_${familyId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'family_state',
            filter: `family_id=eq.${familyId}`,
          },
          (payload: any) => {
            if (payload.new && payload.new.state_data && onStateRestored) {
              setLastSyncedAt(payload.new.updated_at || new Date().toISOString());
              onStateRestored(payload.new.state_data);
            }
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription error:', err);
    }
  }, [familyId, config.isConfigured, isConnected, onStateRestored]);

  return {
    config,
    isConnected,
    isConfigured: config.isConfigured,
    isSyncing,
    lastSyncedAt,
    errorMessage,
    saveConfig,
    testConnection,
    syncNow,
    pullFromCloud,
  };
}
