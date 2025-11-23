import { Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { useState } from 'react';

interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked';
}

export function SetAvailability() {
  const [showModal, setShowModal] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([
    { id: 1, date: '2024-11-25', startTime: '09:00', endTime: '12:00', status: 'available' },
    { id: 2, date: '2024-11-26', startTime: '14:00', endTime: '17:00', status: 'booked' },
    { id: 3, date: '2024-11-27', startTime: '09:00', endTime: '12:00', status: 'available' },
  ]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      setSlots(slots.filter(s => s.id !== id));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const availableSlots = slots.filter(s => s.status === 'available').length;
  const bookedSlots = slots.filter(s => s.status === 'booked').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Set Availability</h1>
          <p className="text-gray-600">Manage your available time slots</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Slot
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl text-gray-900 mb-1">{slots.length}</div>
          <div className="text-sm text-gray-600">Total Slots</div>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="text-2xl text-green-600 mb-1">{availableSlots}</div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <div className="text-2xl text-orange-600 mb-1">{bookedSlots}</div>
          <div className="text-sm text-gray-600">Booked</div>
        </div>
      </div>

      {/* Slots List */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
        {slots.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No availability slots set yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
            >
              Add Your First Slot
            </button>
          </div>
        ) : (
          slots.map((slot) => (
            <div key={slot.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    slot.status === 'available' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <Calendar className={`w-6 h-6 ${
                      slot.status === 'available' ? 'text-green-600' : 'text-orange-600'
                    }`} />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-gray-900">{formatDate(slot.date)}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        slot.status === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {slot.status === 'available' ? 'Available' : 'Booked'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {slot.status === 'available' && (
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Slot Modal */}
      {showModal && (
        <AddSlotModal
          onClose={() => setShowModal(false)}
          onAdd={(newSlot) => {
            setSlots([...slots, { ...newSlot, id: Date.now(), status: 'available' }]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddSlotModal({
  onClose,
  onAdd
}: {
  onClose: () => void;
  onAdd: (slot: Omit<TimeSlot, 'id' | 'status'>) => void;
}) {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate end time is after start time
    if (formData.endTime <= formData.startTime) {
      alert('End time must be after start time');
      return;
    }

    onAdd(formData);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Add Availability Slot</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={today}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              required
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                required
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              This slot will be visible to hospitals and can receive assignment requests.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg transition-colors"
            >
              Add Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
