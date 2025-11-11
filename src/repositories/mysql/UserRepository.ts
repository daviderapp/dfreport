import { IUserRepository } from '@/types/repositories.interface';
import { User, RegisterUserDTO } from '@/types/user.types';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/**
 * Implementazione MySQL del Repository degli Utenti
 * Segue il pattern Dependency Inversion (implementa IUserRepository)
 */
export class MySQLUserRepository implements IUserRepository {

  async findById(id: string): Promise<User | null> {
    const users = await query<User[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) return null;

    return this.mapRowToUser(users[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await query<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) return null;

    return this.mapRowToUser(users[0]);
  }

  async create(data: RegisterUserDTO): Promise<User> {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await query(
      `INSERT INTO users (id, nome, cognome, email, password, data_nascita)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.nome, data.cognome, data.email, hashedPassword, data.dataNascita]
    );

    const user = await this.findById(id);
    if (!user) throw new Error('Failed to create user');

    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.nome !== undefined) {
      fields.push('nome = ?');
      values.push(data.nome);
    }
    if (data.cognome !== undefined) {
      fields.push('cognome = ?');
      values.push(data.cognome);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.password !== undefined) {
      fields.push('password = ?');
      values.push(await bcrypt.hash(data.password, 10));
    }
    if (data.dataNascita !== undefined) {
      fields.push('data_nascita = ?');
      values.push(data.dataNascita);
    }

    if (fields.length === 0) {
      const user = await this.findById(id);
      if (!user) throw new Error('User not found');
      return user;
    }

    values.push(id);

    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const user = await this.findById(id);
    if (!user) throw new Error('User not found after update');

    return user;
  }

  async delete(id: string): Promise<void> {
    await query('DELETE FROM users WHERE id = ?', [id]);
  }

  /**
   * Metodo helper per mappare una riga del database a un oggetto User
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      nome: row.nome,
      cognome: row.cognome,
      email: row.email,
      dataNascita: new Date(row.data_nascita),
      password: row.password,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
