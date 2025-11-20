'use client';

import { useState } from 'react';
import { PageHeader } from '../PageHeader';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const specialties = [
  { id: 1, name: 'Cardiology', description: 'Heart and cardiovascular system', activeDoctors: 12, activeHospitals: 8, status: 'Active' },
  { id: 2, name: 'Neurology', description: 'Brain and nervous system', activeDoctors: 8, activeHospitals: 6, status: 'Active' },
  { id: 3, name: 'Pediatrics', description: 'Medical care of infants, children, and adolescents', activeDoctors: 15, activeHospitals: 10, status: 'Active' },
  { id: 4, name: 'Orthopedics', description: 'Musculoskeletal system', activeDoctors: 10, activeHospitals: 7, status: 'Active' },
  { id: 5, name: 'Dermatology', description: 'Skin, hair, and nails', activeDoctors: 6, activeHospitals: 5, status: 'Active' },
];

export function SpecialtiesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<typeof specialties[0] | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Specialties Management" 
        description="Manage medical specialties and departments"
        actions={
          <Button onClick={() => setShowAddModal(true)} className="bg-navy-600 hover:bg-navy-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Specialty
          </Button>
        }
      />

      <div className="p-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search specialties..."
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
                  <th className="px-6 py-3 text-left text-slate-600">Name</th>
                  <th className="px-6 py-3 text-left text-slate-600">Description</th>
                  <th className="px-6 py-3 text-left text-slate-600">Active Doctors</th>
                  <th className="px-6 py-3 text-left text-slate-600">Active Hospitals</th>
                  <th className="px-6 py-3 text-left text-slate-600">Status</th>
                  <th className="px-6 py-3 text-left text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {specialties.map((specialty) => (
                  <tr key={specialty.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-900">{specialty.name}</td>
                    <td className="px-6 py-4 text-slate-600">{specialty.description}</td>
                    <td className="px-6 py-4 text-slate-900">{specialty.activeDoctors}</td>
                    <td className="px-6 py-4 text-slate-900">{specialty.activeHospitals}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={specialty.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingSpecialty(specialty)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          {specialty.status === 'Active' ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                          )}
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || !!editingSpecialty} onOpenChange={() => { setShowAddModal(false); setEditingSpecialty(null); }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editingSpecialty ? 'Edit Specialty' : 'Add New Specialty'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Specialty Name</Label>
              <Input placeholder="e.g., Cardiology" className="mt-1" defaultValue={editingSpecialty?.name} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Brief description of the specialty" rows={3} className="mt-1" defaultValue={editingSpecialty?.description} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddModal(false); setEditingSpecialty(null); }}>
              Cancel
            </Button>
            <Button className="bg-navy-600 hover:bg-navy-700">
              {editingSpecialty ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}