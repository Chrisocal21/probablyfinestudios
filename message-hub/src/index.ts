interface Env {
  DB: D1Database;
  HUB_API_KEY: string;
  HUB_DASHBOARD_PASSWORD: string;
  HUB_ADMIN_SESSION_SECRET: string;
}

interface IncomingMessage {
  source_site: string;
  name: string;
  email: string;
  message: string;
}

interface PublicIncomingMessage extends IncomingMessage {
  company?: string;
}

interface StoredMessage {
  id: number;
  source_site: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

const ALLOWED_SITES = new Set(['cookbookverse', 'fieldkit', 'chrisocphoto', 'probablyfinestudios', 'davapalooza', 'trvlplay', 'scramble', 'wx', 'hang']);
const PUBLIC_SUBMIT_SITES = new Set(['probablyfinestudios', 'fieldkit']);
const ALLOWED_STATUSES = new Set(['unread', 'read', 'archived']);
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const SITE_ALLOWED_ORIGINS: Record<string, string[]> = {
  probablyfinestudios: [
    'http://localhost:3000',
    'https://probablyfinestudios.com',
    'https://www.probablyfinestudios.com',
  ],
  fieldkit: [
    'http://localhost:3000',
    'https://fieldkit.app',
    'https://www.fieldkit.app',
    'https://fieldkit.vercel.app',
    'https://www.fieldkit.vercel.app',
    'https://get-fieldkit.com',
    'https://www.get-fieldkit.com',
  ],
};

function corsHeaders(): Record<string, string> {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type, x-hub-key',
  };
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(),
    },
  });
}

function badRequest(message: string): Response {
  return jsonResponse(400, { error: message });
}

function validatePayload(payload: Partial<IncomingMessage>): string | null {
  if (!payload.source_site || !payload.name || !payload.email || !payload.message) {
    return 'All fields are required: source_site, name, email, message.';
  }

  if (!ALLOWED_SITES.has(payload.source_site)) {
    return 'source_site is not allowed.';
  }

  if (!EMAIL_REGEX.test(payload.email)) {
    return 'email format is invalid.';
  }

  if (payload.message.length > MAX_MESSAGE_LENGTH) {
    return `message exceeds ${MAX_MESSAGE_LENGTH} characters.`;
  }

  return null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function importSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
}

function safeCompare(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

async function createAdminToken(secret: string): Promise<string> {
  const payload = JSON.stringify({
    iat: Date.now(),
    nonce: crypto.randomUUID(),
  });
  const encodedPayload = toBase64Url(new TextEncoder().encode(payload));
  const signature = await signValue(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

async function verifyAdminToken(token: string | null, secret: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [encodedPayload, providedSignature] = parts;
  const expectedSignature = await signValue(encodedPayload, secret);
  if (!safeCompare(expectedSignature, providedSignature)) {
    return false;
  }

  try {
    const payloadText = new TextDecoder().decode(fromBase64Url(encodedPayload));
    const payload = JSON.parse(payloadText) as { iat?: number };
    return typeof payload.iat === 'number' && Date.now() - payload.iat < TOKEN_MAX_AGE_MS;
  } catch {
    return false;
  }
}

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice('Bearer '.length).trim() || null;
}

async function readMessages(env: Env, limit: number): Promise<Response> {
  const query = await env.DB.prepare(
    `SELECT id, source_site, name, email, message, status, created_at
     FROM messages
     ORDER BY id DESC
     LIMIT ?1`
  )
    .bind(limit)
    .all<StoredMessage>();

  return jsonResponse(200, {
    count: query.results.length,
    items: query.results,
  });
}

async function createMessage(env: Env, request: Request): Promise<Response> {
  let payload: Partial<IncomingMessage>;
  try {
    payload = await request.json<Partial<IncomingMessage>>();
  } catch {
    return badRequest('Request body must be valid JSON.');
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return badRequest(validationError);
  }

  const insert = await env.DB.prepare(
    `INSERT INTO messages (source_site, name, email, message)
     VALUES (?1, ?2, ?3, ?4)`
  )
    .bind(payload.source_site, payload.name, payload.email, payload.message)
    .run();

  const id = Number((insert.meta as { last_row_id?: number }).last_row_id ?? 0);
  return jsonResponse(201, { id });
}

function validatePublicOrigin(request: Request, site: string): string | null {
  const allowedOrigins = SITE_ALLOWED_ORIGINS[site];
  if (!allowedOrigins || allowedOrigins.length === 0) {
    return 'Public submissions are not configured for this site.';
  }

  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');

  if (origin && allowedOrigins.includes(origin)) {
    return null;
  }

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (allowedOrigins.includes(refererOrigin)) {
        return null;
      }
    } catch {
      return 'Invalid referer.';
    }
  }

  return 'Origin not allowed.';
}

