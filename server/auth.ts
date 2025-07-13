import { Request, Response, NextFunction } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Extend session interface
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized - Please login" });
  }
  next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    // If user is logged in, attach user data to request
    storage.getEmployee(req.session.userId).then(user => {
      req.user = user;
      next();
    }).catch(() => next());
  } else {
    next();
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
}; 