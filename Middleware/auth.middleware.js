// import jwt from "jsonwebtoken";
import { R_TOKEN_TIME, TOKEN_AGE } from "../config/constant.js";
import { refreshTokeni, verifyJWTToken } from "../services/auth.services.js";

export const verifyJWT = async (req, res, next) => {
  const access_token = req.cookies?.access_token;
  const refresh_token = req.cookies?.refresh_token;

  if (!access_token && !refresh_token) {
    req.isLoggedIn = false;
    
    return next();
  }
  
    if (access_token)
    {
      try {
              const decoded = verifyJWTToken(access_token);
              req.user = decoded;
              req.isLoggedIn = true;
              return next();
            } catch (err) 
            {
              // fall through to refresh token
            }
    }

  if (refresh_token) {
    try {
      const { accessToken, refreshToken, user } = await refreshTokeni(refresh_token);
      req.user = user;
      const baseConfig = { httpOnly: true, secure: true, sameSite: "lax" };

      res.cookie("access_token", accessToken, {
        ...baseConfig,
        maxAge: TOKEN_AGE, //15 minutes
      });

      res.cookie("refresh_token", refreshToken, {
        ...baseConfig,
        maxAge:R_TOKEN_TIME, //7 days
      });
      req.isLoggedIn = true;
      return next();
    }
    catch (error) {
      req.isLoggedIn = false;
      return next();
    }
  }
req.isLoggedIn = false;
return next();

  }