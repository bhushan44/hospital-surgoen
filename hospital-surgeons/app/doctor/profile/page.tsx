'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  medicalLicenseNumber: string;
  yearsOfExperience: number;
  bio: string;
  averageRating: number;
  specialties: Array<{ id: string; name: string }>;
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
      // Redirect to login if no doctor ID
      return;
    }

    fetch(`/api/doctors/${doctorId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="pt-12 px-4 pb-4">
          <h3 className="text-2xl font-bold text-gray-900">
            Dr. {profile?.firstName || 'John'} {profile?.lastName || 'Doe'}
          </h3>
          <p className="text-gray-600 mt-1">Medical License: {profile?.medicalLicenseNumber || 'LIC-12345'}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-4">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-lg font-semibold text-gray-900">{profile?.averageRating || '4.8'}</span>
            <span className="text-sm text-gray-600">({profile?.yearsOfExperience || 10} years experience)</span>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">About</h4>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}

          {/* Specialties */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {profile?.specialties?.map((specialty) => (
                <span
                  key={specialty.id}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {specialty.name}
                </span>
              )) || (
                <>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Cardiology</span>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Internal Medicine</span>
                </>
              )}
            </div>
          </div>

          {/* Edit Profile Button */}
          <Link
            href="/doctor/profile/edit"
            className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-center block"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
        <Link href="/doctor/dashboard" className="flex flex-col items-center gap-1">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-gray-400">Schedule</span>
        </Link>
        <Link href="/doctor/alerts" className="flex flex-col items-center gap-1">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs text-gray-400">Alerts</span>
        </Link>
        <Link href="/doctor/profile" className="flex flex-col items-center gap-1">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs text-blue-600 font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}




