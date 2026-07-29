const BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
const SECRET = import.meta.env.VITE_WEBHOOK_SECRET;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function callWebhook(path, { method = 'GET', idToken, body } = {}) {
  const headers = {
    'X-Secret-Token': SECRET,
  };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  if (body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    // no JSON body
  }

  if (!res.ok) {
    throw new ApiError(data?.message || 'Something went wrong. Please try again.', res.status);
  }

  return data;
}

export function verifyLogin(idToken) {
  return callWebhook('/webhook/expense-verify-login', { method: 'POST', idToken });
}

export { callWebhook, ApiError };
