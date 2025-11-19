'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DoctorStep3Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    medicalLicenseNumber: '',
    yearsOfExperience: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.medicalLicenseNumber.trim()) {
      newErrors.medicalLicenseNumber = 'Medical license number is required';
    }

    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Years of experience is required';
    } else if (parseInt(formData.yearsOfExperience) < 0) {
      newErrors.yearsOfExperience = 'Years of experience must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId || !token) {
        router.push('/onboarding/doctor/step-2');
        return;
      }

      // Get firstName and lastName from step 2 (stored in localStorage)
      const firstName = localStorage.getItem('firstName') || '';
      const lastName = localStorage.getItem('lastName') || '';

      // Create doctor profile for authenticated user
      const response = await fetch('/api/doctors/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          medicalLicenseNumber: formData.medicalLicenseNumber,
          yearsOfExperience: parseInt(formData.yearsOfExperience),
          bio: formData.bio,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('doctorId', data.data.id);
        router.push('/onboarding/doctor/step-4');
      } else {
        setErrors({ submit: data.message || 'Failed to create doctor profile' });
        console.error('Doctor profile creation failed:', data);
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/onboarding/doctor/step-2" className="text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="text-sm text-gray-600">Step 2 of 5</div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Information</h1>
        <p className="text-gray-600 mb-8">Tell us about your medical practice</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medical License Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical License Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <input
                type="text"
                required
                value={formData.medicalLicenseNumber}
                onChange={(e) => setFormData({ ...formData, medicalLicenseNumber: e.target.value })}
                placeholder="Enter your medical license number"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.medicalLicenseNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.medicalLicenseNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.medicalLicenseNumber}</p>
            )}
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
              placeholder="0"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.yearsOfExperience && (
              <p className="mt-1 text-sm text-red-500">{errors.yearsOfExperience}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio / Professional Summary
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about your medical background, specialties, and experience..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

