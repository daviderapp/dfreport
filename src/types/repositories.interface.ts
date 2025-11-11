import { User, RegisterUserDTO, PublicUser } from './user.types';
import { Famiglia, MembroFamiglia, FamigliaConMembri } from './famiglia.types';
import { Abitazione } from './abitazione.types';
import { ContrattoUtenza } from './contratto.types';
import { Movimento, MovimentoConDettagli, MovimentoFilters, StatisticaCategoria, BilancioMensile } from './movimento.types';

/**
 * Interfaccia per il Repository degli Utenti (Dependency Inversion)
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: RegisterUserDTO): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

/**
 * Interfaccia per il Repository delle famiglia
 */
export interface IFamigliaRepository {
  findById(id: string): Promise<Famiglia | null>;
  findByCodiceInvito(codice: string): Promise<Famiglia | null>;
  findByUserId(userId: string): Promise<Famiglia[]>;
  findConMembri(famigliaId: string): Promise<FamigliaConMembri | null>;
  create(cognomeFamiliare: string): Promise<Famiglia>;
  delete(id: string): Promise<void>;

  // Gestione membri
  addMembro(membroFamiglia: MembroFamiglia): Promise<void>;
  removeMembro(userId: string, famigliaId: string): Promise<void>;
  updateRuoloMembro(userId: string, famigliaId: string, nuovoRuolo: string): Promise<void>;
  getMembro(userId: string, famigliaId: string): Promise<MembroFamiglia | null>;
  getMembri(famigliaId: string): Promise<MembroFamiglia[]>;
}

/**
 * Interfaccia per il Repository delle Abitazioni
 */
export interface IAbitazioneRepository {
  findById(id: string): Promise<Abitazione | null>;
  findByFamigliaId(famigliaId: string): Promise<Abitazione[]>;
  create(abitazione: Omit<Abitazione, 'id' | 'createdAt' | 'updatedAt'>): Promise<Abitazione>;
  update(id: string, data: Partial<Abitazione>): Promise<Abitazione>;
  delete(id: string): Promise<void>;
}

/**
 * Interfaccia per il Repository dei Contratti
 */
export interface IContrattoRepository {
  findById(id: string): Promise<ContrattoUtenza | null>;
  findByAbitazioneId(abitazioneId: string): Promise<ContrattoUtenza[]>;
  findByFamigliaId(famigliaId: string): Promise<ContrattoUtenza[]>;
  create(contratto: Omit<ContrattoUtenza, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContrattoUtenza>;
  update(id: string, data: Partial<ContrattoUtenza>): Promise<ContrattoUtenza>;
  delete(id: string): Promise<void>;
}

/**
 * Interfaccia per il Repository dei Movimenti
 */
export interface IMovimentoRepository {
  findById(id: string): Promise<Movimento | null>;
  findByFamigliaId(famigliaId: string, filters?: MovimentoFilters): Promise<MovimentoConDettagli[]>;
  findByUserId(userId: string, mese: number, anno: number): Promise<Movimento[]>;
  create(movimento: Omit<Movimento, 'id' | 'createdAt' | 'updatedAt'>): Promise<Movimento>;
  update(id: string, data: Partial<Movimento>): Promise<Movimento>;
  delete(id: string): Promise<void>;

  // Statistiche
  getStatisticheCategorieSpese(famigliaId: string, mese: number, anno: number): Promise<StatisticaCategoria[]>;
  getStatisticheCategorieIntroiti(famigliaId: string, mese: number, anno: number): Promise<StatisticaCategoria[]>;
  getBilancioMensile(famigliaId: string, anno: number): Promise<BilancioMensile[]>;
}
