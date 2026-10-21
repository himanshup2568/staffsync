import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Award,
  ArrowRight,
  Pin,
  CalendarCheck,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const DashboardView = ({ setActiveTab }) => {
  const { user, role, addToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const handleClockIn = async () => {
    setPunching(true);
    try {
      const res = await api.clockIn('Clocked in from Dashboard');
      if (res.success) {
        addToast(res.message, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setPunching(false);
    }
  };

  const handleClockOut = async () => {
    setPunching(true);
    try {
      const res = await api.clockOut();
      if (res.success) {
        addToast(res.message, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setPunching(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--primary-light)', fontSize: '1rem', fontWeight: 600 }}>
          Loading StaffSync Dashboard...
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const announcements = data?.recentAnnouncements || [];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
              {role.toUpperCase()} PORTAL
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
            Good day, <span style={{ color: '#818cf8' }}>{user?.name}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '640px' }}>
            {role === 'hr' && "Here is today's organization pulse, attendance logs, and open employee requests across all departments."}
            {role === 'manager' && "Oversee your team's daily availability, pending leave applications, and skills development progress."}
            {role === 'employee' && "Manage your daily work hours, submit time-off applications, and track ongoing training programs."}
          </p>
        </div>

        {/* Quick Action Button */}
        <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
          {role === 'hr' && (
            <button onClick={() => setActiveTab('employees')} className="btn btn-primary">
              <Users size={16} /> Manage Employees
            </button>
          )}
          {role === 'manager' && (
            <button onClick={() => setActiveTab('leaves')} className="btn btn-primary">
              <CalendarCheck size={16} /> Review Team Leaves ({stats.teamPendingLeaves || 0})
            </button>
          )}
          {role === 'employee' && (
            <button onClick={() => setActiveTab('leaves')} className="btn btn-primary">
              <Calendar size={16} /> Apply for Leave
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      {role === 'hr' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Staff</p>
                <h3 style={{ fontSize: '2rem', marginTop: '6px' }}>{stats.totalEmployees || 0}</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <TrendingUp size={13} /> Active & Enrolled
                </span>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Attendance Today</p>
                <h3 style={{ fontSize: '2rem', marginTop: '6px' }}>{stats.attendanceRate || 0}%</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  {stats.checkedInToday || 0} Checked In ({stats.presentToday || 0} On-time)
                </span>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>On Leave Today</p>
                <h3 style={{ fontSize: '2rem', marginTop: '6px' }}>{stats.onLeaveToday || 0}</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--status-info)', marginTop: '4px', display: 'block' }}>
                  Approved Time-Off
                </span>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Calendar size={24} />
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pending Approvals</p>
                <h3 style={{ fontSize: '2rem', marginTop: '6px' }}>{stats.pendingLeaveApprovals || 0}</h3>
                <span style={{ fontSize: '0.78rem', color: stats.pendingLeaveApprovals > 0 ? 'var(--status-warning)' : 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  {stats.pendingLeaveApprovals > 0 ? 'Requires attention' : 'All clear'}
                </span>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {role === 'manager' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Direct Team</p>
                <h3 style={{ fontSize: '2rem', marginTop: '6px' }}>{stats.teamSize || 0}</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Reporting members
                </span>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Team Attendance</p>
                <h3 style={{ fontSize: '2rem', marginTop: '6px' }}>{stats.teamAttendanceRate || 0}%</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--status-success)', marginTop: '4px', display: 'block' }}>
                  {stats.teamCheckedIn || 0} in session today
                </span>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pending Leave Requests</p>
                <h3 style={{ fontSize: '2rem', marginTop: '6px' }}>{stats.teamPendingLeaves || 0}</h3>
                <span style={{ fontSize: '0.78rem', color: stats.teamPendingLeaves > 0 ? 'var(--status-warning)' : 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Requires manager decision
                </span>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <AlertCircle size={24} />
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Team Learning Rate</p>
                <h3 style={{ fontSize: '2rem', marginTop: '6px' }}>{stats.teamTrainingRate || 0}%</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--status-info)', marginTop: '4px', display: 'block' }}>
                  {stats.managedPrograms || 0} Active Programs
                </span>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                <GraduationCap size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {role === 'employee' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {/* Punch Card Widget */}
          <div className="glass-card" style={{ border: '1px solid rgba(99, 102, 241, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Today's Attendance Punch
              </span>
              <span className={`badge ${stats.isClockedOut ? 'badge-success' : stats.isClockedIn ? 'badge-info' : 'badge-warning'}`}>
                {stats.isClockedOut ? 'Shift Done' : stats.isClockedIn ? 'Working' : 'Not Clocked In'}
              </span>
            </div>

            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                {stats.todayAttendance?.clockIn 
                  ? new Date(stats.todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : '--:--'}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {stats.todayAttendance?.clockIn ? `Status: ${stats.todayAttendance.status}` : 'No punch record today'}
              </p>
            </div>

            <div style={{ marginTop: '10px' }}>
              {!stats.isClockedOut ? (
                !stats.isClockedIn ? (
                  <button onClick={handleClockIn} disabled={punching} className="btn btn-success" style={{ width: '100%' }}>
                    <Clock size={16} /> Punch In Now
                  </button>
                ) : (
                  <button onClick={handleClockOut} disabled={punching} className="btn btn-danger" style={{ width: '100%' }}>
                    <Clock size={16} /> Complete Shift & Clock Out
                  </button>
                )
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--status-success)', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ Today's shift logged ({stats.todayAttendance?.totalHours} hrs)
                </div>
              )}
            </div>
          </div>

          {/* Leave Quota Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Remaining Leave Balance
              </span>
              <button onClick={() => setActiveTab('leaves')} className="btn btn-secondary btn-sm">
                Apply <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Casual Leave</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>{stats.leaveBalance?.casual || 0} <span style={{ fontSize: '0.8rem' }}>days</span></p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sick Leave</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>{stats.leaveBalance?.sick || 0} <span style={{ fontSize: '0.8rem' }}>days</span></p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Annual Leave</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#a855f7' }}>{stats.leaveBalance?.annual || 0} <span style={{ fontSize: '0.8rem' }}>days</span></p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paternity / Maternity</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>{stats.leaveBalance?.maternity || 0} <span style={{ fontSize: '0.8rem' }}>days</span></p>
              </div>
            </div>
          </div>

          {/* Learning & Skills Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                My Skills & Trainings
              </span>
              <button onClick={() => setActiveTab('trainings')} className="btn btn-secondary btn-sm">
                View All
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                border: '2px solid #818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#fff'
              }}>
                {stats.myActiveTrainings || 0}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Enrolled Programs</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {stats.completedTrainingsCount || 0} Certifications Earned
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Department Distribution / Quick Links + Recent Bulletins */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Department Distribution (for HR) or Core Actions */}
        {role === 'hr' && stats.deptDistribution && (
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} color="#818cf8" /> Department Headcount
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {stats.deptDistribution.length} Departments
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.deptDistribution.map(dept => {
                const percentage = stats.totalEmployees > 0 
                  ? Math.round((dept.count / stats.totalEmployees) * 100) 
                  : 0;
                return (
                  <div key={dept.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{dept.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{dept.count} members ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        borderRadius: '999px'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Company Announcements Preview */}
        <div className="glass-card" style={{ gridColumn: role !== 'hr' ? 'span 2' : 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pin size={18} color="#f59e0b" /> Company Bulletins & Notices
            </h3>
            <button onClick={() => setActiveTab('announcements')} className="btn btn-secondary btn-sm">
              All Notices ({announcements.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.map(notice => (
              <div 
                key={notice.id}
                onClick={() => setActiveTab('announcements')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: notice.pinned ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {notice.pinned && <Pin size={13} color="#f59e0b" />}
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{notice.title}</span>
                  </div>
                  <span className={`badge ${notice.priority === 'Urgent' ? 'badge-danger' : notice.priority === 'High' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                    {notice.priority}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {notice.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>By {notice.authorName}</span>
                  <span>•</span>
                  <span>Target: {notice.targetDepartment}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
