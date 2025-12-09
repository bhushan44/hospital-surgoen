'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Star, Loader2, AlertCircle } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth/utils';
import apiClient from '@/lib/api/httpClient';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  price: number;
  currency: string;
  userRole: string;
  doctorFeatures?: {
    visibilityWeight: number | null;
    maxAffiliations: number | null;
    notes: string | null;
  } | null;
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  plan: Plan;
}

export default function SubscriptionPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchData();
    } else {
      router.push('/login');
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch available plans for doctors
      const plansResponse = await apiClient.get('/api/subscriptions/plans');
      if (plansResponse.data.success && plansResponse.data.data) {
        const doctorPlans = plansResponse.data.data.filter(
          (plan: Plan) => plan.userRole === 'doctor'
        );
        setPlans(doctorPlans);
      } else {
        console.error('Failed to fetch plans:', plansResponse.data);
        const errorMessage = plansResponse.data?.message || plansResponse.data?.error || 'Failed to load subscription plans';
        toast.error(errorMessage);
      }

      // Fetch current subscription
      const subscriptionResponse = await apiClient.get('/api/subscriptions/current');
      if (subscriptionResponse.data.success && subscriptionResponse.data.data) {
        const subscriptionData = subscriptionResponse.data.data;
        if (subscriptionData && subscriptionData.subscription && subscriptionData.plan) {
          setCurrentSubscription({
            ...subscriptionData.subscription,
            plan: subscriptionData.plan,
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load subscription data';
      if (error.response?.status !== 404) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setUpgrading(planId);

      // Get plan details
      const planResponse = await apiClient.get(`/api/subscriptions/plans/${planId}`);
      if (!planResponse.data.success || !planResponse.data.data) {
        throw new Error('Plan not found');
      }

      const plan = planResponse.data.data;

      // If free plan, activate directly
      if (plan.tier === 'free') {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const subscriptionData = {
          planId: planId,
          status: 'active',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          autoRenew: false,
        };

        const createResponse = await apiClient.post('/api/subscriptions', subscriptionData);
        if (createResponse.data.success) {
          toast.success('Free plan activated successfully!');
          await fetchData();
          router.push('/doctor/dashboard');
        } else {
          throw new Error(createResponse.data.message || 'Failed to activate plan');
        }
      } else {
        // Paid plan - redirect to payment page
        router.push(`/doctor/subscriptions/payment?planId=${planId}&amount=${plan.price / 100}`);
      }
    } catch (error: any) {
      console.error('Error upgrading plan:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to upgrade plan');
    } finally {
      setUpgrading(null);
    }
  };

  const getPlanFeatures = (plan: Plan): string[] => {
    const features: string[] = [];
    
    // If plan has doctorFeatures from database, use those
    if (plan.doctorFeatures) {
      const df = plan.doctorFeatures;
      
      // Visibility weight
      if (df.visibilityWeight !== null && df.visibilityWeight !== undefined) {
        if (df.visibilityWeight === 1) {
          features.push('Basic visibility in search');
        } else if (df.visibilityWeight === 50) {
          features.push('Enhanced visibility (50% weight)');
        } else if (df.visibilityWeight >= 100) {
          features.push('Highest visibility (100% weight)');
        } else {
          features.push(`Visibility weight: ${df.visibilityWeight}%`);
        }
      }
      
      // Max affiliations
      if (df.maxAffiliations !== null && df.maxAffiliations !== undefined) {
        if (df.maxAffiliations === -1 || df.maxAffiliations === 999999) {
          features.push('Unlimited hospital affiliations');
        } else {
          features.push(`Up to ${df.maxAffiliations} hospital affiliations`);
        }
      }
      
      // Notes (can contain additional features)
      if (df.notes) {
        // Split notes by newline or comma to create feature list
        const noteFeatures = df.notes.split(/\n|,|;/).filter(n => n.trim());
        features.push(...noteFeatures.map(n => n.trim()));
      }
    } else {
      // Fallback to tier-based features if no database features
      switch (plan.tier) {
        case 'free':
          features.push(
            'Basic visibility in search',
            'Up to 3 hospital affiliations',
            'Standard listing',
            'Community support'
          );
          break;
        case 'basic':
          features.push(
            'Enhanced visibility',
            'Up to 10 hospital affiliations',
            'Priority placement',
            'Email support'
          );
          break;
        case 'premium':
          features.push(
            'Highest visibility',
            'Unlimited hospital affiliations',
            'Featured badge on profile',
            'Priority support (24/7)'
          );
          break;
      }
    }
    
    return features.length > 0 ? features : ['Standard features'];
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'border-gray-300 bg-white';
      case 'basic':
        return 'border-yellow-400 bg-yellow-50';
      case 'premium':
        return 'border-purple-500 bg-purple-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  const currentPlanId = currentSubscription?.plan?.id;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-gray-900 mb-2 text-2xl font-bold">Subscription Plans</h1>
        <p className="text-gray-600">Choose a plan that fits your needs</p>
      </div>

      {/* Current Plan Display */}
      {currentSubscription && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Current Plan</h3>
              <p className="text-2xl font-bold text-blue-600">{currentSubscription.plan.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {currentSubscription.plan.tier === 'free' ? 'Free Forever' : `Renews on ${new Date(currentSubscription.endDate).toLocaleDateString()}`}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentSubscription.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {currentSubscription.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dummy Payment Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900 mb-1">Test Mode - Dummy Payment</p>
            <p className="text-xs text-yellow-700">
              This is a test environment. All payments are simulated. Use any card number (e.g., 4242 4242 4242 4242) to test the flow.
            </p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          const isPopular = plan.tier === 'basic' || plan.tier === 'premium';
          const features = getPlanFeatures(plan);
          const priceInDollars = plan.price / 100;

          return (
            <div
              key={plan.id}
              className={`relative rounded-lg border-2 p-6 ${getTierColor(plan.tier)} ${
                isPopular ? 'shadow-lg' : 'shadow'
              } ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {plan.tier === 'premium' && (
                <div className="absolute top-4 right-4">
                  <Crown className="w-6 h-6 text-yellow-500" />
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.tier === 'free' ? 'Free' : `₹${priceInDollars.toLocaleString()}`}
                  </span>
                  {plan.tier !== 'free' && (
                    <span className="text-gray-600">/month</span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading === plan.id}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                    plan.tier === 'free'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : plan.tier === 'basic'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {upgrading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : plan.tier === 'free' ? (
                    'Select Free Plan'
                  ) : (
                    'Upgrade Now'
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Why Upgrade Section */}
      {currentSubscription && currentSubscription.plan.tier === 'free' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Upgrade?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">More Visibility</p>
                <p className="text-sm text-gray-600">Get priority placement in hospital searches</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">More Assignments</p>
                <p className="text-sm text-gray-600">Accept unlimited assignments with premium plans</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">More Affiliations</p>
                <p className="text-sm text-gray-600">Partner with more hospitals</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Priority Support</p>
                <p className="text-sm text-gray-600">Get help when you need it most</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
