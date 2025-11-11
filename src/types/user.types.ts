/**
 * Enumerazione dei ruoli utente
 */
export enum UserRole {
  UTENTE = 'UTENTE',
  MEMBRO = 'MEMBRO',
  LAVORATORE = 'LAVORATORE',
  CAPOFAMIGLIA = 'CAPOFAMIGLIA'
}

/**
 * Interfaccia base per un Utente registrato
 */
export interface User {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  dataNascita: Date;
  password: string; // hash
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO per la registrazione di un nuovo utente
 */
export interface RegisterUserDTO {
  nome: string;
  cognome: string;
  email: string;
  dataNascita: Date;
  password: string;
}

/**
 * DTO per il login
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Utente senza dati sensibili (per risposta API)
 */
export type PublicUser = Omit<User, 'password'>;
