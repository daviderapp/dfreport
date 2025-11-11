import { IUserRepository } from '@/types/repositories.interface';
import { User, RegisterUserDTO, LoginDTO, PublicUser } from '@/types/user.types';
import bcrypt from 'bcryptjs';

/**
 * Service per la gestione degli Utenti
 * Implementa la business logic seguendo il pattern Entity-Control-Boundary
 */
export class UserService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Registra un nuovo utente
   * @throws Error se l'email è già in uso
   */
  async register(data: RegisterUserDTO): Promise<PublicUser> {
    // Verifica che l'email non sia già in uso
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email già in uso');
    }

    // Crea l'utente
    const user = await this.userRepository.create(data);

    // Rimuove la password dalla risposta
    return this.toPublicUser(user);
  }

  /**
   * Effettua il login di un utente
   * @throws Error se le credenziali non sono valide
   */
  async login(credentials: LoginDTO): Promise<PublicUser> {
    const user = await this.userRepository.findByEmail(credentials.email);

    if (!user) {
      throw new Error('Credenziali non valide');
    }

    // Verifica la password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenziali non valide');
    }

    return this.toPublicUser(user);
  }

  /**
   * Ottiene un utente per ID
   */
  async getById(id: string): Promise<PublicUser | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.toPublicUser(user) : null;
  }

  /**
   * Ottiene un utente per email
   */
  async getByEmail(email: string): Promise<PublicUser | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.toPublicUser(user) : null;
  }

  /**
   * Aggiorna un utente
   */
  async update(id: string, data: Partial<User>): Promise<PublicUser> {
    const user = await this.userRepository.update(id, data);
    return this.toPublicUser(user);
  }

  /**
   * Elimina un utente
   */
  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  /**
   * Cambia la password di un utente
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Utente non trovato');
    }

    // Verifica la vecchia password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Password attuale non corretta');
    }

    // Aggiorna con la nuova password
    await this.userRepository.update(userId, { password: newPassword });
  }

  /**
   * Converte un User in PublicUser (rimuove dati sensibili)
   */
  private toPublicUser(user: User): PublicUser {
    const { password, ...publicUser } = user;
    return publicUser;
  }
}
