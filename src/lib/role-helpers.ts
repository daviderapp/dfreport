import { UserRole } from '@/types/user.types';

/**
 * Verifica se un utente ha un determinato ruolo o superiore
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    MINORE: 1,
    ADULTO: 2,
    CAPOFAMIGLIA: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Verifica se l'utente è un Capofamiglia
 */
export function isCapofamiglia(userRole: UserRole): boolean {
  return userRole === 'CAPOFAMIGLIA';
}

/**
 * Verifica se l'utente è un Lavoratore
 * Nota: Nel database abbiamo un campo separato 'isLavoratore'
 */
export function isLavoratore(isLavoratore: boolean): boolean {
  return isLavoratore;
}

/**
 * Verifica se l'utente è un Membro (qualsiasi ruolo in una famiglia)
 */
export function isMembro(hasFamiglia: boolean): boolean {
  return hasFamiglia;
}

/**
 * Ottiene le route accessibili per un determinato ruolo
 */
export function getAccessibleRoutes(
  userRole: UserRole | null,
  hasFamiglia: boolean,
  isLavoratore: boolean
): string[] {
  const routes: string[] = [];

  // Route base per tutti gli utenti autenticati
  routes.push('/profilo');

  // Se non ha famiglia, può solo creare o aderire
  if (!hasFamiglia) {
    routes.push('/famiglia/nuova');
    routes.push('/famiglia/join');
    return routes;
  }

  // Route per tutti i membri di una famiglia
  if (hasFamiglia) {
    routes.push('/dashboard');
    routes.push('/famiglia');
    routes.push('/famiglia/join'); // Per aderire a un'altra famiglia
    // Consulta Abitazioni e Contratti (da implementare)
    // Consulta Report (da implementare)
  }

  // Route aggiuntive per Lavoratori
  if (isLavoratore) {
    routes.push('/introiti'); // View Lavoratore (da implementare)
  }

  // Route aggiuntive per Capofamiglia
  if (userRole === 'CAPOFAMIGLIA') {
    routes.push('/famiglia/nuova'); // Può creare altre famiglia
    routes.push('/famiglia/membri'); // Gestione membri
    routes.push('/famiglia/abitazioni'); // Gestione abitazioni (da implementare)
    routes.push('/famiglia/contratti'); // Gestione contratti (da implementare)
  }

  return routes;
}

/**
 * Tipi di permessi per le operazioni
 */
export enum Permission {
  // Gestione Famiglia
  CREATE_FAMIGLIA = 'CREATE_FAMIGLIA',
  JOIN_FAMIGLIA = 'JOIN_FAMIGLIA',
  LEAVE_FAMIGLIA = 'LEAVE_FAMIGLIA',

  // Gestione Membri (solo Capofamiglia)
  MANAGE_MEMBRI = 'MANAGE_MEMBRI',
  REMOVE_MEMBRO = 'REMOVE_MEMBRO',
  ASSIGN_LAVORATORE = 'ASSIGN_LAVORATORE',
  REVOKE_LAVORATORE = 'REVOKE_LAVORATORE',
  REGENERATE_CODICE_INVITO = 'REGENERATE_CODICE_INVITO',

  // Gestione Abitazioni (solo Capofamiglia)
  CREATE_ABITAZIONE = 'CREATE_ABITAZIONE',
  DELETE_ABITAZIONE = 'DELETE_ABITAZIONE',
  VIEW_ABITAZIONI = 'VIEW_ABITAZIONI',

  // Gestione Contratti (solo Capofamiglia)
  CREATE_CONTRATTO = 'CREATE_CONTRATTO',
  DELETE_CONTRATTO = 'DELETE_CONTRATTO',
  VIEW_CONTRATTI = 'VIEW_CONTRATTI',

  // Gestione Spese (tutti i membri)
  CREATE_SPESA = 'CREATE_SPESA',
  DELETE_OWN_SPESA = 'DELETE_OWN_SPESA',
  DELETE_FAMIGLIA_SPESA = 'DELETE_FAMIGLIA_SPESA',
  VIEW_OWN_SPESE = 'VIEW_OWN_SPESE',

  // Gestione Introiti (solo Lavoratori)
  CREATE_INTROITO = 'CREATE_INTROITO',
  DELETE_INTROITO = 'DELETE_INTROITO',
  VIEW_INTROITI = 'VIEW_INTROITI',

  // Report (tutti i membri)
  VIEW_REPORT = 'VIEW_REPORT',
  FILTER_MOVIMENTI = 'FILTER_MOVIMENTI',

  // Profilo
  MANAGE_PROFILE = 'MANAGE_PROFILE',
}

/**
 * Verifica se un utente ha un determinato permesso
 */
export function hasPermission(
  permission: Permission,
  userRole: UserRole | null,
  hasFamiglia: boolean,
  isLavoratore: boolean,
  isOwner?: boolean // Per operazioni su risorse proprie
): boolean {
  // Permessi base
  if (permission === Permission.MANAGE_PROFILE) {
    return true; // Tutti possono gestire il proprio profilo
  }

  if (permission === Permission.CREATE_FAMIGLIA) {
    return true; // Tutti possono creare una famiglia
  }

  if (permission === Permission.JOIN_FAMIGLIA) {
    return true; // Tutti possono aderire a una famiglia
  }

  // Richiede di appartenere a una famiglia
  if (!hasFamiglia) {
    return false;
  }

  // Permessi per membri
  const membroPermissions = [
    Permission.LEAVE_FAMIGLIA,
    Permission.VIEW_ABITAZIONI,
    Permission.VIEW_CONTRATTI,
    Permission.CREATE_SPESA,
    Permission.DELETE_OWN_SPESA,
    Permission.VIEW_OWN_SPESE,
    Permission.VIEW_REPORT,
    Permission.FILTER_MOVIMENTI,
  ];

  if (membroPermissions.includes(permission)) {
    return true;
  }

  // Permessi per lavoratori
  const lavoratorePermissions = [
    Permission.CREATE_INTROITO,
    Permission.DELETE_INTROITO,
    Permission.VIEW_INTROITI,
  ];

  if (lavoratorePermissions.includes(permission) && isLavoratore) {
    return true;
  }

  // Permessi solo per capofamiglia
  const capofamigliaPermissions = [
    Permission.MANAGE_MEMBRI,
    Permission.REMOVE_MEMBRO,
    Permission.ASSIGN_LAVORATORE,
    Permission.REVOKE_LAVORATORE,
    Permission.REGENERATE_CODICE_INVITO,
    Permission.CREATE_ABITAZIONE,
    Permission.DELETE_ABITAZIONE,
    Permission.CREATE_CONTRATTO,
    Permission.DELETE_CONTRATTO,
    Permission.DELETE_FAMIGLIA_SPESA,
  ];

  if (capofamigliaPermissions.includes(permission) && userRole === 'CAPOFAMIGLIA') {
    return true;
  }

  return false;
}
