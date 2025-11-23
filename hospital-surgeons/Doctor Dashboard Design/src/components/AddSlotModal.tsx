import { X, Calendar } from 'lucide-react';

interface AddSlotModalProps {
  onClose: () => void;
}

export function AddSlotModal({ onClose }: AddSlotModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-gray-900">Add Availability Slot</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Date <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <input 
                type="text"
                defaultValue="Nov 15, 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Start Time <span className="text-[#EF4444]">*</span>
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                <option>2:00 PM</option>
                <option>3:00 PM</option>
                <option>4:00 PM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                End Time <span className="text-[#EF4444]">*</span>
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                <option>5:00 PM</option>
                <option>6:00 PM</option>
                <option>7:00 PM</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea 
              placeholder="Special consultation day..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] resize-none"
            />
          </div>

          {/* Warning */}
          <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-3 flex gap-2">
            <span className="text-[#F59E0B]">⚠️</span>
            <span className="text-sm text-gray-700">This will create one-time slot</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-lg transition-colors">
            Save Slot
          </button>
        </div>
      </div>
    </div>
  );
}