async function createPublicMessage(env: Env, request: Request): Promise<Response> {
  let payload: Partial<PublicIncomingMessage>;
  try {
    payload = await request.json<Partial<PublicIncomingMessage>>();
  } catch {
    return badRequest('Request body must be valid JSON.');
  }

  if (!payload.source_site || !PUBLIC_SUBMIT_SITES.has(payload.source_site)) {
    return badRequest('source_site is not enabled for public submissions.');
  }

  const originError = validatePublicOrigin(request, payload.source_site);
  if (originError) {
    return jsonResponse(403, { error: originError });
  }

  if (typeof payload.company === 'string' && payload.company.trim().length > 0) {
    return jsonResponse(202, { ok: true });
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return badRequest(validationError);
  }

  const insert = await env.DB.prepare(
    `INSERT INTO messages (source_site, name, email, message)
     VALUES (?1, ?2, ?3, ?4)`
  )
    .bind(payload.source_site, payload.name, payload.email, payload.message)
    .run();

  const id = Number((insert.meta as { last_row_id?: number }).last_row_id ?? 0);
  return jsonResponse(201, { id });
}

async function updateMessageStatus(env: Env, request: Request, messageId: number): Promise<Response> {
  let payload: { status?: string };
  try {
    payload = await request.json<{ status?: string }>();
  } catch {
    return badRequest('Request body must be valid JSON.');
  }

  if (!payload.status || !ALLOWED_STATUSES.has(payload.status)) {
    return badRequest('status must be one of unread, read, archived.');
  }

  const updateResult = await env.DB.prepare(
    `UPDATE messages
     SET status = ?1
     WHERE id = ?2`
  )
    .bind(payload.status, messageId)
    .run();

  const rowsWritten = Number((updateResult.meta as { changes?: number }).changes ?? 0);
  if (rowsWritten === 0) {
    return jsonResponse(404, { error: 'Message not found.' });
  }

  const selected = await env.DB.prepare(
    `SELECT id, source_site, name, email, message, status, created_at
     FROM messages
     WHERE id = ?1`
  )
    .bind(messageId)
    .first<StoredMessage>();

  return jsonResponse(200, {
    item: selected,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (url.pathname === '/api/admin/login') {
      if (request.method !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed.' });
      }

      let payload: { password?: string };
      try {
        payload = await request.json<{ password?: string }>();
      } catch {
        return badRequest('Request body must be valid JSON.');
      }

      if (!payload.password || payload.password !== env.HUB_DASHBOARD_PASSWORD) {
        return jsonResponse(401, { error: 'Invalid password.' });
      }

      const token = await createAdminToken(env.HUB_ADMIN_SESSION_SECRET);
      return jsonResponse(200, {
        token,
        expires_in: TOKEN_MAX_AGE_MS / 1000,
      });
    }

    if (url.pathname === '/api/admin/messages') {
      const token = extractBearerToken(request);
      const isValid = await verifyAdminToken(token, env.HUB_ADMIN_SESSION_SECRET);
      if (!isValid) {
        return jsonResponse(401, { error: 'Unauthorized.' });
      }

      if (request.method === 'GET') {
        const limitParam = Number(url.searchParams.get('limit') ?? '50');
        const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;
        return readMessages(env, limit);
      }

      if (request.method === 'POST') {
        return createMessage(env, request);
      }

      return jsonResponse(405, { error: 'Method not allowed.' });
    }

    if (url.pathname.startsWith('/api/admin/messages/')) {
      const token = extractBearerToken(request);
      const isValid = await verifyAdminToken(token, env.HUB_ADMIN_SESSION_SECRET);
      if (!isValid) {
        return jsonResponse(401, { error: 'Unauthorized.' });
      }

      const messageId = Number(url.pathname.split('/').pop());
      if (!Number.isInteger(messageId) || messageId <= 0) {
        return badRequest('Invalid message id.');
      }

      if (request.method === 'PATCH') {
        return updateMessageStatus(env, request, messageId);
      }

      return jsonResponse(405, { error: 'Method not allowed.' });
    }

    if (url.pathname === '/api/public/messages') {
      if (request.method !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed.' });
      }

      return createPublicMessage(env, request);
    }

    if (url.pathname !== '/api/messages') {
      return jsonResponse(404, { error: 'Not found.' });
    }

    const providedKey = request.headers.get('X-Hub-Key');
    if (!providedKey || providedKey !== env.HUB_API_KEY) {
      return jsonResponse(401, { error: 'Unauthorized.' });
    }

    if (request.method === 'GET') {
      const limitParam = Number(url.searchParams.get('limit') ?? '50');
      const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

      return readMessages(env, limit);
    }

    if (request.method !== 'POST') {
      return jsonResponse(405, { error: 'Method not allowed.' });
    }

    return createMessage(env, request);
  },
};
