/* ============================================================================
   GPTCLONE Blog � Proxy de autentica��o e API do GitHub para o Decap CMS.
   
   GitHub Pages serve apenas ficheiros est�ticos, pelo n�o � poss�vel fazer
   OAuth do GitHub no frontend (n�o se podem expor segredos de cliente). Este
   proxy (a ser implantado fora do GitHub Pages, p. ex. Render/Railway/qualquer
   host com Node.js) exp�e:
   
   1. GET  /auth          � inicia o fluxo OAuth do GitHub.
   2. GET  /auth/callback � troca o c�digo por token de acesso e define um
      cookie de sess�o http-only (apenas o proxy envia o token ao GitHub).
   3. GET|POST|PUT|DELETE /api/*  � encaminha para api.github.com com o token
      do utilizador (cookie). S� permite api.github.com.
   4. GET  /auth/user     � devolve o utilizador autenticado.
   5. POST /auth/logout   � limpa a sess�o.
   
   Vari�veis de ambiente obrigat�rias:
     GITHUB_CLIENT_ID     � ID da OAuth App do GitHub
     GITHUB_CLIENT_SECRET � Segredo da OAuth App do GitHub
     BASE_URL             � URL p�blica deste proxy (ex. https://proxy.onrender.com)
     SESSION_SECRET       � segredo aleat�rio para assinar o cookie
   Opcionais:
     NODE_ENV             � production (cookies Secure) ou development
     ALLOWED_ORIGINS      � origens permitidas em CORS
============================================================================ */

import { createServer } from 'node:http';
import { parse } from 'node:url';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';


const GITHUB_CLIENT_ID = (process.env.GITHUB_CLIENT_ID || '').trim();
const GITHUB_CLIENT_SECRET = (process.env.GITHUB_CLIENT_SECRET || '').trim();
const BASE_URL = (process.env.BASE_URL || '').trim().replace(/\/+$/, '');
const SESSION_SECRET = process.env.SESSION_SECRET;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';

const DEFAULT_ALLOWED_ORIGINS =
  'https://pedrom3160.github.io,http://localhost:4321,http://localhost:5173,http://127.0.0.1:4321,http://127.0.0.1:5173';
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS)
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
);

const GITHUB_API = 'https://api.github.com';
const COOKIE_TOKEN = 'gptclone_cms_token';
const COOKIE_STATE = 'gptclone_cms_state';

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !BASE_URL || !SESSION_SECRET) {
  console.error(
    'Faltam vari�veis de ambiente: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, BASE_URL, SESSION_SECRET'
  );
  process.exit(1);
}

function allowedOrigin(origin) {
  if (!origin) return null;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.github.io') && url.protocol === 'https:') {
      return origin;
    }
  } catch (error) {
    /* ignore */
  }
  return null;
}

function sign(value) {
  return createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
}

function makeSetCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly'];
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (IS_PROD) parts.push('Secure', 'SameSite=None');
  else parts.push('SameSite=Lax');
  return parts.join('; ');
}

function clearCookie(name) {
  return `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`;
}

