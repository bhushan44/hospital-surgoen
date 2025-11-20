'use client';

import { useState } from 'react';
import { PageHeader } from '../PageHeader';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Filter, Eye, UserX, RotateCcw, Plus } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const users = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@email.com',
    role: 'Doctor',
    status: 'Active',
    verification: 'Verified',
    subscription: 'Premium',
    lastLogin: '2024-11-18 09:30',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: 2,
    name: 'City Medical Center',
    email: 'admin@citymedical.com',
    role: 'Hospital',
    status: 'Active',
    verification: 'Verified',
    subscription: 'Professional',
    lastLogin: '2024-11-18 08:15',
    photo: 'https://api.dicebear.com/7.x/initials/svg?seed=CMC',
  },
  {
    id: 3,
    name: 'Dr. Michael Chen',
    email: 'michael.chen@email.com',
    role: 'Doctor',
    status: 'Active',
    verification: 'Verified',
    subscription: 'Basic',
    lastLogin: '2024-11-17 14:20',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
  },
  {
    id: 4,
    name: 'Sunrise Specialty Clinic',
    email: 'contact@sunriseclinic.com',
    role: 'Hospital',
    status: 'Active',
    verification: 'Pending',
    subscription: 'Basic',
    lastLogin: '2024-11-17 11:45',
    photo: 'https://api.dicebear.com/7.x/initials/svg?seed=SSC',
  },
  {
    id: 5,
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    role: 'Doctor',
    status: 'Suspended',
    verification: 'Verified',
    subscription: 'Premium',
    lastLogin: '2024-11-15 16:30',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
  },
  {
    id: 6,
    name: 'Admin User',
    email: 'admin@health.com',
    role: 'Admin',
    status: 'Active',
    verification: 'Verified',
    subscription: 'N/A',
    lastLogin: '2024-11-18 10:00',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
];

export function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Doctor':
        return 'bg-teal-100 text-teal-700';
      case 'Hospital':
        return 'bg-navy-100 text-navy-700';
      case 'Admin':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Users Management" 
        description="Manage doctors, hospitals, and administrators"
        actions={
          <Button className="bg-navy-600 hover:bg-navy-700">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        }
      />

      <div className="p-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({users.length})</TabsTrigger>
            <TabsTrigger value="doctors">Doctors ({users.filter(u => u.role === 'Doctor').length})</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals ({users.filter(u => u.role === 'Hospital').length})</TabsTrigger>
            <TabsTrigger value="admins">Admins ({users.filter(u => u.role === 'Admin').length})</TabsTrigger>
          </TabsList>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Doctor">Doctor</SelectItem>
                    <SelectItem value="Hospital">Hospital</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="m-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-600">User</th>
                      <th className="px-6 py-3 text-left text-slate-600">Role</th>
                      <th className="px-6 py-3 text-left text-slate-600">Status</th>
                      <th className="px-6 py-3 text-left text-slate-600">Verification</th>
                      <th className="px-6 py-3 text-left text-slate-600">Subscription</th>
                      <th className="px-6 py-3 text-left text-slate-600">Last Login</th>
                      <th className="px-6 py-3 text-left text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={user.photo} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div className="text-slate-900">{user.name}</div>
                              <div className="text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={user.verification} />
                        </td>
                        <td className="px-6 py-4 text-slate-900">{user.subscription}</td>
                        <td className="px-6 py-4 text-slate-600">{user.lastLogin}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {user.status === 'Active' ? (
                              <Button size="sm" variant="ghost">
                                <UserX className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost">
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="doctors" className="m-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-600">User</th>
                      <th className="px-6 py-3 text-left text-slate-600">Status</th>
                      <th className="px-6 py-3 text-left text-slate-600">Verification</th>
                      <th className="px-6 py-3 text-left text-slate-600">Subscription</th>
                      <th className="px-6 py-3 text-left text-slate-600">Last Login</th>
                      <th className="px-6 py-3 text-left text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.filter(u => u.role === 'Doctor').map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={user.photo} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div className="text-slate-900">{user.name}</div>
                              <div className="text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={user.verification} />
                        </td>
                        <td className="px-6 py-4 text-slate-900">{user.subscription}</td>
                        <td className="px-6 py-4 text-slate-600">{user.lastLogin}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <UserX className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="hospitals" className="m-0">
              <div className="p-8 text-center text-slate-600">
                Hospital users view
              </div>
            </TabsContent>

            <TabsContent value="admins" className="m-0">
              <div className="p-8 text-center text-slate-600">
                Admin users view
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
