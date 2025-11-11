import { IAbitazioneRepository } from '@/types/repositories.interface';
import { Abitazione } from '@/types/abitazione.types';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Implementazione MySQL del Repository delle Abitazioni
 */
export class MySQLAbitazioneRepository implements IAbitazioneRepository {

  async findById(id: string): Promise<Abitazione | null> {
    const abitazioni = await query<any[]>(
      'SELECT * FROM abitazioni WHERE id = ?',
      [id]
    );

    if (abitazioni.length === 0) return null;

    return this.mapRowToAbitazione(abitazioni[0]);
  }

  async findByFamigliaId(famigliaId: string): Promise<Abitazione[]> {
    const abitazioni = await query<any[]>(
      'SELECT * FROM abitazioni WHERE famiglia_id = ?',
      [famigliaId]
    );

    return abitazioni.map(row => this.mapRowToAbitazione(row));
  }

  async create(abitazione: Omit<Abitazione, 'id' | 'createdAt' | 'updatedAt'>): Promise<Abitazione> {
    const id = uuidv4();

    await query(
      `INSERT INTO abitazioni (id, famiglia_id, indirizzo, citta, cap, provincia, descrizione)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        abitazione.famigliaId,
        abitazione.indirizzo,
        abitazione.citta,
        abitazione.cap,
        abitazione.provincia,
        abitazione.descrizione || null,
      ]
    );

    const created = await this.findById(id);
    if (!created) throw new Error('Failed to create abitazione');

    return created;
  }

  async update(id: string, data: Partial<Abitazione>): Promise<Abitazione> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.indirizzo !== undefined) {
      fields.push('indirizzo = ?');
      values.push(data.indirizzo);
    }
    if (data.citta !== undefined) {
      fields.push('citta = ?');
      values.push(data.citta);
    }
    if (data.cap !== undefined) {
      fields.push('cap = ?');
      values.push(data.cap);
    }
    if (data.provincia !== undefined) {
      fields.push('provincia = ?');
      values.push(data.provincia);
    }
    if (data.descrizione !== undefined) {
      fields.push('descrizione = ?');
      values.push(data.descrizione);
    }

    if (fields.length === 0) {
      const abitazione = await this.findById(id);
      if (!abitazione) throw new Error('Abitazione not found');
      return abitazione;
    }

    values.push(id);

    await query(
      `UPDATE abitazioni SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const updated = await this.findById(id);
    if (!updated) throw new Error('Abitazione not found after update');

    return updated;
  }

  async delete(id: string): Promise<void> {
    await query('DELETE FROM abitazioni WHERE id = ?', [id]);
  }

  // Helper methods

  private mapRowToAbitazione(row: any): Abitazione {
    return {
      id: row.id,
      famigliaId: row.famiglia_id,
      indirizzo: row.indirizzo,
      citta: row.citta,
      cap: row.cap,
      provincia: row.provincia,
      descrizione: row.descrizione,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
