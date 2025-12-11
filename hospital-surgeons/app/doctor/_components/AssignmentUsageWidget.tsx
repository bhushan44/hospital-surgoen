'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/httpClient';

interface UsageData {
  used: number;
  limit: number;
  percentage: number;
  status: 'ok' | 'warning' | 'critical' | 'reached';
  resetDate: string;
  remaining: number;
  plan: string;
}

export function AssignmentUsageWidget() {
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctorId();
  }, []);

  useEffect(() => {
    if (doctorId) {
      fetchUsage();
    }
  }, [doctorId]);

  const fetchDoctorId = async () => {
    try {
      const response = await apiClient.get('/api/doctors/profile');
      if (response.data.success && response.data.data) {
        setDoctorId(response.data.data.id);
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

  const fetchUsage = async () => {
    if (!doctorId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/doctors/${doctorId}/assignment-usage`);
      if (response.data.success) {
        setUsage(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usage) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (usage.status) {
      case 'reached': return 'bg-red-500';
      case 'critical': return 'bg-orange-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    switch (usage.status) {
      case 'reached': return 'Limit Reached';
      case 'critical': return 'Almost Full';
      case 'warning': return 'Getting Close';
      default: return 'On Track';
    }
  };

  const resetDate = new Date(usage.resetDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isUnlimited = usage.limit === -1;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Assignment Usage
        </h3>
        <span className={`text-xs px-2 py-1 rounded ${
          usage.status === 'reached' ? 'bg-red-100 text-red-700' :
          usage.status === 'critical' ? 'bg-orange-100 text-orange-700' :
          usage.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {getStatusText()}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>
            {usage.used} / {isUnlimited ? '∞' : usage.limit} used
          </span>
          {!isUnlimited && <span>{usage.percentage}%</span>}
        </div>
        {!isUnlimited && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getStatusColor()}`}
              style={{ width: `${Math.min(usage.percentage, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Plan Info */}
      <div className="text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1 mb-1">
          <Calendar className="w-3 h-3" />
          <span>Resets on {resetDate}</span>
        </div>
        <div>Plan: {usage.plan}</div>
      </div>

      {/* Warning/Upgrade Prompt */}
      {usage.status === 'reached' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-red-900 mb-1">
                Limit Reached
              </p>
              <p className="text-xs text-red-700 mb-2">
                You've used all {usage.limit} assignments this month. New assignments will be available on {resetDate}.
              </p>
              <button
                onClick={() => router.push('/doctor/subscriptions')}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors font-medium"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {(usage.status === 'critical' || usage.status === 'warning') && (
        <div className={`border rounded-lg p-3 mb-3 ${
          usage.status === 'critical' 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-2">
            <TrendingUp className={`w-4 h-4 mt-0.5 ${
              usage.status === 'critical' ? 'text-orange-600' : 'text-yellow-600'
            }`} />
            <div className="flex-1">
              <p className={`text-xs font-medium mb-1 ${
                usage.status === 'critical' ? 'text-orange-900' : 'text-yellow-900'
              }`}>
                {usage.remaining} assignment{usage.remaining !== 1 ? 's' : ''} remaining
              </p>
              <button
                onClick={() => router.push('/doctor/subscriptions')}
                className={`text-xs px-3 py-1.5 rounded transition-colors font-medium ${
                  usage.status === 'critical'
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Link */}
      <button
        onClick={() => router.push('/doctor/assignments')}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
      >
        View All Assignments →
      </button>
    </div>
  );
}





