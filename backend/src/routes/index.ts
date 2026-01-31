import { Router } from 'express';
import userRoutes from './userRoutes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/users', userRoutes);

export default router;
