import { getSession, signOut } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details: unknown = null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getTokenFromSession(): Promise<string | null> {
  const session = await getSession();
  const token = (session?.user as any)?.token;
  if (token && typeof token === 'string') {
    return token.replace(/['"]+/g, '').trim();
  }
  return null;
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

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
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
      body: isFormData ? (body as FormData) : (body ? JSON.stringify(body) : undefined),
      ...init,
    });
  } catch (networkError) {
    throw new ApiError(
      'NETWORK_ERROR',
      'Failed to connect to the server. Please check your internet connection.',
      0
    );
  }

  // Handle 401 Unauthorized
  if (response.status === 401) {
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
      response.status,
      data.error?.details ?? null
    );
  }

  return data.data as T;
}

/**
 * Server-side request (for use in Server Components)
 * Accepts an explicit token to forward authorization headers.
 */
export async function requestServer<T>(
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
    const cleanToken = token.replace(/['"]+/g, '').trim();
    headers['Authorization'] = `Bearer ${cleanToken}`;
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
      response.status,
      data.error?.details ?? null
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

export async function getBooksServer(token: string | null, params?: { subject?: string; board?: string; grade?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.subject) searchParams.set('subject', params.subject);
  if (params?.board) searchParams.set('board', params.board);
  if (params?.grade) searchParams.set('grade', params.grade);
  const query = searchParams.toString();
  return requestServer<any>('GET', `/books${query ? `?${query}` : ''}`, token);
}

export async function getBookBySubjectServer(token: string | null, subjectSlug: string) {
  const data = await requestServer<any>('GET', `/books/slug/${encodeURIComponent(subjectSlug)}`, token);
  return {
    boardSlug: data.board_slug,
    programSlug: data.program_slug,
    grade: data.grade,
  };
}

function gradeToProgramSlug(grade: string): string {
  const gradeNum = parseInt(grade, 10);
  if (gradeNum >= 9 && gradeNum <= 10) return `matric-${gradeNum}`;
  if (gradeNum >= 11 && gradeNum <= 12) return `intermediate-${gradeNum}`;
  if (gradeNum >= 1 && gradeNum <= 5) return `primary-${gradeNum}`;
  if (gradeNum >= 6 && gradeNum <= 8) return `middle-${gradeNum}`;
  return grade;
}

export async function getTopicByNestedSlugsServer(
  token: string | null,
  board: string,
  grade: string,
  subject: string,
  chapter: string,
  topic: string
) {
  const program = gradeToProgramSlug(grade);
  const path = `/topics/by-nested-slug/${encodeURIComponent(board)}/${encodeURIComponent(program)}/${encodeURIComponent(subject)}/${encodeURIComponent(chapter)}/${encodeURIComponent(topic)}`;
  
  try {
    const result = await requestServer<{
      topic: any;
      previousTopic: any | null;
      nextTopic: any | null;
      book: any;
      program: any;
      chapter: any;
    }>("GET", path, token);
    
    return result;
  } catch (err) {
    const fallbackPath = `/topics/by-nested-slug/${encodeURIComponent(board)}/${encodeURIComponent(grade)}/${encodeURIComponent(subject)}/${encodeURIComponent(chapter)}/${encodeURIComponent(topic)}`;
    try {
      const result = await requestServer<any>("GET", fallbackPath, token);
      return result;
    } catch {
      throw err;
    }
  }
}
