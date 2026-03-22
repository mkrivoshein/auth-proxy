import { Router } from 'express';
import { javaRequest } from '../authClient.js';

const router = Router();

/**
 * POST /api/auth/register
 * Proxies to Java: POST /api/v1/auth/register
 */
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, company } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'firstName, lastName, email and password are required.' });
  }

  try {
    const { status, data } = await javaRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password, company: company || null })
    });

    return res.status(status).json(data);
  } catch (err) {
    console.error('[register] Java backend unreachable:', err.message);
    return res.status(502).json({ message: 'Authentication service unavailable. Please try again later.' });
  }
});

/**
 * POST /api/auth/login
 * Proxies to Java: POST /api/v1/auth/login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required.' });
  }

  try {
    const { status, data } = await javaRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    return res.status(status).json(data);
  } catch (err) {
    console.error('[login] Java backend unreachable:', err.message);
    return res.status(502).json({ message: 'Authentication service unavailable. Please try again later.' });
  }
});

/**
 * GET /api/auth/profile
 * Forwards JWT bearer token to Java: GET /api/v1/users/me
 */
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header.' });
  }

  try {
    const { status, data } = await javaRequest('/api/v1/users/me', {
      method: 'GET',
      headers: { Authorization: authHeader }
    });

    return res.status(status).json(data);
  } catch (err) {
    console.error('[profile] Java backend unreachable:', err.message);
    return res.status(502).json({ message: 'Authentication service unavailable. Please try again later.' });
  }
});

export default router;
