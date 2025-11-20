'use client';

import { useState } from 'react';
import { PageHeader } from '../PageHeader';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Filter, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const auditLogs = [
  {
    id: 1,
    timestamp: '2024-11-18 10:23:45',
    actor: 'Admin User',
    actorType: 'Admin',
    action: 'Approved Verification',
    entity: 'Doctor',
    entityId: 'DR-001',
    details: { doctorName: 'Dr. Sarah Johnson', specialty: 'Cardiology', status: 'Verified' },
  },
  {
    id: 2,
    timestamp: '2024-11-18 09:15:30',
    actor: 'System',
    actorType: 'System',
    action: 'Created Assignment',
    entity: 'Assignment',
    entityId: 'ASG-245',
    details: { hospital: 'City Medical Center', doctor: 'Dr. Michael Chen', priority: 'Urgent' },
  },
  {
    id: 3,
    timestamp: '2024-11-18 08:45:12',
    actor: 'Admin User',
    actorType: 'Admin',
    action: 'Updated Plan',
    entity: 'Subscription',
    entityId: 'SUB-089',
    details: { plan: 'Premium', user: 'Dr. Emily Rodriguez', change: 'Extended expiry date' },
  },
];

export function AuditLogs() {
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Audit Logs" 
        description="Track all system activities and changes"
        actions={
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        }
      />

      <div className="p-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select defaultValue="all-actors">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Actor Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-actors">All Actors</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-actions">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-actions">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-slate-600">Timestamp</th>
                  <th className="px-6 py-3 text-left text-slate-600">Actor</th>
                  <th className="px-6 py-3 text-left text-slate-600">Action</th>
                  <th className="px-6 py-3 text-left text-slate-600">Entity</th>
                  <th className="px-6 py-3 text-left text-slate-600">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {auditLogs.map((log) => (
                  <>
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-600">{log.timestamp}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-slate-900">{log.actor}</div>
                          <div className="text-slate-500">{log.actorType}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-900">{log.action}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-slate-900">{log.entity}</div>
                          <div className="text-slate-500">{log.entityId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        >
                          {expandedLog === log.id ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              View
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                    {expandedLog === log.id && (
                      <tr key={`${log.id}-details`}>
                        <td colSpan={5} className="px-6 py-4 bg-slate-50">
                          <pre className="text-slate-700 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}