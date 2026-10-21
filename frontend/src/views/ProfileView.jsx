import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Shield, 
  Heart, 
  Edit3, 
  Check, 
  DollarSign, 
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const ProfileView = () => {
  const { user, refreshUser, addToast } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    emergencyName: user?.emergencyContact?.name || '',
    emergencyRelationship: user?.emergencyContact?.relationship || '',
    emergencyPhone: user?.emergencyContact?.phone || ''
  });
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        phone: formData.phone,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone
        }
      };

      const res = await api.updateEmployee(user.id, payload);
      if (res.success) {
        addToast('Personal records updated successfully!', 'success');
        setIsEditing(false);
        refreshUser();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Records & Profile</h1>
          <p className="page-subtitle">
            View your official organizational records, contact information, and benefits allocation.
          </p>
        </div>

        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn btn-primary">
            <Edit3 size={16} /> Edit Contact Info
          </button>
        ) : (
          <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
            <X size={16} /> Cancel Editing
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '36px 24px' }}>
          <div style={{ position: 'relative', marginBottom: '18px' }}>
            <img 
              src={user.avatar} 
              alt={user.name} 
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #818cf8',
                boxShadow: '0 0 24px rgba(99, 102, 241, 0.4)'
              }}
            />
            <span style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#10b981',
              border: '2px solid #0b0f19'
            }} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{user.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>{user.designation}</p>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <span className="badge badge-role-hr" style={{ fontSize: '0.72rem' }}>
              {user.role}
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
              {user.status}
            </span>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-subtle)', marginTop: '24px', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem' }}>
              <Mail size={16} color="#818cf8" />
              <span style={{ color: 'var(--text-secondary)' }}>{user.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem' }}>
              <Briefcase size={16} color="#818cf8" />
              <span style={{ color: 'var(--text-secondary)' }}>{user.department}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem' }}>
              <Calendar size={16} color="#818cf8" />
              <span style={{ color: 'var(--text-secondary)' }}>Joined: {user.joinDate}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem' }}>
              <Shield size={16} color="#818cf8" />
              <span style={{ color: 'var(--text-secondary)' }}>Reports to: {user.managerName || 'Board'}</span>
            </div>
          </div>
        </div>

        {/* Detailed Information & Edit Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!isEditing ? (
            <>
              {/* Contact & Residential Records */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} color="#818cf8" /> Contact & Residence
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</span>
                    <p style={{ fontWeight: 600, marginTop: '2px' }}>{user.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Work Email</span>
                    <p style={{ fontWeight: 600, marginTop: '2px' }}>{user.email}</p>
                  </div>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Residential Address</span>
                  <p style={{ fontWeight: 600, marginTop: '2px' }}>{user.address || 'Address on file'}</p>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Heart size={18} color="#f43f5e" /> Emergency Contact
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact Name</span>
                    <p style={{ fontWeight: 600, marginTop: '2px' }}>{user.emergencyContact?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Relationship</span>
                    <p style={{ fontWeight: 600, marginTop: '2px' }}>{user.emergencyContact?.relationship || 'Family'}</p>
                  </div>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Emergency Phone</span>
                  <p style={{ fontWeight: 600, marginTop: '2px' }}>{user.emergencyContact?.phone || 'Not provided'}</p>
                </div>
              </div>

              {/* Leave Quota Allowances */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
                  Leave Quota Allocations
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '10px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Casual</p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800 }}>{user.leaveBalance?.casual || 0}</p>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '10px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#10b981' }}>Sick</p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800 }}>{user.leaveBalance?.sick || 0}</p>
                  </div>
                  <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '12px', borderRadius: '10px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#a855f7' }}>Annual</p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800 }}>{user.leaveBalance?.annual || 0}</p>
                  </div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '10px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Maternity</p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800 }}>{user.leaveBalance?.maternity || 0}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Editing Form */
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px' }}>
                Update Personal Contact Information
              </h3>

              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Residential Address</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', marginBottom: '12px', textTransform: 'uppercase' }}>
                    Emergency Contact Information
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Contact Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={formData.emergencyName}
                        onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Relationship</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={formData.emergencyRelationship}
                        onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: '12px 0 0' }}>
                    <label className="form-label">Emergency Phone</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                    <Check size={16} /> Save Record Updates
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
