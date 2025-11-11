import { IContrattoRepository } from '@/types/repositories.interface';
import { ContrattoUtenza } from '@/types/contratto.types';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Implementazione MySQL del Repository dei Contratti di Utenza
 */
export class MySQLContrattoRepository implements IContrattoRepository {

  async findById(id: string): Promise<ContrattoUtenza | null> {
    const contratti = await query<any[]>(
      'SELECT * FROM contratti_utenza WHERE id = ?',
      [id]
    );

    if (contratti.length === 0) return null;

    return this.mapRowToContratto(contratti[0]);
  }

  async findByAbitazioneId(abitazioneId: string): Promise<ContrattoUtenza[]> {
    const contratti = await query<any[]>(
      'SELECT * FROM contratti_utenza WHERE abitazione_id = ?',
      [abitazioneId]
    );

    return contratti.map(row => this.mapRowToContratto(row));
  }

  async findByFamigliaId(famigliaId: string): Promise<ContrattoUtenza[]> {
    const contratti = await query<any[]>(
      `SELECT cu.* FROM contratti_utenza cu
       INNER JOIN abitazioni a ON cu.abitazione_id = a.id
       WHERE a.famiglia_id = ?`,
      [famigliaId]
    );

    return contratti.map(row => this.mapRowToContratto(row));
  }

  async create(contratto: Omit<ContrattoUtenza, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContrattoUtenza> {
    const id = uuidv4();

    await query(
      `INSERT INTO contratti_utenza (
        id, abitazione_id, tipo_utenza, fornitore, piano_tariffario,
        data_inizio, durata_giorni, costo_periodico, periodicita,
        scadenza_pagamento, file_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        contratto.abitazioneId,
        contratto.tipoUtenza,
        contratto.fornitore,
        contratto.pianoTariffario,
        contratto.dataInizio,
        contratto.durataGiorni,
        contratto.costoPeriodico,
        contratto.periodicita,
        contratto.scadenzaPagamento || null,
        contratto.fileUrl || null,
      ]
    );

    const created = await this.findById(id);
    if (!created) throw new Error('Failed to create contratto');

    return created;
  }

  async update(id: string, data: Partial<ContrattoUtenza>): Promise<ContrattoUtenza> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.tipoUtenza !== undefined) {
      fields.push('tipo_utenza = ?');
      values.push(data.tipoUtenza);
    }
    if (data.fornitore !== undefined) {
      fields.push('fornitore = ?');
      values.push(data.fornitore);
    }
    if (data.pianoTariffario !== undefined) {
      fields.push('piano_tariffario = ?');
      values.push(data.pianoTariffario);
    }
    if (data.dataInizio !== undefined) {
      fields.push('data_inizio = ?');
      values.push(data.dataInizio);
    }
    if (data.durataGiorni !== undefined) {
      fields.push('durata_giorni = ?');
      values.push(data.durataGiorni);
    }
    if (data.costoPeriodico !== undefined) {
      fields.push('costo_periodico = ?');
      values.push(data.costoPeriodico);
    }
    if (data.periodicita !== undefined) {
      fields.push('periodicita = ?');
      values.push(data.periodicita);
    }
    if (data.scadenzaPagamento !== undefined) {
      fields.push('scadenza_pagamento = ?');
      values.push(data.scadenzaPagamento);
    }
    if (data.fileUrl !== undefined) {
      fields.push('file_url = ?');
      values.push(data.fileUrl);
    }

    if (fields.length === 0) {
      const contratto = await this.findById(id);
      if (!contratto) throw new Error('Contratto not found');
      return contratto;
    }

    values.push(id);

    await query(
      `UPDATE contratti_utenza SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const updated = await this.findById(id);
    if (!updated) throw new Error('Contratto not found after update');

    return updated;
  }

  async delete(id: string): Promise<void> {
    await query('DELETE FROM contratti_utenza WHERE id = ?', [id]);
  }

  // Helper methods

  private mapRowToContratto(row: any): ContrattoUtenza {
    return {
      id: row.id,
      abitazioneId: row.abitazione_id,
      tipoUtenza: row.tipo_utenza,
      fornitore: row.fornitore,
      pianoTariffario: row.piano_tariffario,
      dataInizio: new Date(row.data_inizio),
      durataGiorni: row.durata_giorni,
      costoPeriodico: parseFloat(row.costo_periodico),
      periodicita: row.periodicita,
      scadenzaPagamento: row.scadenza_pagamento ? new Date(row.scadenza_pagamento) : undefined,
      fileUrl: row.file_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
