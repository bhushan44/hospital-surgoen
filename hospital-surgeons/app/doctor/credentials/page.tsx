'use client';

import { Upload, FileText, Download, Eye, Trash2, CheckCircle, Clock, X, Plus } from 'lucide-react';
import { useState } from 'react';

export default function CredentialsDocumentsPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [credentials, setCredentials] = useState([
    {
      id: 1,
      type: 'Degree',
      title: 'MBBS Degree',
      description: 'Bachelor of Medicine, Bachelor of Surgery',
      institution: 'All India Institute of Medical Sciences (AIIMS Delhi)',
      uploadDate: 'Nov 15, 2024',
      verificationStatus: 'verified',
      verifiedBy: 'Admin - Dr. Sharma',
      verifiedDate: 'Nov 16, 2024',
      fileName: 'MBBS_Certificate.pdf',
      fileSize: '2.4 MB'
    },
    {
      id: 2,
      type: 'Certificate',
      title: 'MD Cardiology',
      description: 'Doctor of Medicine in Cardiology',
      institution: 'Post Graduate Institute (PGI Chandigarh)',
      uploadDate: 'Nov 15, 2024',
      verificationStatus: 'verified',
      verifiedBy: 'Admin - Dr. Kumar',
      verifiedDate: 'Nov 17, 2024',
      fileName: 'MD_Cardiology.pdf',
      fileSize: '3.1 MB'
    },
    {
      id: 3,
      type: 'License',
      title: 'Medical Council License',
      description: 'Maharashtra Medical Council Registration',
      institution: 'Maharashtra Medical Council',
      uploadDate: 'Nov 15, 2024',
      verificationStatus: 'pending',
      fileName: 'MMC_License.pdf',
      fileSize: '1.8 MB'
    },
    {
      id: 4,
      type: 'Certificate',
      title: 'Fellowship in Interventional Cardiology',
      description: 'Advanced cardiac intervention training',
      institution: 'Escorts Heart Institute, Delhi',
      uploadDate: 'Nov 18, 2024',
      verificationStatus: 'rejected',
      rejectionReason: 'Document quality is poor. Please upload a clearer scan.',
      fileName: 'Fellowship_Certificate.jpg',
      fileSize: '890 KB'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
            <X className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2 text-2xl font-bold">Credentials & Documents</h1>
          <p className="text-gray-600">Manage your professional credentials and certificates</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Upload New Credential
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl text-gray-900 mb-1 font-bold">5</div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </div>
        
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="text-2xl text-green-600 mb-1 font-bold">3</div>
          <div className="text-sm text-gray-600">Verified</div>
        </div>
        
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <div className="text-2xl text-amber-600 mb-1 font-bold">1</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <div className="text-2xl text-red-600 mb-1 font-bold">1</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credentials.map((credential) => (
          <div key={credential.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            {/* Document Icon */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              {getStatusBadge(credential.verificationStatus)}
            </div>

            {/* Title & Description */}
            <h4 className="text-gray-900 mb-1 font-semibold">{credential.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{credential.description}</p>

            {/* Institution */}
            <div className="flex items-start gap-2 mb-2">
              <span className="text-sm text-gray-500">🏛️</span>
              <span className="text-sm text-gray-700">{credential.institution}</span>
            </div>

            {/* Upload Date */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-500">📅</span>
              <span className="text-sm text-gray-600">Uploaded: {credential.uploadDate}</span>
            </div>

            {/* Verification Details */}
            {credential.verificationStatus === 'verified' && (
              <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                <p className="text-xs text-green-800 mb-1">
                  Verified by: {credential.verifiedBy}
                </p>
                <p className="text-xs text-green-700">
                  Verified on: {credential.verifiedDate}
                </p>
              </div>
            )}

            {credential.verificationStatus === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                <p className="text-xs text-red-800">
                  <span className="font-medium">Reason:</span> {credential.rejectionReason}
                </p>
              </div>
            )}

            {/* File Info */}
            <div className="text-xs text-gray-500 mb-4">
              {credential.fileName} • {credential.fileSize}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center gap-1 transition-colors font-medium">
                <Eye className="w-3 h-3" /> View
              </button>
              <button className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center gap-1 transition-colors font-medium">
                <Download className="w-3 h-3" /> Download
              </button>
              <button className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Credential</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600">Upload modal content goes here...</p>
          </div>
        </div>
      )}
    </div>
  );
}

