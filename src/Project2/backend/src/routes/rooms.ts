
import { Router } from 'express';
import prisma from '../prisma';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { generateAgoraToken } from '../services/agoraService';

const router = Router();

// List Rooms
router.get('/', async (req, res) => {
  const rooms = await prisma.room.findMany({
    include: { owner: { select: { displayName: true, isPro: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(rooms);
});

// Create Room
router.post('/', protect, async (req: AuthRequest, res) => {
  const { title, type, allowVirtual, isPro } = req.body;

  try {
    const room = await prisma.room.create({
      data: {
        title,
        type,
        allowVirtual,
        isPro,
        ownerId: req.user!.id
      }
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get Agora Token
router.get('/:id/token', protect, async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  // In a real app, generate a unique numeric UID for the user
  const numericUid = Math.floor(Math.random() * 1000000);
  
  const token = generateAgoraToken(id, numericUid);
  res.json({ token, uid: numericUid });
});

export default router;
