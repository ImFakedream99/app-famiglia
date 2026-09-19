import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FamilyMember,
  BudgetCategory,
  SpecialBudget,
  Expense,
  AllowanceConfig,
  AllowanceRecord,
  Chore,
  ExtraFundRequest,
  SavingsGoal,
  NotificationItem,
  ActiveTab,
} from '../types';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import {
  INITIAL_MEMBERS,
  INITIAL_CATEGORIES,
  INITIAL_SPECIAL_BUDGETS,
  INITIAL_EXPENSES,
  INITIAL_ALLOWANCES,
  INITIAL_ALLOWANCE_RECORDS,
  INITIAL_CHORES,
  INITIAL_REQUESTS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockInitialData';

interface FamilyContextType {
  currentMember: FamilyMember;
  members: FamilyMember[];
  categories: BudgetCategory[];
  specialBudgets: SpecialBudget[];
  expenses: Expense[];
  allowances: AllowanceConfig[];
  allowanceRecords: AllowanceRecord[];
  chores: Chore[];
  requests: ExtraFundRequest[];
  savingsGoals: SavingsGoal[];
  notifications: NotificationItem[];
  activeTab: ActiveTab;
  familyInviteCode: string;
  familyId: string;
  familyName: string;
  familyRole: 'owner' | 'member';
  setActiveTab: (tab: ActiveTab) => void;
  switchMember: (memberId: string) => void;
  addExpense: (expenseData: {
    amount: number;
    category: string;
    note: string;
    scope: 'family' | 'personal';
    memberId?: string;
    date?: string;
    receiptName?: string;
  }) => void;
  deleteExpense: (id: string) => void;
  updateCategoryBudget: (id: string, allocated: number, isShared: boolean) => void;
  addCategory: (cat: Omit<BudgetCategory, 'id' | 'spent'>) => void;
  addSpecialBudget: (sb: Omit<SpecialBudget, 'id' | 'currentSpent'>) => void;
  updateSpecialBudget: (id: string, targetAmount: number, currentSpent: number) => void;
  updateAllowanceConfig: (cfg: AllowanceConfig) => void;
  triggerAllowancePayout: (teenId: string, note?: string) => void;
  addChore: (chore: Omit<Chore, 'id' | 'status'>) => void;
  markChoreCompleted: (choreId: string) => void;
  approveChore: (choreId: string) => void;
  rejectChore: (choreId: string) => void;
  submitExtraFundRequest: (amount: number, reason: string) => void;
  resolveExtraFundRequest: (
    requestId: string,
    status: 'approved' | 'modified' | 'rejected',
    approvedAmount?: number,
    parentNote?: string
  ) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDefaults: () => void;
  isHighContrastDark: boolean;
  toggleHighContrastDark: (memberId?: string) => void;
  setHighContrastDark: (enabled: boolean, memberId?: string) => void;
  isSupabaseConfigured: boolean;
  isSupabaseConnected: boolean;
  supabaseLastSyncedAt: string | null;
  syncWithSupabaseNow: () => Promise<{ success: boolean; message: string }>;
  pullFromSupabaseNow: () => Promise<{ success: boolean; message: string }>;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

const STORAGE_KEY = 'famiglia_gestione_data_v1';
const FRESH_FAMILY_KEY = 'famiglia_new_family_reset';

// A newly created family gets the complete app UI with an intentionally empty
// dataset. The owner is the only initial app member; everything else is added
// by the family from the existing screens.
const createFreshFamilyMember = (familyId: string, displayName: string): FamilyMember => ({
  id: `member_${familyId}`,
  name: displayName || 'Proprietario',
  role: 'parent',
  avatarColor: 'bg-indigo-600',
});

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load the same application shell for every family, but start newly created
  // families from a completely empty dataset instead of the demo snapshot.
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const familyId = localStorage.getItem('famiglia_family_id') || 'local-demo-family';
  const familyName = localStorage.getItem('famiglia_family_name') || 'Famiglia';
  const authenticatedDisplayName = localStorage.getItem('famiglia_display_name') || '';
  const familyRole = (localStorage.getItem('famiglia_member_role') === 'member' ? 'member' : 'owner') as 'owner' | 'member';
  const isFreshFamily = localStorage.getItem(FRESH_FAMILY_KEY) === familyId;

  const emptyMembers = isFreshFamily
    ? [createFreshFamilyMember(familyId, authenticatedDisplayName)]
    : INITIAL_MEMBERS.map((member, index) =>
        index === 0 && authenticatedDisplayName
          ? { ...member, name: authenticatedDisplayName, role: 'parent', avatarColor: 'bg-indigo-600' }
          : member
      );

  const [currentMemberId, setCurrentMemberId] = useState<string>(() =>
    isFreshFamily ? emptyMembers[0].id : 'm1'
  );
  const [members, setMembers] = useState<FamilyMember[]>(emptyMembers);
  const [categories, setCategories] = useState<BudgetCategory[]>(isFreshFamily ? [] : INITIAL_CATEGORIES);
  const [specialBudgets, setSpecialBudgets] = useState<SpecialBudget[]>(isFreshFamily ? [] : INITIAL_SPECIAL_BUDGETS);
  const [expenses, setExpenses] = useState<Expense[]>(isFreshFamily ? [] : INITIAL_EXPENSES);
  const [allowances, setAllowances] = useState<AllowanceConfig[]>(isFreshFamily ? [] : INITIAL_ALLOWANCES);
  const [allowanceRecords, setAllowanceRecords] = useState<AllowanceRecord[]>(isFreshFamily ? [] : INITIAL_ALLOWANCE_RECORDS);
  const [chores, setChores] = useState<Chore[]>(isFreshFamily ? [] : INITIAL_CHORES);
  const [requests, setRequests] = useState<ExtraFundRequest[]>(isFreshFamily ? [] : INITIAL_REQUESTS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(isFreshFamily ? [] : INITIAL_SAVINGS_GOALS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(isFreshFamily ? [] : INITIAL_NOTIFICATIONS);
  const familyInviteCode = familyId;

  // High-contrast dark mode preference for night-time mobile usage
  const [highContrastDark, setHighContrastDarkState] = useState<boolean>(() => {
    return localStorage.getItem('famiglia_high_contrast_dark') === 'true';
  });

  // Synchronize document classes & theme attribute for dark mode
  useEffect(() => {
    if (highContrastDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('famiglia_high_contrast_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('famiglia_high_contrast_dark', 'false');
    }
  }, [highContrastDark]);

  // Existing families keep their local state. A freshly created family must
  // never hydrate the previous browser/demo snapshot.
  useEffect(() => {
    if (isFreshFamily) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('famiglia_supabase_last_sync');
      localStorage.removeItem(FRESH_FAMILY_KEY);
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.members) setMembers(parsed.members);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.specialBudgets) setSpecialBudgets(parsed.specialBudgets);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.allowances) setAllowances(parsed.allowances);
        if (parsed.allowanceRecords) setAllowanceRecords(parsed.allowanceRecords);
        if (parsed.chores) setChores(parsed.chores);
        if (parsed.requests) setRequests(parsed.requests);
        if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.currentMemberId) setCurrentMemberId(parsed.currentMemberId);
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
  }, [isFreshFamily]);

  // Save to localStorage when state updates
  useEffect(() => {
    try {
      const stateToSave = {
        members,
        categories,
        specialBudgets,
        expenses,
        allowances,
        allowanceRecords,
        chores,
        requests,
        savingsGoals,
        notifications,
        currentMemberId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to persist to localStorage:', e);
    }
  }, [
    members,
    categories,
    specialBudgets,
    expenses,
    allowances,
    allowanceRecords,
    chores,
    requests,
    savingsGoals,
    notifications,
    currentMemberId,
  ]);

  // Modal state for Supabase Database configuration
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Restore state handler when receiving cloud data from Supabase
  const restoreStateFromCloud = useCallback((stateData: any) => {
    if (!stateData) return;
    try {
      if (Array.isArray(stateData.members) && stateData.members.length > 0) setMembers(stateData.members);
      if (Array.isArray(stateData.categories)) setCategories(stateData.categories);
      if (Array.isArray(stateData.specialBudgets)) setSpecialBudgets(stateData.specialBudgets);
      if (Array.isArray(stateData.expenses)) setExpenses(stateData.expenses);
      if (Array.isArray(stateData.allowances)) setAllowances(stateData.allowances);
      if (Array.isArray(stateData.allowanceRecords)) setAllowanceRecords(stateData.allowanceRecords);
      if (Array.isArray(stateData.chores)) setChores(stateData.chores);
      if (Array.isArray(stateData.requests)) setRequests(stateData.requests);
      if (Array.isArray(stateData.savingsGoals)) setSavingsGoals(stateData.savingsGoals);
      if (Array.isArray(stateData.notifications)) setNotifications(stateData.notifications);
    } catch (err) {
      console.error('Failed to restore state from Supabase:', err);
    }
  }, []);

  const stateSnapshot = useMemo(() => ({
    members,
    categories,
    specialBudgets,
    expenses,
    allowances,
    allowanceRecords,
    chores,
    requests,
    savingsGoals,
    notifications,
    currentMemberId,
  }), [
    members,
    categories,
    specialBudgets,
    expenses,
    allowances,
    allowanceRecords,
    chores,
    requests,
    savingsGoals,
    notifications,
    currentMemberId,
  ]);

  const {
    isConfigured: isSupabaseConfigured,
    isConnected: isSupabaseConnected,
    lastSyncedAt: supabaseLastSyncedAt,
    syncNow: syncWithSupabaseNow,
    pullFromCloud: pullFromSupabaseNow,
  } = useSupabaseSync(familyInviteCode, stateSnapshot, restoreStateFromCloud);

  // Auto-sync debounced changes to Supabase when connected
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!isSupabaseConfigured || !isSupabaseConnected) return;

    const timer = setTimeout(() => {
      syncWithSupabaseNow().catch(() => {});
    }, 2000);

    return () => clearTimeout(timer);
  }, [stateSnapshot, isSupabaseConfigured, isSupabaseConnected, syncWithSupabaseNow]);

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];

  const switchMember = (id: string) => {
    setCurrentMemberId(id);
    const target = members.find((m) => m.id === id);
    if (target && target.highContrastDarkMode !== undefined) {
      setHighContrastDarkState(target.highContrastDarkMode);
    }
  };

  const toggleHighContrastDark = (targetMemberId?: string) => {
    const mid = targetMemberId || currentMemberId;
    const nextVal = !highContrastDark;
    setHighContrastDarkState(nextVal);
    setMembers((prev) =>
      prev.map((m) => (m.id === mid ? { ...m, highContrastDarkMode: nextVal } : m))
    );
  };

  const setHighContrastDark = (enabled: boolean, targetMemberId?: string) => {
    const mid = targetMemberId || currentMemberId;
    setHighContrastDarkState(enabled);
    setMembers((prev) =>
      prev.map((m) => (m.id === mid ? { ...m, highContrastDarkMode: enabled } : m))
    );
  };

  const addExpense = (expenseData: {
    amount: number;
    category: string;
    note: string;
    scope: 'family' | 'personal';
    memberId?: string;
    date?: string;
    receiptName?: string;
  }) => {
    const actingMember = expenseData.memberId 
      ? members.find(m => m.id === expenseData.memberId) || currentMember
      : currentMember;

    const newExpense: Expense = {
      id: 'e_' + Date.now(),
      amount: expenseData.amount,
      category: expenseData.category,
      note: expenseData.note,
      scope: expenseData.scope,
      memberId: actingMember.id,
      memberName: actingMember.name,
      memberRole: actingMember.role,
      date: expenseData.date || new Date().toISOString(),
      receiptName: expenseData.receiptName,
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Update category spent
    setCategories((prev) =>
      prev.map((c) => {
        if (c.name === expenseData.category) {
          const newSpent = c.spent + expenseData.amount;
          // Check if exceeds threshold
          if (newSpent >= c.allocated * 0.8 && c.spent < c.allocated * 0.8) {
            setNotifications((n) => [
              {
                id: 'n_' + Date.now(),
                targetRole: 'parent',
                title: `Attenzione Budget: ${c.name}`,
                message: `La categoria ${c.name} ha superato l'80% del budget (${newSpent.toFixed(2)} € / ${c.allocated.toFixed(2)} €).`,
                type: 'budget_alert',
                timestamp: new Date().toISOString(),
                isRead: false,
                linkTab: 'budget',
              },
              ...n,
            ]);
          }
          return { ...c, spent: newSpent };
        }
        return c;
      })
    );

    // If it's a teen personal expense, subtract from allowance balance
    if (actingMember.role === 'teen' && expenseData.scope === 'personal') {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === actingMember.id) {
            const currentBal = m.allowanceBalance || 0;
            return {
              ...m,
              allowanceBalance: Math.max(0, +(currentBal - expenseData.amount).toFixed(2)),
            };
          }
          return m;
        })
      );
    }
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;

    setExpenses((prev) => prev.filter((e) => e.id !== id));

    // Rollback category spent
    setCategories((prev) =>
      prev.map((c) => {
        if (c.name === target.category) {
          return { ...c, spent: Math.max(0, +(c.spent - target.amount).toFixed(2)) };
        }
        return c;
      })
    );

    // If teen personal expense, restore allowance
    if (target.memberRole === 'teen' && target.scope === 'personal') {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === target.memberId) {
            return {
              ...m,
              allowanceBalance: +((m.allowanceBalance || 0) + target.amount).toFixed(2),
            };
          }
          return m;
        })
      );
    }
  };

  const updateCategoryBudget = (id: string, allocated: number, isShared: boolean) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, allocated, isSharedWithTeens: isShared } : c))
    );
  };

  const addCategory = (cat: Omit<BudgetCategory, 'id' | 'spent'>) => {
    const newCat: BudgetCategory = {
      ...cat,
      id: 'c_' + Date.now(),
      spent: 0,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const addSpecialBudget = (sb: Omit<SpecialBudget, 'id' | 'currentSpent'>) => {
    const newSb: SpecialBudget = {
      ...sb,
      id: 'sb_' + Date.now(),
      currentSpent: 0,
    };
    setSpecialBudgets((prev) => [...prev, newSb]);
  };

  const updateSpecialBudget = (id: string, targetAmount: number, currentSpent: number) => {
    setSpecialBudgets((prev) =>
      prev.map((sb) => (sb.id === id ? { ...sb, targetAmount, currentSpent } : sb))
    );
  };

  const updateAllowanceConfig = (cfg: AllowanceConfig) => {
    setAllowances((prev) => {
      const exists = prev.some((a) => a.teenId === cfg.teenId);
      if (exists) {
        return prev.map((a) => (a.teenId === cfg.teenId ? cfg : a));
      }
      return [...prev, cfg];
    });
  };

  const triggerAllowancePayout = (teenId: string, note = 'Erogazione paghetta programmata') => {
    const config = allowances.find((a) => a.teenId === teenId);
    const teen = members.find((m) => m.id === teenId);
    if (!config || !teen) return;

    const payoutAmount = config.amount;
    const savePercent = config.autoSavePercentage || 0;
    const saveAmount = +((payoutAmount * savePercent) / 100).toFixed(2);
    const spendableAmount = +(payoutAmount - saveAmount).toFixed(2);

    // Update teen's balance
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === teenId) {
          return {
            ...m,
            allowanceBalance: +((m.allowanceBalance || 0) + spendableAmount).toFixed(2),
          };
        }
        return m;
      })
    );

    // Route auto-save portion to teen's first savings goal if exists
    if (saveAmount > 0) {
      setSavingsGoals((prev) => {
        const goalIndex = prev.findIndex((g) => g.memberId === teenId);
        if (goalIndex >= 0) {
          const updated = [...prev];
          updated[goalIndex] = {
            ...updated[goalIndex],
            currentAmount: +(updated[goalIndex].currentAmount + saveAmount).toFixed(2),
          };
          return updated;
        }
        return prev;
      });
    }

    // Add allowance record
    const newRecord: AllowanceRecord = {
      id: 'ar_' + Date.now(),
      teenId,
      amount: payoutAmount,
      date: new Date().toISOString(),
      type: 'regular',
      note: saveAmount > 0 ? `${note} (${saveAmount}€ accantonati nel salvadanaio)` : note,
    };
    setAllowanceRecords((prev) => [newRecord, ...prev]);

    // Update next payout date (+7 days or +30 days)
    const nextDate = new Date();
    if (config.frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    setAllowances((prev) =>
      prev.map((a) =>
        a.teenId === teenId
          ? {
              ...a,
              lastPayoutDate: new Date().toISOString().split('T')[0],
              nextPayoutDate: nextDate.toISOString().split('T')[0],
            }
          : a
      )
    );

    // Send notifications to parent and teen
    setNotifications((prev) => [
      {
        id: 'n_' + Date.now(),
        targetRole: 'teen',
        targetMemberId: teenId,
        title: 'Paghetta Ricevuta! 💶',
        message: `Ti sono stati accreditati ${spendableAmount.toFixed(2)} €${saveAmount > 0 ? ` (e ${saveAmount.toFixed(2)} € accantonati per i tuoi risparmi)` : ''}.`,
        type: 'allowance_paid',
        timestamp: new Date().toISOString(),
        isRead: false,
        linkTab: 'allowances',
      },
      {
        id: 'n_' + (Date.now() + 1),
        targetRole: 'parent',
        title: `Paghetta Erogata a ${teen.name}`,
        message: `Erogati ${payoutAmount.toFixed(2)} € a ${teen.name}.`,
        type: 'allowance_paid',
        timestamp: new Date().toISOString(),
        isRead: false,
        linkTab: 'allowances',
      },
      ...prev,
    ]);
  };

  const addChore = (chore: Omit<Chore, 'id' | 'status'>) => {
    const newChore: Chore = {
      ...chore,
      id: 'ch_' + Date.now(),
      status: 'pending',
    };
    setChores((prev) => [newChore, ...prev]);
  };

  const markChoreCompleted = (choreId: string) => {
    const chore = chores.find((c) => c.id === choreId);
    if (!chore) return;
    const teen = members.find((m) => m.id === chore.teenId);

    setChores((prev) =>
      prev.map((c) =>
        c.id === choreId
          ? { ...c, status: 'completed_by_teen', completedAt: new Date().toISOString() }
          : c
      )
    );

    // Notify parent
    setNotifications((prev) => [
      {
        id: 'n_' + Date.now(),
        targetRole: 'parent',
        title: `Faccenda completata: ${chore.title}`,
        message: `${teen ? teen.name : 'Il figlio'} ha completato la faccenda "${chore.title}" (+${chore.reward.toFixed(2)} €) ed è in attesa di approvazione.`,
        type: 'chore_submitted',
        timestamp: new Date().toISOString(),
        isRead: false,
        linkTab: 'allowances',
      },
      ...prev,
    ]);
  };

  const approveChore = (choreId: string) => {
    const chore = chores.find((c) => c.id === choreId);
    if (!chore) return;
    const teen = members.find((m) => m.id === chore.teenId);

    setChores((prev) =>
      prev.map((c) =>
        c.id === choreId
          ? { ...c, status: 'approved_and_paid', approvedAt: new Date().toISOString() }
          : c
      )
    );

    // Reward teen balance
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === chore.teenId) {
          return {
            ...m,
            allowanceBalance: +((m.allowanceBalance || 0) + chore.reward).toFixed(2),
          };
        }
        return m;
      })
    );

    // Add allowance history record
    setAllowanceRecords((prev) => [
      {
        id: 'ar_' + Date.now(),
        teenId: chore.teenId,
        amount: chore.reward,
        date: new Date().toISOString(),
        type: 'chore_bonus',
        note: `Bonus completamento faccenda: ${chore.title}`,
      },
      ...prev,
    ]);

    // Notify teen
    setNotifications((prev) => [
      {
        id: 'n_' + Date.now(),
        targetRole: 'teen',
        targetMemberId: chore.teenId,
        title: `Faccenda Approvata! 🌟`,
        message: `Complimenti! Papà/Mamma ha approvato "${chore.title}". Ricevi un bonus di +${chore.reward.toFixed(2)} € sul tuo saldo.`,
        type: 'chore_approved',
        timestamp: new Date().toISOString(),
        isRead: false,
        linkTab: 'allowances',
      },
      ...prev,
    ]);
  };

  const rejectChore = (choreId: string) => {
    setChores((prev) =>
      prev.map((c) => (c.id === choreId ? { ...c, status: 'pending' } : c))
    );
  };

  const submitExtraFundRequest = (amount: number, reason: string) => {
    const teen = currentMember;
    const newReq: ExtraFundRequest = {
      id: 'req_' + Date.now(),
      teenId: teen.id,
      teenName: teen.name,
      requestedAmount: amount,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [newReq, ...prev]);

    // Notify parents
    setNotifications((prev) => [
      {
        id: 'n_' + Date.now(),
        targetRole: 'parent',
        title: `Richiesta Fondi Extra da ${teen.name}`,
        message: `${teen.name} richiede ${amount.toFixed(2)} € per: "${reason}".`,
        type: 'extra_request',
        timestamp: new Date().toISOString(),
        isRead: false,
        linkTab: 'requests',
      },
      ...prev,
    ]);
  };

  const resolveExtraFundRequest = (
    requestId: string,
    status: 'approved' | 'modified' | 'rejected',
    approvedAmount?: number,
    parentNote?: string
  ) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const finalAmount = status === 'rejected' ? 0 : (approvedAmount !== undefined ? approvedAmount : req.requestedAmount);

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              approvedAmount: finalAmount,
              parentNote,
              resolvedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // If approved or modified, credit to teen
    if (status !== 'rejected' && finalAmount > 0) {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === req.teenId) {
            return {
              ...m,
              allowanceBalance: +((m.allowanceBalance || 0) + finalAmount).toFixed(2),
            };
          }
          return m;
        })
      );

      // Record in allowance history
      setAllowanceRecords((prev) => [
        {
          id: 'ar_' + Date.now(),
          teenId: req.teenId,
          amount: finalAmount,
          date: new Date().toISOString(),
          type: 'extra_fund',
          note: `Fondi extra: ${req.reason}${parentNote ? ` (${parentNote})` : ''}`,
        },
        ...prev,
      ]);
    }

    // Notify teen
    const statusMsg =
      status === 'approved'
        ? `Richiesta approvata per l'intero importo di ${finalAmount.toFixed(2)} €!`
        : status === 'modified'
        ? `Richiesta approvata con modifica a ${finalAmount.toFixed(2)} €. Nota: ${parentNote || 'Nessuna'}`
        : `Richiesta non approvata. Nota: ${parentNote || 'Nessuna motivazione specificata'}`;

    setNotifications((prev) => [
      {
        id: 'n_' + Date.now(),
        targetRole: 'teen',
        targetMemberId: req.teenId,
        title: `Esito Richiesta Fondi: ${status === 'rejected' ? 'Rifiutata' : 'Approvata'}`,
        message: statusMsg,
        type: 'request_resolved',
        timestamp: new Date().toISOString(),
        isRead: false,
        linkTab: 'requests',
      },
      ...prev,
    ]);
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'g_' + Date.now(),
      currentAmount: 0,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const contributeToGoal = (goalId: string, amount: number) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const newAmount = +(goal.currentAmount + amount).toFixed(2);
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: newAmount } : g))
    );

    // If goal owner is a teen, deduct from allowance balance if paid by teen
    if (currentMember.role === 'teen' && currentMember.id === goal.memberId) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === currentMember.id
            ? {
                ...m,
                allowanceBalance: Math.max(0, +((m.allowanceBalance || 0) - amount).toFixed(2)),
              }
            : m
        )
      );
    }

    // If goal reached 100%, send notification
    if (newAmount >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
      setNotifications((prev) => [
        {
          id: 'n_' + Date.now(),
          targetRole: 'all',
          title: `Obiettivo Raggiunto! 🎉`,
          message: `L'obiettivo "${goal.title}" ha raggiunto il traguardo di ${goal.targetAmount.toFixed(2)} €!`,
          type: 'goal_reached',
          timestamp: new Date().toISOString(),
          isRead: false,
          linkTab: 'savings',
        },
        ...prev,
      ]);
    }
  };

  const addFamilyMember = (newMemberData: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...newMemberData,
      id: 'm_' + Date.now(),
      allowanceBalance: newMemberData.role === 'teen' ? 0 : undefined,
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMembers(INITIAL_MEMBERS);
    setCategories(INITIAL_CATEGORIES);
    setSpecialBudgets(INITIAL_SPECIAL_BUDGETS);
    setExpenses(INITIAL_EXPENSES);
    setAllowances(INITIAL_ALLOWANCES);
    setAllowanceRecords(INITIAL_ALLOWANCE_RECORDS);
    setChores(INITIAL_CHORES);
    setRequests(INITIAL_REQUESTS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentMemberId('m1');
    setActiveTab('overview');
  };

  return (
    <FamilyContext.Provider
      value={{
        currentMember,
        members,
        categories,
        specialBudgets,
        expenses,
        allowances,
        allowanceRecords,
        chores,
        requests,
        savingsGoals,
        notifications,
        activeTab,
        familyInviteCode,
        familyId,
        familyName,
        familyRole,
        setActiveTab,
        switchMember,
        addExpense,
        deleteExpense,
        updateCategoryBudget,
        addCategory,
        addSpecialBudget,
        updateSpecialBudget,
        updateAllowanceConfig,
        triggerAllowancePayout,
        addChore,
        markChoreCompleted,
        approveChore,
        rejectChore,
        submitExtraFundRequest,
        resolveExtraFundRequest,
        addSavingsGoal,
        contributeToGoal,
        addFamilyMember,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDefaults,
        isHighContrastDark: highContrastDark,
        toggleHighContrastDark,
        setHighContrastDark,
        isSupabaseConfigured,
        isSupabaseConnected,
        supabaseLastSyncedAt,
        syncWithSupabaseNow,
        pullFromSupabaseNow,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};
