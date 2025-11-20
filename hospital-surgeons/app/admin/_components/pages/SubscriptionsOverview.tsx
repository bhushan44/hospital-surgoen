'use client';

import { PageHeader } from '../PageHeader';
import { StatCard } from '../StatCard';
import { DollarSign, Users, AlertCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { StatusBadge } from '../StatusBadge';

const subscriptions = [
  {
    id: 1,
    user: 'Dr. Sarah Johnson',
    role: 'Doctor',
    plan: 'Premium',
    tier: 'Tier 3',
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    status: 'Active',
    autoRenew: true,
    revenue: '$149',
  },
  {
    id: 2,
    user: 'City Medical Center',
    role: 'Hospital',
    plan: 'Professional',
    tier: 'Tier 2',
    startDate: '2024-02-01',
    endDate: '2025-02-01',
    status: 'Active',
    autoRenew: true,
    revenue: '$249',
  },
  {
    id: 3,
    user: 'Dr. Michael Chen',
    role: 'Doctor',
    plan: 'Basic',
    tier: 'Tier 1',
    startDate: '2024-10-15',
    endDate: '2024-12-15',
    status: 'Expiring Soon',
    autoRenew: false,
    revenue: '$29',
  },
];

export function SubscriptionsOverview() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Subscriptions Overview" 
        description="Monitor and manage all subscription plans"
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Subscriptions"
            value="89"
            icon={Users}
          />
          <StatCard
            title="Monthly Recurring Revenue"
            value="$12,450"
            icon={DollarSign}
            trend={{ value: "18% from last month", isPositive: true }}
          />
          <StatCard
            title="Expiring Soon"
            value="12"
            icon={AlertCircle}
          />
          <StatCard
            title="Cancelled This Month"
            value="3"
            icon={XCircle}
          />
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active (89)</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon (12)</TabsTrigger>
            <TabsTrigger value="expired">Expired (5)</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled (3)</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-600">User</th>
                      <th className="px-6 py-3 text-left text-slate-600">Plan</th>
                      <th className="px-6 py-3 text-left text-slate-600">Tier</th>
                      <th className="px-6 py-3 text-left text-slate-600">Start Date</th>
                      <th className="px-6 py-3 text-left text-slate-600">End Date</th>
                      <th className="px-6 py-3 text-left text-slate-600">Status</th>
                      <th className="px-6 py-3 text-left text-slate-600">Auto-Renew</th>
                      <th className="px-6 py-3 text-left text-slate-600">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-slate-900">{sub.user}</div>
                            <div className="text-slate-500">{sub.role}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-900">{sub.plan}</td>
                        <td className="px-6 py-4 text-slate-600">{sub.tier}</td>
                        <td className="px-6 py-4 text-slate-600">{sub.startDate}</td>
                        <td className="px-6 py-4 text-slate-600">{sub.endDate}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={sub.status} />
                        </td>
                        <td className="px-6 py-4">
                          <span className={sub.autoRenew ? 'text-green-600' : 'text-slate-600'}>
                            {sub.autoRenew ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-900">{sub.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expiring">
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-600">
              Expiring subscriptions view
            </div>
          </TabsContent>

          <TabsContent value="expired">
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-600">
              Expired subscriptions view
            </div>
          </TabsContent>

          <TabsContent value="cancelled">
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-600">
              Cancelled subscriptions view
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
