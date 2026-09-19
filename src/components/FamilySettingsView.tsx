import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Bell,
  Sliders,
  Shield,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Lock,
  Mail,
  AlertTriangle,
  Moon,
  Sun,
  Smartphone,
  Eye,
  Link2,
  Copy,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { FamilyMember, NotificationSetting } from '../types';
import { calculateAge, formatCurrency } from '../utils/formatters';
import { PWAInstallButton } from './PWAInstallButton';
import { createFamilyInvite } from '../lib/familyAuth';

export const FamilySettingsView: React.FC = () => {
  const {
    currentMember,
    members,
    addFamilyMember,
    resetToDefaults,
    isHighContrastDark,
    toggleHighContrastDark,
    familyId,
    familyName,
    familyRole,
  } = useFamily();

  const isParent = familyRole === 'owner';

  // Notification Rules State (PRD 6.7)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'n1',
      title: 'Avviso di avvicinamento al limite budget (80%)',
      description: 'Ricevi una notifica push quando una categoria di spesa raggiunge l’80% del tetto mensile.',
      enabled: true,
    },
    {
      id: 'n2',
      title: 'Alert superamento budget (100%)',
      description: 'Avviso immediato quando le spese di una categoria superano il budget pianificato.',
      enabled: true,
    },
    {
      id: 'n3',
      title: 'Notifica per ogni nuova spesa registrata',
      description: 'Tracciamento condiviso immediato quando un familiare annota un acquisto o scontrino.',
      enabled: true,
    },
    {
      id: 'n4',
      title: 'Richieste fondi straordinari dai ragazzi',
      description: 'Notifica tempestiva quando Sofia o Leonardo richiedono denaro extra con motivazione.',
      enabled: true,
    },
    {
      id: 'n5',
      title: 'Completamento faccende e compiti',
      description: 'Avviso ai genitori quando un figlio completa una faccenda domestica per approvare la ricompensa.',
      enabled: true,
    },
  ]);

  // New member modal
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'parent' | 'teen'>('teen');
  const [birthDate, setBirthDate] = useState('2012-05-10');
  const [initialBalance, setInitialBalance] = useState('20.00');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const handleCreateInvite = async () => {
    setInviteBusy(true);
    setInviteError('');
    try {
      const token = await createFamilyInvite(familyId);
      setInviteLink(`famiglia://invite/${token}`);
    } catch (e: any) {
      setInviteError(e?.message || 'Non è stato possibile creare il link di invito.');
    } finally {
      setInviteBusy(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1800);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const balance = parseFloat(initialBalance.replace(',', '.'));
    addFamilyMember({
      name: name.trim(),
      role,
      birthDate,
      avatarColor: role === 'parent' ? 'bg-indigo-600' : 'bg-amber-600',
      allowanceBalance: role === 'teen' ? (isNaN(balance) ? 0 : balance) : undefined,
    });

    setName('');
    setIsNewMemberModalOpen(false);
  };

  const handleToggleNotification = (setting: NotificationSetting) => {
    setNotificationSettings((prev) =>
      prev.map((s) => (s.id === setting.id ? { ...s, enabled: !s.enabled } : s))
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Configurazione & Privacy
            </span>
            <span className="text-[11px] bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-full">
              Nucleo Familiare
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">Impostazioni & Membri</h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Gestisci i profili di genitori e figli, i canali di notifica e le soglie di allerta budget.
          </p>
        </div>

        {isParent && (
          <button
            onClick={() => setIsNewMemberModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-center"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Aggiungi Membro</span>
          </button>
        )}
      </div>

      {/* Family invitation */}
      <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Invita nella famiglia</h2>
              <p className="text-xs text-stone-600 mt-1 max-w-2xl">
                Crea un link personale per far entrare altri membri in <strong>{familyName}</strong>. Il link scade dopo 7 giorni.
              </p>
            </div>
          </div>
          {isParent && (
            <button
              onClick={handleCreateInvite}
              disabled={inviteBusy}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 shrink-0"
            >
              {inviteBusy ? <span className="animate-pulse">Creo link…</span> : <><Link2 className="w-3.5 h-3.5" /> Crea link d’invito</>}
            </button>
          )}
        </div>
        {inviteLink && (
          <div className="mt-4 p-3 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row gap-2">
            <input readOnly value={inviteLink} className="flex-1 min-w-0 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-700" />
            <button onClick={handleCopyInvite} className="px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center justify-center gap-1.5">
              <Copy className="w-3.5 h-3.5" /> Copia link
            </button>
          </div>
        )}
        {inviteError && <p className="mt-3 text-xs font-medium text-rose-600">{inviteError}</p>}
        <p className="mt-3 text-[11px] text-stone-500">Chi riceve il link dovrà installare Famiglia, registrarsi o accedere e poi accettare l’invito.</p>
      </div>

      {/* Members Management Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">Membri della Famiglia</h2>
            <p className="text-xs text-stone-600">
              I genitori hanno accesso di amministrazione completo; i figli hanno vista trasparente e controllata.
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-500">{members.length} profili attivi</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {members.map((member) => {
            const age = calculateAge(member.birthDate);
            const isCurrent = member.id === currentMember.id;

            return (
              <div
                key={member.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isCurrent
                    ? 'border-indigo-200 bg-indigo-50/30 ring-1 ring-indigo-200'
                    : 'border-stone-200/80 bg-stone-50/50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${member.avatarColor} text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs`}
                >
                  {member.name.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-900 truncate">{member.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        member.role === 'parent'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {member.role === 'parent' ? 'Genitore (Admin)' : `Figlio (${age} anni)`}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    <span>Nato/a il {member.birthDate}</span>
                  </p>

                  {member.role === 'teen' && member.allowanceBalance !== undefined && (
                    <div className="mt-2 text-xs font-semibold text-stone-700">
                      Saldo paghetta: <span className="text-emerald-700 font-bold">{formatCurrency(member.allowanceBalance)}</span>
                    </div>
                  )}

                  {member.highContrastDarkMode && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                      <Moon className="w-2.5 h-2.5 text-indigo-400" /> Dark Mode
                    </span>
                  )}

                  {isCurrent && (
                    <span className="inline-block mt-2 text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md ml-1.5">
                      Profilo attualmente attivo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Preference: High-Contrast Dark Mode for Night-Time Mobile Use */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              isHighContrastDark 
                ? 'bg-zinc-800 text-indigo-300 border border-zinc-700' 
                : 'bg-indigo-50 text-indigo-600'
            }`}>
              {isHighContrastDark ? (
                <Moon className="w-5 h-5 animate-in spin-in-90 duration-200" />
              ) : (
                <Sun className="w-5 h-5 animate-in spin-in-90 duration-200" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-stone-900">
                  Tema ad Alto Contrasto (Uso Notturno)
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  <Smartphone className="w-3 h-3" /> Ideale su Mobile & OLED
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 max-w-2xl">
                Attiva una palette a sfondo scuro profondo (pitch-black) con testi nitidi ad alta leggibilità,
                progettata specificamente per ridurre l’affaticamento oculare e i riflessi quando si consulta l’applicazione la sera o a letto dallo smartphone.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            <span className="text-xs font-semibold text-stone-600">
              {isHighContrastDark ? 'Notturno Attivo' : 'Diurno'}
            </span>
            <button
              type="button"
              id="high-contrast-toggle"
              aria-label="Attiva o disattiva modalità notturna ad alto contrasto"
              onClick={() => toggleHighContrastDark(currentMember.id)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isHighContrastDark ? 'bg-indigo-600' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out text-stone-700 ${
                  isHighContrastDark ? 'translate-x-7 text-indigo-600' : 'translate-x-0'
                }`}
              >
                {isHighContrastDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
              </span>
            </button>
          </div>
        </div>

        {/* Profile Preference Info Banner */}
        <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-stone-700">
            <Eye className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Preferenza personalizzata associata a: <strong className="text-stone-900 font-semibold">{currentMember.name}</strong> ({currentMember.role === 'parent' ? 'Genitore' : 'Figlio'}).
            </span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-2">
            <span>Stato: {isHighContrastDark ? '🌙 Modalità Scura (Alto Contrasto)' : '☀️ Modalità Chiara'}</span>
          </div>
        </div>
      </div>

      {/* Notification Rules & Alert Thresholds (PRD 6.7) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Notifiche & Regole di Trasparenza
            </h2>
            <p className="text-xs text-stone-600">
              Attiva gli avvisi in tempo reale per monitorare sforamenti del budget e richieste dei ragazzi.
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Impostazioni aggiornate con successo!</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {notificationSettings.map((setting) => (
            <div
              key={setting.id}
              className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200/60 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-stone-900 block">{setting.title}</span>
                <span className="text-[11px] text-stone-500 block mt-0.5">{setting.description}</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleNotification(setting)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  setting.enabled ? 'bg-indigo-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    setting.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Download and Install PWA Section */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-stone-900 mb-1">Applicazione da Scaricare</h3>
        <p className="text-xs text-stone-500 mb-4">
          Installa Famiglia come Progressive Web App (PWA) sul tuo smartphone iOS o Android, oppure sul PC/Mac di casa.
        </p>
        <PWAInstallButton variant="settings" />
      </div>

      {/* Reset to Default Demo Data Card */}
      <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-stone-500" />
            <span>Ripristina Dati Dimostrativi</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Cancella le modifiche locali e ricarica i dati esemplificativi completi della Famiglia Rossi.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Vuoi davvero ripristinare i dati demo della Famiglia Rossi?')) {
              resetToDefaults();
            }
          }}
          className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors shrink-0"
        >
          Ripristina Demo
        </button>
      </div>

      {/* New Member Modal */}
      {isNewMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">Aggiungi Membro Famiglia</h3>
            <p className="text-xs text-stone-500 mb-4">
              Crea un nuovo profilo per un genitore o un figlio adolescente.
            </p>

            <form onSubmit={handleAddMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome e Cognome *
                </label>
                <input
                  type="text"
                  placeholder="es. Giulia Rossi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Ruolo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('parent')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      role === 'parent'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    Genitore (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teen')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      role === 'teen'
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    Figlio Adolescente
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Data di Nascita
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
              </div>

              {role === 'teen' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Saldo Paghetta Iniziale (€)
                  </label>
                  <input
                    type="text"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMemberModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Salva Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
