/**
 * Enum per il tipo di movimento
 */
export enum TipoMovimento {
  SPESA = 'SPESA',
  INTROITO = 'INTROITO'
}

/**
 * Enum per il responsabile della spesa
 */
export enum ResponsabileSpesa {
  PERSONALE = 'PERSONALE',
  FAMILIARE = 'FAMILIARE'
}

/**
 * Enum per le categorie di spesa (predefinite)
 */
export enum CategoriaSpesa {
  ALIMENTARI = 'ALIMENTARI',
  TRASPORTI = 'TRASPORTI',
  ABITAZIONI = 'ABITAZIONI',
  SALUTE = 'SALUTE',
  SVAGO = 'SVAGO',
  ISTRUZIONE = 'ISTRUZIONE',
  IMPOSTE = 'IMPOSTE',
  ANIMALI = 'ANIMALI',
  STRAORDINARIE = 'STRAORDINARIE'
}

/**
 * Enum per le categorie di introito (predefinite)
 */
export enum CategoriaIntroito {
  REDDITO = 'REDDITO',
  OCCASIONALI = 'OCCASIONALI',
  SUSSIDI = 'SUSSIDI',
  INTERESSI = 'INTERESSI'
}

/**
 * Union type per tutte le categorie
 */
export type Categoria = CategoriaSpesa | CategoriaIntroito;

/**
 * Interfaccia per una Categoria con metadati (per visualizzazione)
 */
export interface CategoriaConMetadati {
  nome: Categoria;
  tipo: TipoMovimento;
  colore: string; // per i grafici
}

/**
 * Interfaccia base per un movimento (spesa o introito)
 */
export interface Movimento {
  id: string;
  famigliaId: string;
  userId: string; // chi ha registrato il movimento
  tipo: TipoMovimento;
  descrizione: string;
  importo: number;
  data: Date;
  categoria: Categoria;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interfaccia per una Spesa
 */
export interface Spesa extends Movimento {
  tipo: TipoMovimento.SPESA;
  responsabile: ResponsabileSpesa;
}

/**
 * Interfaccia per un Introito
 */
export interface Introito extends Movimento {
  tipo: TipoMovimento.INTROITO;
}

/**
 * DTO per creare una spesa
 */
export interface CreateSpesaDTO {
  famigliaId: string;
  userId: string;
  descrizione: string;
  importo: number;
  data: Date;
  categoria: CategoriaSpesa;
  responsabile: ResponsabileSpesa;
}

/**
 * DTO per creare un introito
 */
export interface CreateIntroitoDTO {
  famigliaId: string;
  userId: string;
  descrizione: string;
  importo: number;
  data: Date;
  categoria: CategoriaIntroito;
}

/**
 * Filtri per la ricerca di movimenti
 */
export interface MovimentoFilters {
  famigliaId: string;
  tipo?: TipoMovimento[];
  categorie?: Categoria[];
  importoMin?: number;
  importoMax?: number;
  responsabile?: ResponsabileSpesa;
  userId?: string;
  dataInizio?: Date;
  dataFine?: Date;
}

/**
 * Movimento con informazioni aggiuntive (per visualizzazione)
 */
export interface MovimentoConDettagli extends Movimento {
  nomeUtente: string;
  cognomeUtente: string;
  coloreCategoria: string;
  responsabile?: ResponsabileSpesa; // solo per spese
}

/**
 * Statistiche per categoria
 */
export interface StatisticaCategoria {
  categoria: Categoria;
  colore: string;
  totale: number;
  numeroMovimenti: number;
  percentuale: number;
}

/**
 * Bilancio mensile
 */
export interface BilancioMensile {
  mese: number;
  anno: number;
  totaleIntroiti: number;
  totaleSpese: number;
  saldo: number;
}
