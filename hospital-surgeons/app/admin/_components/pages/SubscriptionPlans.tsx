'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../PageHeader';
import { Button } from '../ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  tier: string;
  userRole: 'doctor' | 'hospital';
  price: number;
  currency: string;
  priceFormatted: string;
  subscribers: number;
  features?: any;
}

function PlanCard({ plan, onEdit, onDelete, deleting }: { plan: Plan; onEdit: (plan: Plan) => void; onDelete: (plan: Plan) => void; deleting: boolean }) {
  const getTierColor = (tier: string) => {
    if (tier === 'free' || tier === 'basic') return 'bg-blue-100 text-blue-700';
    if (tier === 'premium') return 'bg-purple-100 text-purple-700';
    if (tier === 'enterprise') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      free: 'Free',
      basic: 'Tier 1',
      premium: 'Tier 2',
      enterprise: 'Tier 3',
    };
    return labels[tier] || tier;
  };

  // Format features for display
  const formatFeatures = () => {
    if (!plan.features) return [];
    
    const features: string[] = [];
    if (plan.userRole === 'doctor') {
      if (plan.features.visibilityWeight) {
        features.push(`Visibility Weight: ${plan.features.visibilityWeight}`);
      }
      if (plan.features.maxAffiliations) {
        features.push(`Max Affiliations: ${plan.features.maxAffiliations}`);
      }
    } else {
      if (plan.features.maxPatientsPerMonth) {
        features.push(`Max Patients/Month: ${plan.features.maxPatientsPerMonth}`);
      }
      if (plan.features.includesPremiumDoctors) {
        features.push('Includes Premium Doctors');
      }
    }
    if (plan.features.notes) {
      features.push(plan.features.notes);
    }
    return features;
  };

  const displayFeatures = formatFeatures();

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-slate-900 font-semibold">{plan.name}</h3>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 mt-2 text-xs font-medium ${getTierColor(plan.tier)}`}>
            {getTierLabel(plan.tier)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(plan)} disabled={deleting}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(plan)} disabled={deleting}>
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-600" />
            )}
          </Button>
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-4">{plan.priceFormatted}/month</p>
      {displayFeatures.length > 0 ? (
        <ul className="space-y-2 mb-4">
          {displayFeatures.map((feature, idx) => (
            <li key={idx} className="text-slate-600 flex items-start gap-2">
              <span className="text-teal-600 mt-1">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 mb-4 italic">No features configured</p>
      )}
      <div className="pt-4 border-t border-slate-200">
        <p className="text-slate-600">
          <span className="text-slate-900 font-semibold">{plan.subscribers}</span> active subscribers
        </p>
      </div>
    </div>
  );
}

export function SubscriptionPlans() {
  const [doctorPlans, setDoctorPlans] = useState<Plan[]>([]);
  const [hospitalPlans, setHospitalPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<'doctors' | 'hospitals'>('doctors');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tier: 'basic',
    userRole: 'doctor' as 'doctor' | 'hospital',
    price: '',
    currency: 'USD',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/plans');
      const data = await res.json();

      if (data.success) {
        setDoctorPlans(data.grouped?.doctors || []);
        setHospitalPlans(data.grouped?.hospitals || []);
        
        // Fetch features for each plan
        const allPlans = [...(data.grouped?.doctors || []), ...(data.grouped?.hospitals || [])];
        for (const plan of allPlans) {
          await fetchPlanFeatures(plan);
        }
      } else {
        toast.error(data.message || 'Failed to fetch subscription plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanFeatures = async (plan: Plan) => {
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}/features`);
      const data = await res.json();
      if (data.success && data.data) {
        plan.features = data.data;
        if (plan.userRole === 'doctor') {
          setDoctorPlans(prev => prev.map(p => p.id === plan.id ? { ...p, features: data.data } : p));
        } else {
          setHospitalPlans(prev => prev.map(p => p.id === plan.id ? { ...p, features: data.data } : p));
        }
      }
    } catch (error) {
      console.error('Error fetching plan features:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      toast.error('Name and price are required');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : '/api/admin/plans';
      
      const method = editingPlan ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          tier: formData.tier,
          userRole: formData.userRole,
          price: parseFloat(formData.price), // API will convert to cents
          currency: formData.currency,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
        setShowAddModal(false);
        setEditingPlan(null);
        setFormData({ name: '', tier: 'basic', userRole: 'doctor', price: '', currency: 'USD' });
        fetchPlans();
      } else {
        toast.error(data.message || 'Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    // Price is stored in cents, convert to dollars for display
    const priceInDollars = plan.price / 100;
    setFormData({
      name: plan.name,
      tier: plan.tier,
      userRole: plan.userRole,
      price: priceInDollars.toFixed(2),
      currency: plan.currency,
    });
    setActiveTab(plan.userRole === 'doctor' ? 'doctors' : 'hospitals');
    setShowAddModal(true);
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Are you sure you want to delete "${plan.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(plan.id);
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Plan deleted successfully');
        fetchPlans();
      } else {
        toast.error(data.message || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPlan(null);
    setFormData({ name: '', tier: 'basic', userRole: 'doctor', price: '', currency: 'USD' });
  };

  const handleAddNew = () => {
    setEditingPlan(null);
    setFormData({ 
      name: '', 
      tier: 'basic', 
      userRole: activeTab === 'doctors' ? 'doctor' : 'hospital', 
      price: '', 
      currency: 'USD' 
    });
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Subscription Plans" 
        description="Manage pricing tiers and features for doctors and hospitals"
        actions={
          <Button onClick={handleAddNew} className="bg-navy-600 hover:bg-navy-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        }
      />

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'doctors' | 'hospitals')} className="space-y-6">
            <TabsList>
              <TabsTrigger value="doctors">Doctor Plans</TabsTrigger>
              <TabsTrigger value="hospitals">Hospital Plans</TabsTrigger>
            </TabsList>

            <TabsContent value="doctors" className="space-y-4">
              {doctorPlans.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No doctor plans found. Create one to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctorPlans.map((plan) => (
                    <PlanCard 
                      key={plan.id} 
                      plan={plan} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleting={deletingId === plan.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="hospitals" className="space-y-4">
              {hospitalPlans.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No hospital plans found. Create one to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hospitalPlans.map((plan) => (
                    <PlanCard 
                      key={plan.id} 
                      plan={plan} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleting={deletingId === plan.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={handleCloseModal}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Basic, Professional, Premium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userRole">User Role *</Label>
                  <Select
                    value={formData.userRole}
                    onValueChange={(value) => setFormData({ ...formData, userRole: value as 'doctor' | 'hospital' })}
                    disabled={!!editingPlan}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tier">Tier *</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value) => setFormData({ ...formData, tier: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingPlan ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingPlan ? 'Update' : 'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
