import { Bell, Search, Crown, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] bg-white border-b border-gray-200 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-white">M</span>
            </div>
            <span className="text-xl text-gray-900">MedConnect</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-700">Dr. Rajesh Sharma</span>
            <div className="w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients, assignments, hospitals..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Emergency Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Emergency</span>
            <button
              onClick={() => setEmergencyMode(!emergencyMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                emergencyMode ? 'bg-[#10B981]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  emergencyMode ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-lg relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] rounded-full flex items-center justify-center">
                5
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-200">
                  <span className="text-sm">Notifications</span>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#2563EB] rounded-full mt-1.5" />
                      <div>
                        <p className="text-sm text-gray-900">New assignment request</p>
                        <p className="text-xs text-gray-500 mt-1">City Heart Hospital • 5 min ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full mt-1.5" />
                      <div>
                        <p className="text-sm text-gray-900">Credential verified</p>
                        <p className="text-xs text-gray-500 mt-1">MBBS Certificate • 1 hour ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#F59E0B] rounded-full mt-1.5" />
                      <div>
                        <p className="text-sm text-gray-900">Payment received</p>
                        <p className="text-xs text-gray-500 mt-1">₹2,500 from Apollo Hospital • 2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subscription Badge */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg">
            <Crown className="w-4 h-4 text-white" />
            <span className="text-sm text-white">Platinum</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2"
            >
              <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center relative">
                <span className="text-white text-sm">RS</span>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] rounded-full border-2 border-white" />
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm text-gray-900">Dr. Rajesh Sharma</p>
                  <p className="text-xs text-gray-500">Cardiology Specialist</p>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                  Settings
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                  Subscription
                </button>
                <hr className="my-2" />
                <button className="w-full px-4 py-2 text-left text-sm text-[#EF4444] hover:bg-gray-100">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
