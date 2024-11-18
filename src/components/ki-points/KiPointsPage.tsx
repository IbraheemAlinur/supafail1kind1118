import React, { useState } from 'react';
import { useKiPoints } from '../../hooks/useKiPoints';
import KiPointsStats from './KiPointsStats';
import TransactionHistory from './TransactionHistory';
import { Transaction } from '../../lib/firebase/transactions';

export default function KiPointsPage() {
  const { kiPoints, stats, error } = useKiPoints();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7' | '30' | '90'>('30');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ki Points</h1>
          <p className="mt-2 text-gray-600">Track your Ki Points balance and transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as '7' | '30' | '90')}
            className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <KiPointsStats 
        stats={stats} 
        totalEarned={stats.totalEarned} 
        totalSpent={stats.totalSpent} 
      />

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h2>
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
}