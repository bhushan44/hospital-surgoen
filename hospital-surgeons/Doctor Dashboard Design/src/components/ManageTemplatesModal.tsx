import { X, Plus } from 'lucide-react';

interface ManageTemplatesModalProps {
  onClose: () => void;
}

export function ManageTemplatesModal({ onClose }: ManageTemplatesModalProps) {
  const templates = [
    {
      name: 'Regular OPD Hours',
      days: 'Mon, Wed, Fri',
      time: '9:00 AM - 12:00 PM',
      validity: 'Nov 1 - Dec 31'
    },
    {
      name: 'Evening Consultations',
      days: 'Tue, Thu',
      time: '5:00 PM - 8:00 PM',
      validity: 'Nov 1 - Dec 31'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-gray-900">Recurring Availability</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Create New Template</span>
          </button>

          <div>
            <h3 className="text-sm text-gray-600 mb-4">Active Templates:</h3>
            <div className="space-y-4">
              {templates.map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-gray-900 mb-2">{template.name}</h4>
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <div>{template.days}</div>
                    <div>{template.time}</div>
                    <div>Valid: {template.validity}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 rounded transition-colors">
                      Edit
                    </button>
                    <button className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 rounded transition-colors">
                      Duplicate
                    </button>
                    <button className="px-3 py-1.5 text-sm border border-[#EF4444] text-[#EF4444] hover:bg-red-50 rounded transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
