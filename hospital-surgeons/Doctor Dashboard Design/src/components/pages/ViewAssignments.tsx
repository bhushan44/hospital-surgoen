import { Clock, CheckCircle, X, Building2, User, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';

interface Assignment {
  id: number;
  hospitalName: string;
  patientName: string;
  patientAge: number;
  condition: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  priority: 'routine' | 'urgent' | 'emergency';
  expiresIn?: string;
}

export function ViewAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 1,
      hospitalName: 'City Heart Hospital',
      patientName: 'John Doe',
      patientAge: 45,
      condition: 'Chest pain, suspected cardiac issue',
      date: '2024-11-25',
      time: '09:00 AM - 12:00 PM',
      status: 'pending',
      priority: 'urgent',
      expiresIn: '4h 30m'
    },
    {
      id: 2,
      hospitalName: 'Metro General Hospital',
      patientName: 'Sarah Khan',
      patientAge: 32,
      condition: 'Post-surgery follow-up',
      date: '2024-11-26',
      time: '02:00 PM - 04:00 PM',
      status: 'pending',
      priority: 'routine',
      expiresIn: '18h 15m'
    },
    {
      id: 3,
      hospitalName: 'Apollo Clinic',
      patientName: 'Ravi Kumar',
      patientAge: 58,
      condition: 'Hypertension checkup',
      date: '2024-11-24',
      time: '10:00 AM - 11:00 AM',
      status: 'accepted',
      priority: 'routine'
    },
  ]);

  const handleAccept = (id: number) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: 'accepted' as const } : a
    ));
  };

  const handleDecline = (id: number) => {
    if (window.confirm('Are you sure you want to decline this assignment?')) {
      setAssignments(assignments.map(a => 
        a.id === id ? { ...a, status: 'declined' as const } : a
      ));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-700';
      case 'urgent': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'declined': return 'bg-gray-100 text-gray-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
    }
  };

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const acceptedCount = assignments.filter(a => a.status === 'accepted').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">View Assignments</h1>
        <p className="text-gray-600">Manage your assignment requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl text-gray-900 mb-1">{assignments.length}</div>
          <div className="text-sm text-gray-600">Total Assignments</div>
        </div>
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <div className="text-2xl text-orange-600 mb-1">{pendingCount}</div>
          <div className="text-sm text-gray-600">Pending Response</div>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="text-2xl text-green-600 mb-1">{acceptedCount}</div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No assignments yet</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900">{assignment.hospitalName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(assignment.status)}`}>
                        {assignment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expiry Timer */}
                {assignment.status === 'pending' && assignment.expiresIn && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Expires in</p>
                    <p className="text-sm text-orange-600">{assignment.expiresIn}</p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{assignment.patientName}, {assignment.patientAge} years</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{assignment.condition}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(assignment.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{assignment.time}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {assignment.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleAccept(assignment.id)}
                    className="flex-1 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(assignment.id)}
                    className="flex-1 px-4 py-2 bg-[#EF4444] hover:bg-[#dc2626] text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              )}

              {assignment.status === 'accepted' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">You have accepted this assignment</span>
                  </div>
                </div>
              )}

              {assignment.status === 'declined' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <X className="w-5 h-5" />
                    <span className="text-sm">You have declined this assignment</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
