import { IAbitazioneRepository, IFamigliaRepository } from '@/types/repositories.interface';
import {
  Abitazione,
  CreateAbitazioneDTO,
  UpdateAbitazioneDTO,
} from '@/types/abitazione.types';
import { canManageHousing, AuthorizationError } from '@/lib/auth-helpers';

/**
 * Service per la gestione delle Abitazioni
 */
export class AbitazioneService {
  constructor(
    private abitazioneRepository: IAbitazioneRepository,
    private famigliaRepository: IFamigliaRepository
  ) {}

  /**
   * Crea una nuova abitazione
   * Solo capofamiglia e lavoratori possono creare abitazioni
   */
  async create(data: CreateAbitazioneDTO): Promise<Abitazione> {
    // Verifica autorizzazione
    const membro = await this.famigliaRepository.getMembro(
      data.richiedenteId,
      data.famigliaId
    );

    if (!canManageHousing(membro)) {
      throw new AuthorizationError(
        'Solo il capofamiglia e i lavoratori possono gestire le abitazioni'
      );
    }

    // Crea l'abitazione
    const { richiedenteId, ...abitazioneData } = data;
    return this.abitazioneRepository.create(abitazioneData);
  }

  /**
   * Ottiene un'abitazione per ID
   */
  async getById(id: string): Promise<Abitazione | null> {
    return this.abitazioneRepository.findById(id);
  }

  /**
   * Ottiene tutte le abitazioni di una famiglia
   */
  async getByFamigliaId(famigliaId: string): Promise<Abitazione[]> {
    return this.abitazioneRepository.findByFamigliaId(famigliaId);
  }

  /**
   * Aggiorna un'abitazione
   * Solo capofamiglia e lavoratori possono aggiornare abitazioni
   */
  async update(data: UpdateAbitazioneDTO): Promise<Abitazione> {
    // Ottieni l'abitazione
    const abitazione = await this.abitazioneRepository.findById(data.id);
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
        'Solo il capofamiglia e i lavoratori possono gestire le abitazioni'
      );
    }

    // Aggiorna l'abitazione
    const { id, richiedenteId, ...updateData } = data;
    return this.abitazioneRepository.update(id, updateData);
  }

  /**
   * Elimina un'abitazione
   * Solo capofamiglia e lavoratori possono eliminare abitazioni
   */
  async delete(id: string, richiedenteId: string): Promise<void> {
    // Ottieni l'abitazione
    const abitazione = await this.abitazioneRepository.findById(id);
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
        'Solo il capofamiglia e i lavoratori possono gestire le abitazioni'
      );
    }

    await this.abitazioneRepository.delete(id);
  }

  /**
   * Verifica se un'abitazione appartiene a una specifica famiglia
   */
  async belongsToFamiglia(abitazioneId: string, famigliaId: string): Promise<boolean> {
    const abitazione = await this.abitazioneRepository.findById(abitazioneId);
    return abitazione?.famigliaId === famigliaId;
  }
}
