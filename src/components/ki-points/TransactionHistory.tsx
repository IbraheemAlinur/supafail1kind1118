import React from 'react';
import { format } from 'date-fns';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Transaction } from '../../lib/firebase/transactions';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'earned':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'spent':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowUp className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'earned':
        return 'text-green-600';
      case 'spent':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${
              transaction.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {transaction.description}
              </p>
              <p className="text-xs text-gray-500">
                {format(transaction.timestamp, 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
          <span className={`font-medium ${getTransactionColor(transaction.type)}`}>
            {transaction.type === 'spent' ? '-' : '+'}
            {transaction.amount} Ki
          </span>
        </div>
      ))}

      {transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No transactions yet
        </div>
      )}
    </div>
  );
}