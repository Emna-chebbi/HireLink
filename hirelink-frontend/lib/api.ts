// lib/api.ts
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<any> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint}`;
  console.log(
    'API Request:',
    url,
    options.method,
    token ? 'with token' : 'no token'
  );

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('API Response Status:', response.status, response.statusText);

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const errorData = data ?? {
        detail: `HTTP ${response.status}: ${response.statusText}`,
      };

      console.error('API Error:', errorData);

      const message =
        typeof errorData === 'string'
          ? errorData
          : errorData?.detail ||
            errorData?.message ||
            `HTTP ${response.status}`;

      const error: any = new Error(message);
      error.status = response.status;
      error.data = errorData; // <= important
      error.raw = errorData;
      throw error;
    }

    console.log('API Success:', data);
    return data;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}
