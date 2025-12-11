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
      if (plan.features.maxAssignmentsPerMonth !== null && plan.features.maxAssignmentsPerMonth !== undefined) {
        if (plan.features.maxAssignmentsPerMonth === -1) {
          features.push('Max Assignments: Unlimited');
        } else {
          features.push(`Max Assignments/Month: ${plan.features.maxAssignmentsPerMonth}`);
        }
      }
    } else {
      if (plan.features.maxPatientsPerMonth !== null && plan.features.maxPatientsPerMonth !== undefined) {
        if (plan.features.maxPatientsPerMonth === -1) {
          features.push('Max Patients: Unlimited');
        } else {
          features.push(`Max Patients/Month: ${plan.features.maxPatientsPerMonth}`);
        }
      }
      if (plan.features.maxAssignmentsPerMonth !== null && plan.features.maxAssignmentsPerMonth !== undefined) {
        if (plan.features.maxAssignmentsPerMonth === -1) {
          features.push('Max Assignments: Unlimited');
        } else {
          features.push(`Max Assignments/Month: ${plan.features.maxAssignmentsPerMonth}`);
        }
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
    <div className="bg-white rounded-lg shadow p-6 border border-slate-200 relative z-0">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-slate-900 font-semibold">{plan.name}</h3>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 mt-2 text-xs font-medium ${getTierColor(plan.tier)}`}>
            {getTierLabel(plan.tier)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(plan)} disabled={deleting} title="Edit Plan & Features">
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(plan)} disabled={deleting} title="Delete Plan">
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
  const [modalTab, setModalTab] = useState<'details' | 'features'>('details');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tier: 'basic',
    userRole: 'doctor' as 'doctor' | 'hospital',
    price: '',
    currency: 'USD',
  });
  const [featuresData, setFeaturesData] = useState({
    // Doctor features
    visibilityWeight: 1,
    maxAffiliations: 1,
    maxAssignmentsPerMonth: '',
    // Hospital features
    maxPatientsPerMonth: '',
    hospitalMaxAssignmentsPerMonth: '',
    includesPremiumDoctors: false,
    // Common
    notes: '',
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

  const loadPlanFeatures = async (plan: Plan) => {
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}/features`);
      const data = await res.json();
      
      if (data.success && data.data) {
        const features = data.data;
        if (plan.userRole === 'doctor') {
          setFeaturesData({
            visibilityWeight: features.visibilityWeight || 1,
            maxAffiliations: features.maxAffiliations || 1,
            maxAssignmentsPerMonth: features.maxAssignmentsPerMonth !== null && features.maxAssignmentsPerMonth !== undefined 
              ? (features.maxAssignmentsPerMonth === -1 ? 'unlimited' : String(features.maxAssignmentsPerMonth))
              : '',
            maxPatientsPerMonth: '',
            hospitalMaxAssignmentsPerMonth: '',
            includesPremiumDoctors: false,
            notes: features.notes || '',
          });
        } else {
          setFeaturesData({
            visibilityWeight: 1,
            maxAffiliations: 1,
            maxAssignmentsPerMonth: '',
            maxPatientsPerMonth: features.maxPatientsPerMonth !== null && features.maxPatientsPerMonth !== undefined
              ? (features.maxPatientsPerMonth === -1 ? 'unlimited' : String(features.maxPatientsPerMonth))
              : '',
            hospitalMaxAssignmentsPerMonth: features.maxAssignmentsPerMonth !== null && features.maxAssignmentsPerMonth !== undefined
              ? (features.maxAssignmentsPerMonth === -1 ? 'unlimited' : String(features.maxAssignmentsPerMonth))
              : '',
            includesPremiumDoctors: features.includesPremiumDoctors || false,
            notes: features.notes || '',
          });
        }
      } else {
        // No features yet, set defaults
        if (plan.userRole === 'doctor') {
          setFeaturesData({
            visibilityWeight: 1,
            maxAffiliations: 1,
            maxAssignmentsPerMonth: '',
            maxPatientsPerMonth: '',
            hospitalMaxAssignmentsPerMonth: '',
            includesPremiumDoctors: false,
            notes: '',
          });
        } else {
          setFeaturesData({
            visibilityWeight: 1,
            maxAffiliations: 1,
            maxAssignmentsPerMonth: '',
            maxPatientsPerMonth: '',
            hospitalMaxAssignmentsPerMonth: '',
            includesPremiumDoctors: false,
            notes: '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching plan features:', error);
      // Set defaults on error
      if (plan.userRole === 'doctor') {
        setFeaturesData({
          visibilityWeight: 1,
          maxAffiliations: 1,
          maxAssignmentsPerMonth: '',
          maxPatientsPerMonth: '',
          hospitalMaxAssignmentsPerMonth: '',
          includesPremiumDoctors: false,
          notes: '',
        });
      } else {
        setFeaturesData({
          visibilityWeight: 1,
          maxAffiliations: 1,
          maxAssignmentsPerMonth: '',
          maxPatientsPerMonth: '',
          hospitalMaxAssignmentsPerMonth: '',
          includesPremiumDoctors: false,
          notes: '',
        });
      }
    }
  };


  const formatFeaturesForAPI = (userRole: 'doctor' | 'hospital') => {
    if (userRole === 'doctor') {
      return {
        visibilityWeight: featuresData.visibilityWeight,
        maxAffiliations: featuresData.maxAffiliations,
        maxAssignmentsPerMonth: featuresData.maxAssignmentsPerMonth === 'unlimited' || featuresData.maxAssignmentsPerMonth === ''
          ? (featuresData.maxAssignmentsPerMonth === 'unlimited' ? -1 : null)
          : (featuresData.maxAssignmentsPerMonth ? parseInt(featuresData.maxAssignmentsPerMonth) : null),
        notes: featuresData.notes || null,
      };
    } else {
      return {
        maxPatientsPerMonth: featuresData.maxPatientsPerMonth === 'unlimited' || featuresData.maxPatientsPerMonth === ''
          ? (featuresData.maxPatientsPerMonth === 'unlimited' ? -1 : null)
          : (featuresData.maxPatientsPerMonth ? parseInt(featuresData.maxPatientsPerMonth) : null),
        maxAssignmentsPerMonth: featuresData.hospitalMaxAssignmentsPerMonth === 'unlimited' || featuresData.hospitalMaxAssignmentsPerMonth === ''
          ? (featuresData.hospitalMaxAssignmentsPerMonth === 'unlimited' ? -1 : null)
          : (featuresData.hospitalMaxAssignmentsPerMonth ? parseInt(featuresData.hospitalMaxAssignmentsPerMonth) : null),
        includesPremiumDoctors: featuresData.includesPremiumDoctors,
        notes: featuresData.notes || null,
      };
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

  const validateForm = () => {
    // Plan Details validation
    if (!formData.name.trim()) return false;
    if (!formData.userRole) return false;
    if (!formData.tier) return false;
    if (!formData.price || parseFloat(formData.price) <= 0) return false;
    if (!formData.currency) return false;

    // Features validation based on user role
    if (formData.userRole === 'doctor') {
      if (!featuresData.visibilityWeight || featuresData.visibilityWeight < 1) return false;
      if (!featuresData.maxAffiliations || featuresData.maxAffiliations < 1) return false;
      if (!featuresData.maxAssignmentsPerMonth.trim()) return false;
    } else {
      // Hospital: all features required except notes
      if (!featuresData.maxPatientsPerMonth.trim()) return false;
      if (!featuresData.hospitalMaxAssignmentsPerMonth.trim()) return false;
      // includesPremiumDoctors is a checkbox, always has a value (true/false)
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!validateForm()) {
      toast.error('Please fill all required fields in both tabs');
      return;
    }

    try {
      setSubmitting(true);
      
      // Single API for both create and update
      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : '/api/admin/plans';
      
      const method = editingPlan ? 'PUT' : 'POST';
      
      // Format features for API
      const features = formatFeaturesForAPI(formData.userRole);
      
      // Send plan and features together in one request
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          tier: formData.tier,
          userRole: formData.userRole,
          price: parseFloat(formData.price), // API will convert to cents
          currency: formData.currency,
          features: features, // Always include features
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingPlan ? 'Plan and features updated successfully' : 'Plan and features created successfully');
        
        setShowAddModal(false);
        setEditingPlan(null);
        setModalTab('details');
        setFormData({ name: '', tier: 'basic', userRole: 'doctor', price: '', currency: 'USD' });
        setFeaturesData({
          visibilityWeight: 1,
          maxAffiliations: 1,
          maxAssignmentsPerMonth: '',
          maxPatientsPerMonth: '',
          hospitalMaxAssignmentsPerMonth: '',
          includesPremiumDoctors: false,
          notes: '',
        });
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

  const handleEdit = async (plan: Plan) => {
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
    await loadPlanFeatures(plan);
    setActiveTab(plan.userRole === 'doctor' ? 'doctors' : 'hospitals');
    setModalTab('details');
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
    setModalTab('details');
    setFormData({ name: '', tier: 'basic', userRole: 'doctor', price: '', currency: 'USD' });
    setFeaturesData({
      visibilityWeight: 1,
      maxAffiliations: 1,
      maxAssignmentsPerMonth: '',
      maxPatientsPerMonth: '',
      hospitalMaxAssignmentsPerMonth: '',
      includesPremiumDoctors: false,
      notes: '',
    });
  };

  const handleAddNew = () => {
    setEditingPlan(null);
    setModalTab('details');
    setFormData({ 
      name: '', 
      tier: 'basic', 
      userRole: activeTab === 'doctors' ? 'doctor' : 'hospital', 
      price: '', 
      currency: 'USD' 
    });
    setFeaturesData({
      visibilityWeight: 1,
      maxAffiliations: 1,
      maxAssignmentsPerMonth: '',
      maxPatientsPerMonth: '',
      hospitalMaxAssignmentsPerMonth: '',
      includesPremiumDoctors: false,
      notes: '',
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

      {/* Combined Add/Edit Modal with Tabs */}
      <Dialog open={showAddModal} onOpenChange={handleCloseModal}>
        <DialogContent aria-describedby={undefined} className="max-w-3xl bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto" style={{ zIndex: 100 }}>
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs value={modalTab} onValueChange={(v) => setModalTab(v as 'details' | 'features')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="details">Plan Details</TabsTrigger>
                <TabsTrigger value="features">Features & Limits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
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
                      onValueChange={(value) => {
                        setFormData({ ...formData, userRole: value as 'doctor' | 'hospital' });
                        // Reset features when role changes
                        if (value === 'doctor') {
                          setFeaturesData({
                            visibilityWeight: 1,
                            maxAffiliations: 1,
                            maxAssignmentsPerMonth: '',
                            maxPatientsPerMonth: '',
                            hospitalMaxAssignmentsPerMonth: '',
                            includesPremiumDoctors: false,
                            notes: '',
                          });
                        } else {
                          setFeaturesData({
                            visibilityWeight: 1,
                            maxAffiliations: 1,
                            maxAssignmentsPerMonth: '',
                            maxPatientsPerMonth: '',
                            hospitalMaxAssignmentsPerMonth: '',
                            includesPremiumDoctors: false,
                            notes: '',
                          });
                        }
                      }}
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
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                {formData.userRole === 'doctor' ? (
                  <>
                    <div>
                      <Label htmlFor="visibilityWeight">Visibility Weight *</Label>
                      <Input
                        id="visibilityWeight"
                        type="number"
                        min="1"
                        value={featuresData.visibilityWeight}
                        onChange={(e) => setFeaturesData({ ...featuresData, visibilityWeight: parseInt(e.target.value) || 1 })}
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher weight = better visibility in search results</p>
                    </div>
                    <div>
                      <Label htmlFor="maxAffiliations">Max Affiliations *</Label>
                      <Input
                        id="maxAffiliations"
                        type="number"
                        min="1"
                        value={featuresData.maxAffiliations}
                        onChange={(e) => setFeaturesData({ ...featuresData, maxAffiliations: parseInt(e.target.value) || 1 })}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxAssignmentsPerMonth">Max Assignments Per Month *</Label>
                      <Input
                        id="maxAssignmentsPerMonth"
                        type="text"
                        placeholder="Enter number or 'unlimited'"
                        value={featuresData.maxAssignmentsPerMonth}
                        onChange={(e) => setFeaturesData({ ...featuresData, maxAssignmentsPerMonth: e.target.value })}
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter a number or 'unlimited' for -1</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="maxPatientsPerMonth">Max Patients Per Month *</Label>
                      <Input
                        id="maxPatientsPerMonth"
                        type="text"
                        placeholder="Enter number or 'unlimited'"
                        value={featuresData.maxPatientsPerMonth}
                        onChange={(e) => setFeaturesData({ ...featuresData, maxPatientsPerMonth: e.target.value })}
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter a number or 'unlimited' for -1</p>
                    </div>
                    <div>
                      <Label htmlFor="hospitalMaxAssignmentsPerMonth">Max Assignments Per Month *</Label>
                      <Input
                        id="hospitalMaxAssignmentsPerMonth"
                        type="text"
                        placeholder="Enter number or 'unlimited'"
                        value={featuresData.hospitalMaxAssignmentsPerMonth}
                        onChange={(e) => setFeaturesData({ ...featuresData, hospitalMaxAssignmentsPerMonth: e.target.value })}
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter a number or 'unlimited' for -1</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includesPremiumDoctors"
                        checked={featuresData.includesPremiumDoctors}
                        onChange={(e) => setFeaturesData({ ...featuresData, includesPremiumDoctors: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="includesPremiumDoctors" className="cursor-pointer">
                        Includes Premium Doctors Access
                      </Label>
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this plan..."
                    value={featuresData.notes}
                    onChange={(e) => setFeaturesData({ ...featuresData, notes: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
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
                    {editingPlan ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingPlan ? 'Update Plan & Features' : 'Create Plan & Features'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
