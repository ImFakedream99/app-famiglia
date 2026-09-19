export type Role = 'parent' | 'teen';

export interface FamilyMember {
  id: string;
  name: string;
  role: Role;
  avatarColor: string;
  birthDate: string; // YYYY-MM-DD
  allowanceBalance?: number; // for teens
  email?: string;
  highContrastDarkMode?: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  allocated: number;
  spent: number;
  isSharedWithTeens: boolean; // configurable visibility for teens
  color: string;
}

export interface SpecialBudget {
  id: string;
  title: string;
  targetAmount: number;
  currentSpent: number;
  startDate: string;
  endDate: string;
  notes: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  memberId: string;
  memberName: string;
  memberRole: Role;
  date: string;
  note: string;
  scope: 'family' | 'personal';
  receiptUrl?: string;
  receiptName?: string;
}

export interface AllowanceConfig {
  teenId: string;
  amount: number;
  frequency: 'weekly' | 'monthly';
  payoutDay: number; // day of week (1=Mon) or day of month (1-31)
  autoSavePercentage: number; // % to automatically allocate to savings goal
  isPaused: boolean;
  nextPayoutDate: string;
  lastPayoutDate?: string;
}

export interface AllowanceRecord {
  id: string;
  teenId: string;
  amount: number;
  date: string;
  type: 'regular' | 'advance' | 'chore_bonus' | 'extra_fund';
  note: string;
}

export interface Chore {
  id: string;
  teenId: string;
  title: string;
  description?: string;
  reward: number;
  frequency: 'one-time' | 'daily' | 'weekly';
  status: 'pending' | 'completed_by_teen' | 'approved_and_paid';
  completedAt?: string;
  approvedAt?: string;
}

export interface ExtraFundRequest {
  id: string;
  teenId: string;
  teenName: string;
  requestedAmount: number;
  approvedAmount?: number;
  reason: string;
  status: 'pending' | 'approved' | 'modified' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  parentNote?: string;
}

export interface SavingsGoal {
  id: string;
  memberId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
  autoAllocatePercentage?: number;
}

export interface NotificationItem {
  id: string;
  targetRole: 'all' | 'parent' | 'teen';
  targetMemberId?: string;
  title: string;
  message: string;
  type: 'budget_alert' | 'allowance_paid' | 'extra_request' | 'request_resolved' | 'chore_submitted' | 'chore_approved' | 'goal_reached' | 'info';
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
}

export interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export type ActiveTab = 
  | 'overview' 
  | 'budget' 
  | 'expenses' 
  | 'allowances' 
  | 'requests' 
  | 'savings' 
  | 'literacy' 
  | 'reports' 
  | 'family';
