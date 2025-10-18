import { NextFunction, Request, Response } from "express";

const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals?.user;

  console.log('🔒 RequireUser Debug:', {
    url: req.url,
    method: req.method,
    hasUser: !!user,
    userEmail: (user as any)?.email,
    userId: (user as any)?._id
  });

  if (!user) {
    console.log('❌ Access denied - no user found');
    return res.status(403).send('Not authorized.')
  }

  console.log('✅ Access granted for user:', (user as any)?.email);
  return next();
}

export {requireUser};
