'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Specialty {
  id: string;
  name: string;
}

export default function HospitalStep4Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hospitalType: '',
    phone: '',
    address: '',
  });
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch specialties
    fetch('/api/specialties/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSpecialties(data.data || []);
        }
      });
  }, []);

  const toggleDepartment = (specialtyId: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(specialtyId)
        ? prev.filter((id) => id !== specialtyId)
        : [...prev, specialtyId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hospitalId = localStorage.getItem('hospitalId');
      if (!hospitalId) {
        router.push('/onboarding/hospital/step-3');
        return;
      }

      // Update hospital details
      const updateResponse = await fetch(`/api/hospitals/${hospitalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          hospitalType: formData.hospitalType,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      // Add departments
      for (const specialtyId of selectedDepartments) {
        await fetch(`/api/hospitals/${hospitalId}/departments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ specialtyId }),
        });
      }

      // Update onboarding step
      await fetch(`/api/hospitals/${hospitalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ onboardingStep: 4 }),
      });

      router.push('/onboarding/hospital/step-5');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/onboarding/hospital/step-3" className="text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="text-sm text-gray-600">Step 3 of 5</div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hospital Details</h1>
        <p className="text-gray-600 mb-8">Complete your hospital profile to help doctors find you</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hospital Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <select
                value={formData.hospitalType}
                onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select hospital type</option>
                <option value="General Hospital">General Hospital</option>
                <option value="Specialty Hospital">Specialty Hospital</option>
                <option value="Clinic">Clinic</option>
                <option value="Diagnostic Center">Diagnostic Center</option>
              </select>
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 987-6543"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Medical Center Blvd, New York"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Departments */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Departments</h3>
            <p className="text-sm text-gray-600 mb-4">Select all departments that apply</p>
            <div className="grid grid-cols-2 gap-3">
              {specialties.map((specialty) => (
                <button
                  key={specialty.id}
                  type="button"
                  onClick={() => toggleDepartment(specialty.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedDepartments.includes(specialty.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">{specialty.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

