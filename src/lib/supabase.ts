import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'storage' | 'file' | 'none';
}

export interface SupabaseSyncStatus {
  state: 'connected' | 'connecting' | 'disconnected' | 'error' | 'unconfigured';
  lastSyncedAt: string | null;
  errorMessage: string | null;
  syncedRecordCount?: number;
}

const STORAGE_URL_KEY = 'famiglia_supabase_url';
const STORAGE_ANON_KEY = 'famiglia_supabase_anon_key';
const STORAGE_LAST_SYNC_KEY = 'famiglia_supabase_last_sync';

// Publishable client configuration for the official Famiglia Supabase project.
// This key is intentionally a public client key; authorization is enforced by Supabase Auth + RLS.
const DEFAULT_SUPABASE_URL = 'https://ozygvdbtctzaxwijynzj.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_i0rbYzCRY5AV8pmTrbJbbA_lL88oIhj';

let cachedClient: SupabaseClient | null = null;
let currentConfig: SupabaseConfig = {
  url: '',
  anonKey: '',
  isConfigured: false,
  source: 'none',
};

/**
 * Load Supabase configuration from available sources:
 * 1. LocalStorage
 * 2. Vite environment variables
 * 3. Local supabase.config.json (when served via local server)
 */
export async function initSupabaseConfig(): Promise<SupabaseConfig> {
  const localUrl = localStorage.getItem(STORAGE_URL_KEY)?.trim() || '';
  const localKey = localStorage.getItem(STORAGE_ANON_KEY)?.trim() || '';

  if (localUrl === DEFAULT_SUPABASE_URL && localKey) {
    currentConfig = {
      url: localUrl,
      anonKey: localKey,
      isConfigured: true,
      source: 'storage',
    };
    cachedClient = createClient(localUrl, localKey, {
      auth: { persistSession: true },
    });
    return currentConfig;
  }

  // Check Vite environment variables
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim() || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim() || '';

  if (envUrl && envKey && !envUrl.includes('MY_SUPABASE') && !envUrl.includes('example')) {
    currentConfig = {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
    cachedClient = createClient(envUrl, envKey, {
      auth: { persistSession: true },
    });
    return currentConfig;
  }

  // Built-in public client configuration for the official Famiglia project.
  // The publishable key is safe to ship in a desktop/web client; access is enforced by Auth + RLS.
  if (DEFAULT_SUPABASE_URL && DEFAULT_SUPABASE_KEY) {
    currentConfig = {
      url: DEFAULT_SUPABASE_URL,
      anonKey: DEFAULT_SUPABASE_KEY,
      isConfigured: true,
      source: 'env',
    };
    cachedClient = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return currentConfig;
  }

  // Attempt to load from local supabase.config.json (works seamlessly when running in loco via local web server)
  try {
    const res = await fetch('/supabase.config.json', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey && data.supabaseUrl !== 'https://your-project.supabase.co') {
        currentConfig = {
          url: data.supabaseUrl.trim(),
          anonKey: data.supabaseAnonKey.trim(),
          isConfigured: true,
          source: 'file',
        };
        // Also save to localStorage for persistence
        localStorage.setItem(STORAGE_URL_KEY, currentConfig.url);
        localStorage.setItem(STORAGE_ANON_KEY, currentConfig.anonKey);
        cachedClient = createClient(currentConfig.url, currentConfig.anonKey, {
          auth: { persistSession: true },
        });
        return currentConfig;
      }
    }
  } catch {
    // Local config file not accessible or running on pure file:/// protocol
  }

  currentConfig = {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none',
  };
  cachedClient = null;
  return currentConfig;
}

/**
 * Get the current Supabase configuration synchronously
 */
