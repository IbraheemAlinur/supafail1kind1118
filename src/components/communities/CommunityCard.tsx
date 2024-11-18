import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface CommunityCardProps {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  image: string;
}

export default function CommunityCard({ id, name, description, memberCount, image }: CommunityCardProps) {
  const location = useLocation();
  const isInDashboard = location.pathname.startsWith('/dashboard');
  const linkPath = isInDashboard ? `/dashboard/communities/${id}` : `/communities/${id}`;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{memberCount} members</span>
          </div>
          <Link
            to={linkPath}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View Community
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}