import { Router } from 'express';
import authRoutes from './authRoutes.js';
import readingRoutes from './readingRoutes.js';
import reportRoutes from './reportRoutes.js';
import healthRoutes from './healthRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/readings', readingRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/health', healthRoutes);

export default apiRouter;

