import { z } from 'zod';
import { UserRole } from '@/types/user.types';
import { TipoUtenza, Periodicita } from '@/types/contratto.types';
import { TipoMovimento, ResponsabileSpesa, CategoriaSpesa, CategoriaIntroito } from '@/types/movimento.types';

/**
 * Schema di validazione per la registrazione utente
 * Requisiti password: minimo 8 caratteri, almeno una maiuscola, una minuscola, un numero
 */
export const RegisterUserSchema = z.object({
  nome: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri').max(100),
  cognome: z.string().min(2, 'Il cognome deve contenere almeno 2 caratteri').max(100),
  email: z.string().email('Email non valida'),
  password: z
    .string()
    .min(8, 'La password deve contenere almeno 8 caratteri')
    .regex(/[A-Z]/, 'La password deve contenere almeno una lettera maiuscola')
    .regex(/[a-z]/, 'La password deve contenere almeno una lettera minuscola')
    .regex(/[0-9]/, 'La password deve contenere almeno un numero'),
  dataNascita: z.coerce.date().refine(
    (date) => {
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 18 && age <= 120;
    },
    'Devi avere almeno 18 anni per registrarti'
  ),
});

/**
 * Schema di validazione per il login
 */
export const LoginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'La password è obbligatoria'),
});

/**
 * Schema di validazione per la creazione di una famiglia
 */
export const CreateFamigliaSchema = z.object({
  cognomeFamiliare: z.string().min(2, 'Il cognome familiare deve contenere almeno 2 caratteri').max(100),
});

/**
 * Schema di validazione per aderire a una famiglia
 */
export const JoinFamigliaSchema = z.object({
  codiceInvito: z.string().length(8, 'Il codice invito deve essere di 8 caratteri'),
});

/**
 * Schema di validazione per aggiornare il ruolo di un membro
 */
export const UpdateRuoloMembroSchema = z.object({
  userId: z.string().uuid(),
  famigliaId: z.string().uuid(),
  nuovoRuolo: z.nativeEnum(UserRole),
});

/**
 * Schema di validazione per la creazione di un'abitazione
 */
export const CreateAbitazioneSchema = z.object({
  famigliaId: z.string().uuid(),
  indirizzo: z.string().min(5, 'Indirizzo troppo corto').max(255),
  citta: z.string().min(2, 'Città troppo corta').max(100),
  cap: z.string().regex(/^\d{5}$/, 'CAP non valido (5 cifre)'),
  provincia: z.string().length(2, 'Provincia deve essere di 2 caratteri').toUpperCase(),
  descrizione: z.string().max(500).optional(),
});

/**
 * Schema di validazione per l'aggiornamento di un'abitazione
 */
export const UpdateAbitazioneSchema = z.object({
  indirizzo: z.string().min(5).max(255).optional(),
  citta: z.string().min(2).max(100).optional(),
  cap: z.string().regex(/^\d{5}$/).optional(),
  provincia: z.string().length(2).toUpperCase().optional(),
  descrizione: z.string().max(500).optional(),
});

/**
 * Schema di validazione per la creazione di un contratto
 */
export const CreateContrattoSchema = z.object({
  abitazioneId: z.string().uuid(),
  tipoUtenza: z.nativeEnum(TipoUtenza),
  fornitore: z.string().min(2, 'Fornitore troppo corto').max(100),
  pianoTariffario: z.string().min(2, 'Piano tariffario troppo corto').max(100),
  dataInizio: z.coerce.date(),
  durataGiorni: z.number().int().min(1, 'Durata minima 1 giorno').max(36500), // max ~100 anni
  costoPeriodico: z.number().positive('Il costo deve essere positivo'),
  periodicita: z.nativeEnum(Periodicita),
  scadenzaPagamento: z.coerce.date().optional(),
});

/**
 * Schema di validazione per l'aggiornamento di un contratto
 */
export const UpdateContrattoSchema = CreateContrattoSchema.partial().omit({ abitazioneId: true });

/**
 * Schema di validazione per la creazione di una spesa
 */
export const CreateSpesaSchema = z.object({
  famigliaId: z.string().uuid(),
  descrizione: z.string().min(2, 'Descrizione troppo corta').max(255),
  importo: z.number().positive('L\'importo deve essere positivo'),
  data: z.coerce.date(),
  categoria: z.nativeEnum(CategoriaSpesa),
  responsabile: z.nativeEnum(ResponsabileSpesa),
});

/**
 * Schema di validazione per la creazione di un introito
 */
export const CreateIntroitoSchema = z.object({
  famigliaId: z.string().uuid(),
  descrizione: z.string().min(2, 'Descrizione troppo corta').max(255),
  importo: z.number().positive('L\'importo deve essere positivo'),
  data: z.coerce.date(),
  categoria: z.nativeEnum(CategoriaIntroito),
});

/**
 * Schema di validazione per i filtri dei movimenti
 */
export const MovimentoFiltersSchema = z.object({
  tipo: z.array(z.nativeEnum(TipoMovimento)).optional(),
  categorie: z.array(z.union([z.nativeEnum(CategoriaSpesa), z.nativeEnum(CategoriaIntroito)])).optional(),
  importoMin: z.number().nonnegative().optional(),
  importoMax: z.number().positive().optional(),
  responsabile: z.nativeEnum(ResponsabileSpesa).optional(),
  userId: z.string().uuid().optional(),
  dataInizio: z.coerce.date().optional(),
  dataFine: z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.importoMin !== undefined && data.importoMax !== undefined) {
      return data.importoMin <= data.importoMax;
    }
    return true;
  },
  'L\'importo minimo non può essere maggiore dell\'importo massimo'
).refine(
  (data) => {
    if (data.dataInizio && data.dataFine) {
      return data.dataInizio <= data.dataFine;
    }
    return true;
  },
  'La data inizio non può essere dopo la data fine'
);

/**
 * Schema di validazione per l'upload di file PDF
 */
export const UploadPDFSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.type === 'application/pdf',
    'Il file deve essere un PDF'
  ).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'Il file non può superare i 10MB'
  ),
});
