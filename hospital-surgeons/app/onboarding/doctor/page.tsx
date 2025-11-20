'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Specialty {
  id: string;
  name: string;
}

export default function DoctorRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Form data for all steps
  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: '',
    lastName: '',
    medicalLicenseNumber: '',
    yearsOfPractice: '',
    profilePicture: null as File | null,
    profilePicturePreview: '',
    
    // Step 2: Account
    email: '',
    phone: '',
    password: '',
    
    // Step 3: Professional
    yearsOfExperience: '',
    bio: '',
    
    // Step 4: Specialties
    selectedSpecialties: [] as string[],
    primarySpecialty: '',
  });

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, label: 'Personal' },
    { id: 2, label: 'Practice' },
    { id: 3, label: 'Professional' },
    { id: 4, label: 'Preferences' },
  ];

  useEffect(() => {
    // Fetch specialties for step 4
    fetch('/api/specialties/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSpecialties(data.data || []);
        }
      });
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange('profilePicture', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('profilePicturePreview', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.medicalLicenseNumber.trim()) {
        newErrors.medicalLicenseNumber = 'Medical license number is required';
      }
    } else if (step === 2) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    } else if (step === 3) {
      if (!formData.yearsOfExperience) {
        newErrors.yearsOfExperience = 'Years of experience is required';
      }
    } else if (step === 4) {
      if (formData.selectedSpecialties.length === 0) {
        newErrors.specialties = 'Please select at least one specialty';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    // If on step 2, create account
    if (currentStep === 2) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: 'doctor',
          }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('userId', data.data.user.id);
          localStorage.setItem('token', data.data.accessToken);
          localStorage.setItem('firstName', formData.firstName);
          localStorage.setItem('lastName', formData.lastName);
          setCurrentStep(3);
        } else {
          setErrors({ submit: data.message || data.error || 'Registration failed' });
        }
      } catch (error) {
        console.error('Signup error:', error);
        setErrors({ submit: 'An error occurred. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // If on step 3, create doctor profile
    if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) {
          setErrors({ submit: 'Please complete step 2 first' });
          setIsSubmitting(false);
          return;
        }

        const response = await fetch('/api/doctors/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            medicalLicenseNumber: formData.medicalLicenseNumber,
            yearsOfExperience: parseInt(formData.yearsOfExperience),
            bio: formData.bio,
          }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('doctorId', data.data.id);
          setCurrentStep(4);
        } else {
          setErrors({ submit: data.message || 'Failed to create doctor profile' });
        }
      } catch (error) {
        console.error('Error:', error);
        setErrors({ submit: 'An error occurred. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // If on step 4, save specialties and complete
    if (currentStep === 4) {
      setIsSubmitting(true);
      try {
        const doctorId = localStorage.getItem('doctorId');
        if (!doctorId) {
          setErrors({ submit: 'Please complete previous steps first' });
          setIsSubmitting(false);
          return;
        }

        // Add specialties
        for (const specialtyId of formData.selectedSpecialties) {
          await fetch(`/api/doctors/${doctorId}/specialties`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              specialtyId,
              isPrimary: specialtyId === formData.primarySpecialty,
            }),
          });
        }

        // Redirect to success/dashboard
        router.push('/onboarding/doctor/step-5');
      } catch (error) {
        console.error('Error:', error);
        setErrors({ submit: 'An error occurred. Please try again.' });
        setIsSubmitting(false);
      }
      return;
    }

    // For step 1, just move to next step
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const toggleSpecialty = (specialtyId: string) => {
    const isSelected = formData.selectedSpecialties.includes(specialtyId);
    const newSelected = isSelected
      ? formData.selectedSpecialties.filter((id) => id !== specialtyId)
      : [...formData.selectedSpecialties, specialtyId];

    handleInputChange('selectedSpecialties', newSelected);

    // Set as primary if it's the first one
    if (!formData.primarySpecialty && !isSelected) {
      handleInputChange('primarySpecialty', specialtyId);
    } else if (formData.primarySpecialty === specialtyId && isSelected) {
      // If removing primary, set first remaining as primary
      const remaining = newSelected.filter((id) => id !== specialtyId);
      handleInputChange('primarySpecialty', remaining[0] || '');
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Doctor Profile</h1>
        <p className="text-gray-600 text-center px-4">
          Set up your professional profile to start collaborating with hospitals
        </p>
      </div>

      {/* Progress Card */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Step Labels */}
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-sm font-medium ${
                  step.id === currentStep
                    ? 'text-purple-600'
                    : step.id < currentStep
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Step 1: Personal */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {formData.profilePicturePreview ? (
                    <img
                      src={formData.profilePicturePreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-purple-600">
                        {formData.firstName.charAt(0).toUpperCase() || 'D'}
                      </span>
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
              </div>

              {/* Medical License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical License Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.medicalLicenseNumber}
                  onChange={(e) => handleInputChange('medicalLicenseNumber', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.medicalLicenseNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.medicalLicenseNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.medicalLicenseNumber}</p>
                )}
              </div>

              {/* Years of Practice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Practice
                </label>
                <select
                  value={formData.yearsOfPractice}
                  onChange={(e) => handleInputChange('yearsOfPractice', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select years</option>
                  <option value="0-5">0-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="11-20">11-20 years</option>
                  <option value="21-30">21-30 years</option>
                  <option value="30+">30+ years</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Practice (Account) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Professional */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
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
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about your medical background, specialties, and experience..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Preferences (Specialties) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Your Specialties</h2>
              <p className="text-sm text-gray-600 mb-4">Choose the medical specialties you practice</p>

              {errors.specialties && (
                <p className="text-sm text-red-500 mb-4">{errors.specialties}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                {specialties.map((specialty) => (
                  <button
                    key={specialty.id}
                    type="button"
                    onClick={() => toggleSpecialty(specialty.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.selectedSpecialties.includes(specialty.id)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium">{specialty.name}</span>
                    </div>
                    {formData.selectedSpecialties.includes(specialty.id) &&
                      specialty.id === formData.primarySpecialty && (
                        <p className="text-xs text-purple-600 mt-1">Primary</p>
                      )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : currentStep === totalSteps ? 'Complete' : 'Next'}
              {!isSubmitting && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