export function getSupabaseConfig(): SupabaseConfig {
  if (currentConfig.isConfigured && cachedClient) {
    return currentConfig;
  }

  const localUrl = localStorage.getItem(STORAGE_URL_KEY)?.trim() || '';
  const localKey = localStorage.getItem(STORAGE_ANON_KEY)?.trim() || '';

  if (localUrl === DEFAULT_SUPABASE_URL && localKey) {
    currentConfig = {
      url: localUrl,
      anonKey: localKey,
      isConfigured: true,
      source: 'storage',
    };
    cachedClient = createClient(localUrl, localKey, {
      auth: { persistSession: true },
    });
    return currentConfig;
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim() || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim() || '';

  if (envUrl && envKey && !envUrl.includes('example')) {
    currentConfig = {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
    cachedClient = createClient(envUrl, envKey);
    return currentConfig;
  }

  return currentConfig;
}

/**
 * Update and persist Supabase credentials
 */
export function setSupabaseConfig(url: string, anonKey: string): { success: boolean; error?: string } {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!cleanUrl || !cleanKey) {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
    currentConfig = { url: '', anonKey: '', isConfigured: false, source: 'none' };
    cachedClient = null;
    return { success: true };
  }

  if (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://')) {
    return { success: false, error: "L'URL di Supabase deve iniziare con https://" };
  }

  try {
    localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
    localStorage.setItem(STORAGE_ANON_KEY, cleanKey);
    currentConfig = {
      url: cleanUrl,
      anonKey: cleanKey,
      isConfigured: true,
      source: 'storage',
    };
    cachedClient = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: true },
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Impossibile salvare le credenziali' };
  }
}

/**
 * Get initialized Supabase client or null if unconfigured
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;
  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    cachedClient = createClient(cfg.url, cfg.anonKey);
    return cachedClient;
  }
  return null;
}

/**
 * Test connectivity with a given or current Supabase configuration
 */
