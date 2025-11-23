import { Filter, ChevronRight, MapPin, FileText } from 'lucide-react';

export function ActionCenter() {
  const pendingRequests = [
    {
      priority: 'EMERGENCY',
      color: '#EF4444',
      expiresIn: '45 minutes',
      hospital: 'City Heart Hospital',
      patient: 'John Doe',
      age: 44,
      condition: 'Severe chest pain',
      time: '3:00 PM - 5:00 PM',
      date: 'Today, Nov 11'
    },
    {
      priority: 'URGENT',
      color: '#F59E0B',
      expiresIn: '5 hours 20 min',
      hospital: 'Metro General Hospital',
      patient: 'Sarah Khan',
      age: 32,
      condition: 'Post-surgery follow-up',
      time: '10:00 AM - 12:00 PM',
      date: 'Nov 12, 2024'
    }
  ];

  const upcomingAssignments = [
    {
      date: 'Nov 13',
      time: '9:00 AM - 12:00 PM',
      hospital: 'City Heart Hospital',
      patient: 'Ravi P.',
      type: 'Routine checkup'
    },
    {
      date: 'Nov 13',
      time: '2:00 PM - 4:00 PM',
      hospital: 'Metro General',
      patient: 'Priya M.',
      type: 'Follow-up'
    }
  ];

  const recentActivity = [
    {
      time: '2 min ago',
      text: 'Accepted assignment from City Heart',
      icon: '✅'
    },
    {
      time: '1 hour ago',
      text: 'Completed: John Doe consultation',
      icon: '✓'
    },
    {
      time: '3 hours ago',
      text: 'Assignment expired (no response)',
      icon: '⏰'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-gray-900">ACTION REQUIRED (2)</h2>
          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {pendingRequests.map((request, index) => (
            <div 
              key={index} 
              className="border-2 rounded-lg p-4"
              style={{ borderColor: request.color }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span 
                  className="text-xs px-2 py-1 text-white rounded"
                  style={{ backgroundColor: request.color }}
                >
                  {request.priority === 'EMERGENCY' ? '🔴' : '🟡'} {request.priority}
                </span>
                <span className="text-xs" style={{ color: request.color }}>
                  ⏰ Expires in: {request.expiresIn}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-gray-900">{request.hospital}</div>
                <div className="text-sm text-gray-600">
                  Patient: {request.patient}, Age {request.age}
                </div>
                <div className="text-sm text-gray-600">
                  Condition: {request.condition}
                </div>
                <div className="text-sm text-gray-600">
                  Time: {request.time}
                </div>
                <div className="text-sm text-gray-600">
                  Date: {request.date}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded transition-colors">
                  VIEW DETAILS
                </button>
                <button 
                  className="flex-1 px-4 py-2 text-sm text-white rounded transition-colors"
                  style={{ 
                    backgroundColor: request.priority === 'EMERGENCY' ? '#10B981' : '#10B981' 
                  }}
                >
                  {request.priority === 'EMERGENCY' ? '✓ ACCEPT NOW' : 'Accept'}
                </button>
                <button className="flex-1 px-4 py-2 text-sm bg-[#EF4444] hover:bg-[#dc2626] text-white rounded transition-colors">
                  {request.priority === 'EMERGENCY' ? '✗ DECLINE' : 'Decline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-gray-900">UPCOMING (5)</h2>
          <button className="text-sm text-[#0066CC] hover:underline">View All</button>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingAssignments.map((assignment, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="text-sm text-gray-600 mb-2">
                {assignment.date} • {assignment.time}
              </div>
              <div className="text-gray-900 mb-1 flex items-center gap-2">
                🏥 {assignment.hospital}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Patient: {assignment.patient} • {assignment.type}
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                  <MapPin className="w-3 h-3" /> Directions
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                  <FileText className="w-3 h-3" /> Notes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-gray-900">RECENT ACTIVITY</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="text-sm text-gray-500 mb-1">
                {activity.icon} {activity.time}
              </div>
              <div className="text-sm text-gray-700">{activity.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
