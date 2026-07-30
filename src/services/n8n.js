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

export function saveFcmToken(idToken, { name, fcmToken }) {
  return callWebhook('/webhook/expense-save-fcm-token', {
    method: 'POST',
    idToken,
    body: { name, fcmToken },
  });
}

export function getTransaction(idToken, transactionId) {
  return callWebhook(`/webhook/expense-get-transaction?txn=${encodeURIComponent(transactionId)}`, { idToken });
}

export function getJobs(idToken) {
  return callWebhook('/webhook/expense-get-jobs', { idToken });
}

export function submitExpense(idToken, payload) {
  return callWebhook('/webhook/expense-submit', { method: 'POST', idToken, body: payload });
}

export function getHistory(idToken) {
  return callWebhook('/webhook/expense-get-history', { idToken });
}

export { callWebhook, ApiError };
