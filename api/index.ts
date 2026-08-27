import express from 'express';
import { apiRouter } from './routes';

const app = express();

app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mount routes on both /api (standard) and / (if rewrites strip /api)
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