function getCookie(cookies, name) {
  const match = (cookies || '').match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? match[1] : null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function jsonResponse(res, status, body, origin) {
  const payload = JSON.stringify(body || {});
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  headers['Access-Control-Allow-Credentials'] = 'true';
  res.writeHead(status, headers);
  res.end(payload);
}

function forwardHeaders(req, token) {
  const headers = {
    'User-Agent': 'gptclone-cms-proxy/1.0',
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
  };
  const contentType = req.headers['content-type'];
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

const server = createServer(async (req, res) => {
  const origin = allowedOrigin(req.headers.origin);
  const { pathname } = parse(req.url || '');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, authorization',
      'Vary': 'Origin',
    });
    res.end();
    return;
  }

  if (pathname === '/') {
    return jsonResponse(
      res,
      200,
      { status: 'ok', service: 'gptclone-blog-cms-proxy' },
      origin
    );
  }

  // -------------------------------------------------------------------------
  // Auth: iniciar fluxo OAuth do GitHub
  // -------------------------------------------------------------------------
  if (pathname === '/auth' && req.method === 'GET') {
    const state = createHash('sha256')
      .update(`${Date.now()}${Math.random()}`)
      .digest('hex');
    const redirectTo = req.headers.referer || `${BASE_URL}/admin/`;
    const stateValue = `${state}|${encodeURIComponent(redirectTo)}`;
    res.setHeader(
      'Set-Cookie',
      makeSetCookie(COOKIE_STATE, sign(stateValue), { maxAge: 600 })
    );
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      scope: 'repo',
      redirect_uri: `${BASE_URL}/auth/callback`,
      state: stateValue,
    });
    res.writeHead(302, {
      Location: `https://github.com/login/oauth/authorize?${params}`,
    });
    res.end();
    return;
  }

  // -------------------------------------------------------------------------
  // Auth: callback do GitHub (troca o code por token de acesso)
  // -------------------------------------------------------------------------
  if (pathname === '/auth/callback' && req.method === 'GET') {
    try {
      const query = parse(req.url || '', true).query;
      const code = query.code;
      const state = query.state;
      if (query.error || !code || !state) {
        throw new Error(query.error || 'callback inv�lido');
      }
      const stateCookie = getCookie(req.headers.cookie, COOKIE_STATE);
      if (!stateCookie) throw new Error('estado de sess�o ausente');
      if (!timingSafeEqual(Buffer.from(sign(state)), Buffer.from(stateCookie))) {
        throw new Error('estado inv�lido (CSRF)');
      }

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'gptclone-cms-proxy/1.0',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenJson = await tokenRes.json();
      if (!tokenJson.access_token) {
        throw new Error(tokenJson.error_description || 'falha ao obter token');
      }

      const parts = state.split('|');
      const redirectTo = parts[1] ? decodeURIComponent(parts[1]) : `${BASE_URL}/admin/`;
      res.setHeader('Set-Cookie', [
        makeSetCookie(COOKIE_TOKEN, tokenJson.access_token, {
          maxAge: 60 * 60 * 24 * 30,
        }),
        clearCookie(COOKIE_STATE),
      ]);
      res.writeHead(302, { Location: redirectTo });
      res.end();
      return;
    } catch (err) {
      res.writeHead(302, {
        Location: `${BASE_URL}/admin/?cms_error=auth_failed`,
      });
      res.end();
      return;
    }
  }

  // -------------------------------------------------------------------------
  // Auth: utilizador atual / logout
  // -------------------------------------------------------------------------
  if (pathname === '/auth/user' && req.method === 'GET') {
    const token = getCookie(req.headers.cookie, COOKIE_TOKEN);
    if (!token) return jsonResponse(res, 401, { authenticated: false }, origin);
    try {
      const gh = await fetch(`${GITHUB_API}/user`, {
        headers: forwardHeaders(req, token),
      });
      const body = await gh.json();
      return jsonResponse(res, gh.status, { authenticated: true, user: body }, origin);
    } catch (err) {
      return jsonResponse(
        res,
        502,
        { authenticated: false, error: String(err.message) },
        origin
      );
    }
  }

  if (pathname === '/auth/logout' && req.method === 'POST') {
    res.setHeader('Set-Cookie', [clearCookie(COOKIE_TOKEN), clearCookie(COOKIE_STATE)]);
    return jsonResponse(res, 200, { ok: true }, origin);
  }

  // -------------------------------------------------------------------------
  // Proxy: API do GitHub (apenas api.github.com, com cookie de sess�o)
  // -------------------------------------------------------------------------
  if (
    pathname.startsWith('/api/') &&
    ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')
  ) {
    const token = getCookie(req.headers.cookie, COOKIE_TOKEN);
    if (!token) return jsonResponse(res, 401, { authenticated: false }, origin);

    const targetPath = pathname.slice('/api'.length);
    const targetUrl = `${GITHUB_API}${targetPath}`;
    try {
      const body =
        req.method === 'GET' || req.method === 'DELETE'
          ? undefined
          : await readBody(req);
      const gh = await fetch(targetUrl, {
        method: req.method,
        headers: forwardHeaders(req, token),
        body,
      });
      const contentType = gh.headers.get('content-type') || 'application/json';
      const data = await gh.arrayBuffer();
      res.writeHead(gh.status, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Vary': 'Origin',
      });
      res.end(Buffer.from(data));
      return;
    } catch (err) {
      return jsonResponse(res, 502, { error: String(err.message) }, origin);
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

const PORT = Number(process.env.PORT || 8080);
server.listen(PORT, () => {
  console.log(`gptclone-blog-cms-proxy a ouvir na porta ${PORT} (${NODE_ENV})`);
});
