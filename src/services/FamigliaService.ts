import { IFamigliaRepository } from '@/types/repositories.interface';
import {
  Famiglia,
  MembroFamiglia,
  FamigliaConMembri,
  CreateFamigliaDTO,
  JoinFamigliaDTO,
  UpdateRuoloMembroDTO,
} from '@/types/famiglia.types';
import { UserRole } from '@/types/user.types';
import { isCapofamiglia, requireRole, AuthorizationError } from '@/lib/auth-helpers';

/**
 * Service per la gestione delle famiglia
 */
export class FamigliaService {
  constructor(private famigliaRepository: IFamigliaRepository) {}

  /**
   * Crea una nuova famiglia
   * Il creatore diventa automaticamente capofamiglia
   */
  async createFamiglia(data: CreateFamigliaDTO): Promise<Famiglia> {
    // Verifica che l'utente non abbia già una famiglia
    const famigliaEsistenti = await this.famigliaRepository.findByUserId(data.capofamigliaId);
    if (famigliaEsistenti.length > 0) {
      throw new Error('Puoi creare o far parte di una sola famiglia');
    }

    // Crea la famiglia
    const famiglia = await this.famigliaRepository.create(data.cognomeFamiliare);

    // Aggiungi il creatore come capofamiglia
    await this.famigliaRepository.addMembro({
      userId: data.capofamigliaId,
      famigliaId: famiglia.id,
      ruolo: UserRole.CAPOFAMIGLIA,
      joinedAt: new Date(),
    });

    return famiglia;
  }

  /**
   * Ottiene una famiglia per ID
   */
  async getById(id: string): Promise<Famiglia | null> {
    return this.famigliaRepository.findById(id);
  }

  /**
   * Ottiene una famiglia con i suoi membri
   */
  async getConMembri(famigliaId: string): Promise<FamigliaConMembri | null> {
    return this.famigliaRepository.findConMembri(famigliaId);
  }

  /**
   * Ottiene tutte le famiglia di un utente
   */
  async getfamigliaByUserId(userId: string): Promise<Famiglia[]> {
    return this.famigliaRepository.findByUserId(userId);
  }

  /**
   * Permette a un utente di aderire a una famiglia tramite codice invito
   */
  async joinFamiglia(data: JoinFamigliaDTO): Promise<void> {
    // Verifica che l'utente non abbia già una famiglia
    const famigliaEsistenti = await this.famigliaRepository.findByUserId(data.userId);
    if (famigliaEsistenti.length > 0) {
      throw new Error('Puoi far parte di una sola famiglia');
    }

    // Trova la famiglia tramite codice invito
    const famiglia = await this.famigliaRepository.findByCodiceInvito(data.codiceInvito);
    if (!famiglia) {
      throw new Error('Codice invito non valido');
    }

    // Aggiungi l'utente come membro
    await this.famigliaRepository.addMembro({
      userId: data.userId,
      famigliaId: famiglia.id,
      ruolo: UserRole.MEMBRO,
      joinedAt: new Date(),
    });
  }

  /**
   * Aggiorna il ruolo di un membro
   * Solo il capofamiglia può eseguire questa operazione
   */
  async updateRuoloMembro(data: UpdateRuoloMembroDTO): Promise<void> {
    // Verifica che il richiedente sia capofamiglia
    const richiedente = await this.famigliaRepository.getMembro(
      data.richiedenteId,
      data.famigliaId
    );

    if (!isCapofamiglia(richiedente)) {
      throw new AuthorizationError('Solo il capofamiglia può modificare i ruoli');
    }

    // Verifica che l'utente target sia membro della famiglia
    const targetMembro = await this.famigliaRepository.getMembro(data.userId, data.famigliaId);
    if (!targetMembro) {
      throw new Error('L\'utente non è membro di questa famiglia');
    }

    // Non permettere di modificare il proprio ruolo
    if (data.richiedenteId === data.userId) {
      throw new Error('Non puoi modificare il tuo ruolo');
    }

    // Aggiorna il ruolo
    await this.famigliaRepository.updateRuoloMembro(
      data.userId,
      data.famigliaId,
      data.nuovoRuolo
    );
  }

  /**
   * Rimuove un membro dalla famiglia
   * Solo il capofamiglia può rimuovere altri membri
   * Un membro può rimuovere se stesso
   */
  async removeMembro(
    famigliaId: string,
    userId: string,
    richiedenteId: string
  ): Promise<void> {
    const richiedente = await this.famigliaRepository.getMembro(richiedenteId, famigliaId);

    // Se il richiedente non è il membro stesso, deve essere capofamiglia
    if (richiedenteId !== userId && !isCapofamiglia(richiedente)) {
      throw new AuthorizationError('Solo il capofamiglia può rimuovere altri membri');
    }

    // Verifica che il membro esista
    const membro = await this.famigliaRepository.getMembro(userId, famigliaId);
    if (!membro) {
      throw new Error('Il membro non esiste');
    }

    // Non permettere al capofamiglia di rimuovere se stesso se ci sono altri membri
    if (membro.ruolo === UserRole.CAPOFAMIGLIA) {
      const membri = await this.famigliaRepository.getMembri(famigliaId);
      if (membri.length > 1) {
        throw new Error('Il capofamiglia non può lasciare la famiglia finché ci sono altri membri');
      }
    }

    await this.famigliaRepository.removeMembro(userId, famigliaId);

    // Se era l'ultimo membro, elimina la famiglia
    const membriRimanenti = await this.famigliaRepository.getMembri(famigliaId);
    if (membriRimanenti.length === 0) {
      await this.famigliaRepository.delete(famigliaId);
    }
  }

  /**
   * Ottiene il ruolo di un utente in una famiglia
   */
  async getRuoloUtente(userId: string, famigliaId: string): Promise<UserRole | null> {
    const membro = await this.famigliaRepository.getMembro(userId, famigliaId);
    return membro?.ruolo || null;
  }

  /**
   * Verifica se un utente è membro di una famiglia
   */
  async isMembro(userId: string, famigliaId: string): Promise<boolean> {
    const membro = await this.famigliaRepository.getMembro(userId, famigliaId);
    return membro !== null;
  }

  /**
   * Ottiene i membri di una famiglia
   */
  async getMembri(famigliaId: string): Promise<MembroFamiglia[]> {
    return this.famigliaRepository.getMembri(famigliaId);
  }

  /**
   * Elimina una famiglia
   * Solo il capofamiglia può eliminare una famiglia vuota
   */
  async deleteFamiglia(famigliaId: string, richiedenteId: string): Promise<void> {
    const richiedente = await this.famigliaRepository.getMembro(richiedenteId, famigliaId);

    if (!isCapofamiglia(richiedente)) {
      throw new AuthorizationError('Solo il capofamiglia può eliminare la famiglia');
    }

    const membri = await this.famigliaRepository.getMembri(famigliaId);
    if (membri.length > 1) {
      throw new Error('Non puoi eliminare una famiglia con membri');
    }

    await this.famigliaRepository.delete(famigliaId);
  }
}
