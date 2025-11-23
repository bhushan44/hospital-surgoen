'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, Star, Award, Crown, Medal, Clock, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../hospital/_components/PageHeader';

export function FindDoctors() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    patient: '',
    specialty: '',
    date: '',
    priority: 'routine',
  });
  const [showResults, setShowResults] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState([
    { id: 1, name: 'Emma Wilson', condition: 'Knee Injury' },
    { id: 2, name: 'Sarah Parker', condition: 'Diabetes Management' },
    { id: 3, name: 'Michael Chen', condition: 'Fracture' },
  ]);
  const [specialties, setSpecialties] = useState([
    'Cardiology',
    'Orthopedics',
    'Neurology',
    'General Medicine',
    'Pediatrics',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
  ]);
  const [hospitalSubscription, setHospitalSubscription] = useState<'free' | 'gold' | 'premium'>('free');
  const [loading, setLoading] = useState(false);
  const hospitalId = 'hospital-id-placeholder'; // TODO: Get from auth context

  useEffect(() => {
    fetchPatients();
    fetchSpecialties();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/patients`);
      const result = await response.json();
      if (result.success && result.data) {
        setPatients(result.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          condition: p.condition,
        })));
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/api/specialties/active');
      const result = await response.json();
      if (result.success && result.data) {
        setSpecialties(result.data.map((s: any) => s.name));
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  // Check if hospital has access to a doctor based on subscription
  const hasAccessToDoctor = (doctorRequiredPlan: string) => {
    const planHierarchy = { free: 0, gold: 1, premium: 2 };
    return planHierarchy[hospitalSubscription as keyof typeof planHierarchy] >= 
           planHierarchy[doctorRequiredPlan as keyof typeof planHierarchy];
  };

  // Filter doctors based on subscription and specialty
  const getFilteredDoctors = () => {
    return doctors
      .filter(d => !searchParams.specialty || d.specialty === searchParams.specialty)
      .sort((a, b) => {
        // Sort by accessibility first (accessible doctors first)
        const aAccessible = hasAccessToDoctor(a.requiredPlan);
        const bAccessible = hasAccessToDoctor(b.requiredPlan);
        if (aAccessible !== bAccessible) return bAccessible ? 1 : -1;
        
        // Then by tier
        const tierOrder = { platinum: 0, gold: 1, silver: 2 };
        return tierOrder[a.tier as keyof typeof tierOrder] - tierOrder[b.tier as keyof typeof tierOrder];
      });
  };

  // Show loading or empty state
  if (loading && !showResults) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-1">Find Doctors</h1>
          <p className="text-gray-500">Search for available doctors and create assignments</p>
        </div>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </div>
    );
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 gap-1">
            <Crown className="w-3 h-3" />
            Platinum
          </Badge>
        );
      case 'gold':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 gap-1">
            <Award className="w-3 h-3" />
            Gold
          </Badge>
        );
      case 'silver':
        return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 gap-1">
            <Medal className="w-3 h-3" />
            Silver
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityTimeout = (priority: string) => {
    switch (priority) {
      case 'routine':
        return '24 hours';
      case 'urgent':
        return '6 hours';
      case 'emergency':
        return '1 hour';
      default:
        return '';
    }
  };

  const handleSearch = async () => {
    if (!searchParams.patient || !searchParams.specialty || !searchParams.date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // Get specialty ID from name
      const specialtiesResponse = await fetch('/api/specialties/active');
      const specialtiesResult = await specialtiesResponse.json();
      const specialty = specialtiesResult.data?.find((s: any) => s.name === searchParams.specialty);
      
      if (!specialty) {
        alert('Specialty not found');
        return;
      }

      const params = new URLSearchParams({
        specialtyId: specialty.id,
        date: searchParams.date,
        priority: searchParams.priority,
      });

      const response = await fetch(`/api/hospitals/${hospitalId}/find-doctors?${params.toString()}`);
      const result = await response.json();

      if (result.success && result.data) {
        setDoctors(result.data.doctors || []);
        setHospitalSubscription(result.data.hospitalSubscription || 'free');
        setShowResults(true);
      } else {
        alert(result.message || 'Failed to find doctors');
      }
    } catch (error) {
      console.error('Error searching doctors:', error);
      alert('An error occurred while searching for doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (doctor: any, slot: string) => {
    if (!hasAccessToDoctor(doctor.requiredPlan)) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedDoctor(doctor);
    setSelectedSlot(slot);
    setShowConfirmation(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedDoctor || !selectedSlot || !searchParams.patient) {
      alert('Please select a doctor and time slot');
      return;
    }

    try {
      setLoading(true);
      // Get availability slot ID for the selected time
      // For now, we'll need to get it from the doctor's availability
      // This is a simplified version - in production, you'd match the slot properly
      
      const response = await fetch(`/api/hospitals/${hospitalId}/assignments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: searchParams.patient,
          doctorId: selectedDoctor.id,
          availabilitySlotId: selectedDoctor.availabilitySlotId || null, // TODO: Get actual slot ID
          priority: searchParams.priority,
          consultationFee: selectedDoctor.fee,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowConfirmation(false);
        alert('Assignment created successfully! Doctor has been notified.');
        // Optionally navigate to assignments page
        router.push('/hospital/assignments');
      } else {
        alert(result.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('An error occurred while creating the assignment');
    } finally {
      setLoading(false);
    }
  };

  const getRequiredPlanName = (requiredPlan: string) => {
    return requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Find Doctors" 
        description="Search for available doctors and create assignments"
      />
      <div className="p-8">

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-6">
          <h3 className="text-slate-900 font-semibold">Search Criteria</h3>
        </div>
        <div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Select Patient *</Label>
                <Select value={searchParams.patient} onValueChange={(value) => setSearchParams({ ...searchParams, patient: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name} - {patient.condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty *</Label>
                <Select value={searchParams.specialty} onValueChange={(value) => setSearchParams({ ...searchParams, specialty: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Appointment Date *</Label>
              <Input
                id="date"
                type="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Priority Level *</Label>
              <RadioGroup value={searchParams.priority} onValueChange={(value) => setSearchParams({ ...searchParams, priority: value })}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200">
                  <RadioGroupItem value="routine" id="routine" />
                  <div className="flex-1">
                    <Label htmlFor="routine" className="cursor-pointer">
                      Routine
                    </Label>
                    <p className="text-sm text-gray-500">24-hour response timeout</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                  <RadioGroupItem value="urgent" id="urgent" />
                  <div className="flex-1">
                    <Label htmlFor="urgent" className="cursor-pointer">
                      Urgent
                    </Label>
                    <p className="text-sm text-gray-500">6-hour response timeout</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-red-200 bg-red-50">
                  <RadioGroupItem value="emergency" id="emergency" />
                  <div className="flex-1">
                    <Label htmlFor="emergency" className="cursor-pointer">
                      Emergency
                    </Label>
                    <p className="text-sm text-gray-500">1-hour response timeout - Immediate attention required</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleSearch}
              disabled={!searchParams.patient || !searchParams.specialty || !searchParams.date || loading}
              className="w-full gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Search Available Doctors'}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <div>
          <div className="mb-4">
            <h2 className="text-gray-900">Available Doctors</h2>
            <p className="text-gray-500">Showing results for {searchParams.specialty}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredDoctors().map((doctor) => {
              const hasAccess = hasAccessToDoctor(doctor.requiredPlan);
              return (
              <div key={doctor.id} className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${!hasAccess ? 'relative border border-slate-300' : ''}`}>
                {!hasAccess && (
                  <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                    <div className="text-center p-6">
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-gray-900 mb-2">Upgrade to {getRequiredPlanName(doctor.requiredPlan)}</h3>
                      <p className="text-sm text-gray-600 mb-4">Unlock access to this premium doctor</p>
                      <Button size="sm" onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowUpgradeModal(true);
                      }}>
                        View Upgrade Options
                      </Button>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={doctor.photo || undefined} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {doctor.name.split(' ')[1][0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-gray-900">{doctor.name}</h3>
                            {!hasAccess && <Lock className="w-4 h-4 text-gray-400" />}
                          </div>
                          <p className="text-gray-500">{doctor.specialty}</p>
                        </div>
                        {getTierBadge(doctor.tier)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{doctor.experience} years exp</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {doctor.rating} ({doctor.reviews})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-500">Completed Assignments</p>
                      <p className="text-gray-900">{doctor.completedAssignments}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="text-gray-900">₹{doctor.fee}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Available Time Slots</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {doctor.availableSlots.map((slot: string) => (
                        <Button
                          key={slot}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSlotSelect(doctor, slot)}
                          disabled={!hasAccess}
                          className="gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
            <DialogDescription>
              Review the assignment details before confirming
            </DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="text-gray-900 mb-2">Doctor Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Name:</span> {selectedDoctor.name}</p>
                  <p><span className="text-gray-500">Specialty:</span> {selectedDoctor.specialty}</p>
                  <p><span className="text-gray-500">Experience:</span> {selectedDoctor.experience} years</p>
                  <p><span className="text-gray-500">Rating:</span> {selectedDoctor.rating} ⭐</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="text-gray-900 mb-2">Schedule Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Date:</span> {searchParams.date}</p>
                  <p><span className="text-gray-500">Time:</span> {selectedSlot}</p>
                  <p><span className="text-gray-500">Priority:</span> <span className="capitalize">{searchParams.priority}</span></p>
                  <p><span className="text-gray-500">Response Deadline:</span> {getPriorityTimeout(searchParams.priority)}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="text-gray-900 mb-2">Estimated Cost</h3>
                <p className="text-2xl">₹{selectedDoctor.fee}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Pre-Assignment Checklist
                </h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>✓ Doctor affiliation verified</li>
                  <li>✓ Patient consent confirmed</li>
                  <li>✓ Subscription limit checked</li>
                  <li>✓ Time slot availability confirmed</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAssignment}>
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>
              Unlock access to premium doctors with a subscription upgrade
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                This doctor requires a <strong>{selectedDoctor ? getRequiredPlanName(selectedDoctor.requiredPlan) : 'Premium'}</strong> subscription to access.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gold Plan */}
              <div className={`bg-white rounded-lg shadow p-6 ${hospitalSubscription === 'free' ? 'border-2 border-teal-600' : ''}`}>
                <div className="mb-4">
                  <h3 className="text-slate-900 font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Gold Plan
                  </h3>
                </div>
                <div>
                  <div className="mb-4">
                    <span className="text-3xl text-gray-900">₹4,999</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Unlimited patients
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Access to Gold tier doctors
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Priority search results
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Email & phone support
                    </li>
                  </ul>
                  <Button 
                    className="w-full" 
                    disabled={hospitalSubscription === 'gold' || hospitalSubscription === 'premium'}
                  >
                    {hospitalSubscription === 'gold' ? 'Current Plan' : 'Upgrade to Gold'}
                  </Button>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="bg-white rounded-lg shadow p-6 border-2 border-teal-600">
                <div className="mb-4">
                  <h3 className="text-slate-900 font-semibold flex items-center gap-2">
                    <Crown className="w-5 h-5 text-teal-600" />
                    Premium Plan
                  </h3>
                </div>
                <div>
                  <div className="mb-4">
                    <span className="text-3xl text-gray-900">₹9,999</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      All Gold features
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Access to Platinum doctors
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      24/7 priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Dedicated account manager
                    </li>
                  </ul>
                  <Button 
                    className="w-full" 
                    disabled={hospitalSubscription === 'premium'}
                  >
                    {hospitalSubscription === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                After upgrading, you'll have immediate access to all doctors in your subscription tier.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}