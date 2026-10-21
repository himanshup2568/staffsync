import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Award, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  CheckCircle, 
  PlayCircle, 
  Users, 
  X,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const TrainingsView = () => {
  const { user, role, addToast } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manager launch modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    duration: '3 Weeks',
    deadline: '',
    department: 'Engineering'
  });

  // Employee update modal
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressVal, setProgressVal] = useState(50);

  const canManage = role === 'manager' || role === 'hr';

  const fetchTrainings = async () => {
    try {
      const res = await api.getTrainings();
      if (res.success) {
        setTrainings(res.data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleCreateTraining = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createTraining(formData);
      if (res.success) {
        addToast(res.message, 'success');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          category: 'Technical',
          duration: '3 Weeks',
          deadline: '',
          department: 'Engineering'
        });
        fetchTrainings();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedTraining) return;
    try {
      const res = await api.updateTrainingProgress(selectedTraining.id, progressVal);
      if (res.success) {
        addToast(res.message, 'success');
        setShowProgressModal(false);
        setSelectedTraining(null);
        fetchTrainings();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteTraining = async (id, title) => {
    if (!window.confirm(`Delete training program "${title}"?`)) return;
    try {
      const res = await api.deleteTraining(id);
      if (res.success) {
        addToast(res.message, 'success');
        fetchTrainings();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openProgressModal = (training) => {
    setSelectedTraining(training);
    const myEnrollment = training.enrolledEmployees.find(e => e.employeeId === user?.id);
    setProgressVal(myEnrollment ? myEnrollment.progress : 0);
    setShowProgressModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {role === 'manager' ? 'Team Training & Development' : role === 'hr' ? 'Workforce Skills & Certifications' : 'My Learning & Upskilling'}
          </h1>
          <p className="page-subtitle">
            {canManage 
              ? 'Design corporate learning paths, assign team members, and monitor completion progress.' 
              : 'Upskill with curated technical and leadership courses and track certification progress.'}
          </p>
        </div>

        {canManage && (
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="btn btn-primary"
          >
            <Plus size={16} /> Launch Training Program
          </button>
        )}
      </div>

      {/* Grid of Programs */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading training programs...
        </div>
      ) : trainings.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <GraduationCap size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3>No Training Programs Active</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {canManage ? 'Click "Launch Training Program" to assign a new course to staff.' : 'You have no assigned courses at the moment.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
          {trainings.map(program => {
            const myEnrollment = program.enrolledEmployees.find(e => e.employeeId === user?.id);
            const myProgress = myEnrollment ? myEnrollment.progress : 0;
            const isCompleted = myProgress >= 100;

            const completedCount = program.enrolledEmployees.filter(e => e.status === 'Completed').length;
            const avgProgress = program.enrolledEmployees.length > 0 
              ? Math.round(program.enrolledEmployees.reduce((acc, e) => acc + e.progress, 0) / program.enrolledEmployees.length) 
              : 0;

            return (
              <div 
                key={program.id} 
                className="glass-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)' 
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                      {program.category}
                    </span>

                    {canManage && (
                      <button 
                        onClick={() => handleDeleteTraining(program.id, program.title)} 
                        className="btn btn-danger btn-sm btn-icon"
                        title="Delete Program"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
                    {program.title}
                  </h3>

                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {program.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#818cf8" />
                      <span>{program.duration}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#818cf8" />
                      <span>Target: {program.deadline}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#818cf8" />
                      <span>Dept: {program.department}</span>
                    </div>
                  </div>

                  {/* Employee Progress Card */}
                  {role === 'employee' && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#fff' }}>Your Learning Progress</span>
                        <span style={{ fontWeight: 700, color: isCompleted ? '#10b981' : '#818cf8' }}>{myProgress}%</span>
                      </div>

                      <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${myProgress}%`,
                          height: '100%',
                          background: isCompleted ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                          borderRadius: '999px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>

                      {isCompleted && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.78rem', marginTop: '8px', fontWeight: 600 }}>
                          <Award size={15} /> Certified & Completed!
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manager Enrolled Team List */}
                  {canManage && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#fff' }}>Team Completion Rate:</span>
                        <span style={{ fontWeight: 700, color: '#818cf8' }}>{avgProgress}% avg ({completedCount}/{program.enrolledEmployees.length} done)</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
                        {program.enrolledEmployees.map(emp => (
                          <div key={emp.employeeId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{emp.employeeName}</span>
                            <span className={`badge ${emp.progress >= 100 ? 'badge-success' : emp.progress > 0 ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.62rem' }}>
                              {emp.progress}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Assigned by {program.assignedBy}
                    </span>

                    {role === 'employee' ? (
                      <button 
                        onClick={() => openProgressModal(program)} 
                        className={`btn btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {isCompleted ? 'Review Modules' : 'Update Progress'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => openProgressModal(program)} 
                        className="btn btn-secondary btn-sm"
                      >
                        Log Team Update
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Launch Program Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="#818cf8" /> Launch Team Training Program
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTraining}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Program Title *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="e.g. Distributed Cloud Systems & Security"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Technical">Technical & Engineering</option>
                      <option value="Leadership">Leadership & Coaching</option>
                      <option value="Compliance">Security & Compliance</option>
                      <option value="Soft Skills">Soft Skills & Communication</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Target Department</label>
                    <select 
                      className="form-select"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Design">Design</option>
                      <option value="All">All Staff</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Estimated Duration</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 4 Weeks (20 hrs)"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Completion Deadline</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Description & Learning Outcomes *</label>
                  <textarea 
                    className="form-textarea" 
                    required 
                    rows={4}
                    placeholder="Outline curriculum, modules, prerequisites, and goals..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Launch & Auto-Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {showProgressModal && selectedTraining && (
        <div className="modal-overlay" onClick={() => setShowProgressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Update Learning Progress: {selectedTraining.title}
              </h3>
              <button 
                onClick={() => setShowProgressModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: progressVal >= 100 ? '#10b981' : '#818cf8' }}>
                  {progressVal}%
                </span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {progressVal >= 100 ? 'Course Complete! Certification Ready.' : 'Keep going! Slide to record module completion.'}
                </p>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#6366f1', height: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                {[25, 50, 75, 100].map(val => (
                  <button 
                    key={val}
                    type="button"
                    onClick={() => setProgressVal(val)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, borderColor: progressVal === val ? '#6366f1' : 'var(--border-subtle)' }}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowProgressModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdateProgress} className="btn btn-primary">
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
