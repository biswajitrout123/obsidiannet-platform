import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res, next) => {
  try {
    // 1. Extract token from cookies or standard authorization headers
    const token = req.cookies.token || req.cookies.jwt || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // 2. Verify token validity against your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // 3. Attach the user identity payload directly to the request object
    req.user = {
      _id: decoded.userId || decoded.id
    };

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized - Token Verification Failed" });
  }
};