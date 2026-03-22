import fetch from 'node-fetch';

const JAVA_BASE = process.env.JAVA_BACKEND_URL || 'http://localhost:8080';

/**
 * Forward a request to the Java backend.
 * @param {string} path  - e.g. '/api/v1/auth/register'
 * @param {object} opts  - fetch options (method, body, headers, etc.)
 * @returns {{ status: number, data: object }}
 */
export async function javaRequest(path, opts = {}) {
  const url = `${JAVA_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...opts.headers };

  const response = await fetch(url, { ...opts, headers });

  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  return { status: response.status, data };
}
