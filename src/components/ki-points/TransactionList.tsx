import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { useKiPoints } from '../../hooks/useKiPoints';

export default function TransactionList() {
  const { getTransactionHistory } = useKiPoints();
  const transactions = getTransactionHistory(7); // Show last 7 days by default

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              transaction.type === 'earned' ? 'bg-green-100' : 'bg-purple-100'
            }`}>
              {transaction.type === 'earned' ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-purple-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
              <p className="text-xs text-gray-500">
                {format(transaction.timestamp, 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
          <span className={`font-medium ${
            transaction.type === 'earned' ? 'text-green-600' : 'text-purple-600'
          }`}>
            {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} Ki
          </span>
        </div>
      ))}
      
      {transactions.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No transactions yet
        </div>
      )}
    </div>
  );
}