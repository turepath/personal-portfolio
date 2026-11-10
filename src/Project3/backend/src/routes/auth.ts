
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { sendVerificationEmail } from '../services/mailService';
import crypto from 'crypto';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, displayName }
    });

    const token = crypto.randomBytes(32).toString('hex');
    await prisma.emailVerification.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    await sendVerificationEmail(email, token);

    res.status(201).json({ ok: true, message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify
router.get('/verify', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    const record = await prisma.emailVerification.findUnique({
      where: { token: String(token) }
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    await prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true }
    });

    await prisma.emailVerification.delete({ where: { token: String(token) } });

    res.json({ ok: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Account not verified' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    // Fix: Cast options to any as sameSite is missing from the provided CookieOptions type definition
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    } as any);

    res.json({ id: user.id, email: user.email, displayName: user.displayName, isPro: user.isPro });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// Get Me
router.get('/me', protect, (req: AuthRequest, res) => {
  res.json(req.user);
});

export default router;
