import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { DashboardView } from './views/DashboardView';
import { EmployeesView } from './views/EmployeesView';
import { LeavesView } from './views/LeavesView';
import { AttendanceView } from './views/AttendanceView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { TrainingsView } from './views/TrainingsView';
import { ProfileView } from './views/ProfileView';
import { LoginView } from './views/LoginView';

const MainApp = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--primary-light)',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        Initializing StaffSync Enterprise HR Suite...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'employees':
        return <EmployeesView />;
      case 'leaves':
        return <LeavesView />;
      case 'attendance':
        return <AttendanceView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'trainings':
        return <TrainingsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Fixed Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar onOpenAnnouncements={() => setActiveTab('announcements')} />
        <main className="page-container">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
