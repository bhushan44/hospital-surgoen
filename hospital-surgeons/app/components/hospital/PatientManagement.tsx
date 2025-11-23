'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Eye, UserPlus, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { AddPatientWizard } from './AddPatientWizard';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../hospital/_components/PageHeader';

export function PatientManagement() {
  const router = useRouter();
  
  const onNavigate = (page: string) => {
    router.push(`/hospital/${page}`);
  };
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      admissionDate: '2024-11-15',
      condition: 'Heart Condition',
      specialty: 'Cardiology',
      assignedDoctor: 'Dr. Sarah Johnson',
      status: 'assigned',
    },
    {
      id: 2,
      name: 'Emma Wilson',
      age: 32,
      gender: 'Female',
      admissionDate: '2024-11-18',
      condition: 'Knee Injury',
      specialty: 'Orthopedics',
      assignedDoctor: null,
      status: 'unassigned',
    },
    {
      id: 3,
      name: 'David Brown',
      age: 58,
      gender: 'Male',
      admissionDate: '2024-11-10',
      condition: 'Migraine Treatment',
      specialty: 'Neurology',
      assignedDoctor: 'Dr. Priya Patel',
      status: 'assigned',
    },
    {
      id: 4,
      name: 'Lisa Anderson',
      age: 41,
      gender: 'Female',
      admissionDate: '2024-11-19',
      condition: 'Routine Checkup',
      specialty: 'General Medicine',
      assignedDoctor: 'Dr. James Wilson',
      status: 'assigned',
    },
    {
      id: 5,
      name: 'Michael Chen',
      age: 29,
      gender: 'Male',
      admissionDate: '2024-11-20',
      condition: 'Fracture',
      specialty: 'Orthopedics',
      assignedDoctor: null,
      status: 'declined',
    },
    {
      id: 6,
      name: 'Sarah Parker',
      age: 37,
      gender: 'Female',
      admissionDate: '2024-11-21',
      condition: 'Diabetes Management',
      specialty: 'Endocrinology',
      assignedDoctor: null,
      status: 'unassigned',
    },
  ]);
  const [loading, setLoading] = useState(true);
  const hospitalId = 'hospital-id-placeholder'; // TODO: Get from auth context

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hospitals/${hospitalId}/patients`);
      const result = await response.json();
      if (result.success && result.data) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Assigned
          </Badge>
        );
      case 'unassigned':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unassigned
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showAddPatient) {
    return (
      <AddPatientWizard
        onClose={() => setShowAddPatient(false)}
        onComplete={() => {
          setShowAddPatient(false);
          router.push('/hospital/find-doctors');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Patient Management" 
        description="Manage patient records and assignments"
        actions={
          <Button onClick={() => setShowAddPatient(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        }
      />
      <div className="p-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h3 className="text-slate-900 font-semibold">All Patients</h3>
        </div>
        <div>
          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, condition, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          {/* Patients Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Age / Gender</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Medical Condition</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Assigned Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.age} / {patient.gender}</TableCell>
                    <TableCell>{new Date(patient.admissionDate).toLocaleDateString()}</TableCell>
                    <TableCell>{patient.condition}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.specialty}</Badge>
                    </TableCell>
                    <TableCell>
                      {patient.assignedDoctor || (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(patient.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {(patient.status === 'unassigned' || patient.status === 'declined') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate('find-doctors')}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* View Patient Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>Complete patient information</DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <Label className="text-gray-500 text-sm">Full Name</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.name}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <Label className="text-gray-500 text-sm">Age / Gender</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.age} years / {selectedPatient.gender}</p>
                </div>
              </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                <Label className="text-gray-500 text-sm">Admission Date</Label>
                <p className="text-gray-900 mt-1">{new Date(selectedPatient.admissionDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <Separator />

                <div className="p-4 bg-slate-50 rounded-lg">
                <Label className="text-gray-500 text-sm">Medical Condition</Label>
                <p className="text-gray-900 mt-1">{selectedPatient.condition}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <Label className="text-gray-500 text-sm">Required Specialty</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.specialty}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <Label className="text-gray-500 text-sm">Assignment Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPatient.status)}</div>
                </div>
              </div>

              {selectedPatient.assignedDoctor && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-blue-900 text-sm">Assigned Doctor</Label>
                  <p className="text-blue-900 mt-1">{selectedPatient.assignedDoctor}</p>
                </div>
              )}

                <div className="p-4 bg-slate-50 rounded-lg">
                <Label className="text-gray-500 text-sm">Contact Information</Label>
                <div className="space-y-1 mt-2 text-sm">
                  <p className="text-gray-900">Phone: +91 98765 43210</p>
                  <p className="text-gray-900">Emergency Contact: +91 98765 00000</p>
                  <p className="text-gray-900">Address: 123 Main Street, Mumbai, Maharashtra</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowViewModal(false);
              setShowEditModal(true);
            }}>
              Edit Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Patient Information</DialogTitle>
            <DialogDescription>Update patient details</DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Full Name</Label>
                  <Input id="editName" defaultValue={selectedPatient.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAge">Age</Label>
                  <Input id="editAge" type="number" defaultValue={selectedPatient.age} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCondition">Medical Condition</Label>
                <Input id="editCondition" defaultValue={selectedPatient.condition} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone Number</Label>
                <Input id="editPhone" type="tel" defaultValue="+91 98765 43210" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editEmergency">Emergency Contact</Label>
                <Input id="editEmergency" type="tel" defaultValue="+91 98765 00000" />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowEditModal(false);
              alert('Patient information updated successfully!');
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}