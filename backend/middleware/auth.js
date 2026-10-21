const jwt = require('jsonwebtoken');
const { getStore } = require('../dataStore');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in the environment before starting the server');
}

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const store = getStore();
    const user = store.users.find(u => u.id === decoded.id || u._id === decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found in system' });
    }

    // Omit password from req.user
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token verification failed or expired' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
  JWT_SECRET
};
