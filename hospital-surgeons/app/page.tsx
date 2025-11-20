'use client';

import Link from 'next/link';
import { Building2, UserCog, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">DocSchedule</h1>
          <p className="text-gray-600">Connect hospitals with available doctors</p>
        </div>

        {/* Three Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Doctor Module */}
          <Link
            href="/doctor/dashboard"
            className="block p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <UserCog className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Doctor</h2>
            <p className="text-gray-600 text-sm text-center">
              Manage your schedule, view appointments, and handle assignments
            </p>
          </Link>

          {/* Hospital Module */}
          <Link
            href="/hospital/dashboard"
            className="block p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Hospital</h2>
            <p className="text-gray-600 text-sm text-center">
              Assign doctors to patients, manage rooms, and track assignments
            </p>
          </Link>

          {/* Admin Module */}
          <Link
            href="/admin"
            className="block p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Admin</h2>
            <p className="text-gray-600 text-sm text-center">
              Manage users, verifications, analytics, and system settings
            </p>
          </Link>
        </div>

        {/* Additional Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center border-t pt-6">
          <Link
            href="/onboarding/welcome"
            className="block w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Get Started / Sign In
          </Link>
          <Link
            href="/api-docs"
            className="block w-full sm:w-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
          >
            API Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
