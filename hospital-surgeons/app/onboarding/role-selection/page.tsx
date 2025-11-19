'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedRole === 'hospital') {
      router.push('/onboarding/hospital/step-3');
    } else if (selectedRole === 'doctor') {
      router.push('/onboarding/doctor/step-2');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="text-sm text-gray-600">Step 1 of 5</div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">I am a...</h1>
        <p className="text-gray-600 mb-8">Select your role to customize your experience</p>

        {/* Role Cards */}
        <div className="space-y-4 mb-8">
          {/* Doctor Card */}
          <div
            onClick={() => setSelectedRole('doctor')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedRole === 'doctor'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'doctor' ? 'bg-blue-500' : 'bg-blue-100'
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Doctor</h3>
                <p className="text-sm text-gray-600">Set your availability and receive appointment requests</p>
              </div>
            </div>
          </div>

          {/* Hospital Card */}
          <div
            onClick={() => setSelectedRole('hospital')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedRole === 'hospital'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'hospital' ? 'bg-blue-500' : 'bg-blue-100'
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Hospital</h3>
                <p className="text-sm text-gray-600">Find available doctors and schedule appointments</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center mb-6">You can change your role later in settings</p>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

