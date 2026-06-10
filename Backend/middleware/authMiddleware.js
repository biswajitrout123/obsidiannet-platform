import jwt from 'jsonwebtoken';

import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
  try {
    // 1. Extract token
    const token = req.cookies.token || req.cookies.jwt || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // 3. Fetch the full user from DB to get their role
    const user = await User.findById(decoded.userId || decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Unauthorized - User not found" });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized - Token Verification Failed" });
  }
};

// Middleware to lock routes down to specific roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the currently logged in user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Access restricted to ${roles.join(', ')}s` });
    }
    next();
  };
};