import { format, parseISO, isValid } from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Formatta una data in formato italiano
 */
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Data non valida';
  return format(dateObj, formatStr, { locale: it });
}

/**
 * Formatta un importo in Euro
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Formatta una percentuale
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Converte il nome di un mese da numero (1-12) a stringa italiana
 */
export function getMeseNome(mese: number): string {
  const mesi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return mesi[mese - 1] || 'Mese non valido';
}

/**
 * Ottiene il mese e l'anno correnti
 */
export function getCurrentMonthYear(): { mese: number; anno: number } {
  const now = new Date();
  return {
    mese: now.getMonth() + 1,
    anno: now.getFullYear(),
  };
}

/**
 * Calcola la data di scadenza di un contratto
 */
export function calcolaDataScadenza(dataInizio: Date, durataGiorni: number): Date {
  const scadenza = new Date(dataInizio);
  scadenza.setDate(scadenza.getDate() + durataGiorni);
  return scadenza;
}

/**
 * Verifica se un contratto è in scadenza nei prossimi N giorni
 */
export function isContrattoInScadenza(dataScadenza: Date, giorniSoglia: number = 30): boolean {
  const now = new Date();
  const diffTime = dataScadenza.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= giorniSoglia;
}

/**
 * Genera un nome file sicuro per l'upload
 */
export function generateSafeFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop() || 'pdf';
  const safeName = originalName
    .replace(/\.[^/.]+$/, '') // rimuove estensione
    .replace(/[^a-zA-Z0-9]/g, '_') // sostituisce caratteri speciali
    .substring(0, 50); // limita lunghezza

  return prefix
    ? `${prefix}_${timestamp}_${random}_${safeName}.${ext}`
    : `${timestamp}_${random}_${safeName}.${ext}`;
}

/**
 * Combina classi CSS (utile con Tailwind)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Genera un array di anni per i selettori
 */
export function getYearRange(startYear?: number, endYear?: number): number[] {
  const currentYear = new Date().getFullYear();
  const start = startYear || currentYear - 5;
  const end = endYear || currentYear + 5;

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Converte snake_case a camelCase (per mappare DB -> TS)
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converte camelCase a snake_case (per mappare TS -> DB)
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Verifica se una stringa è un UUID valido
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
