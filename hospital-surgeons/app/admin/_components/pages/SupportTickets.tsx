'use client';

import { PageHeader } from '../PageHeader';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Filter } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const tickets = [
  {
    id: 'TKT-001',
    user: 'Dr. Sarah Johnson',
    subject: 'Unable to accept assignments',
    priority: 'High',
    status: 'Open',
    category: 'Technical',
    assignedTo: 'Support Agent 1',
    created: '2024-11-18 09:30',
  },
  {
    id: 'TKT-002',
    user: 'City Medical Center',
    subject: 'Subscription billing issue',
    priority: 'Medium',
    status: 'In Progress',
    category: 'Billing',
    assignedTo: 'Support Agent 2',
    created: '2024-11-17 14:20',
  },
  {
    id: 'TKT-003',
    user: 'Dr. Michael Chen',
    subject: 'Profile update request',
    priority: 'Low',
    status: 'Resolved',
    category: 'Account',
    assignedTo: 'Support Agent 1',
    created: '2024-11-16 11:15',
  },
];

export function SupportTickets() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Support Tickets" 
        description="Manage user support requests and issues"
        actions={
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        }
      />

      <div className="p-8">
        <Tabs defaultValue="open" className="space-y-6">
          <TabsList>
            <TabsTrigger value="open">Open (1)</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress (1)</TabsTrigger>
            <TabsTrigger value="resolved">Resolved (1)</TabsTrigger>
            <TabsTrigger value="closed">Closed (0)</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-4">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input placeholder="Search tickets..." className="pl-10" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-600">ID</th>
                      <th className="px-6 py-3 text-left text-slate-600">User</th>
                      <th className="px-6 py-3 text-left text-slate-600">Subject</th>
                      <th className="px-6 py-3 text-left text-slate-600">Priority</th>
                      <th className="px-6 py-3 text-left text-slate-600">Category</th>
                      <th className="px-6 py-3 text-left text-slate-600">Assigned To</th>
                      <th className="px-6 py-3 text-left text-slate-600">Created</th>
                      <th className="px-6 py-3 text-left text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tickets.filter(t => t.status === 'Open').map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900">{ticket.id}</td>
                        <td className="px-6 py-4 text-slate-900">{ticket.user}</td>
                        <td className="px-6 py-4 text-slate-900">{ticket.subject}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={ticket.priority} />
                        </td>
                        <td className="px-6 py-4 text-slate-600">{ticket.category}</td>
                        <td className="px-6 py-4 text-slate-600">{ticket.assignedTo}</td>
                        <td className="px-6 py-4 text-slate-600">{ticket.created}</td>
                        <td className="px-6 py-4">
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="in-progress">
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-600">ID</th>
                      <th className="px-6 py-3 text-left text-slate-600">User</th>
                      <th className="px-6 py-3 text-left text-slate-600">Subject</th>
                      <th className="px-6 py-3 text-left text-slate-600">Priority</th>
                      <th className="px-6 py-3 text-left text-slate-600">Category</th>
                      <th className="px-6 py-3 text-left text-slate-600">Assigned To</th>
                      <th className="px-6 py-3 text-left text-slate-600">Created</th>
                      <th className="px-6 py-3 text-left text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tickets.filter(t => t.status === 'In Progress').map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900">{ticket.id}</td>
                        <td className="px-6 py-4 text-slate-900">{ticket.user}</td>
                        <td className="px-6 py-4 text-slate-900">{ticket.subject}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={ticket.priority} />
                        </td>
                        <td className="px-6 py-4 text-slate-600">{ticket.category}</td>
                        <td className="px-6 py-4 text-slate-600">{ticket.assignedTo}</td>
                        <td className="px-6 py-4 text-slate-600">{ticket.created}</td>
                        <td className="px-6 py-4">
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resolved">
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-600">
              Resolved tickets view
            </div>
          </TabsContent>

          <TabsContent value="closed">
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-600">
              Closed tickets view
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
