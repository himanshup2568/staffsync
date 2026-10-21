// API Client for StaffSync
const BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('staffsync_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  demoSwitch: async (role) => {
    const res = await fetch(`${BASE_URL}/auth/demo-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  // Employees
  getEmployees: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/employees?${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getEmployee: async (id) => {
    const res = await fetch(`${BASE_URL}/employees/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createEmployee: async (employeeData) => {
    const res = await fetch(`${BASE_URL}/employees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData)
    });
    return handleResponse(res);
  },

  updateEmployee: async (id, employeeData) => {
    const res = await fetch(`${BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData)
    });
    return handleResponse(res);
  },

  deleteEmployee: async (id) => {
    const res = await fetch(`${BASE_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Leaves
  getLeaves: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/leaves?${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  applyLeave: async (leaveData) => {
    const res = await fetch(`${BASE_URL}/leaves`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(leaveData)
    });
    return handleResponse(res);
  },

  updateLeaveStatus: async (id, status, reviewComment) => {
    const res = await fetch(`${BASE_URL}/leaves/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, reviewComment })
    });
    return handleResponse(res);
  },

  getLeaveSummary: async () => {
    const res = await fetch(`${BASE_URL}/leaves/summary`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Attendance
  getTodayAttendance: async () => {
    const res = await fetch(`${BASE_URL}/attendance/today`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  clockIn: async (notes = '') => {
    const res = await fetch(`${BASE_URL}/attendance/clock-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes })
    });
    return handleResponse(res);
  },

  clockOut: async () => {
    const res = await fetch(`${BASE_URL}/attendance/clock-out`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAttendanceLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/attendance?${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAttendanceStats: async () => {
    const res = await fetch(`${BASE_URL}/attendance/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Announcements
  getAnnouncements: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/announcements?${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createAnnouncement: async (data) => {
    const res = await fetch(`${BASE_URL}/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateAnnouncement: async (id, data) => {
    const res = await fetch(`${BASE_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  deleteAnnouncement: async (id) => {
    const res = await fetch(`${BASE_URL}/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  acknowledgeAnnouncement: async (id) => {
    const res = await fetch(`${BASE_URL}/announcements/${id}/acknowledge`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Trainings
  getTrainings: async () => {
    const res = await fetch(`${BASE_URL}/trainings`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createTraining: async (data) => {
    const res = await fetch(`${BASE_URL}/trainings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateTrainingProgress: async (id, progress, employeeId) => {
    const res = await fetch(`${BASE_URL}/trainings/${id}/progress`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ progress, employeeId })
    });
    return handleResponse(res);
  },

  deleteTraining: async (id) => {
    const res = await fetch(`${BASE_URL}/trainings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await fetch(`${BASE_URL}/stats/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
