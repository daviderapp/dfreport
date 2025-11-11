import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth';

/**
 * Export della funzione auth per NextAuth v5
 */
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
