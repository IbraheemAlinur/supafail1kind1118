import React from 'react';
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

interface KiPointsStatsProps {
  stats: {
    monthlyPoints: number;
    quarterlyPoints: number;
    yearlyPoints: number;
  };
  totalEarned: number;
  totalSpent: number;
}

export default function KiPointsStats({ stats, totalEarned, totalSpent }: KiPointsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Monthly Points</h3>
          <TrendingUp className="h-5 w-5 text-indigo-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-indigo-600">
          {stats.monthlyPoints}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Total Earned</h3>
          <ArrowUp className="h-5 w-5 text-green-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-green-600">
          +{totalEarned}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
          <ArrowDown className="h-5 w-5 text-red-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-red-600">
          -{totalSpent}
        </p>
      </div>
    </div>
  );
}