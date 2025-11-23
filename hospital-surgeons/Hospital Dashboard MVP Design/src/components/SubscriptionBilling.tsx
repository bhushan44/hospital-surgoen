import { Crown, Check, Download, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export function SubscriptionBilling() {
  const currentPlan = {
    tier: 'gold',
    price: 4999,
    billingPeriod: 'monthly',
    startDate: '2024-11-01',
    nextRenewal: '2024-12-01',
    patientsUsed: 18,
    patientsLimit: 'unlimited',
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'month',
      features: [
        '5 patients per month',
        'Basic features',
        'Email support',
        'Standard doctor access',
      ],
      limitations: [
        'Limited patient slots',
        'Basic support only',
      ],
    },
    {
      name: 'Gold',
      price: 4999,
      period: 'month',
      popular: true,
      features: [
        'Unlimited patients',
        'Premium doctor access',
        'Priority search results',
        'Email & phone support',
        'Advanced analytics',
        'Custom notifications',
      ],
      limitations: [],
    },
    {
      name: 'Premium',
      price: 9999,
      period: 'month',
      features: [
        'All Gold features',
        'Dedicated account manager',
        '24/7 priority support',
        'Advanced analytics & reports',
        'Custom integrations',
        'API access',
        'White-label options',
      ],
      limitations: [],
    },
  ];

  const paymentHistory = [
    {
      id: 1,
      date: '2024-11-01',
      plan: 'Gold Plan',
      amount: 4999,
      status: 'paid',
      invoice: 'INV-2024-1101',
    },
    {
      id: 2,
      date: '2024-10-01',
      plan: 'Gold Plan',
      amount: 4999,
      status: 'paid',
      invoice: 'INV-2024-1001',
    },
    {
      id: 3,
      date: '2024-09-01',
      plan: 'Free Plan',
      amount: 0,
      status: 'paid',
      invoice: 'INV-2024-0901',
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'gold') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 gap-1">
          <Crown className="w-3 h-3" />
          Gold Plan
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-1">Subscription & Billing</h1>
        <p className="text-gray-500">Manage your subscription and payment details</p>
      </div>

      {/* Current Plan Overview */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            {getTierBadge(currentPlan.tier)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-500 text-sm mb-1">Monthly Price</p>
              <p className="text-2xl text-gray-900">₹{currentPlan.price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Billing Period</p>
              <p className="text-gray-900">{new Date(currentPlan.startDate).toLocaleDateString()} - {new Date(currentPlan.nextRenewal).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Next Renewal</p>
              <p className="text-gray-900">{new Date(currentPlan.nextRenewal).toLocaleDateString()}</p>
            </div>
            <div>
              <Button variant="outline" className="w-full">Manage Plan</Button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Patients This Month</p>
              <p className="text-sm text-gray-900">
                {currentPlan.patientsUsed} / {currentPlan.patientsLimit === 'unlimited' ? '∞' : currentPlan.patientsLimit}
              </p>
            </div>
            <Progress value={currentPlan.patientsLimit === 'unlimited' ? 18 : (currentPlan.patientsUsed / Number(currentPlan.patientsLimit)) * 100} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {currentPlan.patientsLimit === 'unlimited' ? 'Unlimited patients on Gold plan' : `${currentPlan.patientsUsed} of ${currentPlan.patientsLimit} patients used`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Active Assignments</p>
              <p className="text-gray-900">34</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed This Month</p>
              <p className="text-gray-900">156</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Doctors Accessed</p>
              <p className="text-gray-900">24</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="mb-8">
        <h2 className="text-gray-900 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? 'border-2 border-blue-600 relative' : ''}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 hover:bg-blue-600">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {plan.name === 'Gold' && <Crown className="w-5 h-5 text-yellow-600" />}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-3xl text-gray-900">₹{plan.price.toLocaleString()}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? 'default' : 'outline'}
                  className="w-full"
                  disabled={plan.name === 'Gold'}
                >
                  {plan.name === 'Gold' ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            <div className="text-sm text-gray-600">
              Total Spent: <span className="text-gray-900">₹{paymentHistory.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.plan}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{payment.invoice}</code>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-500">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
