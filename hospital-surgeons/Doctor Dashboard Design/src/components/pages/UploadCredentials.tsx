import { Upload, FileText, Trash2, CheckCircle, Clock, X, Plus } from 'lucide-react';
import { useState } from 'react';

interface Credential {
  id: number;
  title: string;
  institution: string;
  fileName: string;
  uploadDate: string;
  status: 'verified' | 'pending' | 'rejected';
  rejectionReason?: string;
}

export function UploadCredentials() {
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([
    {
      id: 1,
      title: 'MBBS Degree',
      institution: 'AIIMS Delhi',
      fileName: 'MBBS_Certificate.pdf',
      uploadDate: 'Nov 10, 2024',
      status: 'verified'
    },
    {
      id: 2,
      title: 'MD Cardiology',
      institution: 'PGI Chandigarh',
      fileName: 'MD_Cardiology.pdf',
      uploadDate: 'Nov 12, 2024',
      status: 'pending'
    }
  ]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      setCredentials(credentials.filter(c => c.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
            <X className="w-3 h-3" /> Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Upload Credentials</h1>
          <p className="text-gray-600">Add your medical certificates and licenses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload New
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl text-gray-900 mb-1">{credentials.length}</div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="text-2xl text-green-600 mb-1">
            {credentials.filter(c => c.status === 'verified').length}
          </div>
          <div className="text-sm text-gray-600">Verified</div>
        </div>
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <div className="text-2xl text-amber-600 mb-1">
            {credentials.filter(c => c.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
      </div>

      {/* Credentials List */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
        {credentials.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No credentials uploaded yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
            >
              Upload Your First Credential
            </button>
          </div>
        ) : (
          credentials.map((cred) => (
            <div key={cred.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-gray-900">{cred.title}</h4>
                      {getStatusBadge(cred.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{cred.institution}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📄 {cred.fileName}</span>
                      <span>📅 {cred.uploadDate}</span>
                    </div>
                    {cred.status === 'rejected' && cred.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        Reason: {cred.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDelete(cred.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onUpload={(newCred) => {
            setCredentials([...credentials, { ...newCred, id: Date.now() }]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function UploadModal({
  onClose,
  onUpload
}: {
  onClose: () => void;
  onUpload: (cred: Omit<Credential, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    institution: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      onUpload({
        title: formData.title,
        institution: formData.institution,
        fileName: file.name,
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'pending'
      });
      setUploading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Upload Credential</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Credential Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., MBBS Degree, MD Certificate"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              required
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Institution <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="e.g., AIIMS Delhi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Upload Document <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {file ? (
                <div className="space-y-2">
                  <FileText className="w-8 h-8 text-green-600 mx-auto" />
                  <p className="text-sm text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <label className="text-sm text-[#2563EB] hover:text-[#1d4ed8] cursor-pointer">
                    Choose file
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG or PNG (Max 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              Your document will be reviewed by our admin team within 24-48 hours.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !formData.title || !formData.institution || uploading}
              className="flex-1 px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
