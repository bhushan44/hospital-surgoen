import { ChevronLeft, ChevronRight, Phone, Navigation, Eye } from 'lucide-react';

export function TodaySchedule() {
  const schedule = [
    {
      time: '08:00 AM',
      type: 'available',
      duration: '3 hours',
      note: 'Not booked'
    },
    {
      time: '09:00 AM',
      type: 'accepted',
      hospital: 'City Heart Hospital',
      patient: 'John D.',
      condition: 'Cardiology consult',
      status: 'ACCEPTED'
    },
    {
      time: '12:00 PM',
      type: 'break',
      note: 'Lunch Break'
    },
    {
      time: '02:00 PM',
      type: 'pending',
      hospital: 'Metro General',
      patient: 'Sarah K.',
      condition: 'Follow-up consultation',
      expiresIn: '2h 45m',
      status: 'PENDING'
    },
    {
      time: '05:00 PM',
      type: 'available',
      duration: '2 hours',
      note: 'Available for booking'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-gray-900 mb-3">Today's Schedule</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Monday, Nov 11, 2024</span>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button className="px-3 py-1 text-sm bg-[#0066CC] text-white rounded hover:bg-[#0052a3] transition-colors">
              Today
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4 space-y-4 max-h-[700px] overflow-y-auto">
        {schedule.map((item, index) => (
          <div key={index} className="relative">
            {/* Time Label */}
            <div className="flex items-start gap-4">
              <span className="text-sm text-gray-500 w-20 flex-shrink-0">{item.time}</span>
              
              <div className="flex-1">
                {item.type === 'available' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                    <div className="text-sm text-gray-600">[Available Slot]</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.duration} • {item.note}
                    </div>
                  </div>
                )}

                {item.type === 'break' && (
                  <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <div className="text-sm text-gray-600">[{item.note}]</div>
                  </div>
                )}

                {item.type === 'accepted' && (
                  <div className="border-2 border-[#10B981] rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 bg-[#10B981] text-white rounded">
                        ✅ {item.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 mb-1">{item.hospital}</div>
                    <div className="text-sm text-gray-600 mb-1">Patient: {item.patient}</div>
                    <div className="text-sm text-gray-500 mb-3">{item.condition}</div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                        <Phone className="w-3 h-3" /> Call
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                        <Navigation className="w-3 h-3" /> Nav
                      </button>
                    </div>
                  </div>
                )}

                {item.type === 'pending' && (
                  <div className="border-2 border-[#F59E0B] rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 bg-[#F59E0B] text-white rounded">
                        ⏰ {item.status}
                      </span>
                      <span className="text-xs text-[#F59E0B]">Expires: {item.expiresIn}</span>
                    </div>
                    <div className="text-sm text-gray-900 mb-1">{item.hospital}</div>
                    <div className="text-sm text-gray-600 mb-1">Patient: {item.patient}</div>
                    <div className="text-sm text-gray-500 mb-3">{item.condition}</div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 text-sm bg-[#10B981] hover:bg-[#059669] text-white rounded transition-colors">
                        ACCEPT
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm bg-[#EF4444] hover:bg-[#dc2626] text-white rounded transition-colors">
                        DECLINE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
