import { NextFunction, Request, Response } from 'express';
import lo from 'lodash';
import { reIssueAccessToken } from '../services/jwt.service.js';
// import { findSession } from "../services/session.service.js";
import { findUser } from '../services/user.service.js';
import { verifyJWT } from '../utils/jwt.utils.js';
import dotenv from 'dotenv';

dotenv.config();

const deserializeUserFromJWT = async (req: Request, res: Response, next: NextFunction) => {
  // Get token from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const accessToken = authHeader.substring(7); // Remove "Bearer " prefix

  if (!accessToken) return next();

  const { decoded, expired } = verifyJWT(accessToken);

  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  // Token expired - return 401 for frontend to handle refresh
  if (expired) {
    return res.status(401).json({
      error: 'Access token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Invalid token
  return res.status(401).json({
    error: 'Invalid access token',
    code: 'INVALID_TOKEN'
  });
};

// const deserializeUserFromSession = async (req: Request, res: Response, next: NextFunction) => {
//   const sessionId = req.cookies.sessionId;
//   if (!sessionId) return next();

//   const session = await findSession(sessionId)
//   const user = await findUser(session.user)

//   if (user) {
//     res.locals.user = user;
//     return next();
//   }

//   // user null
//   res.clearCookie("sessionId")
//   return res.status(404).send('Invalid session Id or user not found').redirect('/')
// }

export { deserializeUserFromJWT };
