import React, { FormEvent, useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Heart,
  KeyRound,
  Link2,
  Loader2,
  Mail,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  acceptFamilyInvite,
  createFamily,
  getCurrentSession,
  getInviteTokenFromUrl,
  getMyFamily,
  signIn,
  signUp,
  clearInviteTokenFromUrl,
  AppFamily,
} from '../lib/familyAuth';
import { initSupabaseConfig } from '../lib/supabase';

type Mode = 'login' | 'register';

declare global {
  interface Window {
    famigliaUpdater?: {
      install: (url: string) => Promise<boolean>;
    };
    famigliaCredentials?: {
      save: (email: string, password: string) => Promise<boolean>;
      load: () => Promise<{ email: string; password: string } | null>;
      clear: () => Promise<boolean>;
    };
  }
}

const shell = 'min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-4 sm:p-8';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [family, setFamily] = useState<AppFamily | null>(null);
  const [sessionEmail, setSessionEmail] = useState('');
  const [mode, setMode] = useState<Mode>('register');
  const [setupStep, setSetupStep] = useState<'family' | 'invite'>('family');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const saveCredentials = async (savedEmail: string, savedPassword: string) => {
    try { await window.famigliaCredentials?.save(savedEmail, savedPassword); } catch {}
  };

  const loadSavedCredentials = async () => {
    try {
      const saved = await window.famigliaCredentials?.load();
      if (saved) { setEmail(saved.email); setPassword(saved.password); }
    } catch {}
  };

  const refresh = async () => {
    const cfg = await initSupabaseConfig();
    if (!cfg.isConfigured) {
      setError('Il servizio account non è configurato. Controlla la configurazione Supabase dell’app.');
      setReady(true);
      return;
    }
    const { data } = await getCurrentSession();
    setSessionEmail(data.session?.user.email || '');
    if (data.session?.user) {
      const savedName = localStorage.getItem('famiglia_display_name') || data.session.user.user_metadata?.display_name || '';
      if (savedName) setDisplayName(savedName);
      try {
        const current = await getMyFamily();
        setFamily(current);
      } catch (e: any) {
        setError(e?.message || 'Non è stato possibile caricare il nucleo familiare.');
      }
    }
    setReady(true);
  };

  useEffect(() => {
    const token = getInviteTokenFromUrl();
    setInviteToken(token);
    refresh();
    loadSavedCredentials();

    const clientPromise = initSupabaseConfig();
    clientPromise.then(() => {
      // AuthGate is deliberately lightweight; Supabase persists the session locally.
    });
  }, []);

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!email.trim() || !password) {
      setError('Inserisci email e password.');
      return;
    }
    if (mode === 'register' && displayName.trim().length < 2) {
      setError('Inserisci il tuo nome.');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'register') {
        const data = await signUp(email, password, displayName);
        await saveCredentials(email, password);
        setSessionEmail(data.user?.email || email);
        if (!data.session) {
          setNotice('Account creato. Controlla la tua email per confermare l’account, poi torna qui e accedi.');
          setMode('login');
        } else {
          setNotice('Account creato. Ora puoi configurare il tuo nucleo familiare.');
          await refresh();
        }
      } else {
        await signIn(email, password);
        await saveCredentials(email, password);
        await refresh();
      }
    } catch (e: any) {
      setError(e?.message || 'Operazione non riuscita.');
    } finally {
      setBusy(false);
    }
  };

  const finishFamily = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (familyName.trim().length < 2) {
      setError('Inserisci un nome per il nucleo familiare.');
      return;
    }
    if (displayName.trim().length < 2) {
      setError('Inserisci il tuo nome.');
      return;
    }
    setBusy(true);
    try {
      const created = await createFamily(familyName, displayName);
      // Mark this browser session as a freshly created family so the app state
      // starts empty instead of inheriting the old local demo snapshot.
      localStorage.setItem('famiglia_new_family_reset', created.familyId);
      localStorage.removeItem('famiglia_gestione_data_v1');
      setFamily(created);
    } catch (e: any) {
      setError(e?.message || 'Non è stato possibile creare il nucleo.');
    } finally {
      setBusy(false);
    }
  };

  const finishInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (!inviteToken) return;
    setError('');
    setNotice('');
    if (displayName.trim().length < 2) {
      setError('Inserisci il nome con cui vuoi comparire nella famiglia.');
      return;
    }
    setBusy(true);
    try {
      const joined = await acceptFamilyInvite(inviteToken, displayName);
      setFamily(joined);
      clearInviteTokenFromUrl();
    } catch (e: any) {
      setError(e?.message || 'Non è stato possibile accettare l’invito.');
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className={shell}>
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">
          <Loader2 className="w-4 h-4 animate-spin" /> Preparazione di Famiglia…
        </div>
      </div>
    );
  }

  if (family) return <>{children}</>;

  const isAuthenticated = Boolean(sessionEmail);
  if (isAuthenticated && inviteToken) {
    return (
      <div className={shell}>
        <div className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_.95fr] gap-6">
          <BrandPanel />
          <section className="bg-white rounded-[2rem] border border-stone-200 shadow-xl shadow-stone-200/40 p-7 sm:p-9">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Link2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Invito famiglia</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Unisciti a un nucleo familiare</h1>
            <p className="text-sm text-stone-500 mt-2 leading-6">
              Hai ricevuto un link di invito. Scegli il nome con cui vuoi essere visualizzato nell’app.
            </p>
            <form onSubmit={finishInvite} className="space-y-4 mt-7">
              <Field icon={<Users />} label="Il tuo nome" value={displayName} onChange={setDisplayName} placeholder="es. Marco Rossi" />
              {error && <ErrorBox>{error}</ErrorBox>}
              <button disabled={busy} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Entra nella famiglia
              </button>
            </form>
          </section>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className={shell}>
        <div className="w-full max-w-5xl grid lg:grid-cols-[.95fr_1.05fr] gap-6">
          <BrandPanel />
          <section className="bg-white rounded-[2rem] border border-stone-200 shadow-xl shadow-stone-200/40 p-7 sm:p-9">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Ultimo passaggio</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Crea il tuo nucleo familiare</h1>
            <p className="text-sm text-stone-500 mt-2 leading-6">
              Questo sarà lo spazio condiviso per budget, spese, risparmi, paghette e attività.
            </p>
            <form onSubmit={finishFamily} className="space-y-4 mt-7">
              <Field icon={<Heart />} label="Nome del nucleo" value={familyName} onChange={setFamilyName} placeholder="es. Famiglia Rossi" />
              <Field icon={<Users />} label="Il tuo nome" value={displayName} onChange={setDisplayName} placeholder="es. Marco Rossi" />
              {error && <ErrorBox>{error}</ErrorBox>}
              {notice && <NoticeBox>{notice}</NoticeBox>}
              <button disabled={busy} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Crea il nucleo familiare
              </button>
            </form>
            <div className="mt-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              Dopo la creazione potrai generare un link d’invito da condividere con gli altri membri.
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.05fr_.95fr] gap-6 items-stretch">
        <BrandPanel />
        <section className="bg-white rounded-[2rem] border border-stone-200 shadow-xl shadow-stone-200/40 p-7 sm:p-9">
          <div className="flex items-center justify-between gap-3 mb-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Benvenuto</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
                {mode === 'register' ? 'Crea il tuo account' : 'Accedi a Famiglia'}
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                {mode === 'register' ? 'Registrati per creare il tuo nucleo familiare.' : 'Riprendi da dove avevi lasciato.'}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              {mode === 'register' ? <Users className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'register' && (
              <Field icon={<Users />} label="Nome e cognome" value={displayName} onChange={setDisplayName} placeholder="es. Marco Rossi" autoComplete="name" />
            )}
            <Field icon={<Mail />} label="Email" type="email" value={email} onChange={setEmail} placeholder="nome@email.it" autoComplete="email" />
            <Field icon={<KeyRound />} label="Password" type="password" value={password} onChange={setPassword} placeholder="Almeno 6 caratteri" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
            {error && <ErrorBox>{error}</ErrorBox>}
            {notice && <NoticeBox>{notice}</NoticeBox>}
            <button disabled={busy} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {mode === 'register' ? 'Registrati' : 'Accedi'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6 text-[11px] text-stone-400">
            <div className="h-px bg-stone-200 flex-1" /> oppure <div className="h-px bg-stone-200 flex-1" />
          </div>

          <button
            type="button"
            onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); setNotice(''); }}
            className="w-full h-11 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-sm"
          >
            {mode === 'register' ? 'Ho già un account · Accedi' : 'Sono nuovo · Crea un account'}
          </button>

          {inviteToken && (
            <div className="mt-5 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex gap-2.5">
              <Link2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              Dopo l’accesso userai automaticamente il link d’invito per entrare nella famiglia.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const BrandPanel = () => (
  <section className="rounded-[2rem] bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white p-8 sm:p-10 shadow-xl shadow-indigo-200/50 relative overflow-hidden">
    <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10" />
    <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full bg-white/5" />
    <div className="relative h-full flex flex-col">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
          <Heart className="w-6 h-6 fill-white/10" />
        </div>
        <span className="text-xl font-extrabold tracking-tight">Famiglia</span>
      </div>
      <div className="mt-12">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-100">Il tuo spazio condiviso</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mt-3">
          Tutta la famiglia,<br />in un unico posto.
        </h2>
        <p className="text-sm text-indigo-100 leading-6 mt-4 max-w-md">
          Organizza le finanze, condividi le attività e tieni tutto sincronizzato con le persone che ami.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mt-auto pt-10">
        <Feature icon={<Users />} title="Nucleo" text="Crea o unisciti" />
        <Feature icon={<Link2 />} title="Inviti" text="Condividi un link" />
        <Feature icon={<CheckCircle2 />} title="Sync" text="Dati condivisi" />
      </div>
    </div>
  </section>
);

const Feature = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10">
    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-2">{icon}</div>
    <div className="text-xs font-bold">{title}</div>
    <div className="text-[11px] text-indigo-100 mt-0.5">{text}</div>
  </div>
);

const Field = ({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) => (
  <label className="block">
    <span className="block text-xs font-bold text-stone-700 mb-1.5">{label}</span>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-200 bg-stone-50/70 text-sm text-stone-900 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
      />
    </div>
  </label>
);

const ErrorBox = ({ children }: { children: React.ReactNode }) => (
  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">{children}</div>
);

const NoticeBox = ({ children }: { children: React.ReactNode }) => (
  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">{children}</div>
);
