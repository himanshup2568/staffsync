import React, { useState } from 'react';
import { 
  Briefcase, 
  Shield, 
  UserCheck, 
  User, 
  Lock, 
  Mail, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const LoginView = () => {
  const { login, switchRole, addToast } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('hr@staffsync.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Associate Engineer'
  });

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.register(regData);
      if (res.success) {
        addToast(res.message, 'success');
        await login(regData.email, regData.password);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCreds = (demoEmail, demoPw, roleKey) => {
    setEmail(demoEmail);
    setPassword(demoPw);
    switchRole(roleKey);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      <div className="glass-card" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '36px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: 'var(--shadow-lg), 0 0 50px rgba(99, 102, 241, 0.2)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(99, 102, 241, 0.5)',
            marginBottom: '14px'
          }}>
            <Briefcase size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>StaffSync</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Modern Human Resource Management Solution
          </p>
        </div>

        {/* 1-Click Instant Demo Login Banner */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Sparkles size={16} color="#818cf8" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Instant Demo Access (1-Click)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setDemoCreds('hr@staffsync.com', 'admin123', 'hr')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 4px', flexDirection: 'column', gap: '4px' }}
            >
              <Shield size={14} color="#a855f7" />
              <span>HR Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCreds('manager@staffsync.com', 'manager123', 'manager')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 4px', flexDirection: 'column', gap: '4px' }}
            >
              <UserCheck size={14} color="#38bdf8" />
              <span>Manager</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCreds('employee@staffsync.com', 'employee123', 'employee')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 4px', flexDirection: 'column', gap: '4px' }}
            >
              <User size={14} color="#818cf8" />
              <span>Employee</span>
            </button>
          </div>
        </div>

        {/* Login / Register Toggle */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            style={{
              flex: 1,
              padding: '10px',
              background: 'transparent',
              border: 'none',
              borderBottom: !isRegister ? '2px solid #6366f1' : 'none',
              color: !isRegister ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            style={{
              flex: 1,
              padding: '10px',
              background: 'transparent',
              border: 'none',
              borderBottom: isRegister ? '2px solid #6366f1' : 'none',
              color: isRegister ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Register New Staff
          </button>
        </div>

        {!isRegister ? (
          <form onSubmit={handleManualLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            >
              Sign In to StaffSync <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Liam Anderson"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="liam@staffsync.com"
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={regData.role}
                  onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={regData.department}
                  onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Design">Design</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            >
              Complete Registration <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
