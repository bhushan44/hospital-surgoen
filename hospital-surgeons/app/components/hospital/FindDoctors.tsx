'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, Star, Award, Crown, Medal, Clock, CheckCircle2, Lock, Loader2, X } from 'lucide-react';
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
import apiClient from '@/lib/api/httpClient';

export function FindDoctors() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    searchText: '',
    patient: '',
    specialty: '',
    selectedSpecialties: [] as string[],
    date: '',
    priority: 'routine',
  });
  const [showResults, setShowResults] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string; time: string } | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
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
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    fetchHospitalProfile();
    fetchSpecialties();
  }, []);

  useEffect(() => {
    if (hospitalId) {
      fetchPatients();
    }
  }, [hospitalId]);

  const fetchHospitalProfile = async () => {
    try {
      const response = await apiClient.get('/api/hospitals/profile');
      const data = response.data;
      
      if (data.success && data.data) {
        setHospitalId(data.data.id);
      } else {
        setError(data.message || 'Failed to load hospital profile');
      }
    } catch (err: any) {
      console.error('Error fetching hospital profile:', err);
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      setError('Failed to load hospital profile. Please try refreshing the page.');
    }
  };

  const fetchPatients = async () => {
    if (!hospitalId) return;
    try {
      const response = await apiClient.get(`/api/hospitals/${hospitalId}/patients`);
      const result = response.data;
      if (result.success && result.data) {
        setPatients(result.data.map((p: any) => ({
          id: p.id,
          name: p.fullName || p.name,
          condition: p.medicalCondition || p.condition,
        })));
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients');
      setPatients([]);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await apiClient.get('/api/specialties/active');
      const result = response.data;
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
  if ((loading && !showResults) || !hospitalId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader 
          title="Find Doctors" 
          description="Search for available doctors and create assignments"
        />
        <div className="p-8">
          <div className="text-center py-12 text-gray-500">
            {!hospitalId ? 'Loading hospital profile...' : 'Loading...'}
          </div>
        </div>
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

  const handleSearch = async (page: number = 1) => {
    // All fields are optional - allow search with any combination or none (shows all doctors)
    // No validation needed - user can search with any criteria they want

    try {
      setLoading(true);
      
      const params: any = {
        page,
        limit: pagination.limit,
      };
      
      // Add text search if provided
      if (searchParams.searchText) {
        params.search = searchParams.searchText;
      }
      
      // Add multiple specialty IDs
      if (searchParams.selectedSpecialties.length > 0) {
        const specialtiesResponse = await apiClient.get('/api/specialties/active');
        const specialtiesResult = specialtiesResponse.data;
        const specialtyIds = specialtiesResult.data
          ?.filter((s: any) => searchParams.selectedSpecialties.includes(s.name))
          .map((s: any) => s.id) || [];
        
        // Add all specialty IDs as array
        specialtyIds.forEach((id: string) => {
          if (!params.specialtyId) {
            params.specialtyId = [];
          }
          if (Array.isArray(params.specialtyId)) {
            params.specialtyId.push(id);
          }
        });
      } else if (searchParams.specialty) {
        // Fallback to dropdown selection
        const specialtiesResponse = await apiClient.get('/api/specialties/active');
        const specialtiesResult = specialtiesResponse.data;
        const specialty = specialtiesResult.data?.find((s: any) => s.name === searchParams.specialty);
        
        if (specialty) {
          params.specialtyId = [specialty.id];
        }
      }
      
      // Add date if provided
      if (searchParams.date) {
        params.date = searchParams.date;
      }
      
      // Add priority
      params.priority = searchParams.priority;

      // Build query string with multiple specialtyId params
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (key === 'specialtyId' && Array.isArray(params[key])) {
          params[key].forEach((id: string) => {
            queryParams.append('specialtyId', id);
          });
        } else if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key].toString());
        }
      });

      const response = await apiClient.get(`/api/hospitals/${hospitalId}/find-doctors?${queryParams.toString()}`);
      const result = response.data;

      if (result.success && result.data) {
        setDoctors(result.data.doctors || []);
        setHospitalSubscription(result.data.hospitalSubscription || 'free');
        
        // Update pagination state
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        }
        
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

  const handleSlotSelect = (doctor: any, slot: any) => {
    if (!hasAccessToDoctor(doctor.requiredPlan)) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedDoctor(doctor);
    console.log(doctor);
    setSelectedSlot(slot);
    setShowConfirmation(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedDoctor || !selectedSlot || !searchParams.patient) {
      alert('Please select a doctor and time slot');
      return;
    }

    if (creatingAssignment) {
      return; // Prevent double-click
    }

    try {
      setCreatingAssignment(true);
      
      const response = await apiClient.post(`/api/hospitals/${hospitalId}/assignments/create`, {
        patientId: searchParams.patient,
        doctorId: selectedDoctor.id,
        availabilitySlotId: selectedSlot.id,
        priority: searchParams.priority,
        consultationFee: selectedDoctor.fee,
      });

      const result = response.data;

      if (result.success) {
        setShowConfirmation(false);
        alert('Assignment created successfully! Doctor has been notified.');
        // Optionally navigate to assignments page
        router.push('/hospital/assignments');
      } else {
        // Show specific error messages for limit reached
        const errorMessage = result.message || 'Failed to create assignment';
        if (result.code === 'HOSPITAL_ASSIGNMENT_LIMIT_REACHED') {
          alert(`${errorMessage}\n\nUpgrade your plan to create more assignments.`);
        } else if (result.code === 'ASSIGNMENT_LIMIT_REACHED') {
          alert(`${errorMessage}\n\nThis doctor has reached their limit. Please try another doctor.`);
        } else {
          alert(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while creating the assignment';
      const errorCode = error.response?.data?.code;
      
      if (errorCode === 'HOSPITAL_ASSIGNMENT_LIMIT_REACHED') {
        alert(`${errorMessage}\n\nUpgrade your plan to create more assignments.`);
      } else if (errorCode === 'ASSIGNMENT_LIMIT_REACHED') {
        alert(`${errorMessage}\n\nThis doctor has reached their limit. Please try another doctor.`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setCreatingAssignment(false);
    }
  };

  const getRequiredPlanName = (requiredPlan: string) => {
    return requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1);
  };

  return (
    <div className="min-h-screen bg-slate-50" style={{ overflow: 'visible' }}>
      <PageHeader 
        title="Find Doctors" 
        description="Search for available doctors and create assignments"
      />
      <div className="p-8" style={{ overflow: 'visible' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Patient Selection Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Patient</h3>
              <div className="space-y-2">
                <Label htmlFor="patient" className="text-slate-700">
                  Patient
                </Label>
                <Select 
                  value={searchParams.patient} 
                  onValueChange={(value) => setSearchParams({ ...searchParams, patient: value })}
                  disabled={patients.length === 0}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={patients.length === 0 ? "No patients available" : "Choose patient"} />
                  </SelectTrigger>
                  {patients.length > 0 && (
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name} - {patient.condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
                {patients.length === 0 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      No patients found. Please add a patient first.
                    </p>
                  </div>
                )}
                {searchParams.patient && patients.length > 0 && (
                  <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                    <p className="text-xs text-teal-700 font-medium">Patient Selected</p>
                    <p className="text-sm text-teal-900 mt-1">
                      {patients.find(p => p.id.toString() === searchParams.patient)?.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filters Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
              {/* Quick Search Section */}
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Search Doctors</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="searchText"
                    type="text"
                    placeholder="Search by doctor name or specialty..."
                    value={searchParams.searchText}
                    onChange={(e) => setSearchParams({ ...searchParams, searchText: e.target.value })}
                    className="pl-12 h-12 text-base"
                  />
                </div>
              </div>

              {/* Specialty Filters */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium text-slate-900">Filter by Specialties</Label>
                  {searchParams.selectedSpecialties.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchParams({ ...searchParams, selectedSpecialties: [] })}
                      className="text-xs text-slate-500 hover:text-slate-700 h-6"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty) => {
                    const isSelected = searchParams.selectedSpecialties.includes(specialty);
                    return (
                      <Badge
                        key={specialty}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer px-4 py-1.5 text-sm transition-colors ${
                          isSelected 
                            ? "bg-teal-600 text-white hover:bg-teal-700 border-teal-600" 
                            : "hover:bg-slate-50 hover:border-slate-300"
                        }`}
                        onClick={() => {
                          const newSelected = isSelected
                            ? searchParams.selectedSpecialties.filter(s => s !== specialty)
                            : [...searchParams.selectedSpecialties, specialty];
                          setSearchParams({ ...searchParams, selectedSpecialties: newSelected });
                        }}
                      >
                        {specialty}
                        {isSelected && <X className="w-3 h-3 ml-1.5" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Assignment Details Section */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Assignment Details</h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-slate-700">
                      Appointment Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={searchParams.date}
                      onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-700">
                      Priority Level
                    </Label>
                    <RadioGroup value={searchParams.priority} onValueChange={(value) => setSearchParams({ ...searchParams, priority: value })}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                          <RadioGroupItem value="routine" id="routine" />
                          <div className="flex-1">
                            <Label htmlFor="routine" className="cursor-pointer font-medium text-slate-900">
                              Routine
                            </Label>
                            <p className="text-sm text-slate-500">24-hour response</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50/50 hover:border-yellow-300 transition-colors cursor-pointer">
                          <RadioGroupItem value="urgent" id="urgent" />
                          <div className="flex-1">
                            <Label htmlFor="urgent" className="cursor-pointer font-medium text-slate-900">
                              Urgent
                            </Label>
                            <p className="text-sm text-slate-500">6-hour response</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-red-200 bg-red-50/50 hover:border-red-300 transition-colors cursor-pointer">
                          <RadioGroupItem value="emergency" id="emergency" />
                          <div className="flex-1">
                            <Label htmlFor="emergency" className="cursor-pointer font-medium text-slate-900">
                              Emergency
                            </Label>
                            <p className="text-sm text-slate-500">1-hour response</p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSearch(1);
                    }}
                    disabled={loading}
                    className="w-full h-12 text-base font-medium bg-teal-600 hover:bg-teal-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Search Doctors
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Search Results */}
      {showResults && (
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-slate-900">Available Doctors</h2>
              <Badge variant="secondary" className="text-slate-600">
                {getFilteredDoctors().length} {getFilteredDoctors().length === 1 ? 'doctor' : 'doctors'} found
              </Badge>
            </div>
            {(searchParams.searchText || searchParams.selectedSpecialties.length > 0) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-600">Filters:</span>
                {searchParams.searchText && (
                  <Badge variant="outline" className="text-slate-700">
                    Search: "{searchParams.searchText}"
                  </Badge>
                )}
                {searchParams.selectedSpecialties.map((spec) => (
                  <Badge key={spec} className="bg-teal-100 text-teal-800 border-teal-200">
                    {spec}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="text-sm text-slate-600 mb-4">
              Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} doctors
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                    {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {doctor.availableSlots.map((slot: any) => (
                          <Button
                            key={slot.id || slot.time}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSlotSelect(doctor, slot)}
                            disabled={!hasAccess}
                            className="gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            {slot.time || slot}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No available slots for this date</p>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearch(pagination.page - 1);
                  }}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSearch(pageNum);
                        }}
                        disabled={loading}
                        className={pagination.page === pageNum ? "bg-teal-600 hover:bg-teal-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearch(pagination.page + 1);
                  }}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
                  <p><span className="text-gray-500">Time:</span> {selectedSlot?.time || (typeof selectedSlot === 'string' ? selectedSlot : '')}</p>
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
            <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={creatingAssignment}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAssignment} disabled={creatingAssignment}>
              {creatingAssignment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Confirm Assignment'
              )}
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