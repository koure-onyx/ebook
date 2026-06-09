import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { LoginClient } from './login-client';

export default async function LoginPage() {
  // Check if already authenticated
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken');
  
  if (accessToken) {
    redirect('/dashboard');
  }

  return <LoginClient />;
}
