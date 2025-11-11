import {
  IMovimentoRepository,
  IFamigliaRepository,
} from '@/types/repositories.interface';
import {
  Movimento,
  MovimentoConDettagli,
  MovimentoFilters,
  StatisticaCategoria,
  BilancioMensile,
  CreateSpesaDTO,
  CreateIntroitoDTO,
  TipoMovimento,
} from '@/types/movimento.types';
import { canCreateMovimenti, canViewMovimenti, AuthorizationError } from '@/lib/auth-helpers';

/**
 * Service per la gestione dei Movimenti (Spese e Introiti)
 */
export class MovimentoService {
  constructor(
    private movimentoRepository: IMovimentoRepository,
    private famigliaRepository: IFamigliaRepository
  ) {}

  /**
   * Crea una nuova spesa
   */
  async createSpesa(data: CreateSpesaDTO): Promise<Movimento> {
    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(data.userId, data.famigliaId);

    if (!canCreateMovimenti(membro)) {
      throw new AuthorizationError('Non hai i permessi per creare movimenti');
    }

    // Crea la spesa
    return this.movimentoRepository.create({
      famigliaId: data.famigliaId,
      userId: data.userId,
      tipo: TipoMovimento.SPESA,
      descrizione: data.descrizione,
      importo: data.importo,
      data: data.data,
      categoria: data.categoria,
    });
  }

  /**
   * Crea un nuovo introito
   */
  async createIntroito(data: CreateIntroitoDTO): Promise<Movimento> {
    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(data.userId, data.famigliaId);

    if (!canCreateMovimenti(membro)) {
      throw new AuthorizationError('Non hai i permessi per creare movimenti');
    }

    // Crea l'introito
    return this.movimentoRepository.create({
      famigliaId: data.famigliaId,
      userId: data.userId,
      tipo: TipoMovimento.INTROITO,
      descrizione: data.descrizione,
      importo: data.importo,
      data: data.data,
      categoria: data.categoria,
    });
  }

  /**
   * Ottiene un movimento per ID
   */
  async getById(id: string, richiedenteId: string): Promise<Movimento | null> {
    const movimento = await this.movimentoRepository.findById(id);
    if (!movimento) return null;

    // Verifica che il richiedente sia membro della famiglia
    const membro = await this.famigliaRepository.getMembro(
      richiedenteId,
      movimento.famigliaId
    );

    if (!canViewMovimenti(membro)) {
      throw new AuthorizationError('Non hai i permessi per visualizzare questo movimento');
    }

    return movimento;
  }

  /**
   * Ottiene tutti i movimenti di una famiglia con filtri opzionali
   */
  async getByFamigliaId(
    famigliaId: string,
    richiedenteId: string,
    filters?: Omit<MovimentoFilters, 'famigliaId'>
  ): Promise<MovimentoConDettagli[]> {
    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(richiedenteId, famigliaId);

    if (!canViewMovimenti(membro)) {
      throw new AuthorizationError('Non hai i permessi per visualizzare i movimenti');
    }

    // Ottieni i movimenti
    return this.movimentoRepository.findByFamigliaId(famigliaId, {
      famigliaId,
      ...filters,
    });
  }

  /**
   * Ottiene i movimenti di un utente per un mese specifico
   */
  async getByUserIdAndMonth(
    userId: string,
    mese: number,
    anno: number
  ): Promise<Movimento[]> {
    return this.movimentoRepository.findByUserId(userId, mese, anno);
  }

  /**
   * Aggiorna un movimento
   * Solo il creatore del movimento o il capofamiglia può aggiornarlo
   */
  async update(
    id: string,
    data: Partial<Movimento>,
    richiedenteId: string
  ): Promise<Movimento> {
    const movimento = await this.movimentoRepository.findById(id);
    if (!movimento) {
      throw new Error('Movimento non trovato');
    }

    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(
      richiedenteId,
      movimento.famigliaId
    );

    const isCreatore = movimento.userId === richiedenteId;
    const isCapofamiglia = membro?.ruolo === 'CAPOFAMIGLIA';

    if (!isCreatore && !isCapofamiglia) {
      throw new AuthorizationError(
        'Solo il creatore o il capofamiglia possono modificare questo movimento'
      );
    }

    return this.movimentoRepository.update(id, data);
  }

  /**
   * Elimina un movimento
   * Solo il creatore del movimento o il capofamiglia può eliminarlo
   */
  async delete(id: string, richiedenteId: string): Promise<void> {
    const movimento = await this.movimentoRepository.findById(id);
    if (!movimento) {
      throw new Error('Movimento non trovato');
    }

    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(
      richiedenteId,
      movimento.famigliaId
    );

    const isCreatore = movimento.userId === richiedenteId;
    const isCapofamiglia = membro?.ruolo === 'CAPOFAMIGLIA';

    if (!isCreatore && !isCapofamiglia) {
      throw new AuthorizationError(
        'Solo il creatore o il capofamiglia possono eliminare questo movimento'
      );
    }

    await this.movimentoRepository.delete(id);
  }

  // Statistiche e Report

  /**
   * Ottiene le statistiche per categoria delle spese
   */
  async getStatisticheCategorieSpese(
    famigliaId: string,
    richiedenteId: string,
    mese: number,
    anno: number
  ): Promise<StatisticaCategoria[]> {
    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(richiedenteId, famigliaId);

    if (!canViewMovimenti(membro)) {
      throw new AuthorizationError('Non hai i permessi per visualizzare le statistiche');
    }

    return this.movimentoRepository.getStatisticheCategorieSpese(famigliaId, mese, anno);
  }

  /**
   * Ottiene le statistiche per categoria degli introiti
   */
  async getStatisticheCategorieIntroiti(
    famigliaId: string,
    richiedenteId: string,
    mese: number,
    anno: number
  ): Promise<StatisticaCategoria[]> {
    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(richiedenteId, famigliaId);

    if (!canViewMovimenti(membro)) {
      throw new AuthorizationError('Non hai i permessi per visualizzare le statistiche');
    }

    return this.movimentoRepository.getStatisticheCategorieIntroiti(famigliaId, mese, anno);
  }

  /**
   * Ottiene il bilancio mensile annuale
   */
  async getBilancioMensile(
    famigliaId: string,
    richiedenteId: string,
    anno: number
  ): Promise<BilancioMensile[]> {
    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(richiedenteId, famigliaId);

    if (!canViewMovimenti(membro)) {
      throw new AuthorizationError('Non hai i permessi per visualizzare il bilancio');
    }

    return this.movimentoRepository.getBilancioMensile(famigliaId, anno);
  }

  /**
   * Calcola il saldo totale di una famiglia
   */
  async getSaldoTotale(famigliaId: string, richiedenteId: string): Promise<number> {
    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(richiedenteId, famigliaId);

    if (!canViewMovimenti(membro)) {
      throw new AuthorizationError('Non hai i permessi per visualizzare il saldo');
    }

    const movimenti = await this.movimentoRepository.findByFamigliaId(famigliaId);

    return movimenti.reduce((saldo, movimento) => {
      if (movimento.tipo === TipoMovimento.INTROITO) {
        return saldo + movimento.importo;
      } else {
        return saldo - movimento.importo;
      }
    }, 0);
  }
}
