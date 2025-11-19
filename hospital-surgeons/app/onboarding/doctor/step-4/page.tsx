'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Specialty {
  id: string;
  name: string;
}

export default function DoctorStep4Page() {
  const router = useRouter();
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [primarySpecialty, setPrimarySpecialty] = useState<string>('');

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

  const toggleSpecialty = (specialtyId: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialtyId)
        ? prev.filter((id) => id !== specialtyId)
        : [...prev, specialtyId]
    );
    
    // Set as primary if it's the first one
    if (!primarySpecialty && !selectedSpecialties.includes(specialtyId)) {
      setPrimarySpecialty(specialtyId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSpecialties.length === 0) {
      alert('Please select at least one specialty');
      return;
    }

    try {
      const doctorId = localStorage.getItem('doctorId');
      if (!doctorId) {
        router.push('/onboarding/doctor/step-3');
        return;
      }

      // Add specialties
      for (const specialtyId of selectedSpecialties) {
        await fetch(`/api/doctors/${doctorId}/specialties`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            specialtyId,
            isPrimary: specialtyId === primarySpecialty,
          }),
        });
      }

      router.push('/onboarding/doctor/step-5');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/onboarding/doctor/step-3" className="text-gray-600">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Specialties</h1>
        <p className="text-gray-600 mb-8">Choose the medical specialties you practice</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Specialties Selection */}
          <div>
            <p className="text-sm text-gray-600 mb-4">Select all specialties that apply</p>
            <div className="grid grid-cols-2 gap-3">
              {specialties.map((specialty) => (
                <button
                  key={specialty.id}
                  type="button"
                  onClick={() => toggleSpecialty(specialty.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedSpecialties.includes(specialty.id)
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
                  {selectedSpecialties.includes(specialty.id) && specialty.id === primarySpecialty && (
                    <p className="text-xs text-blue-600 mt-1">Primary</p>
                  )}
                </button>
              ))}
            </div>
          </div>

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

