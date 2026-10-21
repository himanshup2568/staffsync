import React, { useState, useEffect } from 'react';
import { Clock, Shield, User, UserCheck, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const Navbar = ({ onOpenAnnouncements }) => {
  const { user, role, switchRole, addToast } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [clockStatus, setClockStatus] = useState({ isClockedIn: false, isClockedOut: false });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch current user clock status
  useEffect(() => {
    const fetchStatus = async () => {
      if (user) {
        try {
          const res = await api.getTodayAttendance();
          if (res.success) {
            setClockStatus({
              isClockedIn: res.isClockedIn,
              isClockedOut: res.isClockedOut,
              record: res.data
            });
          }
        } catch (err) {
          // ignore background error
        }
      }
    };
    fetchStatus();
  }, [user]);

  const handleQuickClockIn = async () => {
    setActionLoading(true);
    try {
      const res = await api.clockIn('Punched via Top Navbar');
      if (res.success) {
        addToast(res.message, 'success');
        setClockStatus(prev => ({ ...prev, isClockedIn: true, isClockedOut: false, record: res.data }));
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickClockOut = async () => {
    setActionLoading(true);
    try {
      const res = await api.clockOut();
      if (res.success) {
        addToast(res.message, 'success');
        setClockStatus(prev => ({ ...prev, isClockedIn: false, isClockedOut: true, record: res.data }));
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'rgba(11, 15, 25, 0.75)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      gap: '20px'
    }}>
      {/* Left: Role Switcher Showcase */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
          <Sparkles size={16} color="#818cf8" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Demo Role Switcher:
          </span>
        </div>

        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.9)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-medium)',
          gap: '4px'
        }}>
          <button
            onClick={() => switchRole('hr')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: role === 'hr' ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'transparent',
              color: role === 'hr' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: role === 'hr' ? '0 0 12px rgba(168, 85, 247, 0.4)' : 'none'
            }}
          >
            <Shield size={13} /> HR Admin
          </button>

          <button
            onClick={() => switchRole('manager')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: role === 'manager' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
              color: role === 'manager' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: role === 'manager' ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none'
            }}
          >
            <UserCheck size={13} /> Manager
          </button>

          <button
            onClick={() => switchRole('employee')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: role === 'employee' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: role === 'employee' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: role === 'employee' ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            <User size={13} /> Employee
          </button>
        </div>
      </div>

      {/* Right Side: Digital Clock & Quick Attendance Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Live Clock Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          fontVariantNumeric: 'tabular-nums'
        }}>
          <Clock size={15} color="#818cf8" />
          <span>{time}</span>
        </div>

        {/* Quick Punch Button */}
        {!clockStatus.isClockedOut && (
          <div>
            {!clockStatus.isClockedIn ? (
              <button
                onClick={handleQuickClockIn}
                disabled={actionLoading}
                className="btn btn-success btn-sm"
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                <Clock size={14} /> Punch In Now
              </button>
            ) : (
              <button
                onClick={handleQuickClockOut}
                disabled={actionLoading}
                className="btn btn-danger btn-sm"
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                <Clock size={14} /> Clock Out ({clockStatus.record ? clockStatus.record.status : 'Working'})
              </button>
            )}
          </div>
        )}

        {clockStatus.isClockedOut && (
          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
            ✓ Shift Completed Today
          </span>
        )}

        {/* Announcements Notification */}
        {onOpenAnnouncements && (
          <button
            onClick={onOpenAnnouncements}
            className="btn btn-secondary btn-icon"
            title="View Announcements"
          >
            <Bell size={18} />
          </button>
        )}
      </div>
    </header>
  );
};
