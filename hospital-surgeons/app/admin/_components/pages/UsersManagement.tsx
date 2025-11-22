'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../PageHeader';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Filter, Eye, UserX, RotateCcw, Plus, Loader2, X } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  verificationStatus: string;
  subscriptionStatus: string | null;
  subscriptionTier: string | null;
  subscriptionPlanName: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  phone: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  doctorId?: string | null;
  hospitalId?: string | null;
}

interface UserDetail extends User {
  profileData?: any;
  activeSubscription?: any;
  recentAuditLogs?: any[];
  assignmentStats?: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter, searchQuery, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (activeTab !== 'all') {
        params.append('role', activeTab === 'doctors' ? 'doctor' : activeTab === 'hospitals' ? 'hospital' : 'admin');
      } else if (roleFilter !== 'all') {
        params.append('role', roleFilter.toLowerCase());
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter.toLowerCase());
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    try {
      setLoadingUserDetail(true);
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedUser(data.data);
        setShowUserDetail(true);
      } else {
        toast.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      setUpdating(userId);
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User status updated successfully');
        fetchUsers();
        if (showUserDetail && selectedUser?.id === userId) {
          fetchUserDetail(userId);
        }
      } else {
        toast.error(data.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setUpdating(null);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdating(userId);
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User role updated successfully');
        fetchUsers();
        if (showUserDetail && selectedUser?.id === userId) {
          fetchUserDetail(userId);
        }
      } else {
        toast.error(data.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will suspend the user account.')) {
      return;
    }

    try {
      setUpdating(userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
        if (showUserDetail && selectedUser?.id === userId) {
          setShowUserDetail(false);
        }
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor':
        return 'bg-teal-100 text-teal-700';
      case 'hospital':
        return 'bg-navy-100 text-navy-700';
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusAction = (user: User) => {
    if (user.status === 'active') {
      return { action: 'suspend', label: 'Suspend', newStatus: 'suspended' };
    } else if (user.status === 'suspended') {
      return { action: 'activate', label: 'Activate', newStatus: 'active' };
    } else {
      return { action: 'activate', label: 'Activate', newStatus: 'active' };
    }
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (statusFilter !== 'all' && user.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const doctorsCount = users.filter(u => u.role.toLowerCase() === 'doctor').length;
  const hospitalsCount = users.filter(u => u.role.toLowerCase() === 'hospital').length;
  const adminsCount = users.filter(u => u.role.toLowerCase() === 'admin').length;

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({users.length})</TabsTrigger>
            <TabsTrigger value="doctors">Doctors ({doctorsCount})</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals ({hospitalsCount})</TabsTrigger>
            <TabsTrigger value="admins">Admins ({adminsCount})</TabsTrigger>
          </TabsList>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setPage(1); }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-4" />
                <p className="text-slate-600">Loading users...</p>
              </div>
            ) : (
              <>
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
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => {
                            const statusAction = getStatusAction(user);
                            return (
                              <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
                                      {user.name.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="text-slate-900">{user.name}</div>
                                      <div className="text-slate-500 text-sm">{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={user.status} />
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={user.verificationStatus} />
                                </td>
                                <td className="px-6 py-4 text-slate-900">
                                  {user.subscriptionPlanName || user.subscriptionTier || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-sm">
                                  {formatDate(user.lastLoginAt)}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => fetchUserDetail(user.id)}
                                      disabled={loadingUserDetail}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {updating === user.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                    ) : (
                                      <>
                                        <Button 
                                          size="sm" 
                                          variant="ghost"
                                          onClick={() => updateUserStatus(user.id, statusAction.newStatus)}
                                          title={statusAction.label}
                                        >
                                          {user.status === 'active' ? (
                                            <UserX className="w-4 h-4" />
                                          ) : (
                                            <RotateCcw className="w-4 h-4" />
                                          )}
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
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
                        {users.filter(u => u.role.toLowerCase() === 'doctor').map((user) => {
                          const statusAction = getStatusAction(user);
                          return (
                            <tr key={user.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
                                    {user.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="text-slate-900">{user.name}</div>
                                    <div className="text-slate-500 text-sm">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={user.status} />
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={user.verificationStatus} />
                              </td>
                              <td className="px-6 py-4 text-slate-900">
                                {user.subscriptionPlanName || user.subscriptionTier || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-slate-600 text-sm">
                                {formatDate(user.lastLoginAt)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => fetchUserDetail(user.id)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => updateUserStatus(user.id, statusAction.newStatus)}
                                  >
                                    {user.status === 'active' ? (
                                      <UserX className="w-4 h-4" />
                                    ) : (
                                      <RotateCcw className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="hospitals" className="m-0">
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
                        {users.filter(u => u.role.toLowerCase() === 'hospital').map((user) => {
                          const statusAction = getStatusAction(user);
                          return (
                            <tr key={user.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-semibold">
                                    {user.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="text-slate-900">{user.name}</div>
                                    <div className="text-slate-500 text-sm">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={user.status} />
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={user.verificationStatus} />
                              </td>
                              <td className="px-6 py-4 text-slate-900">
                                {user.subscriptionPlanName || user.subscriptionTier || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-slate-600 text-sm">
                                {formatDate(user.lastLoginAt)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => fetchUserDetail(user.id)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => updateUserStatus(user.id, statusAction.newStatus)}
                                  >
                                    {user.status === 'active' ? (
                                      <UserX className="w-4 h-4" />
                                    ) : (
                                      <RotateCcw className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="admins" className="m-0">
                  <div className="p-8 text-center text-slate-600">
                    Admin users view
                  </div>
                </TabsContent>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Tabs>
      </div>

      {/* User Detail Modal */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information
            </DialogDescription>
          </DialogHeader>
          
          {loadingUserDetail ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-4" />
              <p className="text-slate-600">Loading user details...</p>
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Name</label>
                  <p className="text-slate-900">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <p className="text-slate-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Role</label>
                  <p className="text-slate-900">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <StatusBadge status={selectedUser.status} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Verification</label>
                  <StatusBadge status={selectedUser.verificationStatus} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Last Login</label>
                  <p className="text-slate-900">{formatDate(selectedUser.lastLoginAt)}</p>
                </div>
              </div>

              {/* Profile Data */}
              {selectedUser.profileData && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedUser.profileData).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-sm font-medium text-slate-600">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <p className="text-slate-900">{String(value || 'N/A')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subscription */}
              {selectedUser.activeSubscription && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Active Subscription</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Plan</label>
                      <p className="text-slate-900">{selectedUser.activeSubscription.planName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Status</label>
                      <StatusBadge status={selectedUser.activeSubscription.status} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Start Date</label>
                      <p className="text-slate-900">{formatDate(selectedUser.activeSubscription.startDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">End Date</label>
                      <p className="text-slate-900">{formatDate(selectedUser.activeSubscription.endDate)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignment Stats */}
              {selectedUser.assignmentStats && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Assignment Statistics</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Total</label>
                      <p className="text-2xl font-bold text-slate-900">{selectedUser.assignmentStats.total}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Completed</label>
                      <p className="text-2xl font-bold text-teal-600">{selectedUser.assignmentStats.completed}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Pending</label>
                      <p className="text-2xl font-bold text-amber-600">{selectedUser.assignmentStats.pending}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Cancelled</label>
                      <p className="text-2xl font-bold text-red-600">{selectedUser.assignmentStats.cancelled}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    const statusAction = getStatusAction(selectedUser);
                    updateUserStatus(selectedUser.id, statusAction.newStatus);
                  }}
                  disabled={updating === selectedUser.id}
                >
                  {selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteUser(selectedUser.id)}
                  disabled={updating === selectedUser.id}
                >
                  Delete User
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
