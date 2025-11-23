'use client';

import { Plus, Trash2, Clock, Calendar, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AddSlotModal } from '../_components/AddSlotModal';
import { isAuthenticated } from '@/lib/auth/utils';

interface TimeSlot {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked';
  notes?: string | null;
}

export default function SetAvailabilityPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchDoctorProfile();
  }, []);

  useEffect(() => {
    if (doctorId) {
      fetchAvailability();
    }
  }, [doctorId]);

  const fetchDoctorProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch('/api/doctors/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (response.status === 404 || !data.success) {
        // Profile doesn't exist yet - show error but don't redirect
        setError('Please complete your profile first to manage availability. You can still add slots, but they will be linked after profile creation.');
        setLoading(false);
        // Don't redirect - let user stay on the page
        return;
      }
      
      if (data.success && data.data && data.data.id) {
        setDoctorId(data.data.id);
      } else {
        setError('Failed to load doctor profile. Please refresh the page.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      setError('Failed to load doctor profile. Please try again.');
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!doctorId) return;
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/doctors/${doctorId}/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) {
        const formattedSlots = Array.isArray(data.data) ? data.data.map((slot: any) => ({
          id: slot.id,
          slotDate: slot.slotDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status || 'available',
          notes: slot.notes,
        })) : [];
        setSlots(formattedSlots);
      } else {
        setError('Failed to load availability slots');
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this slot?') || deletingId) {
      return;
    }

    try {
      setDeletingId(id);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/doctors/availability/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        // Refresh the list
        await fetchAvailability();
      } else {
        alert(data.message || 'Failed to delete slot');
      }
    } catch (err) {
      console.error('Error deleting slot:', err);
      alert('Failed to delete slot');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSlotAdded = () => {
    fetchAvailability();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    // Convert 24-hour format to 12-hour format if needed
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes || '00'} ${ampm}`;
    }
    return timeStr;
  };

  const availableSlots = slots.filter(s => s.status === 'available').length;
  const bookedSlots = slots.filter(s => s.status === 'booked').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-4" />
          <p className="text-slate-600">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2 text-2xl font-bold">Set Availability</h1>
          <p className="text-gray-600">Manage your available time slots</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Slot
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl text-gray-900 mb-1 font-bold">{slots.length}</div>
          <div className="text-sm text-gray-600">Total Slots</div>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="text-2xl text-green-600 mb-1 font-bold">{availableSlots}</div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <div className="text-2xl text-orange-600 mb-1 font-bold">{bookedSlots}</div>
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
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium"
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
                      <h4 className="text-gray-900 font-semibold">{formatDate(slot.slotDate)}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        slot.status === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {slot.status === 'available' ? 'Available' : 'Booked'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                    </div>
                    {slot.notes && (
                      <div className="text-xs text-gray-500 mt-1">{slot.notes}</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {slot.status === 'available' && (
                  <button
                    onClick={() => handleDelete(slot.id)}
                    disabled={deletingId === slot.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === slot.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Slot Modal */}
      {showModal && doctorId && (
        <AddSlotModal 
          doctorId={doctorId}
          onClose={() => setShowModal(false)} 
          onSuccess={handleSlotAdded}
        />
      )}
    </div>
  );
}


