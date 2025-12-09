// lib/api.ts
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<any> {
  // Use NEXT_PUBLIC_API_BASE_URL instead of NEXT_PUBLIC_API_URL
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint}`;
  console.log('API Request:', url, options.method, token ? 'with token' : 'no token');
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      console.error('API Error:', errorData);
      const error = new Error(errorData.detail || `HTTP ${response.status}`);
      (error as any).status = response.status;
      (error as any).message = errorData;
      throw error;
    }

    const data = await response.json();
    console.log('API Success:', data);
    return data;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}