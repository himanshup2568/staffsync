import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Shield, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const EmployeesView = () => {
  const { user: currentUser, role, addToast } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: '',
    phone: '',
    salary: 85000,
    managerId: '',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: 'Family'
  });

  const isHR = role === 'hr';

  const fetchEmployees = async () => {
    try {
      const res = await api.getEmployees({
        search: searchTerm,
        department: selectedDept,
        status: selectedStatus
      });
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, selectedDept, selectedStatus]);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password || 'welcome2026',
        role: formData.role,
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone,
        salary: Number(formData.salary),
        managerId: formData.managerId || null,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relationship: formData.emergencyRelationship
        }
      };

      const res = await api.createEmployee(payload);
      if (res.success) {
        addToast(res.message, 'success');
        setShowAddModal(false);
        resetForm();
        fetchEmployees();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone,
        salary: Number(formData.salary),
        status: formData.status || 'Active',
        address: formData.address
      };

      const res = await api.updateEmployee(selectedEmployee.id, payload);
      if (res.success) {
        addToast(res.message, 'success');
        setShowEditModal(false);
        setSelectedEmployee(null);
        fetchEmployees();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove employee record for ${name}?`)) return;

    try {
      const res = await api.deleteEmployee(id);
      if (res.success) {
        addToast(res.message, 'success');
        if (showDetailModal) setShowDetailModal(false);
        fetchEmployees();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      role: emp.role,
      department: emp.department,
      designation: emp.designation,
      phone: emp.phone,
      salary: emp.salary,
      status: emp.status,
      address: emp.address || '',
      emergencyName: emp.emergencyContact?.name || '',
      emergencyPhone: emp.emergencyContact?.phone || '',
      emergencyRelationship: emp.emergencyContact?.relationship || 'Family'
    });
    setShowEditModal(true);
  };

  const openDetailModal = (emp) => {
    setSelectedEmployee(emp);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: 'Engineering',
      designation: '',
      phone: '',
      salary: 85000,
      managerId: '',
      address: '',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelationship: 'Family'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Directory</h1>
          <p className="page-subtitle">
            {isHR 
              ? 'Complete organizational directory: add staff, manage profiles, roles, and compensation.' 
              : 'Browse colleagues and departmental teams across the company.'}
          </p>
        </div>

        {isHR && (
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }} 
            className="btn btn-primary"
          >
            <UserPlus size={16} /> Add New Employee
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon-pos" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, role, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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
          <option value="Sales">Sales</option>
        </select>

        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: '140px' }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Employee Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading employee directory...
        </div>
      ) : employees.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3>No Employees Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Try adjusting your search criteria or add a new team member.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {employees.map(emp => {
            const roleBadge = emp.role === 'hr' ? 'badge-role-hr' : emp.role === 'manager' ? 'badge-role-manager' : 'badge-role-employee';
            const statusBadge = emp.status === 'Active' ? 'badge-success' : emp.status === 'On Leave' ? 'badge-info' : 'badge-danger';

            return (
              <div key={emp.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img 
                        src={emp.avatar} 
                        alt={emp.name} 
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99, 102, 241, 0.4)' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{emp.name}</h4>
                        <span className={`badge ${roleBadge}`} style={{ fontSize: '0.65rem', marginTop: '2px' }}>
                          {emp.role}
                        </span>
                      </div>
                    </div>

                    <span className={`badge ${statusBadge}`}>
                      {emp.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '14px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={14} color="#818cf8" />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.designation}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={14} color="var(--text-muted)" />
                      <span>{emp.department}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      <span>{emp.phone}</span>
                    </div>
                    {isHR && emp.salary && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600 }}>
                        <DollarSign size={14} />
                        <span>${emp.salary.toLocaleString()} / year</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
                  <button 
                    onClick={() => openDetailModal(emp)} 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1 }}
                  >
                    View Details
                  </button>

                  {isHR && (
                    <>
                      <button 
                        onClick={() => openEditModal(emp)} 
                        className="btn btn-secondary btn-sm btn-icon" 
                        title="Edit Employee"
                      >
                        <Edit2 size={14} />
                      </button>
                      {emp.id !== currentUser?.id && (
                        <button 
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)} 
                          className="btn btn-danger btn-sm btn-icon" 
                          title="Remove Employee"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} color="#818cf8" /> Add New Staff Member
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Jordan Bennett" 
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Work Email *</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required 
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jordan@staffsync.com" 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">System Role *</label>
                    <select 
                      className="form-select" 
                      value={formData.role} 
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="hr">HR Administrator</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Department *</label>
                    <select 
                      className="form-select" 
                      value={formData.department} 
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Design">Design</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Designation / Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.designation} 
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. DevOps Engineer" 
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Annual Salary (USD)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.salary} 
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000" 
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Initial Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={formData.password} 
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Default: welcome2026" 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Home Address</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.address} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Residential address" 
                  />
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#818cf8', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Emergency Contact Details
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Contact Name" 
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Contact Phone" 
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Save & Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Edit Employee Profile: {selectedEmployee.name}
              </h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Designation</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.designation} 
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Department</label>
                    <select 
                      className="form-select" 
                      value={formData.department} 
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Design">Design</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Employment Status</label>
                    <select 
                      className="form-select" 
                      value={formData.status} 
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Annual Salary (USD)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.salary} 
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {showDetailModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={selectedEmployee.avatar} 
                  alt={selectedEmployee.name} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedEmployee.name}</h3>
                  <span className={`badge ${selectedEmployee.role === 'hr' ? 'badge-role-hr' : selectedEmployee.role === 'manager' ? 'badge-role-manager' : 'badge-role-employee'}`}>
                    {selectedEmployee.role}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Position</span>
                  <p style={{ fontWeight: 600 }}>{selectedEmployee.designation}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</span>
                  <p style={{ fontWeight: 600 }}>{selectedEmployee.department}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</span>
                  <p style={{ fontWeight: 600 }}>{selectedEmployee.email}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</span>
                  <p style={{ fontWeight: 600 }}>{selectedEmployee.phone}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reporting Manager</span>
                  <p style={{ fontWeight: 600 }}>{selectedEmployee.managerName || 'Executive Board'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Join Date</span>
                  <p style={{ fontWeight: 600 }}>{selectedEmployee.joinDate}</p>
                </div>
              </div>

              {selectedEmployee.emergencyContact && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>Emergency Contact</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>
                    {selectedEmployee.emergencyContact.name} ({selectedEmployee.emergencyContact.relationship})
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {selectedEmployee.emergencyContact.phone}
                  </p>
                </div>
              )}

              {/* Leave Quotas */}
              {selectedEmployee.leaveBalance && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Allocated Leave Quota Balance
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '8px', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Casual</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedEmployee.leaveBalance.casual}</p>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.7rem', color: '#10b981' }}>Sick</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedEmployee.leaveBalance.sick}</p>
                    </div>
                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '8px', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.7rem', color: '#a855f7' }}>Annual</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedEmployee.leaveBalance.annual}</p>
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Mat/Pat</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedEmployee.leaveBalance.maternity}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowDetailModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
