import { useState } from 'react';
import { Bell, Menu, Search, Home, Users, UserSearch, ClipboardList, Building2, CreditCard, Settings, X } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { DashboardHome } from './components/DashboardHome';
import { PatientManagement } from './components/PatientManagement';
import { FindDoctors } from './components/FindDoctors';
import { AssignmentManagement } from './components/AssignmentManagement';
import { HospitalProfile } from './components/HospitalProfile';
import { SubscriptionBilling } from './components/SubscriptionBilling';
import { NotificationCenter } from './components/NotificationCenter';
import { Settings as SettingsPage } from './components/Settings';

type Page = 'dashboard' | 'patients' | 'find-doctors' | 'assignments' | 'profile' | 'subscription' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'find-doctors', label: 'Find Doctors', icon: UserSearch },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'profile', label: 'Hospital Profile', icon: Building2 },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome onNavigate={setCurrentPage} />;
      case 'patients':
        return <PatientManagement onNavigate={setCurrentPage} />;
      case 'find-doctors':
        return <FindDoctors />;
      case 'assignments':
        return <AssignmentManagement onNavigate={setCurrentPage} />;
      case 'profile':
        return <HospitalProfile />;
      case 'subscription':
        return <SubscriptionBilling />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardHome onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'
        } flex-shrink-0`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="text-gray-900">MediCare</span>}
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as Page)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search patients, doctors, assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Subscription Badge */}
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
              Gold Plan
            </Badge>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
              {notificationOpen && (
                <NotificationCenter onClose={() => setNotificationOpen(false)} />
              )}
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      MC
                    </AvatarFallback>
                  </Avatar>
                  <span>MediCare Hospital</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCurrentPage('profile')}>
                  Hospital Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentPage('subscription')}>
                  Subscription & Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentPage('settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}