'use client';

import { PageHeader } from '../PageHeader';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function SystemSettings() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="System Settings" 
        description="Configure platform settings and preferences"
        actions={
          <Button className="bg-navy-600 hover:bg-navy-700">
            Save Changes
          </Button>
        }
      />

      <div className="p-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="policy">Cancellation Policy</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-slate-900">General Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Platform Name</Label>
                  <Input defaultValue="HealthCare Admin" className="mt-1" />
                </div>
                
                <div>
                  <Label>Support Email</Label>
                  <Input type="email" defaultValue="support@healthcare.com" className="mt-1" />
                </div>
                
                <div>
                  <Label>Support Phone</Label>
                  <Input type="tel" defaultValue="+1 (555) 123-4567" className="mt-1" />
                </div>
                
                <div>
                  <Label>Timezone</Label>
                  <Select defaultValue="pst">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">Pacific Standard Time</SelectItem>
                      <SelectItem value="est">Eastern Standard Time</SelectItem>
                      <SelectItem value="cst">Central Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-slate-600 mt-1">Enable to restrict access during updates</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-slate-900">Assignment Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Routine Assignment Timeout (minutes)</Label>
                  <Input type="number" defaultValue="30" className="mt-1" />
                </div>
                
                <div>
                  <Label>Urgent Assignment Timeout (minutes)</Label>
                  <Input type="number" defaultValue="15" className="mt-1" />
                </div>
                
                <div>
                  <Label>Emergency Assignment Timeout (minutes)</Label>
                  <Input type="number" defaultValue="5" className="mt-1" />
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Enable Assignment Reminders</Label>
                    <p className="text-slate-600 mt-1">Send reminders for pending assignments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Auto-Reassign on Timeout</Label>
                    <p className="text-slate-600 mt-1">Automatically reassign if doctor doesn't respond</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-slate-900">Notification Templates</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Email Templates</Label>
                  <Select defaultValue="verification">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verification">Verification Approved</SelectItem>
                      <SelectItem value="assignment">New Assignment</SelectItem>
                      <SelectItem value="reminder">Assignment Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Email Subject</Label>
                  <Input defaultValue="Your verification has been approved" className="mt-1" />
                </div>
                
                <div>
                  <Label>Email Body</Label>
                  <Textarea 
                    rows={6} 
                    className="mt-1"
                    defaultValue="Dear {{name}},&#10;&#10;Congratulations! Your account verification has been approved.&#10;&#10;Best regards,&#10;HealthCare Admin Team"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="policy">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-slate-900">Cancellation Policy</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Free Cancellation Window (hours before appointment)</Label>
                  <Input type="number" defaultValue="24" className="mt-1" />
                </div>
                
                <div>
                  <Label>Cancellation Penalty Amount ($)</Label>
                  <Input type="number" defaultValue="25" className="mt-1" />
                </div>
                
                <div>
                  <Label>Maximum Cancellations per Month</Label>
                  <Input type="number" defaultValue="3" className="mt-1" />
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Enable Penalty System</Label>
                    <p className="text-slate-600 mt-1">Apply penalties for late cancellations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-slate-900">Payment Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Payment Gateway</Label>
                  <Select defaultValue="stripe">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>API Key</Label>
                  <Input type="password" defaultValue="sk_test_••••••••••••••••" className="mt-1" />
                </div>
                
                <div>
                  <Label>Platform Commission Rate (%)</Label>
                  <Input type="number" defaultValue="15" className="mt-1" />
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Enable Auto-Billing</Label>
                    <p className="text-slate-600 mt-1">Automatically charge subscriptions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
