import { api, requestServer } from './client';

// Types
export interface Book {
  _id: string;
  title: string;
  subject?: string;
  subject_slug: string;
  board_id: string;
  program_id: string;
  grade: string;
  edition_year: number;
  is_live?: boolean;
  cover_image?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  _id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  slug: string;
  description?: string;
}

export interface Topic {
  _id: string;
  chapter_id: string;
  topic_number: number;
  title: string;
  slug: string;
  content_blocks: any[];
}

export interface AdminMetrics {
  total_books: number;
  total_chapters: number;
  total_topics: number;
  total_users: number;
  active_users_today: number;
  ingestion_queue_length: number;
}

export interface ContentHealth {
  books_with_no_chapters: number;
  chapters_with_no_topics: number;
  topics_with_no_content: number;
  orphaned_topics: number;
}

export interface IngestPayload {
  book_metadata: {
    title: string;
    subject: string;
    subject_slug: string;
    board: string;
    grade_level: string;
    edition_year: number;
    publisher?: string;
    authors?: string[];
    language?: string;
    script_direction?: string;
    cover_image?: string;
    description?: string;
  };
  chapter: {
    chapter_number: number;
    title: string;
    slug: string;
    chapter_number_display?: string;
    chapter_summary?: string;
    page_start?: number;
    page_end?: number;
    student_learning_outcomes?: string[];
    seo?: Record<string, any>;
  };
  topics: Array<{
    topic_number: number;
    title: string;
    slug: string;
    title_urdu?: string;
    display_order?: number;
    difficulty?: string;
    estimated_read_time?: number;
    edition_year?: number;
    seo?: Record<string, any>;
    raw_text?: string;
    clean_html?: string;
    content_blocks: any[];
    formulas?: any[];
    key_terms?: any[];
    book_mcqs?: any[];
    book_short_questions?: any[];
    book_problems?: any[];
    keywords?: string[];
  }>;
}

// Books API
export async function getBooks(params?: { boardId?: string; programId?: string; classLevel?: string; subject?: string; grade?: string; editionYear?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.boardId) searchParams.set('boardId', params.boardId);
  if (params?.programId) searchParams.set('programId', params.programId);
  if (params?.classLevel) searchParams.set('classLevel', params.classLevel);
  if (params?.subject) searchParams.set('subject', params.subject);
  if (params?.grade) searchParams.set('grade', params.grade);
  if (params?.editionYear) searchParams.set('editionYear', params.editionYear);
  const query = searchParams.toString();
  return api.get<{ books: Book[]; isAuthenticated: boolean }>(`/books${query ? `?${query}` : ''}`);
}

export async function getBooksServer(token: string | null, params?: { boardId?: string; programId?: string; classLevel?: string; subject?: string; grade?: string; editionYear?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.boardId) searchParams.set('boardId', params.boardId);
  if (params?.programId) searchParams.set('programId', params.programId);
  if (params?.classLevel) searchParams.set('classLevel', params.classLevel);
  if (params?.subject) searchParams.set('subject', params.subject);
  if (params?.grade) searchParams.set('grade', params.grade);
  if (params?.editionYear) searchParams.set('editionYear', params.editionYear);
  const query = searchParams.toString();
  return requestServer<{ books: Book[]; isAuthenticated: boolean }>('GET', `/books${query ? `?${query}` : ''}`, token);
}

export async function getBook(id: string) {
  return api.get<Book>(`/books/${id}`);
}

export async function getBookServer(token: string | null, id: string) {
  return requestServer<Book>('GET', `/books/${id}`, token);
}

export async function getBookBySlug(slug: string, editionYear?: string) {
  const query = editionYear ? `?editionYear=${encodeURIComponent(editionYear)}` : '';
  return api.get<Book>(`/books/slug/${encodeURIComponent(slug)}${query}`);
}

export async function getBookChapters(bookId: string) {
  return api.get<Chapter[]>(`/books/${bookId}/chapters`);
}

export async function createBook(bookData: Partial<Book>) {
  return api.post<Book>('/books', bookData);
}

export async function updateBook(id: string, updateData: Partial<Book>) {
  return api.put<Book>(`/books/${id}`, updateData);
}

export async function deleteBook(id: string) {
  return api.delete<void>(`/books/${id}`);
}

// Topics API
export async function getTopic(id: string) {
  return api.get<Topic>(`/topics/${id}`);
}

export async function getTopicBySlug(slug: string) {
  return api.get<Topic>(`/topics/slug/${encodeURIComponent(slug)}`);
}

export async function getTopicsByChapter(chapterId: string) {
  return api.get<Topic[]>(`/topics/chapter/${chapterId}`);
}

export async function getAdjacentTopics(topicId: string) {
  return api.get<{ previousTopic: Topic | null; nextTopic: Topic | null }>(`/topics/${topicId}/adjacent`);
}

// Ingestion API (Admin only)
export async function ingestBook(payload: IngestPayload) {
  return api.post<{ message: string; book: Book }>('/ingestion/book', payload);
}

export async function bulkIngestTopics(topics: any[]) {
  return api.post<{ message: string; count: number }>('/ingestion/topics/bulk', { topics });
}

export async function getIngestionStats() {
  return api.get<any>('/ingestion/stats');
}

// Dashboard API (Admin)
export async function getAdminDashboard() {
  return api.get<AdminMetrics>('/dashboard/admin');
}

export async function getAdminDashboardServer(token: string | null) {
  return requestServer<AdminMetrics>('GET', '/dashboard/admin', token);
}

export async function getContentHealth() {
  return api.get<ContentHealth>('/dashboard/admin/content-health');
}

export async function getContentHealthServer(token: string | null) {
  return requestServer<ContentHealth>('GET', '/dashboard/admin/content-health', token);
}

// Search API
export async function globalSearch(query: string) {
  return api.get<{ books: Book[]; topics: Topic[]; quran: any[] }>(`/search?q=${encodeURIComponent(query)}`);
}

export async function searchWithFilters(query: string, filters?: Record<string, string>) {
  const searchParams = new URLSearchParams({ q: query });
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => searchParams.set(key, value));
  }
  return api.get<any>(`/search/filtered?${searchParams.toString()}`);
}

export async function getSearchSuggestions(query: string) {
  return api.get<{ suggestions: string[] }>(`/search/suggestions?q=${encodeURIComponent(query)}`);
}

// Export all as grouped API
export const adminApi = {
  books: {
    list: getBooks,
    listServer: getBooksServer,
    get: getBook,
    getBySlug: getBookBySlug,
    getChapters: getBookChapters,
    create: createBook,
    update: updateBook,
    delete: deleteBook,
  },
  topics: {
    get: getTopic,
    getBySlug: getTopicBySlug,
    getByChapter: getTopicsByChapter,
    getAdjacent: getAdjacentTopics,
  },
  ingestion: {
    ingestBook,
    bulkIngestTopics,
    getStats: getIngestionStats,
  },
  dashboard: {
    getAdmin: getAdminDashboard,
    getAdminServer: getAdminDashboardServer,
    getContentHealth: getContentHealth,
    getContentHealthServer: getContentHealthServer,
  },
  search: {
    global: globalSearch,
    filtered: searchWithFilters,
    suggestions: getSearchSuggestions,
  },
};
