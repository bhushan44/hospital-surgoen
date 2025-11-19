'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DoctorStep5Page() {
  const router = useRouter();

  useEffect(() => {
    // Mark onboarding as complete
    const doctorId = localStorage.getItem('doctorId');
    if (doctorId) {
      // Update doctor profile to mark onboarding complete
      fetch(`/api/doctors/${doctorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          // Add any final onboarding fields
        }),
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full absolute top-0 p-4">
        <div className="w-6"></div>
        <div className="text-sm text-gray-600">Step 5 of 5</div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-16 left-0 right-0 px-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>

      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Your profile is ready!
      </h1>
      <p className="text-gray-600 mb-12 text-center">
        Your doctor account has been set up successfully
      </p>

      {/* What's Next */}
      <div className="w-full max-w-md space-y-4 mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What's next?</h2>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-medium">Set your availability and receive appointment requests</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-medium">Check your notifications for booking requests</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-medium">Complete your profile to enhance visibility</p>
          </div>
        </div>
      </div>

      {/* Go to Dashboard Button */}
      <Link
        href="/doctor/dashboard"
        className="w-full max-w-md bg-blue-600 text-white py-4 rounded-lg font-semibold text-center hover:bg-blue-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

