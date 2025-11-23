'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../hospital/_components/PageHeader';

export function AssignmentManagement() {
  const router = useRouter();
  
  const onNavigate = (page: string) => {
    router.push(`/hospital/${page}`);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      patient: 'John Smith',
      condition: 'Heart Condition',
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: '2024-11-21',
      time: '09:00 AM',
      status: 'accepted',
      priority: 'routine',
      createdAt: '2024-11-19 10:00 AM',
      acceptedAt: '2024-11-19 02:30 PM',
      fee: 2000,
    },
    {
      id: 2,
      patient: 'Emma Wilson',
      condition: 'Knee Injury',
      doctor: 'Dr. Michael Chen',
      specialty: 'Orthopedics',
      date: '2024-11-21',
      time: '11:00 AM',
      status: 'pending',
      priority: 'urgent',
      createdAt: '2024-11-20 09:00 AM',
      expiresIn: '18h',
      fee: 1500,
    },
    {
      id: 3,
      patient: 'David Brown',
      condition: 'Migraine Treatment',
      doctor: 'Dr. Priya Patel',
      specialty: 'Neurology',
      date: '2024-11-21',
      time: '02:00 PM',
      status: 'accepted',
      priority: 'routine',
      createdAt: '2024-11-18 03:00 PM',
      acceptedAt: '2024-11-18 05:45 PM',
      fee: 2500,
    },
    {
      id: 4,
      patient: 'Michael Chen',
      condition: 'Fracture',
      doctor: 'Dr. Robert Smith',
      specialty: 'Orthopedics',
      date: '2024-11-20',
      time: '03:00 PM',
      status: 'declined',
      priority: 'routine',
      createdAt: '2024-11-19 11:00 AM',
      declinedAt: '2024-11-19 03:00 PM',
      declineReason: 'Schedule conflict - Unable to accommodate on requested date',
      fee: 1500,
    },
    {
      id: 5,
      patient: 'Lisa Anderson',
      condition: 'Routine Checkup',
      doctor: 'Dr. James Wilson',
      specialty: 'General Medicine',
      date: '2024-11-18',
      time: '10:00 AM',
      status: 'completed',
      priority: 'routine',
      createdAt: '2024-11-17 09:00 AM',
      acceptedAt: '2024-11-17 11:00 AM',
      completedAt: '2024-11-18 10:45 AM',
      fee: 1000,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const hospitalId = 'hospital-id-placeholder'; // TODO: Get from auth context

  useEffect(() => {
    fetchAssignments();
  }, [statusFilter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      const response = await fetch(`/api/hospitals/${hospitalId}/assignments?${params.toString()}`);
      const result = await response.json();
      if (result.success && result.data) {
        setAssignments(result.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 gap-1">
            <XCircle className="w-3 h-3" />
            Declined
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      routine: 'bg-gray-100 text-gray-800',
      urgent: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800',
    };
    return (
      <Badge variant="outline" className={colors[priority as keyof typeof colors] || ''}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const handleViewDetails = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowDetails(true);
  };

  const handleCancelAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowCancelModal(true);
  };

  const getCancellationWarning = (hoursUntil: number) => {
    if (hoursUntil > 24) {
      return { color: 'green', message: 'No penalty - Cancellation allowed', severity: 'info' };
    } else if (hoursUntil > 12) {
      return { color: 'yellow', message: 'Warning: Cancellation will be flagged', severity: 'warning' };
    } else if (hoursUntil > 6) {
      return { color: 'orange', message: 'Penalty: Counts toward 3-flag limit', severity: 'warning' };
    } else {
      return { color: 'red', message: 'Cannot cancel - Must contact doctor directly', severity: 'error' };
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filterByStatus = (status: string) => {
    if (status === 'all') return filteredAssignments;
    return filteredAssignments.filter(a => a.status === status);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Assignment Management" 
        description="Track and manage all doctor assignments"
      />
      <div className="p-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h3 className="text-slate-900 font-semibold">All Assignments</h3>
        </div>
        <div>
          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by patient, doctor, or condition..."
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

          {/* Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="declined">Needs Action</TabsTrigger>
            </TabsList>

            {['all', 'pending', 'accepted', 'completed', 'declined'].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterByStatus(tab === 'all' ? 'all' : tab).map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div>
                              <p>{assignment.patient}</p>
                            </div>
                          </TableCell>
                          <TableCell>{assignment.condition}</TableCell>
                          <TableCell>
                            <div>
                              <p>{assignment.doctor}</p>
                              <p className="text-sm text-gray-500">{assignment.specialty}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{new Date(assignment.date).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-500">{assignment.time}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(assignment.priority)}</TableCell>
                          <TableCell>
                            {getStatusBadge(assignment.status)}
                            {assignment.status === 'pending' && assignment.expiresIn && (
                              <p className="text-xs text-yellow-600 mt-1">Expires in {assignment.expiresIn}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(assignment)}
                              >
                                View
                              </Button>
                              {assignment.status === 'declined' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onNavigate('find-doctors')}
                                >
                                  Find Doctor
                                </Button>
                              )}
                              {(assignment.status === 'pending' || assignment.status === 'accepted') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelAssignment(assignment)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      </div>

      {/* Assignment Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">Status</h3>
                {getStatusBadge(selectedAssignment.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="text-gray-900 mb-2">Patient Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedAssignment.patient}</p>
                    <p><span className="text-gray-500">Condition:</span> {selectedAssignment.condition}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="text-gray-900 mb-2">Doctor Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedAssignment.doctor}</p>
                    <p><span className="text-gray-500">Specialty:</span> {selectedAssignment.specialty}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="text-gray-900 mb-2">Schedule</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Date:</span> {new Date(selectedAssignment.date).toLocaleDateString()}</p>
                  <p><span className="text-gray-500">Time:</span> {selectedAssignment.time}</p>
                  <p><span className="text-gray-500">Priority:</span> <span className="capitalize">{selectedAssignment.priority}</span></p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="text-gray-900 mb-2">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-gray-500">Created:</span>
                    <span>{selectedAssignment.createdAt}</span>
                  </div>
                  {selectedAssignment.acceptedAt && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      <span className="text-gray-500">Accepted:</span>
                      <span>{selectedAssignment.acceptedAt}</span>
                    </div>
                  )}
                  {selectedAssignment.declinedAt && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      <span className="text-gray-500">Declined:</span>
                      <span>{selectedAssignment.declinedAt}</span>
                    </div>
                  )}
                  {selectedAssignment.completedAt && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span className="text-gray-500">Completed:</span>
                      <span>{selectedAssignment.completedAt}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedAssignment.status === 'declined' && selectedAssignment.declineReason && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-medium">Decline Reason:</span> {selectedAssignment.declineReason}
                  </AlertDescription>
                </Alert>
              )}

              {selectedAssignment.status === 'accepted' && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message Doctor
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Phone className="w-4 h-4" />
                    Call Doctor
                  </Button>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-blue-900">Consultation Fee</span>
                  <span className="text-blue-900">₹{selectedAssignment.fee}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Assignment Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Assignment</DialogTitle>
            <DialogDescription>
              Review the cancellation policy before proceeding
            </DialogDescription>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">Cancellation Policy:</span> Cancellations within 6 hours of the appointment require direct contact with the doctor.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Cancellation Reason (Optional)</Label>
                <Textarea placeholder="Please provide a reason for cancellation..." rows={3} />
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  This will notify the doctor and free up the time slot. The patient will need to be reassigned to another doctor.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Assignment
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowCancelModal(false);
                alert('Assignment cancelled successfully');
              }}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
