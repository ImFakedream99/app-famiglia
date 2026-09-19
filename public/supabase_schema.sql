-- ====================================================================
-- SCHEMA DATABASE SUPABASE PER FAMIGLIA - GESTIONE ECONOMICA FAMILIARE
-- ====================================================================
-- Istruzioni:
-- 1. Accedi alla dashboard del tuo progetto su https://supabase.com
-- 2. Clicca sull'icona "SQL Editor" nella barra laterale sinistra
-- 3. Clicca su "New query", incolla questo testo e clicca su "Run"
-- ====================================================================

-- 1. Tabella principale di sincronizzazione stato (Family State Snapshot)
CREATE TABLE IF NOT EXISTS public.family_state (
    family_id TEXT PRIMARY KEY,
    state_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    app_version TEXT DEFAULT '2.4.0'
);

CREATE INDEX IF NOT EXISTS idx_family_state_updated_at ON public.family_state (updated_at DESC);

-- Abilita Row Level Security (RLS)
ALTER TABLE public.family_state ENABLE ROW LEVEL SECURITY;

-- Permessi per client anonimo / locale
DROP POLICY IF EXISTS "Consentito accesso lettura per family_state" ON public.family_state;
CREATE POLICY "Consentito accesso lettura per family_state" 
ON public.family_state FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Consentito inserimento e modifica per family_state" ON public.family_state;
CREATE POLICY "Consentito inserimento e modifica per family_state" 
ON public.family_state FOR ALL 
USING (true) 
WITH CHECK (true);

-- 2. Tabelle relazionali per visualizzazione su Supabase Table Editor

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
DROP POLICY IF EXISTS "Accesso a spese" ON public.expenses;
CREATE POLICY "Accesso a spese" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

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
DROP POLICY IF EXISTS "Accesso a chores" ON public.chores;
CREATE POLICY "Accesso a chores" ON public.chores FOR ALL USING (true) WITH CHECK (true);

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
DROP POLICY IF EXISTS "Accesso a savings" ON public.savings_goals;
CREATE POLICY "Accesso a savings" ON public.savings_goals FOR ALL USING (true) WITH CHECK (true);

-- Abilita Realtime per la tabella family_state
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'family_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.family_state;
  END IF;
END $$;
