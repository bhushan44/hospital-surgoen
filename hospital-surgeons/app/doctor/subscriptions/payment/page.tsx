'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Smartphone, Building2, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth/utils';
import apiClient from '@/lib/api/httpClient';
import { toast } from 'sonner';
import Link from 'next/link';

function PaymentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');
  const pricingId = searchParams.get('pricingId');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency') || 'INR';
  const billingCycle = searchParams.get('billingCycle') || 'monthly';

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: '',
    bankName: 'State Bank of India',
    accountNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!planId) {
      toast.error('Plan ID is required');
      router.push('/doctor/subscriptions');
      return;
    }

    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/subscriptions/plans/${planId}`);
      if (response.data.success && response.data.data) {
        setPlan(response.data.data);
      } else {
        toast.error('Plan not found');
        router.push('/doctor/subscriptions');
      }
    } catch (error: any) {
      console.error('Error fetching plan:', error);
      toast.error('Failed to load plan details');
      router.push('/doctor/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }

      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Format: MM/YY';
      }

      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (formData.cvv.length !== 3) {
        newErrors.cvv = 'CVV must be 3 digits';
      }

      if (!formData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
    } else if (paymentMethod === 'upi') {
      if (!formData.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
        newErrors.upiId = 'Invalid UPI ID format (e.g., username@paytm)';
      }
    } else if (paymentMethod === 'netbanking') {
      if (!formData.bankName.trim()) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!formData.accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setProcessing(true);

      // Prepare payment data
      const paymentData: any = {
        planId: planId,
        pricingId: pricingId || selectedPricing?.id,
        amount: priceInDollars,
        currency: displayCurrency,
        billingCycle: selectedPricing?.billingCycle || billingCycle,
        paymentMethod: paymentMethod,
      };

      if (paymentMethod === 'card') {
        paymentData.cardNumber = formData.cardNumber.replace(/\s/g, '');
        paymentData.expiryDate = formData.expiryDate;
        paymentData.cvv = formData.cvv;
        paymentData.cardholderName = formData.cardholderName;
      } else if (paymentMethod === 'upi') {
        paymentData.upiId = formData.upiId;
      } else if (paymentMethod === 'netbanking') {
        paymentData.bankName = formData.bankName;
        paymentData.accountNumber = formData.accountNumber;
      }

      // Call dummy payment API
      const response = await apiClient.post('/api/payments/dummy', paymentData);

      if (response.data.success) {
        toast.success('Payment processed successfully!');
        router.push(
          `/doctor/subscriptions/payment/success?txn=${response.data.data.transactionId}&planId=${planId}`
        );
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  // Get the selected pricing option or default to first one
  const selectedPricing = pricingId 
    ? plan.pricingOptions?.find(p => p.id === pricingId)
    : plan.pricingOptions?.[0];
  
  const priceInDollars = selectedPricing ? selectedPricing.price / 100 : parseFloat(amount || '0');
  const displayCurrency = selectedPricing?.currency || currency;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/doctor/subscriptions"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Plans</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Plan Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h2>
              <p className="text-sm text-gray-600">Subscription Plan</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {displayCurrency === 'INR' ? '₹' : '$'}{priceInDollars.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                per {selectedPricing?.billingCycle === 'monthly' ? 'month' : 
                     selectedPricing?.billingCycle === 'quarterly' ? 'quarter' :
                     selectedPricing?.billingCycle === 'yearly' ? 'year' :
                     `${selectedPricing?.billingPeriodMonths || 1} months`}
              </p>
            </div>
          </div>
        </div>

        {/* Dummy Payment Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-1">Test Mode - Dummy Payment</p>
              <p className="text-xs text-yellow-700">
                This is a test payment. Use any card number (e.g., 4242 4242 4242 4242), any future expiry date (e.g., 12/25), and any 3-digit CVV to test the flow.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Information</h3>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className={`w-8 h-8 mx-auto mb-2 ${
                  paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  paymentMethod === 'card' ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  Card
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'upi'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className={`w-8 h-8 mx-auto mb-2 ${
                  paymentMethod === 'upi' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  paymentMethod === 'upi' ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  UPI
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'netbanking'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building2 className={`w-8 h-8 mx-auto mb-2 ${
                  paymentMethod === 'netbanking' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  paymentMethod === 'netbanking' ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  Net Banking
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })
                    }
                    placeholder="4242 4242 4242 4242"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={19}
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Test card: 4242 4242 4242 4242
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: formatExpiryDate(e.target.value) })
                      }
                      placeholder="MM/YY"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                      maxLength={5}
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) =>
                        setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })
                      }
                      placeholder="123"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cvv ? 'border-red-300' : 'border-gray-300'
                      }`}
                      maxLength={3}
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={formData.cardholderName}
                    onChange={(e) =>
                      setFormData({ ...formData, cardholderName: e.target.value })
                    }
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cardholderName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.cardholderName && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
                  )}
                </div>
              </div>
            )}

            {/* UPI Payment Form */}
            {paymentMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  placeholder="username@paytm"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.upiId ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.upiId && (
                  <p className="mt-1 text-sm text-red-600">{errors.upiId}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Test UPI: test@upi
                </p>
              </div>
            )}

            {/* Net Banking Form */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="State Bank of India"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bankName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.bankName && (
                    <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })
                    }
                    placeholder="Account Number"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.accountNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.accountNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ${displayCurrency === 'INR' ? '₹' : '$'}${priceInDollars.toLocaleString()}`
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <PaymentFormContent />
    </Suspense>
  );
}








