import { MySQLFamigliaRepository } from '@/repositories/mysql/FamigliaRepository';

/**
 * Verifica se un utente appartiene a almeno una famiglia
 */
export async function userHasFamiglie(userId: string): Promise<boolean> {
  const famigliaRepository = new MySQLFamigliaRepository();
  const famiglie = await famigliaRepository.findByUserId(userId);
  return famiglie.length > 0;
}

/**
 * Ottiene tutte le famiglie di un utente
 */
export async function getUserFamiglie(userId: string) {
  const famigliaRepository = new MySQLFamigliaRepository();
  return await famigliaRepository.findByUserId(userId);
}
