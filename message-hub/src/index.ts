interface Env {
  DB: D1Database;
  HUB_API_KEY: string;
  HUB_DASHBOARD_PASSWORD: string;
  HUB_ADMIN_SESSION_SECRET: string;
  FORWARD_EMAIL: SendEmail;
}

const FORWARD_TO = 'chrisoconnell21@gmail.com';
// One sender per site so each can carry its own logo as a Google Contact photo in Gmail.
const forwardFrom = (site: string) => `${site}@probablyfinestudios.com`;

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

const ALLOWED_SITES = new Set(['cookbookverse', 'fieldkit', 'chrisocphoto', 'probablyfinestudios', 'davapalooza', 'trvlplay', 'scramble', 'wx', 'hang', 'supplyline']);
const PUBLIC_SUBMIT_SITES = new Set(['probablyfinestudios', 'fieldkit', 'chrisocphoto', 'supplyline']);
const ALLOWED_STATUSES = new Set(['unread', 'read', 'archived']);
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const SITE_ALLOWED_ORIGINS: Record<string, string[]> = {
  probablyfinestudios: [
    'http://localhost:3000',
    'http://localhost:3001',
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
  chrisocphoto: [
    'http://localhost:3000',
    'https://chrisocphoto.com',
    'https://www.chrisocphoto.com',
  ],
  supplyline: [
    'http://localhost:3000',
    'https://supplyline-chrisoc.vercel.app',
  ],
};

function corsHeaders(): Record<string, string> {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

async function forwardMessage(env: Env, id: number, msg: IncomingMessage): Promise<void> {
  const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();
  const firstLine = oneLine(msg.message.trim().split('\n')[0]).slice(0, 80);
  try {
    await env.FORWARD_EMAIL.send({
      from: { name: `${oneLine(msg.name).slice(0, 60)} via ${msg.source_site}`, email: forwardFrom(msg.source_site) },
      to: FORWARD_TO,
      replyTo: { name: oneLine(msg.name).slice(0, 60), email: oneLine(msg.email) },
      subject: `[${msg.source_site}] ${oneLine(msg.name).slice(0, 60)}: ${firstLine}`,
      text:
        `${msg.message}\n\n` +
        `-- \n` +
        `From: ${oneLine(msg.name)} <${oneLine(msg.email)}>\n` +
        `Site: ${msg.source_site}\n` +
        `Hit Reply to answer them directly.\n` +
        `Inbox: https://mail.probablyfinestudios.com/admin (message #${id})\n`,
    });
  } catch (error) {
    console.error('forward failed', id, error);
  }
}

async function createMessage(env: Env, request: Request, ctx: ExecutionContext): Promise<Response> {
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
  ctx.waitUntil(forwardMessage(env, id, payload as IncomingMessage));
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

async function createPublicMessage(env: Env, request: Request, ctx: ExecutionContext): Promise<Response> {
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
  ctx.waitUntil(forwardMessage(env, id, payload as IncomingMessage));
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

async function deleteMessageById(env: Env, messageId: number): Promise<Response> {
  const result = await env.DB.prepare(
    `DELETE FROM messages
     WHERE id = ?1`
  )
    .bind(messageId)
    .run();

  const rowsWritten = Number((result.meta as { changes?: number }).changes ?? 0);
  if (rowsWritten === 0) {
    return jsonResponse(404, { error: 'Message not found.' });
  }

  return jsonResponse(200, { ok: true, id: messageId });
}

const ADMIN_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Inbox — Probably Fine Studios</title>
<style>
  :root {
    --bg: #f6f8fc; --surface: #fff; --text: #1f1f1f; --muted: #5e5e5e; --faint: #747775;
    --line: #eef0f2; --hover: #f2f6fc; --active: #d3e3fd; --search: #eaf1fb; --accent: #0b57d0;
    --read-row: #f2f6fc; --shadow: 0 1px 2px rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #111; --surface: #1b1b1b; --text: #e8eaed; --muted: #bdc1c6; --faint: #9aa0a6;
      --line: #2a2a2a; --hover: #262a30; --active: #2b3a55; --search: #262626; --accent: #8ab4f8;
      --read-row: #161616; --shadow: 0 1px 3px rgba(0,0,0,.6);
    }
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body { margin: 0; font-family: 'Google Sans', Roboto, -apple-system, 'Segoe UI', Arial, sans-serif; background: var(--bg); color: var(--text); font-size: 14px; }
  button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
  svg { width: 20px; height: 20px; fill: currentColor; display: block; }
  .icon-btn { width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--muted); }
  .icon-btn:hover { background: rgba(127,127,127,.15); }

  /* login */
  #login { display: none; height: 100%; align-items: center; justify-content: center; }
  .login-card { background: var(--surface); padding: 40px 36px; border-radius: 28px; width: 100%; max-width: 380px; box-shadow: var(--shadow); }
  .login-card .mark { margin-bottom: 18px; }
  .login-card h1 { font-size: 24px; font-weight: 400; margin: 0 0 6px; }
  .login-card p { color: var(--muted); margin: 0 0 24px; }
  .login-card input { width: 100%; padding: 14px 16px; border: 1px solid var(--faint); border-radius: 6px; background: transparent; color: var(--text); font-size: 15px; }
  .login-card input:focus { outline: 2px solid var(--accent); border-color: transparent; }
  #login-error { color: #d93025; font-size: 13px; min-height: 20px; margin: 8px 0; }
  .btn-primary { background: var(--accent); color: #fff; padding: 10px 24px; border-radius: 20px; font-weight: 500; float: right; }
  @media (prefers-color-scheme: dark) { .btn-primary { color: #062e6f; } }

  /* shell */
  #app { display: none; height: 100%; flex-direction: column; }
  .topbar { display: flex; align-items: center; gap: 8px; padding: 8px 16px 8px 8px; height: 64px; flex-shrink: 0; }
  .brand { display: flex; align-items: center; gap: 10px; width: 224px; padding-left: 8px; flex-shrink: 0; }
  .mark { width: 36px; height: 36px; border-radius: 10px; background: var(--text); color: var(--bg); font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: center; letter-spacing: -.02em; }
  .brand-name { font-size: 20px; color: var(--muted); }
  .search { flex: 1; max-width: 720px; display: flex; align-items: center; background: var(--search); border-radius: 24px; height: 48px; padding: 0 8px; }
  .search:focus-within { background: var(--surface); box-shadow: var(--shadow); }
  .search input { flex: 1; border: 0; background: transparent; font: inherit; font-size: 16px; color: var(--text); outline: none; }
  .topbar .spacer { flex: 1; }
  .menu-btn { display: none; }

  .body { flex: 1; display: flex; min-height: 0; }
  nav { width: 256px; flex-shrink: 0; padding: 8px 16px 16px 0; overflow-y: auto; }
  .nav-item { display: flex; align-items: center; gap: 16px; height: 32px; padding: 0 12px 0 26px; border-radius: 0 16px 16px 0; color: var(--text); width: 100%; text-align: left; font-size: 14px; }
  .nav-item:hover { background: rgba(127,127,127,.12); }
  .nav-item.active { background: var(--active); font-weight: 700; }
  .nav-item .n { margin-left: auto; font-size: 12px; font-weight: 700; }
  .nav-item svg { width: 18px; height: 18px; color: var(--muted); }
  .nav-label { font-size: 16px; font-weight: 500; padding: 18px 0 6px 26px; }
  .swatch { width: 12px; height: 12px; border-radius: 3px; margin: 0 3px; flex-shrink: 0; }

  .panel { flex: 1; min-width: 0; background: var(--surface); border-radius: 16px; margin: 0 16px 16px 0; display: flex; flex-direction: column; overflow: hidden; }
  .panel-bar { display: flex; align-items: center; gap: 4px; padding: 4px 12px; height: 48px; border-bottom: 1px solid var(--line); flex-shrink: 0; }
  .panel-bar .count { margin-left: auto; color: var(--muted); font-size: 12px; padding-right: 8px; }
  .scroll { flex: 1; overflow-y: auto; }

  /* list rows */
  .row { display: flex; align-items: center; height: 40px; padding: 0 16px 0 12px; border-bottom: 1px solid var(--line); cursor: pointer; position: relative; background: var(--read-row); }
  .row.unread { background: var(--surface); }
  .row:hover { box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15); z-index: 1; }
  .row .star { width: 28px; color: var(--accent); display: flex; justify-content: center; }
  .row .star i { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); visibility: hidden; }
  .row.unread .star i { visibility: visible; }
  .row .from { width: 190px; flex-shrink: 0; padding: 0 12px 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .content { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; white-space: nowrap; overflow: hidden; }
  .row .subject { flex-shrink: 0; max-width: 55%; overflow: hidden; text-overflow: ellipsis; }
  .row .snippet { color: var(--muted); overflow: hidden; text-overflow: ellipsis; }
  .row .date { width: 80px; text-align: right; font-size: 12px; flex-shrink: 0; color: var(--muted); }
  .row.unread .from, .row.unread .subject, .row.unread .date { font-weight: 700; color: var(--text); }
  .row .hover-actions { display: none; position: absolute; right: 8px; background: inherit; }
  .row:hover .hover-actions { display: flex; }
  .row:hover .date { visibility: hidden; }
  .hover-actions .icon-btn { width: 34px; height: 34px; }

  .chip { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: 4px; font-size: 12px; font-weight: 500; flex-shrink: 0; white-space: nowrap; }

  .empty { text-align: center; color: var(--muted); padding: 120px 20px; }
  .empty b { display: block; font-size: 18px; font-weight: 400; color: var(--text); margin-bottom: 6px; }

  /* reading view */
  .read { padding: 20px 24px 40px 72px; max-width: 980px; }
  .read h2 { font-size: 22px; font-weight: 400; margin: 0 0 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .sender { display: flex; gap: 12px; align-items: flex-start; margin-left: -56px; }
  .avatar { width: 40px; height: 40px; border-radius: 50%; color: #fff; font-weight: 500; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sender .who { flex: 1; min-width: 0; }
  .sender .who b { font-size: 14px; }
  .sender .who span { color: var(--muted); font-size: 12px; }
  .sender .when { color: var(--muted); font-size: 12px; white-space: nowrap; }
  .message { margin-top: 20px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; }
  .reply { margin-top: 32px; display: flex; gap: 12px; }
  .pill { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 20px 0 16px; border: 1px solid var(--faint); border-radius: 20px; color: var(--muted); font-weight: 500; text-decoration: none; }
  .pill:hover { background: rgba(127,127,127,.1); }

  #toasts { position: fixed; left: 24px; bottom: 24px; display: flex; flex-direction: column; gap: 8px; z-index: 50; }
  .toast { background: #313131; color: #f2f2f2; border-radius: 6px; padding: 12px 8px 12px 16px; min-width: 300px; max-width: 420px; display: flex; align-items: center; gap: 12px; box-shadow: 0 3px 6px rgba(0,0,0,.3); cursor: pointer; animation: up .2s ease-out; }
  .toast .t { flex: 1; min-width: 0; }
  .toast .t b { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .toast .t span { font-size: 13px; color: #c4c7c5; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .toast .open { color: #a8c7fa; font-weight: 500; padding: 6px 10px; border-radius: 4px; }
  .toast .open:hover { background: rgba(168,199,250,.12); }
  @keyframes up { from { transform: translateY(12px); opacity: 0; } }
  #bell.on { color: var(--accent); }

  @media (max-width: 860px) {
    #toasts { left: 12px; right: 12px; }
    .toast { min-width: 0; max-width: none; }
    .brand { width: auto; }
    .brand-name { display: none; }
    .menu-btn { display: inline-flex; }
    nav { position: fixed; top: 64px; bottom: 0; left: 0; background: var(--bg); z-index: 10; transform: translateX(-100%); transition: transform .15s; box-shadow: var(--shadow); }
    nav.open { transform: none; }
    .panel { margin: 0; border-radius: 0; }
    .row { height: auto; padding: 10px 12px; flex-wrap: wrap; }
    .row .from { width: auto; flex: 1; }
    .row .content { order: 3; width: 100%; padding-left: 32px; }
    .row .hover-actions { display: none !important; }
    .row:hover .date { visibility: visible; }
    .read { padding: 16px; }
    .sender { margin-left: 0; }
  }
</style>
</head>
<body>

<div id="login">
  <div class="login-card">
    <div class="mark">PFS</div>
    <h1>Sign in</h1>
    <p>to the Probably Fine inbox</p>
    <input id="password" type="password" placeholder="Password" autocomplete="current-password" />
    <div id="login-error"></div>
    <button class="btn-primary" id="login-btn">Next</button>
    <div style="clear:both"></div>
  </div>
</div>

<div id="app">
  <div class="topbar">
    <button class="icon-btn menu-btn" id="menu-btn" title="Menu"><svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg></button>
    <div class="brand"><div class="mark">PFS</div><span class="brand-name">Inbox</span></div>
    <label class="search">
      <span class="icon-btn"><svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span>
      <input id="search" type="search" placeholder="Search mail" />
    </label>
    <div class="spacer"></div>
    <button class="icon-btn" id="bell" title="Turn on desktop notifications"><svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg></button>
    <button class="icon-btn" id="logout-btn" title="Log out"><svg viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 00-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg></button>
  </div>
  <div class="body">
    <nav id="nav"></nav>
    <section class="panel">
      <div class="panel-bar" id="panel-bar"></div>
      <div class="scroll" id="view"></div>
    </section>
  </div>
</div>
<div id="toasts"></div>

<script>
const TOKEN_KEY = 'pfs_hub_token';
const I = {
  inbox: '<svg viewBox="0 0 24 24"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H5V5h14v10z"/></svg>',
  unread: '<svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
  archive: '<svg viewBox="0 0 24 24"><path d="M20.54 5.23l-1.39-1.68A1.45 1.45 0 0018 3H6c-.47 0-.88.21-1.16.55L3.46 5.23A1.98 1.98 0 003 6.5V19a2 2 0 002 2h14a2 2 0 002-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>',
  all: '<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2zm0 12H4V8h16v10z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  markRead: '<svg viewBox="0 0 24 24"><path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10a2 2 0 002 2h16a2 2 0 002-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35A7.96 7.96 0 0012 4a8 8 0 108 8h-2a6 6 0 11-1.76-4.24L13 11h7V4l-2.35 2.35z"/></svg>',
  reply: '<svg viewBox="0 0 24 24"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>',
};

const KNOWN = {
  probablyfinestudios: '#1a73e8', supplyline: '#e37400', fieldkit: '#0f9d58', cookbookverse: '#d93025',
  chrisocphoto: '#5f6368', davapalooza: '#a142f4', trvlplay: '#12b5cb', scramble: '#9334e6', wx: '#4285f4', hang: '#f9ab00',
};
const FALLBACK = ['#1a73e8', '#e37400', '#0f9d58', '#d93025', '#a142f4', '#12b5cb', '#e52592', '#5f6368'];
function siteColor(site) {
  if (KNOWN[site]) return KNOWN[site];
  let h = 0; for (const c of site) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return FALLBACK[h % FALLBACK.length];
}
const chip = (site) => {
  const c = siteColor(site);
  return '<span class="chip" style="background:' + c + '22;color:' + c + '">' + esc(site) + '</span>';
};

let messages = [];
let folder = 'inbox';
let site = '';
let query = '';
let openId = null;

const $ = (id) => document.getElementById(id);
function esc(s) { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

const api = (path, opts = {}) => fetch(path, {
  ...opts,
  headers: { 'content-type': 'application/json', authorization: 'Bearer ' + (localStorage.getItem(TOKEN_KEY) || '') },
});

function showLogin(err) { $('app').style.display = 'none'; $('login').style.display = 'flex'; $('login-error').textContent = err || ''; $('password').focus(); }
function showApp() { $('login').style.display = 'none'; $('app').style.display = 'flex'; load(); }

async function login() {
  const btn = $('login-btn'); btn.disabled = true;
  try {
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: $('password').value }) });
    const data = await res.json();
    if (!res.ok) return showLogin(data.error || 'Wrong password.');
    localStorage.setItem(TOKEN_KEY, data.token);
    showApp();
  } catch { showLogin('Could not reach the server.'); }
  finally { btn.disabled = false; }
}
$('login-btn').onclick = login;
$('password').onkeydown = (e) => { if (e.key === 'Enter') login(); };
$('logout-btn').onclick = () => { localStorage.removeItem(TOKEN_KEY); showLogin(); };
$('menu-btn').onclick = () => $('nav').classList.toggle('open');
$('search').oninput = (e) => { query = e.target.value.trim().toLowerCase(); openId = null; render(); };

let lastSeenId = null;
let pollTimer = null;

async function load() {
  const res = await api('/api/admin/messages?limit=200');
  if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); clearInterval(pollTimer); return showLogin('Session expired. Sign in again.'); }
  messages = (await res.json()).items || [];
  const maxId = messages.reduce((n, m) => Math.max(n, m.id), 0);
  if (lastSeenId !== null) messages.filter((m) => m.id > lastSeenId).reverse().forEach(notify);
  lastSeenId = Math.max(lastSeenId || 0, maxId);
  if (!pollTimer) pollTimer = setInterval(() => { if ($('app').style.display !== 'none') load(); }, 30000);
  render();
}

function openMessage(id) {
  openId = id;
  const m = messages.find((x) => x.id === id);
  if (m && m.status === 'unread') {
    m.status = 'read';
    api('/api/admin/messages/' + id, { method: 'PATCH', body: JSON.stringify({ status: 'read' }) });
  }
  render();
  $('view').scrollTop = 0;
}

function notify(m) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = '<div class="t"><b>' + esc(m.name) + ' via ' + esc(m.source_site) + '</b><span>' + esc(firstLine(m.message)) + '</span></div><button class="open">Open</button>';
  el.onclick = () => { el.remove(); openMessage(m.id); };
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), 8000);

  if ('Notification' in window && Notification.permission === 'granted') {
    const n = new Notification(m.name + ' via ' + m.source_site, { body: firstLine(m.message), tag: 'pfs-' + m.id });
    n.onclick = () => { window.focus(); openMessage(m.id); n.close(); };
  }
}

function syncBell() {
  const on = 'Notification' in window && Notification.permission === 'granted';
  $('bell').classList.toggle('on', on);
  $('bell').title = on ? 'Desktop notifications are on' : 'Turn on desktop notifications';
}
$('bell').onclick = async () => {
  if (!('Notification' in window)) return alert('This browser does not support notifications.');
  if (Notification.permission === 'denied') return alert('Notifications are blocked for this site. Allow them from the lock icon in the address bar.');
  await Notification.requestPermission();
  syncBell();
};
syncBell();
document.addEventListener('visibilitychange', () => { if (!document.hidden && $('app').style.display !== 'none') load(); });

function inFolder(m) {
  if (folder === 'inbox') return m.status !== 'archived';
  if (folder === 'unread') return m.status === 'unread';
  if (folder === 'archived') return m.status === 'archived';
  return true;
}
function visible() {
  return messages.filter((m) => inFolder(m) && (!site || m.source_site === site) &&
    (!query || (m.name + ' ' + m.email + ' ' + m.message + ' ' + m.source_site).toLowerCase().includes(query)));
}

function firstLine(text) { const t = text.trim().split(/\\n/)[0]; return t.length > 80 ? t.slice(0, 80) + '…' : t; }
function rest(text) { const t = text.trim(); const f = t.split(/\\n/)[0]; return t.slice(Math.min(f.length, 80)).replace(/\\s+/g, ' ').trim(); }

function shortDate(iso) {
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z');
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: '2-digit' });
}
function longDate(iso) {
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function renderNav() {
  const unread = messages.filter((m) => m.status === 'unread').length;
  const folders = [
    ['inbox', 'Inbox', I.inbox, unread],
    ['unread', 'Unread', I.unread, 0],
    ['archived', 'Archived', I.archive, 0],
    ['all', 'All mail', I.all, 0],
  ];
  const sites = [...new Set(messages.map((m) => m.source_site))].sort();
  $('nav').innerHTML =
    folders.map(([key, label, icon, n]) =>
      '<button class="nav-item' + (folder === key && !site ? ' active' : '') + '" data-folder="' + key + '">' + icon + label +
      (n ? '<span class="n">' + n + '</span>' : '') + '</button>').join('') +
    '<div class="nav-label">Sites</div>' +
    sites.map((s) => {
      const n = messages.filter((m) => m.source_site === s && m.status === 'unread').length;
      return '<button class="nav-item' + (site === s ? ' active' : '') + '" data-site="' + esc(s) + '"><span class="swatch" style="background:' + siteColor(s) + '"></span>' + esc(s) +
        (n ? '<span class="n">' + n + '</span>' : '') + '</button>';
    }).join('');
  $('nav').querySelectorAll('[data-folder]').forEach((b) => b.onclick = () => { folder = b.dataset.folder; site = ''; openId = null; $('nav').classList.remove('open'); render(); });
  $('nav').querySelectorAll('[data-site]').forEach((b) => b.onclick = () => { site = b.dataset.site; folder = 'all'; openId = null; $('nav').classList.remove('open'); render(); });
}

function rowActions(m) {
  return '<span class="hover-actions">' +
    (m.status !== 'archived' ? '<button class="icon-btn" title="Archive" data-act="archived" data-id="' + m.id + '">' + I.archive + '</button>' : '<button class="icon-btn" title="Move to inbox" data-act="read" data-id="' + m.id + '">' + I.inbox + '</button>') +
    '<button class="icon-btn" title="Delete" data-act="delete" data-id="' + m.id + '">' + I.trash + '</button>' +
    (m.status === 'unread'
      ? '<button class="icon-btn" title="Mark as read" data-act="read" data-id="' + m.id + '">' + I.markRead + '</button>'
      : '<button class="icon-btn" title="Mark as unread" data-act="unread" data-id="' + m.id + '">' + I.unread + '</button>') +
    '</span>';
}

function renderList() {
  const list = visible();
  $('panel-bar').innerHTML = '<button class="icon-btn" title="Refresh" id="refresh">' + I.refresh + '</button>' +
    '<span class="count">' + (list.length ? '1–' + list.length + ' of ' + list.length : '') + '</span>';
  $('refresh').onclick = load;

  if (!list.length) {
    $('view').innerHTML = '<div class="empty"><b>' + (query ? 'No messages matched your search' : 'Nothing here') + '</b>' +
      (folder === 'inbox' && !query ? 'Inbox zero. Probably fine.' : '') + '</div>';
    return;
  }
  $('view').innerHTML = list.map((m) =>
    '<div class="row' + (m.status === 'unread' ? ' unread' : '') + '" data-open="' + m.id + '">' +
      '<span class="star"><i></i></span>' +
      '<span class="from">' + esc(m.name) + '</span>' +
      '<span class="content">' + chip(m.source_site) +
        '<span class="subject">' + esc(firstLine(m.message)) + '</span>' +
        (rest(m.message) ? '<span class="snippet">– ' + esc(rest(m.message)) + '</span>' : '') +
      '</span>' +
      '<span class="date">' + shortDate(m.created_at) + '</span>' +
      rowActions(m) +
    '</div>').join('');
}

function renderRead(m) {
  const color = siteColor(m.source_site);
  const subject = 'Re: your message via ' + m.source_site;
  const quoted = '\\n\\n---\\nOn ' + longDate(m.created_at) + ', ' + m.name + ' wrote:\\n' + m.message;
  const mailto = 'mailto:' + encodeURIComponent(m.email) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(quoted);
  $('panel-bar').innerHTML =
    '<button class="icon-btn" title="Back" id="back">' + I.back + '</button>' +
    (m.status !== 'archived'
      ? '<button class="icon-btn" title="Archive" data-act="archived" data-id="' + m.id + '">' + I.archive + '</button>'
      : '<button class="icon-btn" title="Move to inbox" data-act="read" data-id="' + m.id + '">' + I.inbox + '</button>') +
    '<button class="icon-btn" title="Delete" data-act="delete" data-id="' + m.id + '">' + I.trash + '</button>' +
    '<button class="icon-btn" title="Mark as unread" data-act="unread" data-id="' + m.id + '">' + I.unread + '</button>';
  $('back').onclick = () => { openId = null; render(); };
  $('view').innerHTML =
    '<div class="read">' +
      '<h2>' + esc(firstLine(m.message)) + chip(m.source_site) + '</h2>' +
      '<div class="sender">' +
        '<div class="avatar" style="background:' + color + '">' + esc((m.name || '?').trim()[0].toUpperCase()) + '</div>' +
        '<div class="who"><b>' + esc(m.name) + '</b> <span>&lt;' + esc(m.email) + '&gt;</span><br><span>via ' + esc(m.source_site) + ' contact form</span></div>' +
        '<div class="when">' + longDate(m.created_at) + '</div>' +
      '</div>' +
      '<div class="message">' + esc(m.message) + '</div>' +
      '<div class="reply"><a class="pill" href="' + mailto + '">' + I.reply + 'Reply</a></div>' +
    '</div>';
}

function render() {
  renderNav();
  const m = openId != null && messages.find((x) => x.id === openId);
  if (m) renderRead(m); else { openId = null; renderList(); }
  document.title = (messages.filter((x) => x.status === 'unread').length ? '(' + messages.filter((x) => x.status === 'unread').length + ') ' : '') + 'Inbox — Probably Fine Studios';
}

$('app').addEventListener('click', async (e) => {
  const act = e.target.closest('[data-act]');
  if (act) {
    e.stopPropagation();
    const id = Number(act.dataset.id);
    if (act.dataset.act === 'delete') {
      if (!confirm('Delete this message forever?')) return;
      await api('/api/admin/messages/' + id, { method: 'DELETE' });
      openId = null;
    } else {
      await api('/api/admin/messages/' + id, { method: 'PATCH', body: JSON.stringify({ status: act.dataset.act }) });
      if (act.dataset.act !== 'read' || openId === id) openId = act.dataset.act === 'unread' || act.dataset.act === 'archived' ? null : openId;
    }
    return load();
  }
  const row = e.target.closest('[data-open]');
  if (row) openMessage(Number(row.dataset.open));
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'Escape' && openId != null) { openId = null; render(); }
  if (e.key === '/') { e.preventDefault(); $('search').focus(); }
});

if (localStorage.getItem(TOKEN_KEY)) showApp(); else showLogin();
</script>
</body>
</html>`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      if (request.method !== 'GET') {
        return jsonResponse(405, { error: 'Method not allowed.' });
      }
      return new Response(ADMIN_PAGE, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

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
        return createMessage(env, request, ctx);
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

      if (request.method === 'DELETE') {
        return deleteMessageById(env, messageId);
      }

      return jsonResponse(405, { error: 'Method not allowed.' });
    }

    if (url.pathname === '/api/public/messages') {
      if (request.method !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed.' });
      }

      return createPublicMessage(env, request, ctx);
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

    return createMessage(env, request, ctx);
  },
};
