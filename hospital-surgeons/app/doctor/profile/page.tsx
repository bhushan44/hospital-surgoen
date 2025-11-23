'use client';

import { Save, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/utils';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    licenseNumber: '',
    yearsOfExperience: '',
    bio: ''
  });
  const [userInfo, setUserInfo] = useState({
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (isAuthenticated()) {
      fetchProfile();
    } else {
      router.push('/login');
    }
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/doctors/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      
      console.log('Profile API Response:', { status: response.status, result });
      
      if (response.status === 404 || !result.success) {
        // Profile doesn't exist yet - show empty form for creation
        console.log('Profile not found, showing empty form');
        setDoctorId(null);
        setFormData({
          firstName: '',
          lastName: '',
          licenseNumber: '',
          yearsOfExperience: '',
          bio: ''
        });
        setUserInfo({
          email: '',
          phone: '',
        });
        setVerificationStatus('pending');
        setLoading(false);
        return;
      }
      
      if (result.success && result.data) {
        const doctor = result.data;
        console.log('Doctor data received:', doctor);
        
        setDoctorId(doctor.id);
        setFormData({
          firstName: doctor.firstName || '',
          lastName: doctor.lastName || '',
          licenseNumber: doctor.medicalLicenseNumber || doctor.medical_license_number || '',
          yearsOfExperience: doctor.yearsOfExperience?.toString() || doctor.years_of_experience?.toString() || '',
          bio: doctor.bio || ''
        });
        // User info (email, phone) might be in a separate user object or not returned
        setUserInfo({
          email: (doctor as any).email || '',
          phone: (doctor as any).phone || '',
        });
        // Set verification status based on license verification
        const verificationStatus = doctor.licenseVerificationStatus || doctor.license_verification_status || 'pending';
        if (verificationStatus === 'verified') {
          setVerificationStatus('verified');
        } else if (verificationStatus === 'rejected') {
          setVerificationStatus('rejected');
        } else {
          setVerificationStatus('pending');
        }
      } else {
        console.error('Unexpected response format:', result);
        setError('Failed to load profile: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.licenseNumber || !formData.yearsOfExperience) {
      setError('Please fill in all required fields (First Name, Last Name, License Number, Years of Experience)');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      
      if (!doctorId) {
        // Create new profile
        const response = await fetch('/api/doctors/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            medicalLicenseNumber: formData.licenseNumber,
            yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
            bio: formData.bio,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          alert('Profile created successfully!');
          fetchProfile(); // Refresh to get the doctor ID
        } else {
          setError(result.message || 'Failed to create profile');
        }
      } else {
        // Update existing profile
        const response = await fetch(`/api/doctors/${doctorId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            medicalLicenseNumber: formData.licenseNumber,
            yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
            bio: formData.bio || null,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          alert('Profile updated successfully!');
          fetchProfile(); // Refresh the profile
        } else {
          setError(result.message || 'Failed to update profile');
        }
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-gray-900 mb-2 text-2xl font-bold">Complete Profile</h1>
        <p className="text-gray-600">Keep your professional information up to date</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Verification Status Banner */}
      {verificationStatus === 'verified' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-green-900 mb-1 font-semibold">Your profile is verified!</h4>
              <p className="text-sm text-green-800">
                You can now receive assignment requests from hospitals.
              </p>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-amber-900 mb-1 font-semibold">Your profile is under verification</h4>
              <p className="text-sm text-amber-800">
                This typically takes 24-48 hours. Admin is reviewing your medical license and credentials.
              </p>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-900 mb-1 font-semibold">Your verification was rejected</h4>
              <p className="text-sm text-red-800">
                Reason: Medical license number could not be verified. Please update your documents and resubmit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-6 font-semibold">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="Enter first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="Enter last name"
            />
          </div>

          {/* Medical License Number */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Medical License Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] pr-10"
                placeholder="Enter license number"
              />
              {verificationStatus === 'verified' && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">This will be verified by admin</p>
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="Years of practice"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="block text-sm text-gray-700 mb-2 font-medium">
            Professional Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
            placeholder="Tell hospitals about your experience and specialization..."
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">Maximum 500 characters</p>
            <p className="text-xs text-gray-500">{formData.bio.length}/500</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg flex items-center gap-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
          <button 
            onClick={fetchProfile}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
