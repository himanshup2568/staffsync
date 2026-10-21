const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow frontend Vite client
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database (auto-fallback to resilient store if Mongo is not running)
connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'StaffSync Modern Human Resource Management Solution API',
    version: '2.0.0',
    endpoints: [
      '/api/auth',
      '/api/employees',
      '/api/leaves',
      '/api/attendance',
      '/api/announcements',
      '/api/trainings',
      '/api/stats'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Route modules
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/trainings', require('./routes/trainingRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` StaffSync Backend Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
