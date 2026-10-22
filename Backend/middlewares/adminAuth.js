import crypto from 'crypto';

// Admin authentication: one admin account configured through environment variables
// (ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_TOKEN_SECRET). Login returns a signed token (HS256, JWT format)
// that expires after TOKEN_TTL_SECONDS. Built on Node's crypto so no extra dependency is needed.
const TOKEN_TTL_SECONDS = 12 * 60 * 60;

const b64 = (input) => Buffer.from(input).toString('base64url');

const sign = (data, secret) => crypto.createHmac('sha256', secret).update(data).digest('base64url');

const safeEqual = (a, b) => {
  const bufA = crypto.createHash('sha256').update(String(a)).digest();
  const bufB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(bufA, bufB);
};

const isConfigured = () =>
  !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.ADMIN_TOKEN_SECRET);

export const signAdminToken = (username) => {
  const now = Math.floor(Date.now() / 1000);
  const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64(JSON.stringify({ sub: username, role: 'admin', iat: now, exp: now + TOKEN_TTL_SECONDS }));
  return { token: `${header}.${payload}.${sign(`${header}.${payload}`, process.env.ADMIN_TOKEN_SECRET)}`, expiresIn: TOKEN_TTL_SECONDS };
};

export const verifyAdminToken = (token) => {
  if (!isConfigured() || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = sign(`${header}.${payload}`, process.env.ADMIN_TOKEN_SECRET);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'admin' && data.exp > Math.floor(Date.now() / 1000) ? data : null;
  } catch {
    return null;
  }
};

// Protects a route: requires "Authorization: Bearer <token>" from a successful admin login
export const requireAdmin = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  if (!isConfigured()) {
    return res.status(503).json({ success: false, message: 'Admin access is not configured on the server.' });
  }
  const header = req.headers.authorization || '';
  const admin = verifyAdminToken(header.startsWith('Bearer ') ? header.slice(7) : '');
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Please log in again to continue.' });
  }
  req.admin = admin;
  next();
};

// ponytail: in-memory attempt counter. Each serverless instance counts separately, so the real ceiling is
// (attempts x instances); move to a shared store (Redis/Mongo) if brute force becomes a concern.
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

const tooManyAttempts = (ip) => {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(ip, { first: now, count: 0 });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
};

export const adminLogin = (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({ success: false, message: 'Admin login is not configured on the server.' });
  }

  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (tooManyAttempts(ip)) {
    return res.status(429).json({ success: false, message: 'Too many failed attempts. Please wait 15 minutes and try again.' });
  }

  const { username = '', password = '' } = req.body || {};
  // Both comparisons always run so timing doesn't reveal which field was wrong
  const userOk = safeEqual(username, process.env.ADMIN_USERNAME);
  const passOk = safeEqual(password, process.env.ADMIN_PASSWORD);

  if (!(userOk && passOk)) {
    const entry = attempts.get(ip);
    if (entry) entry.count += 1;
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  attempts.delete(ip);
  const { token, expiresIn } = signAdminToken(process.env.ADMIN_USERNAME);
  return res.status(200).json({ success: true, data: { token, expiresIn } });
};
