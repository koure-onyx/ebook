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

// Server-side request (for use in Server Components)
async function requestServer<T>(
  method: string,
  path: string,
  token: string | null,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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

// Named API functions matching backend endpoints

export async function getBooks(params?: { subject?: string; board?: string; grade?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.subject) searchParams.set('subject', params.subject);
  if (params?.board) searchParams.set('board', params.board);
  if (params?.grade) searchParams.set('grade', params.grade);
  const query = searchParams.toString();
  return request<any[]>('GET', `/books${query ? `?${query}` : ''}`);
}

export async function getBooksServer(token: string | null, params?: { subject?: string; board?: string; grade?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.subject) searchParams.set('subject', params.subject);
  if (params?.board) searchParams.set('board', params.board);
  if (params?.grade) searchParams.set('grade', params.grade);
  const query = searchParams.toString();
  return requestServer<any[]>('GET', `/books${query ? `?${query}` : ''}`, token);
}

export async function searchContent(query: string) {
  return request<{ query: string; results: any[]; count: number }>('GET', `/search?q=${encodeURIComponent(query)}`);
}

export async function getDashboard() {
  return request<{
    welcome_message: string;
    stats: any;
    recent_activity: any[];
    recommendations: any[];
  }>('GET', '/dashboard');
}

export async function getDashboardServer(token: string | null) {
  return requestServer<{
    welcome_message: string;
    stats: any;
    recent_activity: any[];
    recommendations: any[];
  }>('GET', '/dashboard', token);
}

export async function getProgress() {
  return request<{
    user_id: string;
    total_books_read: number;
    books_in_progress: number;
    total_topics_studied: number;
    quiz_scores: any[];
    weekly_activity: any[];
    mastery_levels: Record<string, string>;
  }>('GET', '/progress');
}

export async function getVault() {
  return request<{
    user_id: string;
    items_count: number;
    items: any[];
  }>('GET', '/vault');
}

export async function getVaultItem(id: string) {
  return request<any>('GET', `/vault/${id}`);
}

export async function saveToVault(payload: { topicId: string; type: string; content: any }) {
  return request<any>('POST', '/vault', payload);
}

export async function deleteVaultItem(id: string) {
  return request<void>('DELETE', `/vault/${id}`);
}

export async function getAICredits() {
  return request<{
    user_id: string;
    credit_type: string;
    balance: number;
    monthly_limit: number;
    used_this_month: number;
  }>('GET', '/user/credits');
}

export async function getTopicBySlug(subjectSlug: string, chapterNumber: string, topicSlug: string) {
  return request<{
    topic: any;
    previousTopic: { _id: string; title: string; slug: string; chapterSlug?: string } | null;
    nextTopic: { _id: string; title: string; slug: string; chapterSlug?: string } | null;
    book: any;
    program: any;
    chapter: any;
  }>('GET', `/topics/by-slug/${subjectSlug}/${chapterNumber}/${topicSlug}`);
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

export async function getChapterTopics(chapterId: string) {
  return request<any[]>('GET', `/chapters/${chapterId}/topics`);
}

export async function generateAIExplanation(topicId: string, content: string) {
  return streamSSE('/ai/explain', { topicId, content }, 
    (text) => console.log('chunk:', text),
    () => console.log('done')
  );
}

export async function generateFlashcards(topicId: string) {
  return request<any[]>('POST', '/ai/flashcards', { topicId });
}

export async function generateQuizQuestions(topicId: string) {
  return request<any[]>('POST', '/ai/generate-questions', { topicId });
}

export async function markTopicRead(topicId: string) {
  return request<{ success: boolean; xp_earned: number }>('POST', '/progress/mark-read', { topicId });
}

export async function submitQuizScore(topicId: string, score: number, answers: any[]) {
  return request<{ success: boolean; xp_earned: number; mastery_status: string }>(
    'POST', 
    '/quiz/score', 
    { topicId, score, answers }
  );
}

export async function getQuranWords(topicId: string) {
  return request<any[]>('GET', `/topics/${topicId}/quran-words`);
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>('GET', path, undefined, init),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  stream: streamSSE,
};

// Additional server-side functions
export async function getProgressServer(token: string | null) {
  return requestServer<{
    user_id: string;
    total_books_read: number;
    books_in_progress: number;
    total_topics_studied: number;
    quiz_scores: any[];
    weekly_activity: any[];
    mastery_levels: Record<string, string>;
  }>('GET', '/progress', token);
}

export async function getVaultServer(token: string | null) {
  return requestServer<{
    user_id: string;
    items_count: number;
    items: any[];
  }>('GET', '/vault', token);
}

export async function getChapterProgress(chapterId: string, token: string | null) {
  return requestServer<any>('GET', `/progress/chapter/${chapterId}`, token);
}

export async function getPublicTopicBySlug(subject: string, chapter: string, topic: string) {
  return request<any>('GET', `/topics/public/by-slug/${subject}/${chapter}/${topic}`);
}

export async function getCheckoutPlans(token: string | null) {
  if (token) {
    return requestServer<any[]>('GET', '/checkout/plans', token);
  }
  return requestServer<any[]>('GET', '/checkout/plans', null);
}
