'use client';

import { PageHeader } from '../PageHeader';
import { Button } from '../ui/button';
import { Plus, Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const doctorPlans = [
  {
    id: 1,
    name: 'Basic',
    tier: 'Tier 1',
    price: '$29/month',
    features: ['Basic profile visibility', '5 assignments/month', 'Email support'],
    subscribers: 34,
  },
  {
    id: 2,
    name: 'Professional',
    tier: 'Tier 2',
    price: '$79/month',
    features: ['Enhanced visibility', '20 assignments/month', 'Priority support', 'Analytics dashboard'],
    subscribers: 42,
  },
  {
    id: 3,
    name: 'Premium',
    tier: 'Tier 3',
    price: '$149/month',
    features: ['Maximum visibility', 'Unlimited assignments', '24/7 support', 'Advanced analytics', 'Featured listing'],
    subscribers: 13,
  },
];

const hospitalPlans = [
  {
    id: 1,
    name: 'Basic',
    tier: 'Tier 1',
    price: '$99/month',
    features: ['List up to 10 doctors', 'Basic matching', 'Email support'],
    subscribers: 12,
  },
  {
    id: 2,
    name: 'Professional',
    tier: 'Tier 2',
    price: '$249/month',
    features: ['List up to 50 doctors', 'Advanced matching', 'Priority support', 'Analytics'],
    subscribers: 14,
  },
  {
    id: 3,
    name: 'Enterprise',
    tier: 'Tier 3',
    price: '$499/month',
    features: ['Unlimited doctors', 'Custom matching rules', 'Dedicated support', 'Advanced analytics', 'API access'],
    subscribers: 2,
  },
];

function PlanCard({ plan }: { plan: typeof doctorPlans[0] }) {
  const getTierColor = (tier: string) => {
    if (tier.includes('1')) return 'bg-blue-100 text-blue-700';
    if (tier.includes('2')) return 'bg-purple-100 text-purple-700';
    if (tier.includes('3')) return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-slate-900">{plan.name}</h3>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 mt-2 ${getTierColor(plan.tier)}`}>
            {plan.tier}
          </span>
        </div>
        <Button size="sm" variant="ghost">
          <Edit className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-slate-900 mb-4">{plan.price}</p>
      <ul className="space-y-2 mb-4">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="text-slate-600 flex items-start gap-2">
            <span className="text-teal-600 mt-1">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="pt-4 border-t border-slate-200">
        <p className="text-slate-600">
          <span className="text-slate-900">{plan.subscribers}</span> active subscribers
        </p>
      </div>
    </div>
  );
}

export function SubscriptionPlans() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Subscription Plans" 
        description="Manage pricing tiers and features for doctors and hospitals"
        actions={
          <Button className="bg-navy-600 hover:bg-navy-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        }
      />

      <div className="p-8">
        <Tabs defaultValue="doctors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="doctors">Doctor Plans</TabsTrigger>
            <TabsTrigger value="hospitals">Hospital Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctorPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hospitals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitalPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
