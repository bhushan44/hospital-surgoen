'use client';

import { useState, useEffect } from 'react';
import { Plus, Settings, CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { AddSlotModal } from './AddSlotModal';
import { isAuthenticated } from '@/lib/auth/utils';

interface ManagementStatsProps {
  onAddSlot?: () => void;
  onManageTemplates?: () => void;
}

export function ManagementStats({ onAddSlot, onManageTemplates }: ManagementStatsProps) {
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showManageTemplates, setShowManageTemplates] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    completed: 0,
    acceptance: 0,
    avgRating: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Get doctor profile
      const profileResponse = await fetch('/api/doctors/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileResponse.json();
      
      if (profileData.success && profileData.data) {
        const id = profileData.data.id;
        setDoctorId(id);

        // Get stats
        const statsResponse = await fetch(`/api/doctors/${id}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsResponse.json();

        if (statsData.success && statsData.data) {
          setStats({
            completed: statsData.data.totalBookings || 0,
            acceptance: 94, // Calculate from pending vs completed
            avgRating: parseFloat(statsData.data.averageRating || '0'),
            revenue: 126000, // Will be fetched from earnings API
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    {
      name: 'Regular OPD Hours',
      days: 'Mon, Wed, Fri',
      time: '9:00 AM - 12:00 PM',
      validity: 'Nov 1 - Dec 31'
    },
    {
      name: 'Evening Consultations',
      days: 'Tue, Thu',
      time: '5:00 PM - 8:00 PM',
      validity: 'Nov 1 - Dec 31'
    }
  ];

  const hospitals = [
    { name: 'City Heart Hospital', preferred: true },
    { name: 'Metro General', preferred: true },
    { name: 'Apollo Clinic', preferred: false },
    { name: 'Fortis Healthcare', preferred: false }
  ];

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="space-y-6 bg-transparent">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ backgroundImage: 'none' }}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900 font-semibold">AVAILABILITY</h3>
        </div>
        <div className="p-4 space-y-3">
          <button
            onClick={() => setShowAddSlotModal(true)}
            className="w-full flex items-center gap-2 px-4 py-3 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Slot</span>
          </button>
          <button
            onClick={() => setShowManageTemplates(true)}
            className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Templates</span>
          </button>
          <Link
            href="/doctor/schedule"
            className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            <CalendarDays className="w-4 h-4" />
            <span>View Calendar</span>
          </Link>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ backgroundImage: 'none' }}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-gray-900 font-semibold">{currentMonth}</h3>
          <div className="flex gap-1">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs text-gray-500 font-medium">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const today = new Date();
              const isToday = day === today.getDate() && 
                            currentDate.getMonth() === today.getMonth() &&
                            currentDate.getFullYear() === today.getFullYear();
              
              let dotColor = '';
              if (isToday) dotColor = 'bg-[#0066CC]'; // Today - booked
              else if ([13, 15, 17].includes(day)) dotColor = 'bg-[#10B981]'; // Available
              else if ([20, 21, 22].includes(day)) dotColor = 'bg-[#EF4444]'; // Leave

              return (
                <div key={i} className="aspect-square flex flex-col items-center justify-center">
                  <span className={`text-sm ${isToday ? 'text-[#0066CC] font-semibold' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  {dotColor && (
                    <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-0.5`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0066CC]" />
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span>Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span>Blocked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ backgroundImage: 'none' }}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900 font-semibold">LEAVE MANAGEMENT</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-2">Upcoming Leave:</div>
            <div className="text-sm text-gray-700">🏖️ Nov 20-22 (Vacation)</div>
          </div>
          <Link
            href="/doctor/leaves"
            className="w-full block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-center font-medium"
          >
            Mark New Leave
          </Link>
          <Link
            href="/doctor/leaves"
            className="w-full block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-center font-medium"
          >
            View All Leaves
          </Link>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ backgroundImage: 'none' }}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900 font-semibold">THIS MONTH</h3>
        </div>
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-gray-900 font-semibold">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Acceptance</span>
                <span className="text-gray-900 font-semibold">{stats.acceptance}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Rating</span>
                <span className="text-gray-900 font-semibold">
                  {stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ⭐` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="text-gray-900 font-semibold">₹{stats.revenue.toLocaleString()}</span>
              </div>
            </>
          )}
          <Link
            href="/doctor/earnings"
            className="w-full mt-2 block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-center font-medium"
          >
            View Detailed Report
          </Link>
        </div>
      </div>

      {/* Affiliated Hospitals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ backgroundImage: 'none' }}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-gray-900 font-semibold">HOSPITALS (8/10)</h3>
          <Link href="/doctor/hospitals" className="text-[#0066CC] hover:underline">
            <Plus className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-4 space-y-2">
          {hospitals.map((hospital, index) => (
            <div key={index} className="text-sm text-gray-700 flex items-center gap-2">
              {hospital.preferred && <span>⭐</span>}
              <span>{hospital.name}</span>
            </div>
          ))}
          <Link
            href="/doctor/hospitals"
            className="w-full mt-2 block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-center font-medium"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Modals */}
      {showAddSlotModal && doctorId && (
        <AddSlotModal 
          doctorId={doctorId}
          onClose={() => setShowAddSlotModal(false)}
          onSuccess={() => {
            setShowAddSlotModal(false);
            fetchStats();
          }}
        />
      )}

      {showManageTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-gray-900 font-semibold">Recurring Availability</h2>
              <button 
                onClick={() => setShowManageTemplates(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-lg transition-colors font-medium">
                <Plus className="w-4 h-4" />
                <span>Create New Template</span>
              </button>
              <div>
                <h3 className="text-sm text-gray-600 mb-4 font-medium">Active Templates:</h3>
                <div className="space-y-4">
                  {templates.map((template, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-gray-900 mb-2 font-semibold">{template.name}</h4>
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <div>{template.days}</div>
                        <div>{template.time}</div>
                        <div>Valid: {template.validity}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 rounded transition-colors font-medium">
                          Edit
                        </button>
                        <button className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 rounded transition-colors font-medium">
                          Duplicate
                        </button>
                        <button className="px-3 py-1.5 text-sm border border-[#EF4444] text-[#EF4444] hover:bg-red-50 rounded transition-colors font-medium">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowManageTemplates(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
