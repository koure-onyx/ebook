import { getSession, signOut } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

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

export async function streamSSE(
  path: string,
  body: unknown,
  onChunk: (text: string) => void,
  onDone: () => void
): Promise<void> {
  const token = await getTokenFromSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      await signOut({ callbackUrl: '/' });
    }
    const data = await response.json();
    throw new ApiError(
      data.error?.code || 'STREAM_ERROR',
      data.error?.message || response.statusText,
      response.status
    );
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          onDone();
          return;
        }
        onChunk(data);
      }
    }
  }
}

// --- API Methods ---

export async function getBooks(params?: { subject?: string; board?: string; grade?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.subject) searchParams.set('subject', params.subject);
  if (params?.board) searchParams.set('board', params.board);
  if (params?.grade) searchParams.set('grade', params.grade);
  const query = searchParams.toString();
  return request<any>('GET', `/books${query ? `?${query}` : ''}`);
}

export async function getBooksServer(token: string | null, params?: { subject?: string; board?: string; grade?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.subject) searchParams.set('subject', params.subject);
  if (params?.board) searchParams.set('board', params.board);
  if (params?.grade) searchParams.set('grade', params.grade);
  const query = searchParams.toString();
  return requestServer<any>('GET', `/books${query ? `?${query}` : ''}`, token);
}

// Get book by subject slug (for legacy route redirect)
export async function getBookBySubject(subjectSlug: string) {
  const data = await request<any>('GET', `/books/slug/${encodeURIComponent(subjectSlug)}`);
  return {
    boardSlug: data.board_slug,
    programSlug: data.program_slug,
    grade: data.grade,
  };
}

export async function searchContent(query: string) {
  return request<{ query: string; results: any[]; count: number }>('GET', `/search?q=${encodeURIComponent(query)}`);
}

export async function getDashboardServer(token: string | null) {
  return requestServer<any>('GET', '/dashboard/student', token);
}

export async function getProgressServer(token: string | null) {
  return requestServer<any>('GET', '/progress/stats', token);
}

export async function getVaultServer(token: string | null) {
  return requestServer<any>('GET', '/vault', token);
}

export async function getAICredits() {
  return request<{
    user_id: string;
    credit_type: string;
    balance: number;
    monthly_limit: number;
    used_this_month: number;
  }>('GET', '/ai/credits');
}


/**
 * Get topic by nested slugs matching the catch-all route structure
 * Maps grade (e.g., "9") to programSlug (e.g., "matric-9")
 */
function gradeToProgramSlug(grade: string): string {
  const gradeNum = parseInt(grade, 10);
  
  // Matric grades (9-10)
  if (gradeNum >= 9 && gradeNum <= 10) {
    return `matric-${gradeNum}`;
  }
  
  // Intermediate/FSc grades (11-12)
  if (gradeNum >= 11 && gradeNum <= 12) {
    return `intermediate-${gradeNum}`;
  }
  
  // Primary grades (1-5)
  if (gradeNum >= 1 && gradeNum <= 5) {
    return `primary-${gradeNum}`;
  }
  
  // Middle grades (6-8)
  if (gradeNum >= 6 && gradeNum <= 8) {
    return `middle-${gradeNum}`;
  }
  
  // Fallback: use grade as-is if no mapping found
  return grade;
}

export async function getTopicByNestedSlugs(
  board: string,
  grade: string,
  subject: string,
  chapter: string,
  topic: string
) {
  const program = gradeToProgramSlug(grade);
  const path = `/topics/by-nested-slug/${encodeURIComponent(board)}/${encodeURIComponent(program)}/${encodeURIComponent(subject)}/${encodeURIComponent(chapter)}/${encodeURIComponent(topic)}`;
  
  const response = await request<{
    success: boolean;
    data: {
      topic: any;
      previousTopic: any | null;
      nextTopic: any | null;
      book: any;
      program: any;
      chapter: any;
    };
  }>("GET", path);
  
  if (!response.success) {
    throw new ApiError("TOPIC_NOT_FOUND", "Topic not found", 404);
  }
  
  return response.data;
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
  
  const response = await requestServer<{
    success: boolean;
    data: {
      topic: any;
      previousTopic: any | null;
      nextTopic: any | null;
      book: any;
      program: any;
      chapter: any;
    };
  }>("GET", path, token);
  
  if (!response.success) {
    throw new ApiError("TOPIC_NOT_FOUND", "Topic not found", 404);
  }
  
  return response.data;
}

export async function getTopicBySlugServer(token: string | null, subjectSlug: string, chapterNumber: string, topicSlug: string) {
  return requestServer<any>('GET', `/topics/slug/${encodeURIComponent(`${subjectSlug}/${chapterNumber}/${topicSlug}`)}`, token);
}

export async function getTopicById(id: string) {
  return request<any>('GET', `/topics/${id}`);
}

export async function getAdjacentTopics(topicId: string) {
  return request<{
    previousTopic: { _id: string; title: string; slug: string } | null;
    nextTopic: { _id: string; title: string; slug: string } | null;
  }>('GET', `/topics/${topicId}/adjacent`);
}

export async function generateFlashcards(topicId: string) {
  return request<any[]>('POST', `/ai/flashcards`, { topicId });
}

export async function generateFlashcardsServer(token: string | null, topicId: string) {
  return requestServer<any[]>('POST', `/ai/flashcards`, token, { topicId });
}

export async function markTopicRead(topicId: string) {
  return request<{ success: boolean; xp_earned: number }>('POST', '/progress/mark-read', { topicId });
}

export async function markTopicReadServer(token: string | null, topicId: string) {
  return requestServer<{ success: boolean; xp_earned: number }>('POST', '/progress/mark-read', token, { topicId });
}

export async function submitQuizScore(topicId: string, score: number, answers: any[]) {
  return request<{ success: boolean; xp_earned: number; mastery_status: string }>(
    'POST',
    `/quizzes/topic/${topicId}/submit`,
    { topicId, score, answers }
  );
}

export async function submitQuizScoreServer(token: string | null, topicId: string, score: number, answers: any[]) {
  return requestServer<{ success: boolean; xp_earned: number; mastery_status: string }>(
    'POST',
    `/quizzes/topic/${topicId}/submit`,
    token,
    { topicId, score, answers }
  );
}

// Quiz questions - uses /quizzes/topic/:topicId/random for AI-generated questions
export async function generateQuizQuestionsServer(token: string | null, topicId: string, count: number = 5) {
  return requestServer<{ questions: any[] }>('GET', `/quizzes/topic/${topicId}/random?limit=${count}`, token);
}

export async function searchContentServer(token: string | null, query: string) {
  return requestServer<{ books: any[]; topics: any[]; quran: any[] }>('GET', `/search?q=${encodeURIComponent(query)}`, token);
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>('GET', path, undefined, init),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  stream: streamSSE,
};