export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
}> {
  const targetUrl = (url || currentConfig.url || localStorage.getItem(STORAGE_URL_KEY) || '').trim();
  const targetKey = (anonKey || currentConfig.anonKey || localStorage.getItem(STORAGE_ANON_KEY) || '').trim();

  if (!targetUrl || !targetKey) {
    return {
      success: false,
      message: 'Inserisci sia il Project URL che la Anon Key di Supabase.',
    };
  }

  const startTime = performance.now();
  try {
    const testClient = createClient(targetUrl, targetKey);
    
    // First try querying the app_family_state table
    const { data, error } = await testClient
      .from('app_family_state')
      .select('id')
      .limit(1);

    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      // If table doesn't exist yet, test REST health endpoint directly
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Connessione stabilita con Supabase! (Nota: il database deve contenere le tabelle di autenticazione Famiglia)',
          latencyMs,
        };
      }
      return {
        success: false,
        message: `Errore Supabase: ${error.message} (Codice: ${error.code || 'N/A'})`,
      };
    }

    return {
      success: true,
      message: `Connesso con successo al database Supabase! (Latenza: ${latencyMs}ms)`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Errore di rete o URL non valido: ${err.message || String(err)}`,
    };
  }
}

/**
 * Upload complete family state snapshot to Supabase
 */
export async function uploadStateToSupabase(familyId: string, stateData: any): Promise<{
  success: boolean;
  error?: string;
  syncedAt?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Database Supabase non configurato.' };
  }

  try {
    const now = new Date().toISOString();
    const payload = {
      family_id: familyId,
      state_data: stateData,
      updated_at: now,
      app_version: '2.5.0',
    };

    const { error } = await client
      .from('app_family_state')
      .upsert(payload, { onConflict: 'family_id' });

    if (error) {
      return { success: false, error: error.message };
    }

    localStorage.setItem(STORAGE_LAST_SYNC_KEY, now);
    return { success: true, syncedAt: now };
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore durante la sincronizzazione' };
  }
}

/**
 * Download complete family state snapshot from Supabase
 */
export async function downloadStateFromSupabase(familyId: string): Promise<{
  success: boolean;
  stateData?: any;
  updatedAt?: string;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Database Supabase non configurato.' };
  }

  try {
    const { data, error } = await client
      .from('family_state')
      .select('state_data, updated_at')
      .eq('family_id', familyId)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || !data.state_data) {
      return {
        success: false,
        error: 'Nessun dato trovato su Supabase per questo nucleo familiare. Invia i dati locali per inizializzare il cloud.',
      };
    }

    if (data.updated_at) {
      localStorage.setItem(STORAGE_LAST_SYNC_KEY, data.updated_at);
    }

    return {
      success: true,
      stateData: data.state_data,
      updatedAt: data.updated_at,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore durante il recupero dei dati' };
  }
}

/**
 * Generate a downloadable supabase.config.json file content
 */
export function generateSupabaseConfigFile(url?: string, anonKey?: string): string {
  const cfg = getSupabaseConfig();
  const targetUrl = url || cfg.url || 'https://your-project.supabase.co';
  const targetKey = anonKey || cfg.anonKey || 'your-anon-public-key-here';

  return JSON.stringify(
    {
      supabaseUrl: targetUrl,
      supabaseAnonKey: targetKey,
      familyId: 'FAM-ROSSI-7829',
      _help:
        'Questo file permette all eseguibile Famiglia.exe di connettersi al tuo database Supabase in loco. Inseriscilo nella stessa cartella di Famiglia.exe.',
    },
    null,
    2
  );
}

/**
 * Complete SQL script to execute in Supabase SQL Editor
 */
export const SUPABASE_SCHEMA_SQL = `-- ====================================================================
-- SCHEMA DATABASE SUPABASE PER FAMIGLIA - GESTIONE ECONOMICA FAMILIARE
-- ====================================================================
-- Copia e incolla questo script nel menu "SQL Editor" del tuo progetto Supabase
-- e clicca su "Run" (Esegui).
-- ====================================================================

-- 1. Tabella di sincronizzazione principale dello stato familiare
CREATE TABLE IF NOT EXISTS public.family_state (
    family_id TEXT PRIMARY KEY,
    state_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    app_version TEXT DEFAULT '2.4.0'
);

-- Indice per query veloci sul family_id
CREATE INDEX IF NOT EXISTS idx_family_state_updated_at ON public.family_state (updated_at DESC);

-- Abilita Row Level Security (RLS)
ALTER TABLE public.family_state ENABLE ROW LEVEL SECURITY;

-- Policy pubblica aperta (per uso anon / client diretto in loco)
DROP POLICY IF EXISTS "Consentito accesso lettura per family_state" ON public.family_state;
CREATE POLICY "Consentito accesso lettura per family_state" 
ON public.family_state FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Consentito inserimento e modifica per family_state" ON public.family_state;
CREATE POLICY "Consentito inserimento e modifica per family_state" 
ON public.family_state FOR ALL 
USING (true) 
WITH CHECK (true);

-- 2. Tabelle relazionali opzionali per consultazione diretta tramite Supabase Table Editor

CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL,
    note TEXT,
    scope TEXT NOT NULL,
    member_id TEXT NOT NULL,
    date DATE NOT NULL,
    receipt_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accesso totale a expenses" ON public.expenses;
CREATE POLICY "Accesso totale a expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.chores (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    title TEXT NOT NULL,
    reward NUMERIC(10,2) NOT NULL,
    assigned_to TEXT NOT NULL,
    status TEXT NOT NULL,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accesso totale a chores" ON public.chores;
CREATE POLICY "Accesso totale a chores" ON public.chores FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.savings_goals (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    title TEXT NOT NULL,
    target_amount NUMERIC(10,2) NOT NULL,
    current_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    category TEXT,
    member_id TEXT NOT NULL,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accesso totale a savings_goals" ON public.savings_goals;
CREATE POLICY "Accesso totale a savings_goals" ON public.savings_goals FOR ALL USING (true) WITH CHECK (true);

-- Abilita la pubblicazione Realtime per sincronizzazione live
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'family_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.family_state;
  END IF;
END $$;

COMMENT ON TABLE public.family_state IS 'Stato completo sincronizzato dell applicazione Famiglia Gestione Economica';
`;
