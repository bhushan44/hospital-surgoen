import { Plus, Settings, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface ManagementStatsProps {
  onAddSlot: () => void;
  onManageTemplates: () => void;
}

export function ManagementStats({ onAddSlot, onManageTemplates }: ManagementStatsProps) {
  const hospitals = [
    { name: 'City Heart Hospital', preferred: true },
    { name: 'Metro General', preferred: true },
    { name: 'Apollo Clinic', preferred: false },
    { name: 'Fortis Healthcare', preferred: false }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900">AVAILABILITY</h3>
        </div>
        <div className="p-4 space-y-3">
          <button 
            onClick={onAddSlot}
            className="w-full flex items-center gap-2 px-4 py-3 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Slot</span>
          </button>
          <button 
            onClick={onManageTemplates}
            className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Templates</span>
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            <CalendarDays className="w-4 h-4" />
            <span>View Calendar</span>
          </button>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-gray-900">November 2024</h3>
          <div className="flex gap-1">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(30)].map((_, i) => {
              const day = i + 1;
              let dotColor = '';
              if (day === 11) dotColor = 'bg-[#0066CC]'; // Today - booked
              else if ([13, 15, 17].includes(day)) dotColor = 'bg-[#10B981]'; // Available
              else if ([20, 21, 22].includes(day)) dotColor = 'bg-[#EF4444]'; // Leave
              
              return (
                <div key={i} className="aspect-square flex flex-col items-center justify-center">
                  <span className={`text-sm ${day === 11 ? 'text-[#0066CC]' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  {dotColor && (
                    <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-0.5`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0066CC]" />
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span>Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span>Blocked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900">LEAVE MANAGEMENT</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-2">Upcoming Leave:</div>
            <div className="text-sm text-gray-700">🏖️ Nov 20-22 (Vacation)</div>
          </div>
          <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            Mark New Leave
          </button>
          <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            View All Leaves
          </button>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900">THIS MONTH</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="text-gray-900">42</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Acceptance</span>
            <span className="text-gray-900">94%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Rating</span>
            <span className="text-gray-900">4.8 ⭐</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Revenue</span>
            <span className="text-gray-900">₹1,26,000</span>
          </div>
          <button className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            View Detailed Report
          </button>
        </div>
      </div>

      {/* Affiliated Hospitals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-gray-900">HOSPITALS (8/10)</h3>
          <button className="text-[#0066CC] hover:underline">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {hospitals.map((hospital, index) => (
            <div key={index} className="text-sm text-gray-700 flex items-center gap-2">
              {hospital.preferred && <span>⭐</span>}
              <span>{hospital.name}</span>
            </div>
          ))}
          <button className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            View All
          </button>
        </div>
      </div>
    </div>
  );
}
