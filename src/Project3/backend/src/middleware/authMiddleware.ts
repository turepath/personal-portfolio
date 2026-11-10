
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

/**
 * Fix: Explicitly added cookies, body, and params to AuthRequest interface.
 * While body and params are typically part of Request, the custom AuthRequest
 * type was causing property access errors in route handlers.
 * Cookies is added by cookie-parser and needs explicit typing.
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isPro: boolean;
  };
  cookies: any;
  body: any;
  params: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Fix: req.cookies is now recognized on AuthRequest
  const token = req.cookies.token;

  if (!token) {
    // Fix: Cast res to any to access status method which is missing from the provided type definition
    return (res as any).status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, isPro: true, isVerified: true }
    });

    if (!user) {
      // Fix: Cast res to any to access status method which is missing from the provided type definition
      return (res as any).status(401).json({ error: 'User no longer exists' });
    }

    if (!user.isVerified) {
      // Fix: Cast res to any to access status method which is missing from the provided type definition
      return (res as any).status(403).json({ error: 'Please verify your email first' });
    }

    req.user = user;
    next();
  } catch (error) {
    // Fix: Cast res to any to access status method which is missing from the provided type definition
    (res as any).status(401).json({ error: 'Invalid token' });
  }
};
