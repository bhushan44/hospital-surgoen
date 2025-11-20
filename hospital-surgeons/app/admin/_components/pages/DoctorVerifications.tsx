'use client';

import { useState } from 'react';
import { PageHeader } from '../PageHeader';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Filter, Eye, Check, X, MessageSquare, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';

const pendingDoctors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@email.com',
    specialty: 'Cardiology',
    experience: '12 years',
    licenseNumber: 'MD-45678',
    submittedDate: '2024-11-15',
    status: 'Pending',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'Board-certified cardiologist specializing in interventional cardiology and heart failure management.',
    documents: [
      { name: 'Medical License', type: 'PDF', verified: false },
      { name: 'Board Certification', type: 'PDF', verified: false },
    ]
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    email: 'michael.chen@email.com',
    specialty: 'Pediatrics',
    experience: '8 years',
    licenseNumber: 'MD-23456',
    submittedDate: '2024-11-16',
    status: 'Pending',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    bio: 'Experienced pediatrician with expertise in developmental disorders and pediatric emergency care.',
    documents: [
      { name: 'Medical License', type: 'PDF', verified: false },
      { name: 'Board Certification', type: 'PDF', verified: false },
    ]
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    specialty: 'Neurology',
    experience: '15 years',
    licenseNumber: 'MD-78901',
    submittedDate: '2024-11-14',
    status: 'Pending',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    bio: 'Neurologist specializing in stroke treatment, epilepsy management, and neurodegenerative diseases.',
    documents: [
      { name: 'Medical License', type: 'PDF', verified: false },
      { name: 'Board Certification', type: 'PDF', verified: false },
    ]
  },
];

export function DoctorVerifications() {
  const [selectedDoctor, setSelectedDoctor] = useState<typeof pendingDoctors[0] | null>(null);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleApprove = () => {
    console.log('Approving doctor:', selectedDoctor?.id);
    setSelectedDoctor(null);
    setNotes('');
  };

  const handleReject = () => {
    console.log('Rejecting doctor:', selectedDoctor?.id);
    setSelectedDoctor(null);
    setNotes('');
  };

  const handleRequestInfo = () => {
    console.log('Requesting more info:', selectedDoctor?.id);
    setSelectedDoctor(null);
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Doctor Verifications" 
        description="Review and verify doctor registration applications"
        actions={
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        }
      />

      <div className="p-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending (3)</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-600">Doctor</th>
                      <th className="px-6 py-3 text-left text-slate-600">Email</th>
                      <th className="px-6 py-3 text-left text-slate-600">Specialty</th>
                      <th className="px-6 py-3 text-left text-slate-600">Experience</th>
                      <th className="px-6 py-3 text-left text-slate-600">Submitted</th>
                      <th className="px-6 py-3 text-left text-slate-600">Status</th>
                      <th className="px-6 py-3 text-left text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pendingDoctors.map((doctor) => (
                      <tr key={doctor.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={doctor.photo} 
                              alt={doctor.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div className="text-slate-900">{doctor.name}</div>
                              <div className="text-slate-500">{doctor.licenseNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{doctor.email}</td>
                        <td className="px-6 py-4 text-slate-900">{doctor.specialty}</td>
                        <td className="px-6 py-4 text-slate-600">{doctor.experience}</td>
                        <td className="px-6 py-4 text-slate-600">{doctor.submittedDate}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={doctor.status} />
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedDoctor(doctor)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-600">
              No approved verifications to display
            </div>
          </TabsContent>

          <TabsContent value="rejected">
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-600">
              No rejected verifications to display
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Verification Detail Modal */}
      <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Doctor Verification Review</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 flex-1 overflow-auto">
            {/* Left Panel - Profile */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <img 
                    src={selectedDoctor?.photo} 
                    alt={selectedDoctor?.name}
                    className="w-20 h-20 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="text-slate-900">{selectedDoctor?.name}</h3>
                    <p className="text-slate-600 mt-1">{selectedDoctor?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={selectedDoctor?.status || 'Pending'} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-600">License Number</label>
                  <p className="text-slate-900 mt-1">{selectedDoctor?.licenseNumber}</p>
                </div>
                <div>
                  <label className="text-slate-600">Specialty</label>
                  <p className="text-slate-900 mt-1">{selectedDoctor?.specialty}</p>
                </div>
                <div>
                  <label className="text-slate-600">Experience</label>
                  <p className="text-slate-900 mt-1">{selectedDoctor?.experience}</p>
                </div>
                <div>
                  <label className="text-slate-600">Bio</label>
                  <p className="text-slate-900 mt-1">{selectedDoctor?.bio}</p>
                </div>
                <div>
                  <label className="text-slate-600">Submitted Date</label>
                  <p className="text-slate-900 mt-1">{selectedDoctor?.submittedDate}</p>
                </div>
              </div>

              <div>
                <label className="text-slate-600 mb-2 block">Admin Notes</label>
                <Textarea
                  placeholder="Add notes about this verification..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            {/* Right Panel - Documents */}
            <div className="space-y-4">
              <div className="bg-slate-100 rounded-lg p-6 h-96 flex items-center justify-center border-2 border-dashed border-slate-300">
                <div className="text-center">
                  <Download className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600">Document Preview</p>
                  <p className="text-slate-500 mt-1">PDF viewer would display here</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-600">Documents</label>
                {selectedDoctor?.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                        <span className="text-red-600">PDF</span>
                      </div>
                      <div>
                        <p className="text-slate-900">{doc.name}</p>
                        <p className="text-slate-500">Document {idx + 1}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={handleRequestInfo}
              className="border-amber-600 text-amber-600 hover:bg-amber-50"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Request Info
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleReject}
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
