import { UserRole } from './user.types';

/**
 * Interfaccia per una Famiglia
 */
export interface Famiglia {
  id: string;
  cognomeFamiliare: string;
  codiceInvito: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interfaccia per il collegamento tra Utente e Famiglia (con ruolo)
 */
export interface MembroFamiglia {
  userId: string;
  famigliaId: string;
  ruolo: UserRole;
  joinedAt: Date;
}

/**
 * DTO per la creazione di una nuova famiglia
 */
export interface CreateFamigliaDTO {
  cognomeFamiliare: string;
  capofamigliaId: string;
}

/**
 * DTO per aderire a una famiglia esistente
 */
export interface JoinFamigliaDTO {
  codiceInvito: string;
  userId: string;
}

/**
 * DTO per aggiornare il ruolo di un membro
 */
export interface UpdateRuoloMembroDTO {
  famigliaId: string;
  userId: string;
  nuovoRuolo: UserRole;
  richiedenteId: string; // deve essere capofamiglia
}

/**
 * Famiglia con i suoi membri (per risposta API)
 */
export interface FamigliaConMembri extends Famiglia {
  membri: Array<{
    userId: string;
    nome: string;
    cognome: string;
    email: string;
    ruolo: UserRole;
    joinedAt: Date;
  }>;
}
