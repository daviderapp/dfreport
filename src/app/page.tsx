import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';

/**
 * Pagina principale - reindirizza a dashboard o login
 */
export default async function HomePage() {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
