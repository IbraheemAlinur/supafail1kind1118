import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Transaction {
  id: string;
  sender_id: string;
  recipient_id: string;
  amount: number;
  type: 'earned' | 'spent' | 'transfer';
  category: 'ask' | 'offer' | 'event' | 'content' | 'daily' | 'transfer';
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  escrow_amount?: number;
  escrow_released_at?: string;
  metadata?: {
    post_id?: string;
    event_id?: string;
    community_id?: string;
    completion_time?: string;
    rating?: number;
    feedback?: string;
  };
}

interface KiPointsStats {
  monthlyPoints: number;
  quarterlyPoints: number;
  yearlyPoints: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: Date;
}

interface KiPointsState {
  transactions: Transaction[];
  stats: KiPointsStats;
  addTransaction: (transaction: Transaction) => void;
  updateStats: (stats: KiPointsStats) => void;
  clearTransactions: () => void;
}

export const useKiPointsStore = create<KiPointsState>()(
  devtools(
    (set) => ({
      transactions: [],
      stats: {
        monthlyPoints: 0,
        quarterlyPoints: 0,
        yearlyPoints: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: new Date()
      },
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
          stats: {
            ...state.stats,
            lastUpdated: new Date(),
            totalEarned: transaction.type === 'earned' 
              ? state.stats.totalEarned + transaction.amount 
              : state.stats.totalEarned,
            totalSpent: transaction.type === 'spent' 
              ? state.stats.totalSpent + transaction.amount 
              : state.stats.totalSpent,
            monthlyPoints: calculateMonthlyPoints([transaction, ...state.transactions]),
            quarterlyPoints: calculateQuarterlyPoints([transaction, ...state.transactions]),
            yearlyPoints: calculateYearlyPoints([transaction, ...state.transactions])
          }
        })),
      updateStats: (stats) =>
        set(() => ({
          stats
        })),
      clearTransactions: () =>
        set(() => ({
          transactions: []
        }))
    }),
    { name: 'ki-points-store' }
  )
);

// Helper functions to calculate points for different time periods
function calculateMonthlyPoints(transactions: Transaction[]): number {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return transactions
    .filter(t => new Date(t.created_at) >= startOfMonth)
    .reduce((total, t) => {
      if (t.type === 'earned') return total + t.amount;
      if (t.type === 'spent') return total - t.amount;
      return total;
    }, 0);
}

function calculateQuarterlyPoints(transactions: Transaction[]): number {
  const startOfQuarter = new Date();
  startOfQuarter.setMonth(Math.floor(startOfQuarter.getMonth() / 3) * 3, 1);
  startOfQuarter.setHours(0, 0, 0, 0);

  return transactions
    .filter(t => new Date(t.created_at) >= startOfQuarter)
    .reduce((total, t) => {
      if (t.type === 'earned') return total + t.amount;
      if (t.type === 'spent') return total - t.amount;
      return total;
    }, 0);
}

function calculateYearlyPoints(transactions: Transaction[]): number {
  const startOfYear = new Date();
  startOfYear.setMonth(0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  return transactions
    .filter(t => new Date(t.created_at) >= startOfYear)
    .reduce((total, t) => {
      if (t.type === 'earned') return total + t.amount;
      if (t.type === 'spent') return total - t.amount;
      return total;
    }, 0);
}