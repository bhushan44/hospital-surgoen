'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../PageHeader';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface Specialty {
  id: string;
  name: string;
  description: string | null;
  activeDoctors: number;
  activeHospitals: number;
  status: string;
}

export function SpecialtiesManagement() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSpecialties();
  }, [searchQuery]);

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('limit', '100');

      const res = await fetch(`/api/admin/specialties?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setSpecialties(data.data || []);
      } else {
        toast.error(data.message || 'Failed to fetch specialties');
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
      toast.error('Failed to fetch specialties');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Name is required
    if (!formData.name.trim()) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingSpecialty
        ? `/api/admin/specialties/${editingSpecialty.id}`
        : '/api/admin/specialties';
      
      const method = editingSpecialty ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingSpecialty ? 'Specialty updated successfully' : 'Specialty created successfully');
        setShowAddModal(false);
        setEditingSpecialty(null);
        setFormData({ name: '', description: '' });
        fetchSpecialties();
      } else {
        toast.error(data.message || 'Failed to save specialty');
      }
    } catch (error) {
      console.error('Error saving specialty:', error);
      toast.error('Failed to save specialty');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      name: specialty.name,
      description: specialty.description || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (specialty: Specialty) => {
    if (!confirm(`Are you sure you want to delete "${specialty.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(specialty.id);
      const res = await fetch(`/api/admin/specialties/${specialty.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Specialty deleted successfully');
        fetchSpecialties();
      } else {
        toast.error(data.message || 'Failed to delete specialty');
      }
    } catch (error) {
      console.error('Error deleting specialty:', error);
      toast.error('Failed to delete specialty');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSpecialty(null);
    setFormData({ name: '', description: '' });
  };

  const filteredSpecialties = specialties.filter((specialty) =>
    specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (specialty.description && specialty.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : (
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
                  {filteredSpecialties.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        {searchQuery ? 'No specialties found matching your search' : 'No specialties found'}
                      </td>
                    </tr>
                  ) : (
                    filteredSpecialties.map((specialty) => (
                      <tr key={specialty.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900 font-medium">{specialty.name}</td>
                        <td className="px-6 py-4 text-slate-600">{specialty.description || '-'}</td>
                        <td className="px-6 py-4 text-slate-900">{specialty.activeDoctors}</td>
                        <td className="px-6 py-4 text-slate-900">{specialty.activeHospitals}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={specialty.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEdit(specialty)}
                              disabled={deletingId === specialty.id}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDelete(specialty)}
                              disabled={deletingId === specialty.id}
                            >
                              {deletingId === specialty.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-red-600" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={handleCloseModal}>
        <DialogContent aria-describedby={undefined} className="bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>{editingSpecialty ? 'Edit Specialty' : 'Add New Specialty'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Specialty Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Cardiology"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the specialty"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCloseModal}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-navy-600 hover:bg-navy-700"
                disabled={submitting || !validateForm()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingSpecialty ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingSpecialty ? 'Update' : 'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
