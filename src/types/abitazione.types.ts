/**
 * Interfaccia per un'Abitazione
 */
export interface Abitazione {
  id: string;
  famigliaId: string;
  nomeAbitazione: string;
  indirizzo: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  descrizione?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO per la creazione di una nuova abitazione
 */
export interface CreateAbitazioneDTO {
  famigliaId: string;
  nomeAbitazione: string;
  indirizzo: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  descrizione?: string;
  richiedenteId: string; // deve essere capofamiglia
}

/**
 * DTO per l'aggiornamento di un'abitazione
 */
export interface UpdateAbitazioneDTO {
  id: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  descrizione?: string;
  richiedenteId: string; // deve essere capofamiglia
}
