import { api } from './client';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  avatar?: string;
  onboardingCompleted?: boolean;
}

export async function getMe(): Promise<User | null> {
  try {
    const data = await api.get<{ user: User }>('/auth/me');
    return data.user;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<{ user: User }> {
  return api.post<{ user: User }>('/auth/login', { email, password });
}

export async function signup(
  email: string,
  password: string,
  name: string
): Promise<{ user: User }> {
  return api.post<{ user: User }>('/auth/signup', { email, password, name });
}

export async function logout(): Promise<void> {
  return api.post('/auth/logout');
}

export async function googleAuth(): Promise<void> {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/google`;
}
