import { Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function CompleteProfile() {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('verified');
  const [formData, setFormData] = useState({
    firstName: 'Rajesh',
    lastName: 'Sharma',
    licenseNumber: 'MH-DOC-2024-12345',
    yearsOfExperience: '15',
    phone: '+91 9876543210',
    email: 'dr.rajesh@medconnect.com',
    city: 'Mumbai',
    latitude: '19.0760',
    longitude: '72.8777',
    bio: 'Experienced cardiologist with 15+ years of practice. Specialized in interventional cardiology and heart failure management.'
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Complete Profile</h1>
        <p className="text-gray-600">Keep your professional information up to date</p>
      </div>

      {/* Verification Status Banner */}
      {verificationStatus === 'verified' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-green-900 mb-1">Your profile is verified!</h4>
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
              <h4 className="text-amber-900 mb-1">Your profile is under verification</h4>
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
              <h4 className="text-red-900 mb-1">Your verification was rejected</h4>
              <p className="text-sm text-red-800">
                Reason: Medical license number could not be verified. Please update your documents and resubmit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-6">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
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
            <label className="block text-sm text-gray-700 mb-2">
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
            <label className="block text-sm text-gray-700 mb-2">
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
            <label className="block text-sm text-gray-700 mb-2">
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

          {/* Phone Number */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] pr-10"
                placeholder="+91 XXXXX XXXXX"
              />
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1">Verified</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] pr-10"
                placeholder="email@example.com"
              />
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1">Verified</p>
          </div>

          {/* Primary Location */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Primary Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="City name"
              list="cities"
            />
            <datalist id="cities">
              <option value="Mumbai" />
              <option value="Delhi" />
              <option value="Bangalore" />
              <option value="Chennai" />
              <option value="Kolkata" />
            </datalist>
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Latitude
            </label>
            <input
              type="text"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="19.0760"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-populated or use map picker</p>
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Longitude
            </label>
            <input
              type="text"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="72.8777"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-populated or use map picker</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="block text-sm text-gray-700 mb-2">
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
          <button className="px-6 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          <button className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
