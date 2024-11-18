import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import ConnectionStatus from '../ui/ConnectionStatus';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectionStatus />
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}