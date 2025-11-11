/**
 * Enum per il tipo di utenza
 */
export enum TipoUtenza {
  ELETTRICITA = 'ELETTRICITA',
  GAS = 'GAS',
  ACQUA = 'ACQUA',
  INTERNET = 'INTERNET',
  TELEFONO = 'TELEFONO',
  RIFIUTI = 'RIFIUTI',
  ALTRO = 'ALTRO'
}

/**
 * Enum per la periodicità del pagamento
 */
export enum Periodicita {
  MENSILE = 'MENSILE',
  BIMESTRALE = 'BIMESTRALE',
  TRIMESTRALE = 'TRIMESTRALE',
  SEMESTRALE = 'SEMESTRALE',
  ANNUALE = 'ANNUALE'
}

/**
 * Interfaccia per un Contratto di Utenza
 */
export interface ContrattoUtenza {
  id: string;
  abitazioneId: string;
  tipoUtenza: TipoUtenza;
  fornitore: string;
  pianoTariffario: string;
  dataInizio: Date;
  durataGiorni: number;
  costoPeriodico: number;
  periodicita: Periodicita;
  scadenzaPagamento?: Date;
  fileUrl?: string; // path al file PDF allegato
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO per la creazione di un contratto
 */
export interface CreateContrattoDTO {
  abitazioneId: string;
  tipoUtenza: TipoUtenza;
  fornitore: string;
  pianoTariffario: string;
  dataInizio: Date;
  durataGiorni: number;
  costoPeriodico: number;
  periodicita: Periodicita;
  scadenzaPagamento?: Date;
  richiedenteId: string; // deve essere capofamiglia
}

/**
 * DTO per l'aggiornamento di un contratto
 */
export interface UpdateContrattoDTO {
  id: string;
  tipoUtenza?: TipoUtenza;
  fornitore?: string;
  pianoTariffario?: string;
  dataInizio?: Date;
  durataGiorni?: number;
  costoPeriodico?: number;
  periodicita?: Periodicita;
  scadenzaPagamento?: Date;
  richiedenteId: string; // deve essere capofamiglia
}
