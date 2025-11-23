import { useState } from 'react';
import { Search, Calendar, Star, Award, Crown, Medal, Clock, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';

export function FindDoctors() {
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

  // Current hospital subscription (this would come from context/state management)
  const hospitalSubscription = 'gold'; // 'free', 'gold', or 'premium'

  const patients = [
    { id: 1, name: 'Emma Wilson', condition: 'Knee Injury' },
    { id: 2, name: 'Sarah Parker', condition: 'Diabetes Management' },
    { id: 3, name: 'Michael Chen', condition: 'Fracture' },
  ];

  const specialties = [
    'Cardiology',
    'Orthopedics',
    'Neurology',
    'General Medicine',
    'Pediatrics',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
  ];

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      tier: 'platinum',
      requiredPlan: 'premium', // Requires premium subscription
      experience: 15,
      rating: 4.9,
      reviews: 234,
      completedAssignments: 456,
      photo: null,
      availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
      fee: 2000,
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Orthopedics',
      tier: 'gold',
      requiredPlan: 'gold', // Requires gold or premium
      experience: 12,
      rating: 4.8,
      reviews: 189,
      completedAssignments: 378,
      photo: null,
      availableSlots: ['10:00 AM', '01:00 PM', '03:00 PM'],
      fee: 1500,
    },
    {
      id: 3,
      name: 'Dr. Priya Patel',
      specialty: 'Neurology',
      tier: 'platinum',
      requiredPlan: 'premium',
      experience: 18,
      rating: 4.9,
      reviews: 312,
      completedAssignments: 521,
      photo: null,
      availableSlots: ['09:30 AM', '11:30 AM', '02:30 PM'],
      fee: 2500,
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'General Medicine',
      tier: 'silver',
      requiredPlan: 'free', // Available on all plans
      experience: 8,
      rating: 4.6,
      reviews: 145,
      completedAssignments: 289,
      photo: null,
      availableSlots: ['08:00 AM', '12:00 PM', '04:00 PM'],
      fee: 1000,
    },
    {
      id: 5,
      name: 'Dr. Emma Brown',
      specialty: 'Orthopedics',
      tier: 'silver',
      requiredPlan: 'free',
      experience: 7,
      rating: 4.5,
      reviews: 98,
      completedAssignments: 167,
      photo: null,
      availableSlots: ['09:00 AM', '02:00 PM', '05:00 PM'],
      fee: 800,
    },
    {
      id: 6,
      name: 'Dr. Robert Martinez',
      specialty: 'Cardiology',
      tier: 'gold',
      requiredPlan: 'gold',
      experience: 14,
      rating: 4.7,
      reviews: 201,
      completedAssignments: 389,
      photo: null,
      availableSlots: ['10:00 AM', '01:00 PM', '04:00 PM'],
      fee: 1800,
    },
  ];

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
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 gap-1">
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

  const handleSearch = () => {
    setShowResults(true);
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

  const handleConfirmAssignment = () => {
    // Create assignment logic here
    setShowConfirmation(false);
    alert('Assignment created successfully! Doctor has been notified.');
  };

  const getRequiredPlanName = (requiredPlan: string) => {
    return requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-1">Find Doctors</h1>
        <p className="text-gray-500">Search for available doctors and create assignments</p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
        </CardHeader>
        <CardContent>
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
              disabled={!searchParams.patient || !searchParams.specialty || !searchParams.date}
              className="w-full gap-2"
            >
              <Search className="w-4 h-4" />
              Search Available Doctors
            </Button>
          </div>
        </CardContent>
      </Card>

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
              <Card key={doctor.id} className={`hover:shadow-lg transition-shadow ${!hasAccess ? 'relative border-gray-300' : ''}`}>
                {!hasAccess && (
                  <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
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
                <CardContent className="p-6">
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
                      {doctor.availableSlots.map((slot) => (
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
                </CardContent>
              </Card>
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
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-900 mb-2">Doctor Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Name:</span> {selectedDoctor.name}</p>
                  <p><span className="text-gray-500">Specialty:</span> {selectedDoctor.specialty}</p>
                  <p><span className="text-gray-500">Experience:</span> {selectedDoctor.experience} years</p>
                  <p><span className="text-gray-500">Rating:</span> {selectedDoctor.rating} ⭐</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-900 mb-2">Schedule Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Date:</span> {searchParams.date}</p>
                  <p><span className="text-gray-500">Time:</span> {selectedSlot}</p>
                  <p><span className="text-gray-500">Priority:</span> <span className="capitalize">{searchParams.priority}</span></p>
                  <p><span className="text-gray-500">Response Deadline:</span> {getPriorityTimeout(searchParams.priority)}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
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
              <Card className={hospitalSubscription === 'free' ? 'border-2 border-blue-600' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Gold Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="border-2 border-purple-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    Premium Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
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
  );
}