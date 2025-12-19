'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  tier: string;
  price: number;
  billingCycle: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
}

export default function SubscriptionsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      tier: 'free',
      price: 0,
      billingCycle: 'month',
      isCurrent: true,
      features: [
        'Basic hospital registration',
        'Add up to 5 patients/month',
        'Access to all doctors',
        'Standard listing',
      ],
      // Excluded features shown with X
    },
    {
      id: 'gold',
      name: 'Gold Plan',
      tier: 'gold',
      price: 5000,
      billingCycle: 'booking',
      features: [
        'Everything in Free',
        'Pay per confirmed booking',
        'Unlimited patient additions',
        'Priority doctor access',
        'Enhanced hospital visibility',
        'Basic analytics',
        'Email support',
        'No monthly commitment',
      ],
    },
    {
      id: 'platinum',
      name: 'Platinum Plan',
      tier: 'premium',
      price: 10000,
      billingCycle: 'month',
      isPopular: true,
      features: [
        'Everything in Gold',
        'Unlimited transactions (no pre-booking fees!)',
        'Top priority doctor access',
        'Premium hospital listing',
        'Advanced analytics & insights',
        'Dedicated account manager',
        'Priority support (24/7)',
        'Custom integrations available',
      ],
    },
  ];

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    // Navigate to payment page
    window.location.href = `/hospital/payment?plan=${planId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">DocSchedule</h1>
          <button className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600 mb-8">Select the plan that best fits your needs</p>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg p-6 border-2 ${
                plan.isPopular
                  ? 'border-purple-500 bg-purple-50'
                  : plan.isCurrent
                  ? 'border-gray-300 bg-white'
                  : 'border-yellow-300 bg-yellow-50'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-0 bg-purple-600 text-white px-3 py-1 rounded-br-lg text-xs font-semibold">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  plan.tier === 'free' ? 'bg-gray-200' : plan.tier === 'gold' ? 'bg-yellow-200' : 'bg-purple-200'
                }`}>
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  {plan.tier === 'free' && <p className="text-sm text-gray-600">Free Plan</p>}
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{plan.price.toLocaleString()}
                </span>
                <span className="text-gray-600"> /{plan.billingCycle}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              {plan.isCurrent ? (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full py-3 rounded-lg font-semibold text-white ${
                    plan.isPopular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  Upgrade Now
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Why Choose Section */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h3>
          <p className="text-gray-600 mb-4">Streamlined scheduling that benefits both doctors and hospitals</p>
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">For Hospitals</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Flexible Pricing: Choose between transaction-based or unlimited monthly plans</li>
                <li>• Enhanced Patient Flow: Attract more patients with premium visibility</li>
                <li>• Exclusive Benefits: Platinum members receive promotional and marketing advantages</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How do the Doctor plans differ?</h4>
              <p className="text-gray-600">
                The Basic plan is free but offers limited visibility. Gold members receive priority placement in search results, appearing before free users, and benefit from enhanced visibility based on seniority and location.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Which Hospital plan is right for me?</h4>
              <p className="text-gray-600">
                For hospitals with moderate patient flow, the Gold plan offers a pay-per-transaction model. For busy hospitals expecting many bookings, the Platinum plan with unlimited transactions may be more cost-effective.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I upgrade my plan later?</h4>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a contract or commitment?</h4>
              <p className="text-gray-600">
                No, all our paid plans are month-to-month with no long-term commitment. You can cancel at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-600 text-white rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-lg font-semibold mb-2">Need help choosing a plan?</h4>
              <p className="text-blue-100 mb-4">
                Our team is ready to help you select the best plan for your needs. Contact us for a personalized consultation.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>(800) 555-DOCS</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>support@docschedule.com</span>
                </div>
              </div>
              <button className="mt-4 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold border-2 border-white">
                Schedule a Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
























