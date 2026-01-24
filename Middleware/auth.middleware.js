import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    // console.log("No token found in cookies");
    req.isLoggedIn = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    // console.log("user",req.user);
    
    req.isLoggedIn = true;
  } catch (err) {
    // console.log("Error verifying token:", err.message);
    req.isLoggedIn = false;
  }

  next();
};
