'use client';

import { PageHeader } from '../PageHeader';
import { StatCard } from '../StatCard';
import { Users, Building2, UserCheck, ClipboardList, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '../ui/button';
import { StatusBadge } from '../StatusBadge';

const assignmentTrendData = [
  { month: 'Jan', assignments: 145 },
  { month: 'Feb', assignments: 168 },
  { month: 'Mar', assignments: 192 },
  { month: 'Apr', assignments: 178 },
  { month: 'May', assignments: 215 },
  { month: 'Jun', assignments: 243 },
];

const userGrowthData = [
  { month: 'Jan', doctors: 45, hospitals: 12 },
  { month: 'Feb', doctors: 52, hospitals: 15 },
  { month: 'Mar', doctors: 61, hospitals: 18 },
  { month: 'Apr', doctors: 68, hospitals: 21 },
  { month: 'May', doctors: 78, hospitals: 24 },
  { month: 'Jun', doctors: 89, hospitals: 28 },
];

const recentActivity = [
  { id: 1, type: 'verification', message: 'Dr. Sarah Johnson verified', time: '5 mins ago', status: 'success' },
  { id: 2, type: 'assignment', message: 'Emergency assignment created at City Hospital', time: '12 mins ago', status: 'urgent' },
  { id: 3, type: 'registration', message: 'New hospital registration: MedCare Center', time: '23 mins ago', status: 'pending' },
  { id: 4, type: 'subscription', message: 'Premium plan activated for Dr. Mike Chen', time: '1 hour ago', status: 'success' },
  { id: 5, type: 'assignment', message: 'Assignment completed by Dr. Emma Wilson', time: '2 hours ago', status: 'success' },
];

const alerts = [
  { id: 1, message: '3 doctor verifications pending review', priority: 'high', time: 'Today' },
  { id: 2, message: '2 subscription plans expiring tomorrow', priority: 'medium', time: 'Today' },
  { id: 3, message: 'System maintenance scheduled', priority: 'low', time: 'Tomorrow' },
];

export function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Dashboard" 
        description="Healthcare system overview and analytics"
        actions={
          <>
            <Button variant="outline">
              Export Report
            </Button>
            <Button className="bg-navy-600 hover:bg-navy-700">
              Quick Actions
            </Button>
          </>
        }
      />

      <div className="p-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Doctors"
            value="89"
            icon={Users}
            trend={{ value: "12% from last month", isPositive: true }}
          />
          <StatCard
            title="Active Hospitals"
            value="28"
            icon={Building2}
            trend={{ value: "8% from last month", isPositive: true }}
          />
          <StatCard
            title="Pending Verifications"
            value="7"
            icon={UserCheck}
            trend={{ value: "3 new today", isPositive: false }}
          />
          <StatCard
            title="Today's Assignments"
            value="24"
            icon={ClipboardList}
            trend={{ value: "15% from yesterday", isPositive: true }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-slate-900">Assignment Trends</h3>
                <p className="text-slate-600 mt-1">Monthly assignment volume</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={assignmentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="assignments" stroke="#0d9488" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-slate-900">User Growth</h3>
                <p className="text-slate-600 mt-1">Doctors and hospitals registered</p>
              </div>
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="doctors" fill="#0d9488" name="Doctors" />
                <Bar dataKey="hospitals" fill="#1e293b" name="Hospitals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-slate-900">Recent Activity</h3>
              <p className="text-slate-600 mt-1">Latest system events and updates</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-teal-600 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900">{activity.message}</p>
                      <p className="text-slate-500 mt-1">{activity.time}</p>
                    </div>
                    <StatusBadge status={activity.status} variant="small" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-slate-900">Alerts</h3>
              <p className="text-slate-600 mt-1">Critical notifications</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        alert.priority === 'high' ? 'bg-red-600' : 
                        alert.priority === 'medium' ? 'bg-amber-600' : 'bg-blue-600'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900">{alert.message}</p>
                        <p className="text-slate-600 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start h-auto py-4">
              <UserCheck className="w-5 h-5 mr-2" />
              Verify Users
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <ClipboardList className="w-5 h-5 mr-2" />
              View Assignments
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <DollarSign className="w-5 h-5 mr-2" />
              Manage Plans
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <TrendingUp className="w-5 h-5 mr-2" />
              View Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
