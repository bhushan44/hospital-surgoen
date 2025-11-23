import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/pages/DashboardHome';
import { CompleteProfile } from './components/pages/CompleteProfile';
import { CredentialsDocuments } from './components/pages/CredentialsDocuments';
import { ProfilePhotos } from './components/pages/ProfilePhotos';
import { MyAvailability } from './components/pages/MyAvailability';
import { TodayAssignments } from './components/pages/TodayAssignments';
import { AllAssignments } from './components/pages/AllAssignments';
import { AffiliatedHospitals } from './components/pages/AffiliatedHospitals';
import { Specializations } from './components/pages/Specializations';
import { LeavesTimeOff } from './components/pages/LeavesTimeOff';
import { EarningsPayments } from './components/pages/EarningsPayments';
import { RatingsReviews } from './components/pages/RatingsReviews';
import { SubscriptionPlan } from './components/pages/SubscriptionPlan';
import { Preferences } from './components/pages/Preferences';
import { Support } from './components/pages/Support';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'complete-profile':
        return <CompleteProfile />;
      case 'credentials':
        return <CredentialsDocuments />;
      case 'profile-photos':
        return <ProfilePhotos />;
      case 'availability':
        return <MyAvailability />;
      case 'today-assignments':
        return <TodayAssignments />;
      case 'all-assignments':
        return <AllAssignments />;
      case 'hospitals':
        return <AffiliatedHospitals />;
      case 'specializations':
        return <Specializations />;
      case 'leaves':
        return <LeavesTimeOff />;
      case 'earnings':
        return <EarningsPayments />;
      case 'ratings':
        return <RatingsReviews />;
      case 'subscription':
        return <SubscriptionPlan />;
      case 'preferences':
        return <Preferences />;
      case 'support':
        return <Support />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      
      <div className="flex pt-[72px]">
        <Sidebar 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-60'
          }`}
        >
          <div className="p-6 max-w-[1400px] mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
