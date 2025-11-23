import {
  LayoutDashboard,
  User,
  FileText,
  Image,
  Calendar,
  Clipboard,
  List,
  Building2,
  Stethoscope,
  Umbrella,
  IndianRupee,
  Star,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  const menuGroups = [
    {
      title: 'Profile & Verification',
      items: [
        { id: 'complete-profile', label: 'Complete Profile', icon: User, badge: '87%' },
        { id: 'credentials', label: 'Credentials & Documents', icon: FileText, badge: '3' },
        { id: 'profile-photos', label: 'Profile Photos', icon: Image },
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard Home', icon: LayoutDashboard },
        { id: 'availability', label: 'My Availability', icon: Calendar },
        { id: 'today-assignments', label: "Today's Assignments", icon: Clipboard, badge: '3' },
        { id: 'all-assignments', label: 'All Assignments', icon: List },
      ]
    },
    {
      title: 'Professional Network',
      items: [
        { id: 'hospitals', label: 'Affiliated Hospitals', icon: Building2, badge: '8/10' },
        { id: 'specializations', label: 'Specializations', icon: Stethoscope },
      ]
    },
    {
      title: 'Time & Finance',
      items: [
        { id: 'leaves', label: 'Leaves & Time Off', icon: Umbrella },
        { id: 'earnings', label: 'Earnings & Payments', icon: IndianRupee },
        { id: 'subscription', label: 'Subscription Plan', icon: Star },
      ]
    },
    {
      title: 'Performance & Support',
      items: [
        { id: 'ratings', label: 'Ratings & Reviews', icon: Star },
        { id: 'preferences', label: 'Preferences', icon: Settings },
        { id: 'support', label: 'Support', icon: HelpCircle },
      ]
    }
  ];

  return (
    <aside
      className={`fixed left-0 top-[72px] bottom-0 bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } overflow-y-auto`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-4 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-600" />
        )}
      </button>

      <nav className="p-4">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {!collapsed && (
              <div className="px-3 mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  {group.title}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#2563EB] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="text-sm flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-white text-[#2563EB]'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
