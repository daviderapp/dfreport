import { IFamigliaRepository } from '@/types/repositories.interface';
import { Famiglia, MembroFamiglia, FamigliaConMembri } from '@/types/famiglia.types';
import { UserRole } from '@/types/user.types';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Implementazione MySQL del Repository delle famiglia
 */
export class MySQLFamigliaRepository implements IFamigliaRepository {

  async findById(id: string): Promise<Famiglia | null> {
    const famiglia = await query<any[]>(
      'SELECT * FROM famiglie WHERE id = ?',
      [id]
    );

    if (famiglia.length === 0) return null;

    return this.mapRowToFamiglia(famiglia[0]);
  }

  async findByCodiceInvito(codice: string): Promise<Famiglia | null> {
    const famiglia = await query<any[]>(
      'SELECT * FROM famiglie WHERE codice_invito = ?',
      [codice]
    );

    if (famiglia.length === 0) return null;

    return this.mapRowToFamiglia(famiglia[0]);
  }

  async findByUserId(userId: string): Promise<Famiglia[]> {
    const famiglia = await query<any[]>(
      `SELECT f.* FROM famiglie f
       INNER JOIN membri_famiglia mf ON f.id = mf.famiglia_id
       WHERE mf.user_id = ?`,
      [userId]
    );

    return famiglia.map(row => this.mapRowToFamiglia(row));
  }

  async findConMembri(famigliaId: string): Promise<FamigliaConMembri | null> {
    const famiglia = await this.findById(famigliaId);
    if (!famiglia) return null;

    const membri = await query<any[]>(
      `SELECT u.id as userId, u.nome, u.cognome, u.email,
              mf.ruolo, mf.joined_at
       FROM users u
       INNER JOIN membri_famiglia mf ON u.id = mf.user_id
       WHERE mf.famiglia_id = ?`,
      [famigliaId]
    );

    return {
      ...famiglia,
      membri: membri.map(m => ({
        userId: m.userId,
        nome: m.nome,
        cognome: m.cognome,
        email: m.email,
        ruolo: m.ruolo as UserRole,
        joinedAt: new Date(m.joined_at),
      })),
    };
  }

  async create(cognomeFamiliare: string): Promise<Famiglia> {
    const id = uuidv4();
    const codiceInvito = this.generateCodiceInvito();

    await query(
      `INSERT INTO famiglie (id, cognome_familiare, codice_invito)
       VALUES (?, ?, ?)`,
      [id, cognomeFamiliare, codiceInvito]
    );

    const famiglia = await this.findById(id);
    if (!famiglia) throw new Error('Failed to create famiglia');

    return famiglia;
  }

  async delete(id: string): Promise<void> {
    await query('DELETE FROM famiglie WHERE id = ?', [id]);
  }

  // Gestione membri

  async addMembro(membroFamiglia: MembroFamiglia): Promise<void> {
    await query(
      `INSERT INTO membri_famiglia (user_id, famiglia_id, ruolo)
       VALUES (?, ?, ?)`,
      [membroFamiglia.userId, membroFamiglia.famigliaId, membroFamiglia.ruolo]
    );
  }

  async removeMembro(userId: string, famigliaId: string): Promise<void> {
    await query(
      'DELETE FROM membri_famiglia WHERE user_id = ? AND famiglia_id = ?',
      [userId, famigliaId]
    );
  }

  async updateRuoloMembro(userId: string, famigliaId: string, nuovoRuolo: string): Promise<void> {
    await query(
      `UPDATE membri_famiglia SET ruolo = ?
       WHERE user_id = ? AND famiglia_id = ?`,
      [nuovoRuolo, userId, famigliaId]
    );
  }

  async getMembro(userId: string, famigliaId: string): Promise<MembroFamiglia | null> {
    const membri = await query<any[]>(
      `SELECT * FROM membri_famiglia
       WHERE user_id = ? AND famiglia_id = ?`,
      [userId, famigliaId]
    );

    if (membri.length === 0) return null;

    return this.mapRowToMembroFamiglia(membri[0]);
  }

  async getMembri(famigliaId: string): Promise<MembroFamiglia[]> {
    const membri = await query<any[]>(
      'SELECT * FROM membri_famiglia WHERE famiglia_id = ?',
      [famigliaId]
    );

    return membri.map(row => this.mapRowToMembroFamiglia(row));
  }

  // Helper methods

  private mapRowToFamiglia(row: any): Famiglia {
    return {
      id: row.id,
      cognomeFamiliare: row.cognome_familiare,
      codiceInvito: row.codice_invito,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToMembroFamiglia(row: any): MembroFamiglia {
    return {
      userId: row.user_id,
      famigliaId: row.famiglia_id,
      ruolo: row.ruolo as UserRole,
      joinedAt: new Date(row.joined_at),
    };
  }

  /**
   * Genera un codice invito univoco di 8 caratteri alfanumerici
   */
  private generateCodiceInvito(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
