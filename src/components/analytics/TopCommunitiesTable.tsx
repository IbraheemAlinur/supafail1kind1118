import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const SAMPLE_COMMUNITIES = [
  {
    id: '1',
    name: 'Tech Entrepreneurs',
    engagement: 92,
    trend: 'up',
    trendValue: 5,
  },
  {
    id: '2',
    name: 'Creative Innovators',
    engagement: 87,
    trend: 'up',
    trendValue: 3,
  },
  {
    id: '3',
    name: 'Social Impact',
    engagement: 78,
    trend: 'down',
    trendValue: 2,
  },
  {
    id: '4',
    name: 'Digital Marketing',
    engagement: 75,
    trend: 'up',
    trendValue: 4,
  },
];

export default function TopCommunitiesTable() {
  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Community
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Engagement
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trend
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {SAMPLE_COMMUNITIES.map((community) => (
            <tr key={community.id}>
              <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {community.name}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                {community.engagement}%
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm">
                <div className="flex items-center">
                  {community.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={community.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {community.trendValue}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}