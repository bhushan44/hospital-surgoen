import { ArrowUp, ArrowDown, Users, ClipboardList, Calendar, TrendingUp, Plus, UserSearch, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface DashboardHomeProps {
  onNavigate: (page: string) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const metrics = [
    {
      title: 'Total Patients',
      value: '248',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Assignments',
      value: '34',
      change: '8 pending',
      trend: 'neutral',
      icon: ClipboardList,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Monthly Assignments',
      value: '156',
      change: '+18.2%',
      trend: 'up',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Subscription Usage',
      value: '18',
      change: 'Unlimited',
      trend: 'neutral',
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  const todaysSchedule = [
    {
      time: '09:00 AM',
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      patient: 'John Smith',
      condition: 'Heart Condition',
      status: 'accepted',
      acceptedAt: '2 hours ago',
    },
    {
      time: '11:00 AM',
      doctor: 'Dr. Michael Chen',
      specialty: 'Orthopedics',
      patient: 'Emma Wilson',
      condition: 'Knee Injury',
      status: 'pending',
      expiresIn: '18h',
    },
    {
      time: '02:00 PM',
      doctor: 'Dr. Priya Patel',
      specialty: 'Neurology',
      patient: 'David Brown',
      condition: 'Migraine Treatment',
      status: 'accepted',
      acceptedAt: '1 day ago',
    },
    {
      time: '04:00 PM',
      doctor: 'Dr. James Wilson',
      specialty: 'General Medicine',
      patient: 'Lisa Anderson',
      condition: 'Routine Checkup',
      status: 'pending',
      expiresIn: '6h',
    },
  ];

  const pendingActions = [
    { type: 'unassigned', count: 5, message: 'Patients without assigned doctors', action: 'Assign Now' },
    { type: 'declined', count: 2, message: 'Declined assignments need reassignment', action: 'Find Doctor' },
    { type: 'expiring', count: 3, message: 'Assignments expiring soon', action: 'Send Reminder' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-1">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">{metric.title}</p>
                    <h3 className="text-gray-900 mb-2">{metric.value}</h3>
                    <div className="flex items-center gap-1">
                      {metric.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-600" />}
                      {metric.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-600" />}
                      <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className={`${metric.bgColor} ${metric.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => onNavigate('patients')} className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Patient
            </Button>
            <Button onClick={() => onNavigate('find-doctors')} variant="outline" className="gap-2">
              <UserSearch className="w-4 h-4" />
              Find Doctor
            </Button>
            <Button onClick={() => onNavigate('assignments')} variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              View All Assignments
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysSchedule.map((appointment, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="text-center min-w-[80px]">
                    <div className="text-blue-600">{appointment.time}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-gray-900">{appointment.doctor}</p>
                        <p className="text-gray-500 text-sm">{appointment.specialty}</p>
                      </div>
                      {appointment.status === 'accepted' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Accepted
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-700">Patient: {appointment.patient}</span>
                      <span className="text-gray-500">• {appointment.condition}</span>
                    </div>
                    {appointment.status === 'accepted' ? (
                      <p className="text-gray-500 text-xs mt-2">Confirmed {appointment.acceptedAt}</p>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-yellow-600 text-xs">Expires in {appointment.expiresIn}</span>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                          Send Reminder
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((action, index) => (
                <div key={index} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <Badge variant="secondary">{action.count}</Badge>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{action.message}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      if (action.type === 'unassigned' || action.type === 'declined') {
                        onNavigate('find-doctors');
                      } else {
                        onNavigate('assignments');
                      }
                    }}
                  >
                    {action.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
