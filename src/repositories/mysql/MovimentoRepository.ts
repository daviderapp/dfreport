import { IMovimentoRepository } from '@/types/repositories.interface';
import {
  Movimento,
  MovimentoConDettagli,
  MovimentoFilters,
  StatisticaCategoria,
  BilancioMensile,
  TipoMovimento,
  Categoria,
} from '@/types/movimento.types';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Implementazione MySQL del Repository dei Movimenti
 */
export class MySQLMovimentoRepository implements IMovimentoRepository {

  async findById(id: string): Promise<Movimento | null> {
    const movimenti = await query<any[]>(
      'SELECT * FROM movimenti WHERE id = ?',
      [id]
    );

    if (movimenti.length === 0) return null;

    return this.mapRowToMovimento(movimenti[0]);
  }

  async findByFamigliaId(
    famigliaId: string,
    filters?: MovimentoFilters
  ): Promise<MovimentoConDettagli[]> {
    let sql = `
      SELECT
        m.*,
        u.nome as nomeUtente,
        u.cognome as cognomeUtente
      FROM movimenti m
      INNER JOIN users u ON m.user_id = u.id
      WHERE m.famiglia_id = ?
    `;

    const params: any[] = [famigliaId];

    if (filters?.tipo && filters.tipo.length > 0) {
      sql += ` AND m.tipo IN (${filters.tipo.map(() => '?').join(',')})`;
      params.push(...filters.tipo);
    }

    if (filters?.categorie && filters.categorie.length > 0) {
      sql += ` AND m.categoria IN (${filters.categorie.map(() => '?').join(',')})`;
      params.push(...filters.categorie);
    }

    if (filters?.importoMin !== undefined) {
      sql += ' AND m.importo >= ?';
      params.push(filters.importoMin);
    }

    if (filters?.importoMax !== undefined) {
      sql += ' AND m.importo <= ?';
      params.push(filters.importoMax);
    }

    if (filters?.responsabile) {
      sql += ' AND m.responsabile = ?';
      params.push(filters.responsabile);
    }

    if (filters?.userId) {
      sql += ' AND m.user_id = ?';
      params.push(filters.userId);
    }

    if (filters?.dataInizio) {
      sql += ' AND m.data >= ?';
      params.push(filters.dataInizio);
    }

    if (filters?.dataFine) {
      sql += ' AND m.data <= ?';
      params.push(filters.dataFine);
    }

    sql += ' ORDER BY m.data DESC, m.created_at DESC';

    const rows = await query<any[]>(sql, params);

    return rows.map(row => this.mapRowToMovimentoConDettagli(row));
  }

  async findByUserId(userId: string, mese: number, anno: number): Promise<Movimento[]> {
    const movimenti = await query<any[]>(
      `SELECT * FROM movimenti
       WHERE user_id = ?
       AND MONTH(data) = ?
       AND YEAR(data) = ?
       ORDER BY data DESC`,
      [userId, mese, anno]
    );

    return movimenti.map(row => this.mapRowToMovimento(row));
  }

