import { UserRole } from '@/types/user.types';
import { MembroFamiglia } from '@/types/famiglia.types';

/**
 * Verifica se un utente ha un determinato ruolo in una famiglia
 */
export function hasRole(membro: MembroFamiglia | null, ...roles: UserRole[]): boolean {
  if (!membro) return false;
  return roles.includes(membro.ruolo);
}

/**
 * Verifica se un utente è capofamiglia
 */
export function isCapofamiglia(membro: MembroFamiglia | null): boolean {
  return hasRole(membro, UserRole.CAPOFAMIGLIA);
}

/**
 * Verifica se un utente può gestire abitazioni e contratti
 * (Capofamiglia o Lavoratore)
 */
export function canManageHousing(membro: MembroFamiglia | null): boolean {
  return hasRole(membro, UserRole.CAPOFAMIGLIA, UserRole.LAVORATORE);
}

/**
 * Verifica se un utente può visualizzare i movimenti della famiglia
 */
export function canViewMovimenti(membro: MembroFamiglia | null): boolean {
  return hasRole(membro, UserRole.CAPOFAMIGLIA, UserRole.LAVORATORE, UserRole.MEMBRO);
}

/**
 * Verifica se un utente può creare movimenti
 */
export function canCreateMovimenti(membro: MembroFamiglia | null): boolean {
  return hasRole(membro, UserRole.CAPOFAMIGLIA, UserRole.LAVORATORE, UserRole.MEMBRO);
}

/**
 * Verifica se un utente può gestire gli introiti
 * (solo Capofamiglia e Lavoratore)
 */
export function canManageIntroiti(membro: MembroFamiglia | null): boolean {
  return hasRole(membro, UserRole.CAPOFAMIGLIA, UserRole.LAVORATORE);
}

/**
 * Verifica se un utente può gestire i membri della famiglia
 * (solo Capofamiglia)
 */
export function canManageMembers(membro: MembroFamiglia | null): boolean {
  return isCapofamiglia(membro);
}

/**
 * Errore di autorizzazione
 */
export class AuthorizationError extends Error {
  constructor(message: string = 'Non hai i permessi per eseguire questa operazione') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Verifica l'autorizzazione e lancia un errore se non autorizzato
 */
export function requireRole(membro: MembroFamiglia | null, ...roles: UserRole[]): void {
  if (!hasRole(membro, ...roles)) {
    throw new AuthorizationError();
  }
}
