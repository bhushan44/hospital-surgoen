import { AlertCircle, TrendingUp, Calendar, CheckCircle, Star, Award, IndianRupee, Activity } from 'lucide-react';

export function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Profile Completion Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-amber-900 mb-2">Complete Your Profile</h3>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-amber-800">Progress: 87%</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <span className="text-green-600">✅</span> Basic Information (100%)
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <span className="text-green-600">✅</span> Profile Photo (100%)
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <span className="text-green-600">✅</span> Medical License (Verified)
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <span className="text-amber-600">⚠️</span> Bank Details (Pending)
              </div>
            </div>
            <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm transition-colors">
              Complete Now
            </button>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Verification Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Profile</span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" /> Verified
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Medical License</span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" /> Verified
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Credentials</span>
            <span className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="w-4 h-4" /> 1 Pending, 3 Verified
            </span>
          </div>
        </div>
        <button className="mt-4 w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm transition-colors">
          View Details
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Strength */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-6 h-6" />
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-3xl mb-1">92</div>
          <div className="text-purple-100 text-sm">Profile Strength</div>
          <div className="text-xs text-purple-200 mt-2">Out of 100</div>
        </div>

        {/* Total Assignments */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-6 h-6" />
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-3xl mb-1">247</div>
          <div className="text-blue-100 text-sm">Total Assignments</div>
          <div className="text-xs text-blue-200 mt-2">234 completed • 94.6%</div>
        </div>

        {/* Average Rating */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-6 h-6" />
            <span className="text-xs">↑ 0.2</span>
          </div>
          <div className="text-3xl mb-1 flex items-center gap-1">
            4.7 <Star className="w-5 h-5 fill-white" />
          </div>
          <div className="text-orange-100 text-sm">Average Rating</div>
          <div className="text-xs text-orange-200 mt-2">Based on 89 reviews</div>
        </div>

        {/* This Month Earnings */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <IndianRupee className="w-6 h-6" />
            <span className="text-xs">+12%</span>
          </div>
          <div className="text-3xl mb-1">₹1,24,500</div>
          <div className="text-green-100 text-sm">This Month</div>
          <div className="text-xs text-green-200 mt-2">₹15,000 pending</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl text-gray-900 mb-1">3</div>
          <div className="text-sm text-gray-600">Today's Assignments</div>
          <div className="text-xs text-gray-500 mt-1">2 pending, 1 accepted</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl text-gray-900 mb-1">12</div>
          <div className="text-sm text-gray-600">This Week Slots</div>
          <div className="text-xs text-gray-500 mt-1">8 available, 4 booked</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl text-gray-900 mb-1">94%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
          <div className="text-xs text-gray-500 mt-1">142/151 completed</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl text-gray-900 mb-1">8/10</div>
          <div className="text-sm text-gray-600">Hospital Affiliations</div>
          <div className="text-xs text-gray-500 mt-1">2 slots remaining</div>
        </div>
      </div>

      {/* Subscription Widget */}
      <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 fill-white" />
              <span className="text-xl">Your Plan: PLATINUM</span>
            </div>
            <div className="space-y-1 text-sm text-amber-100">
              <div>• Visibility Weight: 100 (Highest)</div>
              <div>• Max Affiliations: 10</div>
              <div>• Featured badge on profile</div>
              <div>• Priority support</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-amber-100">Renewal: Dec 15, 2024</span>
          <button className="px-4 py-2 bg-white text-amber-600 rounded-lg text-sm hover:bg-amber-50 transition-colors">
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-4 hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Assignment completed</p>
                <p className="text-xs text-gray-500 mt-1">City Heart Hospital • John Doe • 2 hours ago</p>
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New assignment request</p>
                <p className="text-xs text-gray-500 mt-1">Metro General Hospital • 5 hours ago</p>
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Credential verified</p>
                <p className="text-xs text-gray-500 mt-1">MD Cardiology Certificate • Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
