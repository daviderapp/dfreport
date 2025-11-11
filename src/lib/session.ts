import { auth } from '../../auth';

/**
 * Ottiene la sessione corrente dell'utente
 */
export async function getCurrentSession() {
  return await auth();
}

/**
 * Ottiene l'ID dell'utente corrente
 * @throws Error se l'utente non è autenticato
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    throw new Error('Utente non autenticato');
  }
  return session.user.id;
}

/**
 * Verifica se un utente è autenticato
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session?.user;
}
