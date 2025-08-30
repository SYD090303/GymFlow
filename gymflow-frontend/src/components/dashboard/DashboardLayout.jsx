import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FiMenu, FiX } from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <div className={`md:hidden fixed inset-0 z-40 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          onClick={() => setSidebarOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Drawer */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-64 transform bg-white transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          aria-hidden={!sidebarOpen}
        >
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
          <div className="h-14 px-4 flex items-center justify-between">
            <button
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white grid place-items-center font-bold">GF</div>
              <h1 className="text-lg font-semibold text-gray-900">Gym Flow</h1>
            </div>
            <div className="w-9" />
          </div>
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="mx-auto px-3 md:px-6 py-4 md:py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
