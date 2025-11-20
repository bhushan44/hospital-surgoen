'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HospitalProfile {
  id: string;
  name: string;
  hospitalType: string;
  email: string;
  phone: string;
  address: string;
  departments: Array<{ id: string; name: string }>;
}

export default function HospitalProfilePage() {
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hospitalId = localStorage.getItem('hospitalId');
    if (!hospitalId) {
      // Redirect to login if no hospital ID
      return;
    }

    fetch(`/api/hospitals/${hospitalId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.data.hospital);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">DocSchedule</h1>
      </div>

      {/* Profile Section */}
      <div className="bg-white">
        <h2 className="text-2xl font-bold text-gray-900 p-4">Profile</h2>

        {/* Banner Image */}
        <div className="h-32 bg-blue-600 relative">
          {/* Profile Picture */}
          <div className="absolute bottom-0 left-4 transform translate-y-1/2">
            <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Hospital Info */}
        <div className="pt-12 px-4 pb-4">
          <h3 className="text-2xl font-bold text-gray-900">{profile?.name || 'Hospital Name'}</h3>
          <p className="text-gray-600 mt-1">{profile?.hospitalType || 'General Hospital'}</p>

          {/* Contact Info */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700">{profile?.email || 'appointments@hospital.com'}</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-gray-700">{profile?.phone || '+1 (555) 987-6543'}</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-700">{profile?.address || '123 Medical Center Blvd, New York, NY'}</span>
            </div>
          </div>

          {/* Departments */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Departments</h4>
            <div className="flex flex-wrap gap-2">
              {profile?.departments?.map((dept) => (
                <span
                  key={dept.id}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {dept.name}
                </span>
              )) || (
                <>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Cardiology</span>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Neurology</span>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Pediatrics</span>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Orthopedics</span>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Emergency</span>
                </>
              )}
            </div>
          </div>

          {/* Edit Profile Button */}
          <Link
            href="/hospital/profile/edit"
            className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-center block"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
        <Link href="/hospital/dashboard" className="flex flex-col items-center gap-1">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-gray-400">Schedule</span>
        </Link>
        <Link href="/hospital/alerts" className="flex flex-col items-center gap-1">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs text-gray-400">Alerts</span>
        </Link>
        <Link href="/hospital/profile" className="flex flex-col items-center gap-1">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs text-blue-600 font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}







