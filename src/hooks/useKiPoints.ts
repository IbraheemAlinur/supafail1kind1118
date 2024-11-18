import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useMemoizedCallback } from './useMemoizedCallback';
import { supabase } from '../lib/supabase/client';
import type { Database } from '../lib/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface KiPointsStats {
  monthlyPoints: number;
  quarterlyPoints: number;
  yearlyPoints: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: Date;
}

export function useKiPoints() {
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<KiPointsStats>({
    monthlyPoints: 0,
    quarterlyPoints: 0,
    yearlyPoints: 0,
    totalEarned: 0,
    totalSpent: 0,
    lastUpdated: new Date()
  });

  const user = useStore(state => state.user);
  const updateUserPoints = useStore(state => state.updateUserPoints);

  const fetchStats = useMemoizedCallback(async () => {
    if (!user) return;

    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const startOfQuarter = new Date();
      startOfQuarter.setMonth(Math.floor(startOfQuarter.getMonth() / 3) * 3, 1);
      startOfQuarter.setHours(0, 0, 0, 0);

      const startOfYear = new Date();
      startOfYear.setMonth(0, 1);
      startOfYear.setHours(0, 0, 0, 0);

      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .gte('created_at', startOfYear.toISOString());

      if (transactionError) throw transactionError;

      const stats = transactions?.reduce((acc, transaction) => {
        const amount = transaction.amount;
        const isEarned = transaction.type === 'earned';
        const date = new Date(transaction.created_at);

        if (isEarned) {
          acc.totalEarned += amount;
        } else {
          acc.totalSpent += amount;
        }

        if (date >= startOfMonth) {
          acc.monthlyPoints += isEarned ? amount : -amount;
        }
        if (date >= startOfQuarter) {
          acc.quarterlyPoints += isEarned ? amount : -amount;
        }
        if (date >= startOfYear) {
          acc.yearlyPoints += isEarned ? amount : -amount;
        }

        return acc;
      }, {
        monthlyPoints: 0,
        quarterlyPoints: 0,
        yearlyPoints: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: new Date()
      });

      setStats(stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch Ki Points stats';
      setError(message);
      console.error('Error fetching stats:', err);
    }
  }, [user]);

  const transferPoints = useMemoizedCallback(async (
    recipientId: string,
    amount: number,
    description: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) throw new Error('Must be logged in to transfer points');
    setError(null);

    try {
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          sender_id: user.id,
          recipient_id: recipientId,
          amount,
          type: 'transfer',
          category: metadata?.type || 'transfer',
          description,
          metadata,
          status: 'completed'
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update local state
      updateUserPoints(user.id, -amount);
      await fetchStats();

      return transaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to transfer points';
      setError(message);
      console.error('Error transferring points:', err);
      throw err;
    }
  }, [user, updateUserPoints, fetchStats]);

  const validateTransfer = useMemoizedCallback(async (amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('ki_points')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data ? data.ki_points >= amount : false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate transfer';
      setError(message);
      console.error('Error validating transfer:', err);
      return false;
    }
  }, [user]);

  const getTransactionHistory = useMemoizedCallback(async (days: number = 7): Promise<Transaction[]> => {
    if (!user) return [];

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transaction history';
      setError(message);
      console.error('Error fetching transactions:', err);
      return [];
    }
  }, [user]);

  return {
    kiPoints: user?.ki_points || 0,
    stats,
    transferPoints,
    validateTransfer,
    getTransactionHistory,
    error,
    fetchStats
  };
}