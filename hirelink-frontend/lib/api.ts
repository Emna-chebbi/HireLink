const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  accessToken?: string
) {
  if (!API_BASE) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return text;
  }
}