  async create(movimento: Omit<Movimento, 'id' | 'createdAt' | 'updatedAt'>): Promise<Movimento> {
    const id = uuidv4();

    await query(
      `INSERT INTO movimenti (
        id, famiglia_id, user_id, tipo, descrizione,
        importo, data, categoria, responsabile
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        movimento.famigliaId,
        movimento.userId,
        movimento.tipo,
        movimento.descrizione,
        movimento.importo,
        movimento.data,
        movimento.categoria,
        (movimento as any).responsabile || null,
      ]
    );

    const created = await this.findById(id);
    if (!created) throw new Error('Failed to create movimento');

    return created;
  }

  async update(id: string, data: Partial<Movimento>): Promise<Movimento> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.descrizione !== undefined) {
      fields.push('descrizione = ?');
      values.push(data.descrizione);
    }
    if (data.importo !== undefined) {
      fields.push('importo = ?');
      values.push(data.importo);
    }
    if (data.data !== undefined) {
      fields.push('data = ?');
      values.push(data.data);
    }
    if (data.categoria !== undefined) {
      fields.push('categoria = ?');
      values.push(data.categoria);
    }
    if ((data as any).responsabile !== undefined) {
      fields.push('responsabile = ?');
      values.push((data as any).responsabile);
    }

    if (fields.length === 0) {
      const movimento = await this.findById(id);
      if (!movimento) throw new Error('Movimento not found');
      return movimento;
    }

    values.push(id);

    await query(
      `UPDATE movimenti SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const updated = await this.findById(id);
    if (!updated) throw new Error('Movimento not found after update');

    return updated;
  }

  async delete(id: string): Promise<void> {
    await query('DELETE FROM movimenti WHERE id = ?', [id]);
  }

  // Statistiche

  async getStatisticheCategorieSpese(
    famigliaId: string,
    mese: number,
    anno: number
  ): Promise<StatisticaCategoria[]> {
    const rows = await query<any[]>(
      `SELECT
        categoria,
        SUM(importo) as totale,
        COUNT(*) as numeroMovimenti
       FROM movimenti
       WHERE famiglia_id = ?
       AND tipo = 'SPESA'
       AND MONTH(data) = ?
       AND YEAR(data) = ?
       GROUP BY categoria`,
      [famigliaId, mese, anno]
    );

    const totaleSpese = rows.reduce((sum, row) => sum + parseFloat(row.totale), 0);

    return rows.map(row => ({
      categoria: row.categoria as Categoria,
      colore: this.getCategoriaColor(row.categoria),
      totale: parseFloat(row.totale),
      numeroMovimenti: parseInt(row.numeroMovimenti),
      percentuale: totaleSpese > 0 ? (parseFloat(row.totale) / totaleSpese) * 100 : 0,
    }));
  }

  async getStatisticheCategorieIntroiti(
    famigliaId: string,
    mese: number,
    anno: number
  ): Promise<StatisticaCategoria[]> {
    const rows = await query<any[]>(
      `SELECT
        categoria,
        SUM(importo) as totale,
        COUNT(*) as numeroMovimenti
       FROM movimenti
       WHERE famiglia_id = ?
       AND tipo = 'INTROITO'
       AND MONTH(data) = ?
       AND YEAR(data) = ?
       GROUP BY categoria`,
      [famigliaId, mese, anno]
    );

    const totaleIntroiti = rows.reduce((sum, row) => sum + parseFloat(row.totale), 0);

    return rows.map(row => ({
      categoria: row.categoria as Categoria,
      colore: this.getCategoriaColor(row.categoria),
      totale: parseFloat(row.totale),
      numeroMovimenti: parseInt(row.numeroMovimenti),
      percentuale: totaleIntroiti > 0 ? (parseFloat(row.totale) / totaleIntroiti) * 100 : 0,
    }));
  }

  async getBilancioMensile(famigliaId: string, anno: number): Promise<BilancioMensile[]> {
    const rows = await query<any[]>(
      `SELECT
        MONTH(data) as mese,
        tipo,
        SUM(importo) as totale
       FROM movimenti
       WHERE famiglia_id = ?
       AND YEAR(data) = ?
       GROUP BY MONTH(data), tipo
       ORDER BY MONTH(data)`,
      [famigliaId, anno]
    );

    const bilancioMap = new Map<number, BilancioMensile>();

    // Inizializza tutti i mesi
    for (let mese = 1; mese <= 12; mese++) {
      bilancioMap.set(mese, {
        mese,
        anno,
        totaleIntroiti: 0,
        totaleSpese: 0,
        saldo: 0,
      });
    }

    // Popola con i dati reali
    rows.forEach(row => {
      const mese = parseInt(row.mese);
      const bilancio = bilancioMap.get(mese)!;
      const totale = parseFloat(row.totale);

      if (row.tipo === TipoMovimento.INTROITO) {
        bilancio.totaleIntroiti = totale;
      } else if (row.tipo === TipoMovimento.SPESA) {
        bilancio.totaleSpese = totale;
      }

      bilancio.saldo = bilancio.totaleIntroiti - bilancio.totaleSpese;
    });

    return Array.from(bilancioMap.values());
  }

  // Helper methods

  private mapRowToMovimento(row: any): Movimento {
    return {
      id: row.id,
      famigliaId: row.famiglia_id,
      userId: row.user_id,
      tipo: row.tipo as TipoMovimento,
      descrizione: row.descrizione,
      importo: parseFloat(row.importo),
      data: new Date(row.data),
      categoria: row.categoria as Categoria,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToMovimentoConDettagli(row: any): MovimentoConDettagli {
    return {
      ...this.mapRowToMovimento(row),
      nomeUtente: row.nomeUtente,
      cognomeUtente: row.cognomeUtente,
      coloreCategoria: this.getCategoriaColor(row.categoria),
      responsabile: row.responsabile,
    };
  }

  /**
   * Mappa le categorie ai colori per i grafici
   */
  private getCategoriaColor(categoria: string): string {
    const colorMap: Record<string, string> = {
      // Spese
      ALIMENTARI: '#10b981',
      TRASPORTI: '#3b82f6',
      ABITAZIONI: '#8b5cf6',
      SALUTE: '#ef4444',
      SVAGO: '#f59e0b',
      ISTRUZIONE: '#06b6d4',
      IMPOSTE: '#6366f1',
      ANIMALI: '#ec4899',
      STRAORDINARIE: '#84cc16',
      // Introiti
      REDDITO: '#22c55e',
      OCCASIONALI: '#0ea5e9',
      SUSSIDI: '#a855f7',
      INTERESSI: '#14b8a6',
    };

    return colorMap[categoria] || '#6b7280';
  }
}
