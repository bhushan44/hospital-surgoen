'use client';

import { useState } from 'react';
import { PageHeader } from '../PageHeader';
import { StatCard } from '../StatCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Filter, Eye } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ClipboardList, CheckCircle, XCircle } from 'lucide-react';

const assignments = [
  {
    id: 1,
    hospital: 'City Medical Center',
    doctor: 'Dr. Sarah Johnson',
    patient: 'John Doe',
    specialty: 'Cardiology',
    dateTime: '2024-11-18 14:30',
    priority: 'Urgent',
    status: 'Accepted',
  },
  {
    id: 2,
    hospital: 'Sunrise Specialty Clinic',
    doctor: 'Dr. Michael Chen',
    patient: 'Jane Smith',
    specialty: 'Pediatrics',
    dateTime: '2024-11-18 15:00',
    priority: 'Routine',
    status: 'Pending',
  },
  {
    id: 3,
    hospital: 'City Medical Center',
    doctor: 'Dr. Emily Rodriguez',
    patient: 'Robert Johnson',
    specialty: 'Neurology',
    dateTime: '2024-11-18 10:00',
    priority: 'Emergency',
    status: 'Completed',
  },
];

export function AssignmentsMonitor() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Assignments Monitor" 
        description="Track and manage doctor-hospital assignments"
        actions={
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        }
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Today"
            value="24"
            icon={ClipboardList}
            trend={{ value: "15% from yesterday", isPositive: true }}
          />
          <StatCard
            title="Acceptance Rate"
            value="87%"
            icon={CheckCircle}
            trend={{ value: "3% from last week", isPositive: true }}
          />
          <StatCard
            title="Completion Rate"
            value="94%"
            icon={CheckCircle}
            trend={{ value: "2% from last week", isPositive: true }}
          />
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All (3)</TabsTrigger>
            <TabsTrigger value="pending">Pending (1)</TabsTrigger>
            <TabsTrigger value="accepted">Accepted (1)</TabsTrigger>
            <TabsTrigger value="completed">Completed (1)</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled (0)</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-600">Hospital</th>
                      <th className="px-6 py-3 text-left text-slate-600">Doctor</th>
                      <th className="px-6 py-3 text-left text-slate-600">Patient</th>
                      <th className="px-6 py-3 text-left text-slate-600">Specialty</th>
                      <th className="px-6 py-3 text-left text-slate-600">Date/Time</th>
                      <th className="px-6 py-3 text-left text-slate-600">Priority</th>
                      <th className="px-6 py-3 text-left text-slate-600">Status</th>
                      <th className="px-6 py-3 text-left text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900">{assignment.hospital}</td>
                        <td className="px-6 py-4 text-slate-900">{assignment.doctor}</td>
                        <td className="px-6 py-4 text-slate-600">{assignment.patient}</td>
                        <td className="px-6 py-4 text-slate-900">{assignment.specialty}</td>
                        <td className="px-6 py-4 text-slate-600">{assignment.dateTime}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={assignment.priority} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={assignment.status} />
                        </td>
                        <td className="px-6 py-4">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-600">
              Pending assignments view
            </div>
          </TabsContent>

          <TabsContent value="accepted">
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-600">
              Accepted assignments view
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-600">
              Completed assignments view
            </div>
          </TabsContent>

          <TabsContent value="cancelled">
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-600">
              Cancelled assignments view
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
