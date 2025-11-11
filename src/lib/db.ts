import mysql from 'mysql2/promise';

/**
 * Pool di connessioni al database MySQL
 * Configurato secondo le best practices per Next.js
 */
let pool: mysql.Pool | null = null;

export const getPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dfreport_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
};

/**
 * Ottiene una connessione dal pool
 */
export const getConnection = async (): Promise<mysql.PoolConnection> => {
  const pool = getPool();
  return pool.getConnection();
};

/**
 * Esegue una query sul database
 */
export const query = async <T = any>(
  sql: string,
  params?: any[]
): Promise<T> => {
  const pool = getPool();
  const [rows] = await pool.query(sql, params);
  return rows as T;
};

/**
 * Chiude il pool di connessioni (utile per i test)
 */
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
