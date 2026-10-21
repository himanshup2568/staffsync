import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  Clock, 
  Bell, 
  GraduationCap, 
  LayoutDashboard, 
  UserCheck, 
  LogOut, 
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, role, logout } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case 'hr':
        return [
          { id: 'dashboard', label: 'HR Dashboard', icon: LayoutDashboard },
          { id: 'employees', label: 'Employee Directory', icon: Users, badge: 'All' },
          { id: 'leaves', label: 'Leave Approvals', icon: CalendarCheck },
          { id: 'attendance', label: 'Attendance Tracking', icon: Clock },
          { id: 'trainings', label: 'Training Programs', icon: GraduationCap },
          { id: 'announcements', label: 'Company Bulletins', icon: Bell },
        ];
      case 'manager':
        return [
          { id: 'dashboard', label: 'Manager Dashboard', icon: LayoutDashboard },
          { id: 'leaves', label: 'Team Leave Requests', icon: CalendarCheck },
          { id: 'attendance', label: 'Team Attendance', icon: Clock },
          { id: 'trainings', label: 'Training & Development', icon: GraduationCap },
          { id: 'announcements', label: 'Announcements', icon: Bell },
          { id: 'profile', label: 'My Profile', icon: UserCheck },
        ];
      case 'employee':
      default:
        return [
          { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { id: 'attendance', label: 'Punch In / Attendance', icon: Clock },
          { id: 'leaves', label: 'Apply for Leave', icon: CalendarCheck },
          { id: 'trainings', label: 'My Learning & Skills', icon: GraduationCap },
          { id: 'announcements', label: 'Company Notices', icon: Bell },
          { id: 'profile', label: 'Personal Records', icon: UserCheck },
        ];
    }
  };

  const navItems = getNavItems();

  const roleBadgeClass = () => {
    if (role === 'hr') return 'badge-role-hr';
    if (role === 'manager') return 'badge-role-manager';
    return 'badge-role-employee';
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'rgba(11, 15, 25, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      padding: '24px 16px'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)'
        }}>
          <Briefcase size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>StaffSync</span>
            <span style={{ 
              fontSize: '0.65rem', 
              background: 'rgba(99, 102, 241, 0.2)', 
              color: '#818cf8', 
              padding: '2px 6px', 
              borderRadius: '4px',
              fontWeight: 700 
            }}>MERN</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Enterprise HR Suite</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 12px 6px' }}>
          Menu ({role.toUpperCase()})
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(139, 92, 246, 0.15))' 
                  : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <Icon size={19} color={isActive ? '#818cf8' : 'currentColor'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && (
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  boxShadow: '0 0 8px var(--primary-light)'
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Card */}
      {user && (
        <div style={{
          padding: '14px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={user.avatar} 
              alt={user.name} 
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-medium)' }} 
            />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </p>
              <span className={`badge ${roleBadgeClass()}`} style={{ fontSize: '0.66rem', padding: '2px 6px' }}>
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#fda4af',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}
    </aside>
  );
};
