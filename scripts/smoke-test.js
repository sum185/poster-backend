'use strict';

/**
 * End-to-end smoke test against a running server.
 *   node server.js            (in another terminal)
 *   node scripts/smoke-test.js
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let cookie = '';
let passed = 0;
let failed = 0;

function check(name, cond, extra = '') {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

async function req(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(BASE + path, { ...options, headers, redirect: 'manual' });
  const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  if (setCookie.length) cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  const body = await res.text();
  return { res, body };
}

(async () => {
  console.log(`Smoke test -> ${BASE}\n`);

  let r = await req('/login');
  check('GET /login returns 200', r.res.status === 200);
  check('login page renders form', r.body.includes('Sign in'));

  r = await req('/dashboard');
  check('GET /dashboard redirects when logged out', r.res.status === 302 &&
    (r.res.headers.get('location') || '').startsWith('/login'));

  r = await req('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'email=admin%40example.com&password=wrong',
  });
  check('wrong password rejected (401)', r.res.status === 401);

  r = await req('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `email=${encodeURIComponent(EMAIL)}&password=${encodeURIComponent(PASSWORD)}`,
  });
  check('correct login redirects', r.res.status === 302 &&
    (r.res.headers.get('location') || '') === '/dashboard');
  check('session cookie issued', /poster\.sid=/.test(cookie));

  r = await req('/dashboard');
  check('GET /dashboard returns 200 when logged in', r.res.status === 200);
  check('dashboard shows stat cards', r.body.includes('Total Posters'));

  const title = 'Smoke Test Poster ' + Date.now();
  r = await req('/posters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `title=${encodeURIComponent(title)}&category=Test&status=draft`,
  });
  check('create poster redirects', r.res.status === 302);

  r = await req('/posters');
  check('poster list contains new poster', r.body.includes(title));

  r = await req('/users');
  check('admins page returns 200', r.res.status === 200);

  r = await req('/logout', { method: 'POST' });
  check('logout redirects to /login', r.res.status === 302 &&
    (r.res.headers.get('location') || '') === '/login');

  r = await req('/dashboard');
  check('dashboard blocked after logout', r.res.status === 302);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
