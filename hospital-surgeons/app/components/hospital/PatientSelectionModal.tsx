'use client';

import { useState, useEffect } from 'react';
import { X, User, Clock, Calendar, AlertCircle, Loader2, CheckCircle2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/httpClient';

interface PatientSelectionModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoctor: any;
  selectedSlot: { id: string; time: string; startTime?: string; endTime?: string; slotDate?: string } | null;
  hospitalId: string | null;
  onSuccess?: () => void;
}

export function PatientSelectionModal({
  open,
  onClose,
  selectedDoctor,
  selectedSlot,
  hospitalId,
  onSuccess,
}: PatientSelectionModalProps) {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && hospitalId) {
      fetchPatients();
    }
  }, [open, hospitalId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPatients(
        patients.filter(
          (patient) =>
            patient.name?.toLowerCase().includes(query) ||
            patient.condition?.toLowerCase().includes(query) ||
            patient.phone?.includes(query)
        )
      );
    }
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    if (!hospitalId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/hospitals/${hospitalId}/patients`);
      const data = response.data;
      
      if (data.success && Array.isArray(data.data)) {
        setPatients(data.data);
        setFilteredPatients(data.data);
      }
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedDoctor || !selectedSlot || !selectedPatientId || !hospitalId) {
      setError('Please select a patient to continue');
      return;
    }

    if (creatingAssignment) {
      return;
    }

    try {
      setCreatingAssignment(true);
      setError(null);
      
      const response = await apiClient.post(`/api/hospitals/${hospitalId}/assignments/create`, {
        patientId: selectedPatientId,
        doctorId: selectedDoctor.id,
        availabilitySlotId: selectedSlot.id,
        priority: priority,
        consultationFee: selectedDoctor.fee,
      });

      const result = response.data;

      if (result.success) {
        // Success - close modal and show success message
        if (onSuccess) {
          onSuccess();
        }
        onClose();
        // Reset form
        setSelectedPatientId('');
        setPriority('routine');
        setSearchQuery('');
        // Navigate to assignments page
        router.push('/hospital/assignments');
      } else {
        setError(result.message || 'Failed to create assignment');
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while creating the assignment';
      setError(errorMessage);
    } finally {
      setCreatingAssignment(false);
    }
  };

  const getPriorityTimeout = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return '1 hour';
      case 'urgent':
        return '4 hours';
      case 'routine':
        return '24 hours';
      default:
        return '24 hours';
    }
  };

  const selectedPatient = patients.find((p) => p.id.toString() === selectedPatientId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Patient & Complete Assignment</DialogTitle>
          <DialogDescription>
            Choose a patient and confirm assignment details
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Selected Doctor Info */}
          {selectedDoctor && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedDoctor.photo || undefined} />
                  <AvatarFallback className="bg-teal-100 text-teal-600">
                    {selectedDoctor.name?.split(' ').map((n: string) => n[0]).join('') || 'DR'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-slate-900 font-semibold">{selectedDoctor.name}</h3>
                      <p className="text-slate-600 text-sm">{selectedDoctor.specialty}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      ₹{selectedDoctor.fee}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{selectedDoctor.experience} years exp</span>
                    <span className="flex items-center gap-1">
                      ⭐ {selectedDoctor.rating} ({selectedDoctor.reviews})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Details */}
          {selectedSlot && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-blue-900 font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Schedule Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Date:</span>
                  <p className="text-blue-900 mt-1">
                    {selectedSlot.slotDate 
                      ? new Date(selectedSlot.slotDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Time:</span>
                  <p className="text-blue-900 mt-1">{selectedSlot.time || selectedSlot.startTime || 'TBD'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Patient Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient-search" className="text-slate-900 font-medium mb-2 block">
                Search & Select Patient
              </Label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="patient-search"
                  type="text"
                  placeholder="Search by name, condition, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-6 border border-slate-200 rounded-lg text-center">
                  <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-2">
                    {searchQuery ? 'No patients found matching your search' : 'No patients available'}
                  </p>
                  {!searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        router.push('/hospital/patients');
                      }}
                    >
                      Add New Patient
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id.toString())}
                      className={`p-4 border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors ${
                        selectedPatientId === patient.id.toString()
                          ? 'bg-teal-50 border-teal-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-slate-900 font-medium">{patient.name || patient.fullName}</h4>
                            {selectedPatientId === patient.id.toString() && (
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            )}
                          </div>
                          <p className="text-slate-600 text-sm">{patient.condition || patient.medicalCondition || 'No condition specified'}</p>
                          {patient.phone && (
                            <p className="text-slate-500 text-xs mt-1">📞 {patient.phone}</p>
                          )}
                        </div>
                        {patient.roomType && (
                          <Badge variant="outline" className="text-xs">
                            {patient.roomType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Patient Preview */}
            {selectedPatient && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  <h4 className="text-teal-900 font-semibold">Selected Patient</h4>
                </div>
                <div className="text-sm text-teal-800">
                  <p><strong>Name:</strong> {selectedPatient.name || selectedPatient.fullName}</p>
                  <p><strong>Condition:</strong> {selectedPatient.condition || selectedPatient.medicalCondition || 'N/A'}</p>
                  {selectedPatient.phone && <p><strong>Phone:</strong> {selectedPatient.phone}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Priority Selection */}
          <div className="space-y-3">
            <Label className="text-slate-900 font-medium">Priority Level</Label>
            <RadioGroup value={priority} onValueChange={(value: any) => setPriority(value)}>
              <div className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                <RadioGroupItem value="routine" id="routine" />
                <Label htmlFor="routine" className="flex-1 cursor-pointer">
                  <div>
                    <span className="font-medium">Routine</span>
                    <p className="text-xs text-slate-500">Response deadline: {getPriorityTimeout('routine')}</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                <RadioGroupItem value="urgent" id="urgent" />
                <Label htmlFor="urgent" className="flex-1 cursor-pointer">
                  <div>
                    <span className="font-medium">Urgent</span>
                    <p className="text-xs text-slate-500">Response deadline: {getPriorityTimeout('urgent')}</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                <RadioGroupItem value="emergency" id="emergency" />
                <Label htmlFor="emergency" className="flex-1 cursor-pointer">
                  <div>
                    <span className="font-medium">Emergency</span>
                    <p className="text-xs text-slate-500">Response deadline: {getPriorityTimeout('emergency')}</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Assignment Summary */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-slate-900 font-semibold mb-3">Assignment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Consultation Fee:</span>
                <span className="text-slate-900 font-medium">₹{selectedDoctor?.fee || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Priority:</span>
                <span className="text-slate-900 font-medium capitalize">{priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Response Deadline:</span>
                <span className="text-slate-900 font-medium">{getPriorityTimeout(priority)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={creatingAssignment}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateAssignment}
            disabled={!selectedPatientId || creatingAssignment}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {creatingAssignment ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating Assignment...
              </>
            ) : (
              'Create Assignment'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

