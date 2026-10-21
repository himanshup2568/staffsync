import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  User, 
  MapPin, 
  Download,
  Filter,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const AttendanceView = () => {
  const { user, role, addToast } = useAuth();
  const [logs, setLogs] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchNotes, setPunchNotes] = useState('StaffSync Web Check-in');
  const [stats, setStats] = useState(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchAttendanceData = async () => {
    try {
      const [logsRes, todayRes, statsRes] = await Promise.all([
        api.getAttendanceLogs({
          department: selectedDept,
          status: selectedStatus,
          date: selectedDate
        }),
        api.getTodayAttendance(),
        api.getAttendanceStats()
      ]);

      if (logsRes.success) setLogs(logsRes.data);
      if (todayRes.success) setTodayRecord(todayRes);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDept, selectedStatus, selectedDate]);

  const handleClockIn = async () => {
    setPunchLoading(true);
    try {
      const res = await api.clockIn(punchNotes);
      if (res.success) {
        addToast(res.message, 'success');
        fetchAttendanceData();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleClockOut = async () => {
    setPunchLoading(true);
    try {
      const res = await api.clockOut();
      if (res.success) {
        addToast(res.message, 'success');
        fetchAttendanceData();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setPunchLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {role === 'hr' ? 'Workforce Attendance Tracker' : role === 'manager' ? 'Team Attendance Monitor' : 'My Punch Clock & Attendance'}
          </h1>
          <p className="page-subtitle">
            {role === 'hr' 
              ? 'Real-time organization-wide attendance rates, working hours, and punctuality records.' 
              : 'Monitor clock-ins, working durations, and attendance history.'}
          </p>
        </div>
      </div>

      {/* Live Punch Clock Widget for Current User */}
      <div className="glass-card" style={{
        marginBottom: '28px',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.85), rgba(30, 41, 59, 0.75))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
          }}>
            <Clock size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Punch Station</h3>
              <span className={`badge ${todayRecord?.isClockedOut ? 'badge-success' : todayRecord?.isClockedIn ? 'badge-info' : 'badge-warning'}`}>
                {todayRecord?.isClockedOut ? 'Shift Done' : todayRecord?.isClockedIn ? 'Active Shift' : 'Not Clocked In'}
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {todayRecord?.record?.clockIn 
                ? `Clocked in at ${formatTime(todayRecord.record.clockIn)} (${todayRecord.record.status})` 
                : 'Click "Punch In" to register your arrival and begin tracking working hours.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!todayRecord?.isClockedIn && !todayRecord?.isClockedOut && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ minWidth: '220px' }}
                placeholder="Optional check-in note..."
                value={punchNotes}
                onChange={(e) => setPunchNotes(e.target.value)}
              />
              <button 
                onClick={handleClockIn} 
                disabled={punchLoading} 
                className="btn btn-success"
              >
                <Clock size={16} /> Punch In
              </button>
            </div>
          )}

          {todayRecord?.isClockedIn && !todayRecord?.isClockedOut && (
            <button 
              onClick={handleClockOut} 
              disabled={punchLoading} 
              className="btn btn-danger"
            >
              <Clock size={16} /> Clock Out & End Shift
            </button>
          )}

          {todayRecord?.isClockedOut && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700 }}>
              <CheckCircle2 size={18} />
              <span>Shift Logged ({todayRecord?.record?.totalHours} hrs)</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards (for HR & Managers) */}
      {stats && (role === 'hr' || role === 'manager') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="glass-card" style={{ padding: '16px 20px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attendance Rate</span>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#818cf8' }}>{stats.attendanceRate}%</p>
          </div>
          <div className="glass-card" style={{ padding: '16px 20px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Present On-Time</span>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>{stats.present}</p>
          </div>
          <div className="glass-card" style={{ padding: '16px 20px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>Late Arrival</span>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#f59e0b' }}>{stats.late}</p>
          </div>
          <div className="glass-card" style={{ padding: '16px 20px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>On Approved Leave</span>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#38bdf8' }}>{stats.onLeaveToday}</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        {role === 'hr' && (
          <select 
            className="form-select" 
            style={{ width: 'auto', minWidth: '160px' }}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Design">Design</option>
          </select>
        )}

        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: '150px' }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Present">Present</option>
          <option value="Late">Late Arrival</option>
          <option value="Half Day">Half Day</option>
        </select>

        <input 
          type="date"
          className="form-input"
          style={{ width: 'auto', minWidth: '160px' }}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder="Filter by date"
        />

        {selectedDate && (
          <button 
            onClick={() => setSelectedDate('')} 
            className="btn btn-secondary btn-sm"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading attendance records...
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Clock size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3>No Attendance Records Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            No records matched your search filters.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const badgeClass = log.status === 'Present' ? 'badge-success' : log.status === 'Late' ? 'badge-warning' : 'badge-info';

                return (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{log.date}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{log.employeeName}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{log.department}</span>
                    </td>
                    <td>
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#10b981' }}>
                        {formatTime(log.clockIn)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: log.clockOut ? '#38bdf8' : 'var(--text-muted)' }}>
                        {formatTime(log.clockOut)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>
                        {log.totalHours ? `${log.totalHours} hrs` : (log.clockIn && !log.clockOut ? 'In Progress' : '--')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                      {log.notes || 'Normal shift'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
