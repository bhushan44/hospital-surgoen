'use client';

import { PageHeader } from '../PageHeader';
import { StatCard } from '../StatCard';
import { Button } from '../ui/button';
import { Building2, Clock, Check, X, Star } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

const affiliations = [
  {
    id: 1,
    doctor: { name: 'Dr. Sarah Johnson', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    specialty: 'Cardiology',
    hospital: { name: 'City Medical Center', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CMC' },
    status: 'Active',
    preferred: true,
    createdDate: '2024-01-15',
  },
  {
    id: 2,
    doctor: { name: 'Dr. Michael Chen', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
    specialty: 'Pediatrics',
    hospital: { name: 'Sunrise Specialty Clinic', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=SSC' },
    status: 'Active',
    preferred: false,
    createdDate: '2024-02-10',
  },
  {
    id: 3,
    doctor: { name: 'Dr. Emily Rodriguez', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
    specialty: 'Neurology',
    hospital: { name: 'City Medical Center', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CMC' },
    status: 'Pending',
    preferred: false,
    createdDate: '2024-11-16',
  },
];

export function Affiliations() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Affiliations" 
        description="Manage doctor-hospital affiliations and partnerships"
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Total Active"
            value="89"
            icon={Building2}
          />
          <StatCard
            title="Pending Requests"
            value="7"
            icon={Clock}
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-slate-900">All Affiliations</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-slate-600">Doctor</th>
                  <th className="px-6 py-3 text-left text-slate-600">Specialty</th>
                  <th className="px-6 py-3 text-left text-slate-600">Hospital</th>
                  <th className="px-6 py-3 text-left text-slate-600">Status</th>
                  <th className="px-6 py-3 text-left text-slate-600">Preferred</th>
                  <th className="px-6 py-3 text-left text-slate-600">Created</th>
                  <th className="px-6 py-3 text-left text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {affiliations.map((affiliation) => (
                  <tr key={affiliation.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={affiliation.doctor.photo} 
                          alt={affiliation.doctor.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="text-slate-900">{affiliation.doctor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-900">{affiliation.specialty}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={affiliation.hospital.logo} 
                          alt={affiliation.hospital.name}
                          className="w-8 h-8 rounded"
                        />
                        <span className="text-slate-900">{affiliation.hospital.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={affiliation.status} />
                    </td>
                    <td className="px-6 py-4">
                      {affiliation.preferred && (
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{affiliation.createdDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {affiliation.status === 'Pending' ? (
                          <>
                            <Button size="sm" variant="ghost" className="text-green-600">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600">
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
