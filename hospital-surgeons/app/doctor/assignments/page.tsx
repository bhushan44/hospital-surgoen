'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2 text-2xl font-bold">Assignments</h1>
        <p className="text-gray-600">View and manage your assignments</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('today')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'today'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Today's Assignments
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Assignments
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'today' ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500">Today's Assignments view</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500">All Assignments view</p>
          </div>
        )}
      </div>
    </div>
  );
}
