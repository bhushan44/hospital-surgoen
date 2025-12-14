'use client';

import { useState, useEffect } from 'react';
import { X, User, Clock, Calendar, AlertCircle, Loader2, CheckCircle2, Search, Stethoscope, DollarSign, Star } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/httpClient';
import { cn } from '../../components/ui/utils';

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
      // Reset form when modal opens
      setSelectedPatientId('');
      setPriority('routine');
      setSearchQuery('');
      setError(null);
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
            patient.fullName?.toLowerCase().includes(query) ||
            patient.condition?.toLowerCase().includes(query) ||
            patient.medicalCondition?.toLowerCase().includes(query) ||
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
        if (onSuccess) {
          onSuccess();
        }
        onClose();
        setSelectedPatientId('');
        setPriority('routine');
        setSearchQuery('');
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'border-red-300 bg-red-50 hover:bg-red-100';
      case 'urgent':
        return 'border-orange-300 bg-orange-50 hover:bg-orange-100';
      case 'routine':
        return 'border-blue-300 bg-blue-50 hover:bg-blue-100';
      default:
        return 'border-slate-200 bg-slate-50 hover:bg-slate-100';
    }
  };

  const selectedPatient = patients.find((p) => p.id.toString() === selectedPatientId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-white">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold text-slate-900">Complete Assignment</DialogTitle>
            <DialogDescription className="text-slate-600">
              Select a patient and confirm the assignment details
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Doctor & Schedule Info Card */}
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200/50 p-5 shadow-sm">
            <div className="flex items-start gap-5">
              <Avatar className="w-20 h-20 border-2 border-white shadow-md">
                <AvatarImage src={selectedDoctor?.photo || undefined} />
                <AvatarFallback className="bg-teal-600 text-white text-lg font-semibold">
                  {selectedDoctor?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'DR'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{selectedDoctor?.name || 'Doctor'}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-4 h-4" />
                        {selectedDoctor?.specialty || 'General Medicine'}
                      </span>
                      {selectedDoctor?.experience && (
                        <span>{selectedDoctor.experience} years exp</span>
                      )}
                      {selectedDoctor?.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {selectedDoctor.rating} ({selectedDoctor.reviews || 0})
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-teal-600 text-white px-3 py-1 text-sm font-semibold">
                    <DollarSign className="w-3 h-3 mr-1" />
                    ₹{selectedDoctor?.fee || 0}
                  </Badge>
                </div>
                
                {selectedSlot && (
                  <div className="mt-4 pt-4 border-t border-teal-200/50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {selectedSlot.slotDate 
                            ? new Date(selectedSlot.slotDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Date TBD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{selectedSlot.time || selectedSlot.startTime || 'Time TBD'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Selection Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="patient-search" className="text-base font-semibold text-slate-900">
                Select Patient
              </Label>
              {patients.length > 0 && (
                <span className="text-sm text-slate-500">
                  {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} found
                </span>
              )}
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="patient-search"
                type="text"
                placeholder="Search by name, condition, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 text-base"
              />
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
                <p className="text-slate-600 text-sm">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50">
                <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-700 font-medium mb-1">
                  {searchQuery ? 'No patients found' : 'No patients available'}
                </p>
                <p className="text-slate-500 text-sm mb-4">
                  {searchQuery ? 'Try a different search term' : 'Add a patient to get started'}
                </p>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      router.push('/hospital/patients');
                    }}
                    className="border-teal-300 text-teal-700 hover:bg-teal-50"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Add New Patient
                  </Button>
                )}
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-72 overflow-y-auto">
                {filteredPatients.map((patient) => {
                  const isSelected = selectedPatientId === patient.id.toString();
                  return (
                    <div
                      key={patient.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle selection - if already selected, deselect
                        if (isSelected) {
                          setSelectedPatientId('');
                        } else {
                          setSelectedPatientId(patient.id.toString());
                        }
                      }}
                      className={cn(
                        "p-4 border-b border-slate-100 last:border-b-0 cursor-pointer transition-all",
                        isSelected
                          ? 'bg-teal-50 border-l-4 border-l-teal-600'
                          : 'hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            isSelected ? 'bg-teal-600' : 'bg-slate-200'
                          )}>
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                              <User className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-slate-900 font-semibold text-base">
                                {patient.name || patient.fullName}
                              </h4>
                              {isSelected && (
                                <Badge className="bg-teal-600 text-white text-xs">Selected</Badge>
                              )}
                            </div>
                            <p className="text-slate-600 text-sm mb-1">
                              {patient.condition || patient.medicalCondition || 'No condition specified'}
                            </p>
                            {patient.phone && (
                              <p className="text-slate-500 text-xs flex items-center gap-1">
                                📞 {patient.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {patient.roomType && (
                            <Badge variant="outline" className="text-xs">
                              {patient.roomType}
                            </Badge>
                          )}
                          {isSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatientId('');
                              }}
                              className="p-1.5 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                              title="Remove selection"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Selected Patient Preview with Clear Button */}
            {selectedPatient && (
              <div className="p-4 bg-teal-50 border-2 border-teal-300 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-teal-900 font-semibold text-base">Selected Patient</h4>
                        <Badge className="bg-teal-600 text-white text-xs">Active</Badge>
                      </div>
                      <div className="text-sm text-teal-800 space-y-1">
                        <p><strong>Name:</strong> {selectedPatient.name || selectedPatient.fullName}</p>
                        <p><strong>Condition:</strong> {selectedPatient.condition || selectedPatient.medicalCondition || 'N/A'}</p>
                        {selectedPatient.phone && <p><strong>Phone:</strong> {selectedPatient.phone}</p>}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPatientId('')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Priority Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-slate-900">Priority Level</Label>
            <RadioGroup value={priority} onValueChange={(value: any) => setPriority(value)} className="space-y-2">
              <div className={cn(
                "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                priority === 'routine' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
              )}>
                <RadioGroupItem value="routine" id="routine" className="border-2" />
                <Label htmlFor="routine" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">Routine</span>
                      <p className="text-xs text-slate-500 mt-0.5">Response deadline: 24 hours</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Standard</Badge>
                  </div>
                </Label>
              </div>
              <div className={cn(
                "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                priority === 'urgent' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300'
              )}>
                <RadioGroupItem value="urgent" id="urgent" className="border-2" />
                <Label htmlFor="urgent" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">Urgent</span>
                      <p className="text-xs text-slate-500 mt-0.5">Response deadline: 4 hours</p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">Priority</Badge>
                  </div>
                </Label>
              </div>
              <div className={cn(
                "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                priority === 'emergency' ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
              )}>
                <RadioGroupItem value="emergency" id="emergency" className="border-2" />
                <Label htmlFor="emergency" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">Emergency</span>
                      <p className="text-xs text-slate-500 mt-0.5">Response deadline: 1 hour</p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">Critical</Badge>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Assignment Summary */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              Assignment Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Consultation Fee</p>
                <p className="text-lg font-bold text-slate-900">₹{selectedDoctor?.fee || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Priority</p>
                <p className="text-lg font-bold text-slate-900 capitalize">{priority}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Response Time</p>
                <p className="text-lg font-bold text-slate-900">{getPriorityTimeout(priority)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={creatingAssignment}
            className="border-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateAssignment}
            disabled={!selectedPatientId || creatingAssignment}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 min-w-[160px]"
          >
            {creatingAssignment ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Create Assignment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
