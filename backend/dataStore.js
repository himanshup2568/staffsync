const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate realistic seed data
const getInitialSeedData = () => {
  const salt = bcrypt.genSaltSync(10);
  const hashPass = (pw) => bcrypt.hashSync(pw, salt);

  const users = [
    {
      id: 'usr-1',
      name: 'Sarah Jenkins',
      email: 'hr@staffsync.com',
      password: hashPass('admin123'),
      role: 'hr',
      department: 'Human Resources',
      designation: 'Head of People & Culture',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      joinDate: '2021-03-15',
      status: 'Active',
      salary: 115000,
      managerId: null,
      managerName: 'Executive Board',
      emergencyContact: { name: 'Mark Jenkins', relationship: 'Spouse', phone: '+1 (555) 998-1234' },
      address: '742 Evergreen Terrace, Seattle, WA',
      leaveBalance: { casual: 8, sick: 10, annual: 18, maternity: 60 }
    },
    {
      id: 'usr-2',
      name: 'Alex Rivera',
      email: 'manager@staffsync.com',
      password: hashPass('manager123'),
      role: 'manager',
      department: 'Engineering',
      designation: 'Engineering Manager & Tech Lead',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinDate: '2022-01-10',
      status: 'Active',
      salary: 130000,
      managerId: 'usr-1',
      managerName: 'Sarah Jenkins',
      emergencyContact: { name: 'Carmen Rivera', relationship: 'Sister', phone: '+1 (555) 443-8821' },
      address: '120 Pine Street, Apt 4B, San Francisco, CA',
      leaveBalance: { casual: 7, sick: 9, annual: 15, maternity: 60 }
    },
    {
      id: 'usr-3',
      name: 'Elena Rostova',
      email: 'employee@staffsync.com',
      password: hashPass('employee123'),
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Frontend Developer',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      joinDate: '2023-04-01',
      status: 'Active',
      salary: 98000,
      managerId: 'usr-2',
      managerName: 'Alex Rivera',
      emergencyContact: { name: 'Dmitri Rostov', relationship: 'Father', phone: '+1 (555) 887-2341' },
      address: '450 Mission Bay Blvd, San Francisco, CA',
      leaveBalance: { casual: 6, sick: 8, annual: 12, maternity: 60 }
    },
    {
      id: 'usr-4',
      name: 'Marcus Chen',
      email: 'marcus.chen@staffsync.com',
      password: hashPass('password123'),
      role: 'employee',
      department: 'Engineering',
      designation: 'Backend Cloud Architect',
      phone: '+1 (555) 567-8901',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      joinDate: '2022-08-15',
      status: 'Active',
      salary: 108000,
      managerId: 'usr-2',
      managerName: 'Alex Rivera',
      emergencyContact: { name: 'Mei Chen', relationship: 'Mother', phone: '+1 (555) 776-9012' },
      address: '88 King Street, San Francisco, CA',
      leaveBalance: { casual: 5, sick: 10, annual: 14, maternity: 60 }
    },
    {
      id: 'usr-5',
      name: 'Maya Patel',
      email: 'maya.patel@staffsync.com',
      password: hashPass('password123'),
      role: 'employee',
      department: 'Marketing',
      designation: 'Product Marketing Lead',
      phone: '+1 (555) 678-9012',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinDate: '2023-02-20',
      status: 'Active',
      salary: 92000,
      managerId: 'usr-1',
      managerName: 'Sarah Jenkins',
      emergencyContact: { name: 'Raj Patel', relationship: 'Brother', phone: '+1 (555) 332-1199' },
      address: '320 Broadway, New York, NY',
      leaveBalance: { casual: 8, sick: 10, annual: 16, maternity: 60 }
    },
    {
      id: 'usr-6',
      name: 'David Kim',
      email: 'david.kim@staffsync.com',
      password: hashPass('password123'),
      role: 'employee',
      department: 'Design',
      designation: 'Senior UI/UX Designer',
      phone: '+1 (555) 789-0123',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      joinDate: '2023-09-01',
      status: 'Active',
      salary: 95000,
      managerId: 'usr-2',
      managerName: 'Alex Rivera',
      emergencyContact: { name: 'Hannah Kim', relationship: 'Spouse', phone: '+1 (555) 665-4433' },
      address: '101 California St, San Francisco, CA',
      leaveBalance: { casual: 7, sick: 9, annual: 13, maternity: 60 }
    }
  ];

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const dayBefore = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];

  const attendance = [
    {
      id: 'att-1',
      employeeId: 'usr-3',
      employeeName: 'Elena Rostova',
      department: 'Engineering',
      date: today,
      clockIn: `${today}T09:05:00.000Z`,
      clockOut: null,
      totalHours: 0,
      status: 'Present',
      notes: 'Punched in via Web Portal'
    },
    {
      id: 'att-2',
      employeeId: 'usr-2',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      date: today,
      clockIn: `${today}T08:55:00.000Z`,
      clockOut: null,
      totalHours: 0,
      status: 'Present',
      notes: 'Office check-in'
    },
    {
      id: 'att-3',
      employeeId: 'usr-4',
      employeeName: 'Marcus Chen',
      department: 'Engineering',
      date: today,
      clockIn: `${today}T09:35:00.000Z`,
      clockOut: null,
      totalHours: 0,
      status: 'Late',
      notes: 'Commute delay reported'
    },
    {
      id: 'att-4',
      employeeId: 'usr-3',
      employeeName: 'Elena Rostova',
      department: 'Engineering',
      date: yesterday,
      clockIn: `${yesterday}T09:02:00.000Z`,
      clockOut: `${yesterday}T17:35:00.000Z`,
      totalHours: 8.55,
      status: 'Present',
      notes: 'Full shift completed'
    },
    {
      id: 'att-5',
      employeeId: 'usr-2',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      date: yesterday,
      clockIn: `${yesterday}T08:50:00.000Z`,
      clockOut: `${yesterday}T18:10:00.000Z`,
      totalHours: 9.33,
      status: 'Present',
      notes: 'Leadership review'
    },
    {
      id: 'att-6',
      employeeId: 'usr-3',
      employeeName: 'Elena Rostova',
      department: 'Engineering',
      date: dayBefore,
      clockIn: `${dayBefore}T08:58:00.000Z`,
      clockOut: `${dayBefore}T17:15:00.000Z`,
      totalHours: 8.28,
      status: 'Present',
      notes: 'Sprint planning day'
    }
  ];

  const leaves = [
    {
      id: 'lev-1',
      employeeId: 'usr-3',
      employeeName: 'Elena Rostova',
      employeeEmail: 'employee@staffsync.com',
      department: 'Engineering',
      leaveType: 'Annual',
      startDate: '2026-11-10',
      endDate: '2026-11-14',
      totalDays: 5,
      reason: 'Attending React Summit global conference and family vacation',
      status: 'Pending',
      appliedOn: '2026-10-18T10:30:00.000Z',
      reviewedBy: null,
      reviewComment: '',
      reviewedAt: null
    },
    {
      id: 'lev-2',
      employeeId: 'usr-4',
      employeeName: 'Marcus Chen',
      employeeEmail: 'marcus.chen@staffsync.com',
      department: 'Engineering',
      leaveType: 'Sick',
      startDate: '2026-10-12',
      endDate: '2026-10-13',
      totalDays: 2,
      reason: 'Seasonal viral flu and recovery',
      status: 'Approved',
      appliedOn: '2026-10-11T14:20:00.000Z',
      reviewedBy: 'Alex Rivera',
      reviewComment: 'Approved. Get well soon Marcus!',
      reviewedAt: '2026-10-11T16:00:00.000Z'
    },
    {
      id: 'lev-3',
      employeeId: 'usr-5',
      employeeName: 'Maya Patel',
      employeeEmail: 'maya.patel@staffsync.com',
      department: 'Marketing',
      leaveType: 'Casual',
      startDate: '2026-10-25',
      endDate: '2026-10-26',
      totalDays: 2,
      reason: 'Personal family gathering in Boston',
      status: 'Approved',
      appliedOn: '2026-10-15T09:15:00.000Z',
      reviewedBy: 'Sarah Jenkins',
      reviewComment: 'Approved, coverage assigned.',
      reviewedAt: '2026-10-15T11:45:00.000Z'
    },
    {
      id: 'lev-4',
      employeeId: 'usr-6',
      employeeName: 'David Kim',
      employeeEmail: 'david.kim@staffsync.com',
      department: 'Design',
      leaveType: 'Personal',
      startDate: '2026-10-05',
      endDate: '2026-10-06',
      totalDays: 2,
      reason: 'Apartment relocation and lease signing',
      status: 'Approved',
      appliedOn: '2026-10-01T11:00:00.000Z',
      reviewedBy: 'Alex Rivera',
      reviewComment: 'Good luck with the move!',
      reviewedAt: '2026-10-01T15:20:00.000Z'
    }
  ];

  const announcements = [
    {
      id: 'ann-1',
      title: 'StaffSync 2026 Annual Q4 Strategy & Town Hall',
      content: 'Join CEO and executive leadership this Thursday at 3:00 PM EST for our global organization town hall. We will share quarterly wins, revenue milestones, and preview our 2027 technical and product roadmaps. Q&A will follow.',
      authorName: 'Sarah Jenkins',
      authorRole: 'Head of People & Culture',
      category: 'Event',
      priority: 'Urgent',
      targetDepartment: 'All',
      pinned: true,
      createdAt: '2026-10-19T08:00:00.000Z',
      acknowledgedBy: ['usr-1', 'usr-2', 'usr-3']
    },
    {
      id: 'ann-2',
      title: 'Updated Flexible Work & Remote Wellness Policy',
      content: 'People Ops has refreshed the Hybrid Workplace Guidelines. Core collaboration hours are 10:00 AM - 4:00 PM local time. Monthly home-office wellness reimbursements have been boosted by 15%. Review the full policy on the HR portal.',
      authorName: 'Sarah Jenkins',
      authorRole: 'Head of People & Culture',
      category: 'Policy',
      priority: 'High',
      targetDepartment: 'All',
      pinned: true,
      createdAt: '2026-10-16T11:30:00.000Z',
      acknowledgedBy: ['usr-1', 'usr-2']
    },
    {
      id: 'ann-3',
      title: 'Fall 2026 Hackathon: AI-Augmented Workflows',
      content: 'Calling all engineers, designers, and product thinkers! Our 48-hour internal Hackathon kicks off next month. Prizes include $10,000 in team learning budgets and integration into production.',
      authorName: 'Alex Rivera',
      authorRole: 'Engineering Manager',
      category: 'General',
      priority: 'Normal',
      targetDepartment: 'Engineering',
      pinned: false,
      createdAt: '2026-10-14T14:15:00.000Z',
      acknowledgedBy: ['usr-3', 'usr-4']
    }
  ];

  const trainings = [
    {
      id: 'trn-1',
      title: 'Modern Full-Stack Cloud Architecture & Microservices',
      description: 'Comprehensive program covering Docker containerization, Kubernetes orchestration, MongoDB Atlas optimization, and zero-trust microservice security patterns.',
      category: 'Technical',
      duration: '4 Weeks (20 hrs)',
      deadline: '2026-11-30',
      assignedBy: 'Alex Rivera',
      assignedRole: 'Engineering Manager',
      department: 'Engineering',
      enrolledEmployees: [
        {
          employeeId: 'usr-3',
          employeeName: 'Elena Rostova',
          progress: 75,
          status: 'In Progress',
          completedAt: null
        },
        {
          employeeId: 'usr-4',
          employeeName: 'Marcus Chen',
          progress: 100,
          status: 'Completed',
          completedAt: '2026-10-15T18:00:00.000Z'
        }
      ]
    },
    {
      id: 'trn-2',
      title: 'Enterprise Cyber Security & Data Privacy (SOC2 / GDPR)',
      description: 'Mandatory annual enterprise compliance course covering phishing defenses, API credential lifecycle, data retention protocols, and incident response procedures.',
      category: 'Compliance',
      duration: '2 Hours',
      deadline: '2026-11-15',
      assignedBy: 'Sarah Jenkins',
      assignedRole: 'Head of People & Culture',
      department: 'All',
      enrolledEmployees: [
        {
          employeeId: 'usr-3',
          employeeName: 'Elena Rostova',
          progress: 100,
          status: 'Completed',
          completedAt: '2026-10-10T12:00:00.000Z'
        },
        {
          employeeId: 'usr-2',
          employeeName: 'Alex Rivera',
          progress: 100,
          status: 'Completed',
          completedAt: '2026-10-09T16:30:00.000Z'
        },
        {
          employeeId: 'usr-5',
          employeeName: 'Maya Patel',
          progress: 40,
          status: 'In Progress',
          completedAt: null
        }
      ]
    },
    {
      id: 'trn-3',
      title: 'High-Impact Technical Leadership & Empathetic Management',
      description: 'Workshop series on 1-on-1 coaching frameworks, delivering constructive feedback, conducting quarterly career growth reviews, and preventing team burnout.',
      category: 'Leadership',
      duration: '3 Weeks (15 hrs)',
      deadline: '2026-12-10',
      assignedBy: 'Sarah Jenkins',
      assignedRole: 'Head of People & Culture',
      department: 'Management',
      enrolledEmployees: [
        {
          employeeId: 'usr-2',
          employeeName: 'Alex Rivera',
          progress: 60,
          status: 'In Progress',
          completedAt: null
        }
      ]
    }
  ];

  return { users, attendance, leaves, announcements, trainings };
};

// In-memory data holder
let store = null;

const loadData = () => {
  if (store) return store;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      store = JSON.parse(content);
    } else {
      store = getInitialSeedData();
      saveData();
    }
  } catch (err) {
    console.error('Error loading data store, resetting to initial seed:', err);
    store = getInitialSeedData();
    saveData();
  }
  return store;
};

const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving data store:', err);
  }
};

// Initialize
loadData();

module.exports = {
  getStore: loadData,
  saveStore: saveData,
  resetStore: () => {
    store = getInitialSeedData();
    saveData();
    return store;
  }
};
