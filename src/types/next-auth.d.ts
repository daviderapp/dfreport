import 'next-auth';
import 'next-auth/jwt';

/**
 * Estende i tipi di NextAuth per includere campi personalizzati
 */
declare module 'next-auth' {
  interface User {
    id: string;
    nome: string;
    cognome: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      nome: string;
      cognome: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    nome: string;
    cognome: string;
  }
}
