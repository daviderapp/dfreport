import {
  IContrattoRepository,
  IAbitazioneRepository,
  IFamigliaRepository,
} from '@/types/repositories.interface';
import {
  ContrattoUtenza,
  CreateContrattoDTO,
  UpdateContrattoDTO,
} from '@/types/contratto.types';
import { canManageHousing, AuthorizationError } from '@/lib/auth-helpers';
import { calcolaDataScadenza } from '@/lib/utils';

/**
 * Service per la gestione dei Contratti di Utenza
 */
export class ContrattoService {
  constructor(
    private contrattoRepository: IContrattoRepository,
    private abitazioneRepository: IAbitazioneRepository,
    private famigliaRepository: IFamigliaRepository
  ) {}

  /**
   * Crea un nuovo contratto
   * Solo capofamiglia e lavoratori possono creare contratti
   */
  async create(data: CreateContrattoDTO): Promise<ContrattoUtenza> {
    // Verifica che l'abitazione esista
    const abitazione = await this.abitazioneRepository.findById(data.abitazioneId);
    if (!abitazione) {
      throw new Error('Abitazione non trovata');
    }

    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(
      data.richiedenteId,
      abitazione.famigliaId
    );

    if (!canManageHousing(membro)) {
      throw new AuthorizationError(
        'Solo il capofamiglia e i lavoratori possono gestire i contratti'
      );
    }

    // Calcola data scadenza se non fornita
    const scadenzaPagamento = data.scadenzaPagamento ||
      calcolaDataScadenza(data.dataInizio, data.durataGiorni);

    // Crea il contratto
    const { richiedenteId, ...contrattoData } = data;
    return this.contrattoRepository.create({
      ...contrattoData,
      scadenzaPagamento,
    });
  }

  /**
   * Ottiene un contratto per ID
   */
  async getById(id: string): Promise<ContrattoUtenza | null> {
    return this.contrattoRepository.findById(id);
  }

  /**
   * Ottiene tutti i contratti di un'abitazione
   */
  async getByAbitazioneId(abitazioneId: string): Promise<ContrattoUtenza[]> {
    return this.contrattoRepository.findByAbitazioneId(abitazioneId);
  }

  /**
   * Ottiene tutti i contratti di una famiglia
   */
  async getByFamigliaId(famigliaId: string): Promise<ContrattoUtenza[]> {
    return this.contrattoRepository.findByFamigliaId(famigliaId);
  }

  /**
   * Aggiorna un contratto
   * Solo capofamiglia e lavoratori possono aggiornare contratti
   */
  async update(data: UpdateContrattoDTO): Promise<ContrattoUtenza> {
    // Ottieni il contratto
    const contratto = await this.contrattoRepository.findById(data.id);
    if (!contratto) {
      throw new Error('Contratto non trovato');
    }

    // Ottieni l'abitazione
    const abitazione = await this.abitazioneRepository.findById(contratto.abitazioneId);
    if (!abitazione) {
      throw new Error('Abitazione non trovata');
    }

    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(
      data.richiedenteId,
      abitazione.famigliaId
    );

    if (!canManageHousing(membro)) {
      throw new AuthorizationError(
        'Solo il capofamiglia e i lavoratori possono gestire i contratti'
      );
    }

    // Aggiorna il contratto
    const { id, richiedenteId, ...updateData } = data;
    return this.contrattoRepository.update(id, updateData);
  }

  /**
   * Elimina un contratto
   * Solo capofamiglia e lavoratori possono eliminare contratti
   */
  async delete(id: string, richiedenteId: string): Promise<void> {
    // Ottieni il contratto
    const contratto = await this.contrattoRepository.findById(id);
    if (!contratto) {
      throw new Error('Contratto non trovato');
    }

    // Ottieni l'abitazione
    const abitazione = await this.abitazioneRepository.findById(contratto.abitazioneId);
    if (!abitazione) {
      throw new Error('Abitazione non trovata');
    }

    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(
      richiedenteId,
      abitazione.famigliaId
    );

    if (!canManageHousing(membro)) {
      throw new AuthorizationError(
        'Solo il capofamiglia e i lavoratori possono gestire i contratti'
      );
    }

    await this.contrattoRepository.delete(id);
  }

  /**
   * Ottiene i contratti in scadenza per una famiglia
   */
  async getContrattiInScadenza(
    famigliaId: string,
    giorniSoglia: number = 30
  ): Promise<ContrattoUtenza[]> {
    const contratti = await this.contrattoRepository.findByFamigliaId(famigliaId);
    const now = new Date();
    const soglia = new Date();
    soglia.setDate(soglia.getDate() + giorniSoglia);

    return contratti.filter(contratto => {
      if (!contratto.scadenzaPagamento) return false;
      return contratto.scadenzaPagamento >= now &&
             contratto.scadenzaPagamento <= soglia;
    });
  }

  /**
   * Carica un file PDF per un contratto
   */
  async uploadPDF(contrattoId: string, fileUrl: string): Promise<void> {
    await this.contrattoRepository.update(contrattoId, { fileUrl });
  }
}
