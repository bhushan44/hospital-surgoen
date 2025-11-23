import { Building2, Mail, Phone, Globe, MapPin, Upload, Star, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

export function HospitalProfile() {
  const hospitalInfo = {
    name: 'MediCare Multi-Specialty Hospital',
    type: 'Multi-Specialty Hospital',
    registrationNo: 'MH-2024-001234',
    email: 'contact@medicare.com',
    phone: '+91 98765 43210',
    website: 'www.medicare.com',
    address: '123 Health Street, Medical District, Mumbai, Maharashtra - 400001',
    beds: 250,
    verified: true,
  };

  const departments = [
    'Cardiology',
    'Orthopedics',
    'Neurology',
    'General Medicine',
    'Pediatrics',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Oncology',
    'Emergency Medicine',
  ];

  const affiliatedDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      experience: 15,
      rating: 4.9,
      assignments: 456,
      lastActive: '2 hours ago',
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Orthopedics',
      experience: 12,
      rating: 4.8,
      assignments: 378,
      lastActive: '5 hours ago',
    },
    {
      id: 3,
      name: 'Dr. Priya Patel',
      specialty: 'Neurology',
      experience: 18,
      rating: 4.9,
      assignments: 521,
      lastActive: '1 hour ago',
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'General Medicine',
      experience: 8,
      rating: 4.6,
      assignments: 289,
      lastActive: '3 hours ago',
    },
  ];

  const documents = [
    { name: 'Hospital Registration License', status: 'verified', uploadDate: '2024-01-15' },
    { name: 'Medical Council Accreditation', status: 'verified', uploadDate: '2024-01-15' },
    { name: 'Insurance Certificate', status: 'pending', uploadDate: '2024-11-18' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-1">Hospital Profile</h1>
        <p className="text-gray-500">Manage your hospital information and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-blue-600" />
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-gray-900">{hospitalInfo.name}</h2>
                    {hospitalInfo.verified && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-gray-500 mb-4">{hospitalInfo.type}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="outline">Reg: {hospitalInfo.registrationNo}</Badge>
                    <Badge variant="outline">{hospitalInfo.beds} Beds</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name</Label>
                    <Input id="hospitalName" defaultValue={hospitalInfo.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalType">Hospital Type</Label>
                    <Input id="hospitalType" defaultValue={hospitalInfo.type} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="email" className="pl-10" defaultValue={hospitalInfo.email} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="phone" className="pl-10" defaultValue={hospitalInfo.phone} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="website" className="pl-10" defaultValue={hospitalInfo.website} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Textarea
                      id="address"
                      className="pl-10"
                      defaultValue={hospitalInfo.address}
                      rows={3}
                    />
                  </div>
                </div>

                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Departments */}
          <Card>
            <CardHeader>
              <CardTitle>Available Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <Badge key={dept} variant="secondary" className="px-3 py-1">
                    {dept}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Affiliated Doctors */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Affiliated Doctors</CardTitle>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {affiliatedDoctors.map((doctor) => (
                  <div key={doctor.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {doctor.name.split(' ')[1][0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-gray-900">{doctor.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {doctor.rating}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{doctor.experience} years</span>
                        <span>•</span>
                        <span>{doctor.assignments} assignments</span>
                        <span>•</span>
                        <span>Active {doctor.lastActive}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={index} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-gray-900">{doc.name}</p>
                      {doc.status === 'verified' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Doctors</span>
                  <span className="text-gray-900">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Patients</span>
                  <span className="text-gray-900">248</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="text-gray-900">156 assignments</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="text-green-600">96%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
