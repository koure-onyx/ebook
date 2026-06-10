import { getSession, signOut } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getTokenFromSession(): Promise<string | null> {
  const session = await getSession();
  return (session?.user as any)?.token || null;
}

/**
 * Client-side request (using browser session)
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  init?: RequestInit
): Promise<T> {
  const token = await getTokenFromSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...init?.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    });
  } catch (networkError) {
    throw new ApiError(
      'NETWORK_ERROR',
      'Failed to connect to the server. Please check your internet connection.',
      0
    );
  }

  // Handle 401 Unauthorized - sign out the user
  if (response.status === 401) {
    await signOut({ callbackUrl: '/' });
    throw new ApiError(
      'UNAUTHORIZED',
      'Your session has expired. Please sign in again.',
      401
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || response.statusText,
      response.status
    );
  }

  return data.data as T;
}

/**
 * Server-side request (for use in Server Components)
 * Accepts an explicit token to forward authorization headers.
 */
async function requestServer<T>(
  method: string,
  path: string,
  token: string | null,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Explicitly set Authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new ApiError(
      'NETWORK_ERROR',
      'Failed to connect to the server.',
      0
    );
  }

  if (response.status === 401) {
    throw new ApiError(
      'UNAUTHORIZED',
      'Authentication required.',
      401
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || response.statusText,
      response.status
    );
  }

  return data.data as T;
}

// --- Generic API Methods ---

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>('GET', path, undefined, init),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
