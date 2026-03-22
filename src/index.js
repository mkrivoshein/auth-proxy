import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '16kb' }));

// Rate-limit auth endpoints to protect against brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again in 15 minutes.' }
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// 404 fallback
app.use((_req, res) => res.status(404).json({ message: 'Not found.' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ message: 'Internal server error.' });
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Node BFF server running on http://localhost:${PORT}`);
  console.log(`Proxying auth requests to ${process.env.JAVA_BACKEND_URL || 'http://localhost:8080'}`);
});
