
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initSockets } from './sockets';
import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import postRoutes from './routes/posts';
import paymentRoutes from './routes/payments';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
// Fix: Cast middleware to any to resolve type mismatch with Express's app.use PathParams overload
app.use(express.json() as any);
// Fix: Cast middleware to any to resolve type mismatch with Express's app.use PathParams overload
app.use(cookieParser() as any);

// Health Check
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/payments', paymentRoutes);

// Error Handler
app.use(errorHandler);

// Sockets
initSockets(httpServer);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
