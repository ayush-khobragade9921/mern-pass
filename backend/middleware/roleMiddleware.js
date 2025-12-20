// Middleware to check if user has required role(s)
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required' 
    });
  }
  next();
};

// Check if user is security
export const isSecurity = (req, res, next) => {
  if (!req.user || req.user.role !== 'security') {
    return res.status(403).json({ 
      message: 'Security personnel access required' 
    });
  }
  next();
};

// Check if user is employee
export const isEmployee = (req, res, next) => {
  if (!req.user || req.user.role !== 'employee') {
    return res.status(403).json({ 
      message: 'Employee access required' 
    });
  }
  next();
};

// Check if user is employee or admin
export const isEmployeeOrAdmin = (req, res, next) => {
  if (!req.user || !['employee', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Employee or Admin access required' 
    });
  }
  next();
};

// Check if user is security or admin
export const isSecurityOrAdmin = (req, res, next) => {
  if (!req.user || !['security', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Security or Admin access required' 
    });
  }
  next();
};