import { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MySQLUserRepository } from '@/repositories/mysql/UserRepository';
import { MySQLFamigliaRepository } from '@/repositories/mysql/FamigliaRepository';
import { LoginSchema } from '@/lib/validation';
import bcrypt from 'bcryptjs';

/**
 * Configurazione NextAuth per l'autenticazione
 * Utilizza Credentials Provider con MySQL
 */
export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Valida le credenziali
          const validatedData = LoginSchema.parse(credentials);

          // Crea repository
          const userRepository = new MySQLUserRepository();

          // Trova l'utente
          const user = await userRepository.findByEmail(validatedData.email);
          if (!user) {
            return null;
          }

          // Verifica la password
          const isPasswordValid = await bcrypt.compare(
            validatedData.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Ritorna l'utente senza la password
          return {
            id: user.id,
            email: user.email,
            name: `${user.nome} ${user.cognome}`,
            nome: user.nome,
            cognome: user.cognome,
          };
        } catch (error) {
          console.error('Errore durante l\'autenticazione:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Aggiungi informazioni personalizzate al token
      if (user) {
        token.id = user.id;
        token.nome = (user as any).nome;
        token.cognome = (user as any).cognome;
      }

      // Aggiorna famigliaId ad ogni refresh del token
      if (token.id) {
        const famigliaRepo = new MySQLFamigliaRepository();
        const famiglie = await famigliaRepo.findByUserId(token.id as string);
        token.famigliaId = famiglie.length > 0 ? famiglie[0].id : null;
      }

      return token;
    },
    async session({ session, token }) {
      // Aggiungi informazioni personalizzate alla sessione
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).nome = token.nome;
        (session.user as any).cognome = token.cognome;
        (session.user as any).famigliaId = token.famigliaId;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 ore
  },
  secret: process.env.NEXTAUTH_SECRET,
};
