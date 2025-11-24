'use client';

import { Upload, FileText, Download, Eye, Trash2, CheckCircle, Clock, X, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/utils';
import apiClient from '@/lib/api/httpClient';
import type { AxiosError } from 'axios';

interface Credential {
  id: string;
  credentialType: string;
  title: string;
  institution?: string | null;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  fileId: string;
  uploadedAt: string;
  file?: {
    id: string;
    fileName: string;
    fileSize?: number;
    fileUrl?: string;
  };
}

export default function CredentialsDocumentsPage() {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    credentialType: 'Degree',
    title: '',
    institution: '',
    file: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchDoctorProfile();
  }, []);

  useEffect(() => {
    if (doctorId) {
      fetchCredentials();
    }
  }, [doctorId]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await apiClient.get('/api/doctors/profile');
      const data = response.data;
      
      if (data.success && data.data?.id) {
        setDoctorId(data.data.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status !== 404) {
        console.error('Error fetching doctor profile:', error);
      }
      setLoading(false);
    }
  };

  const fetchCredentials = async () => {
    if (!doctorId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/doctors/${doctorId}/credentials`);
      const data = response.data;
      
      if (data.success && data.data) {
        setCredentials(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success && response.data.data?.id) {
        return response.data.data.id;
      }
      return null;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.file) newErrors.file = 'File is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!doctorId || !formData.file) return;

    try {
      setSubmitting(true);
      
      // First upload the file
      const fileId = await handleFileUpload(formData.file);
      if (!fileId) {
        setErrors({ submit: 'Failed to upload file. Please try again.' });
        setSubmitting(false);
        return;
      }

      // Then create the credential
      const response = await apiClient.post(`/api/doctors/${doctorId}/credentials`, {
        fileId,
        credentialType: formData.credentialType,
        title: formData.title,
        institution: formData.institution || null,
        verificationStatus: 'pending',
      });
      
      if (response.data.success) {
        await fetchCredentials();
        handleCloseModal();
      } else {
        setErrors({ submit: response.data.message || 'Failed to add credential' });
      }
    } catch (error) {
      console.error('Error adding credential:', error);
      setErrors({ submit: 'Failed to add credential. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) return;
    
    try {
      setDeletingId(id);
      // Note: You may need to add a DELETE endpoint for credentials
      // For now, this is a placeholder
      const response = await apiClient.delete(`/api/doctors/credentials/${id}`);
      
      if (response.data.success) {
        await fetchCredentials();
      } else {
        alert(response.data.message || 'Failed to delete credential');
      }
    } catch (error) {
      console.error('Error deleting credential:', error);
      alert('Failed to delete credential');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setFormData({
      credentialType: 'Degree',
      title: '',
      institution: '',
      file: null,
    });
    setErrors({});
  };

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const stats = {
    total: credentials.length,
    verified: credentials.filter(c => c.verificationStatus === 'verified').length,
    pending: credentials.filter(c => c.verificationStatus === 'pending').length,
    rejected: credentials.filter(c => c.verificationStatus === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-4" />
          <p className="text-slate-600">Loading credentials...</p>
        </div>
      </div>
    );
  }

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
          <div className="text-2xl text-gray-900 mb-1 font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </div>
        
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="text-2xl text-green-600 mb-1 font-bold">{stats.verified}</div>
          <div className="text-sm text-gray-600">Verified</div>
        </div>
        
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <div className="text-2xl text-amber-600 mb-1 font-bold">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <div className="text-2xl text-red-600 mb-1 font-bold">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Credentials Grid */}
      {credentials.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No credentials uploaded yet</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium"
          >
            Upload Your First Credential
          </button>
        </div>
      ) : (
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
              <p className="text-sm text-gray-600 mb-3">{credential.credentialType}</p>

              {/* Institution */}
              {credential.institution && (
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-sm text-gray-500">🏛️</span>
                  <span className="text-sm text-gray-700">{credential.institution}</span>
                </div>
              )}

              {/* Upload Date */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">📅</span>
                <span className="text-sm text-gray-600">Uploaded: {formatDate(credential.uploadedAt)}</span>
              </div>

              {/* File Info */}
              {credential.file && (
                <div className="text-xs text-gray-500 mb-4">
                  {credential.file.fileName} • {formatFileSize(credential.file.fileSize)}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {credential.file?.fileUrl && (
                  <>
                    <button
                      onClick={() => window.open(credential.file?.fileUrl, '_blank')}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center gap-1 transition-colors font-medium"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = credential.file?.fileUrl || '';
                        link.download = credential.file?.fileName || 'download';
                        link.click();
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center gap-1 transition-colors font-medium"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(credential.id)}
                  disabled={deletingId === credential.id}
                  className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === credential.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Upload Credential</h3>
              <button
                onClick={handleCloseModal}
                disabled={submitting || uploadingFile}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {/* Credential Type */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    Credential Type <span className="text-[#EF4444]">*</span>
                  </label>
                  <select
                    value={formData.credentialType}
                    onChange={(e) => setFormData({ ...formData, credentialType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  >
                    <option value="Degree">Degree</option>
                    <option value="Certificate">Certificate</option>
                    <option value="License">License</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Fellowship">Fellowship</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    Title <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., MBBS Degree, MD Cardiology"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-red-600 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    Institution (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g., AIIMS Delhi, PGI Chandigarh"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    Document File <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0066CC] transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, file });
                          setErrors({ ...errors, file: '' });
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        {formData.file ? formData.file.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
                    </label>
                  </div>
                  {errors.file && (
                    <p className="text-red-600 text-xs mt-1">{errors.file}</p>
                  )}
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    {errors.submit}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting || uploadingFile}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingFile}
                  className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {(submitting || uploadingFile) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploadingFile ? 'Uploading...' : submitting ? 'Saving...' : 'Upload Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
