'use client';

import { PageHeader } from '../PageHeader';
import { Button } from '../ui/button';
import { Download, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const userGrowthData = [
  { month: 'Jan', doctors: 45, hospitals: 12 },
  { month: 'Feb', doctors: 52, hospitals: 15 },
  { month: 'Mar', doctors: 61, hospitals: 18 },
  { month: 'Apr', doctors: 68, hospitals: 21 },
  { month: 'May', doctors: 78, hospitals: 24 },
  { month: 'Jun', doctors: 89, hospitals: 28 },
];

const assignmentVolumeData = [
  { specialty: 'Cardiology', assignments: 145 },
  { specialty: 'Neurology', assignments: 98 },
  { specialty: 'Pediatrics', assignments: 187 },
  { specialty: 'Orthopedics', assignments: 112 },
  { specialty: 'Dermatology', assignments: 76 },
];

const statusDistributionData = [
  { name: 'Completed', value: 450, color: '#10b981' },
  { name: 'Pending', value: 120, color: '#f59e0b' },
  { name: 'Cancelled', value: 45, color: '#ef4444' },
];

const topDoctors = [
  { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', assignments: 48, rating: 4.9 },
  { name: 'Dr. Michael Chen', specialty: 'Pediatrics', assignments: 45, rating: 4.8 },
  { name: 'Dr. Emily Rodriguez', specialty: 'Neurology', assignments: 42, rating: 4.9 },
];

const topHospitals = [
  { name: 'City Medical Center', type: 'General', assignments: 156, rating: 4.7 },
  { name: 'Sunrise Specialty Clinic', type: 'Specialty', assignments: 98, rating: 4.8 },
  { name: 'Community Health', type: 'General', assignments: 87, rating: 4.6 },
];

export function Analytics() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Analytics Dashboard" 
        description="Comprehensive system analytics and insights"
        actions={
          <>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
            <Button className="bg-navy-600 hover:bg-navy-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </>
        }
      />

      <div className="p-8 space-y-8">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-slate-900 mb-4">User Growth Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="doctors" stroke="#0d9488" strokeWidth={2} name="Doctors" />
                <Line type="monotone" dataKey="hospitals" stroke="#1e293b" strokeWidth={2} name="Hospitals" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-slate-900 mb-4">Assignment Volume by Specialty</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assignmentVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="specialty" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="assignments" fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-slate-900 mb-4">Assignment Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-slate-900 mb-4">Performance Summary</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Average Response Time</span>
                  <span className="text-slate-900">2.3 mins</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Acceptance Rate</span>
                  <span className="text-slate-900">87%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Completion Rate</span>
                  <span className="text-slate-900">94%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-navy-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-slate-900">Top Performing Doctors</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topDoctors.map((doctor, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0">
                    <div>
                      <div className="text-slate-900">{doctor.name}</div>
                      <div className="text-slate-600">{doctor.specialty}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-900">{doctor.assignments} assignments</div>
                      <div className="text-amber-600">★ {doctor.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-slate-900">Top Performing Hospitals</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topHospitals.map((hospital, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0">
                    <div>
                      <div className="text-slate-900">{hospital.name}</div>
                      <div className="text-slate-600">{hospital.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-900">{hospital.assignments} assignments</div>
                      <div className="text-amber-600">★ {hospital.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
