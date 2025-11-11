import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { MovimentoService } from '@/services/MovimentoService';
import { MySQLMovimentoRepository, MySQLFamigliaRepository } from '@/repositories/mysql';
import { CategoriaIntroito } from '@/types/movimento.types';
import { z } from 'zod';

const createIntroitoSchema = z.object({
  famigliaId: z.string().uuid(),
  descrizione: z.string().min(1, 'La descrizione è obbligatoria').max(255),
  importo: z.number().positive('L\'importo deve essere positivo'),
  data: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data non valida',
  }),
  categoria: z.nativeEnum(CategoriaIntroito),
});

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Valida il body della richiesta
    const body = await request.json();
    const validationResult = createIntroitoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Dati non validi',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Crea il service
    const movimentoRepo = new MySQLMovimentoRepository();
    const famigliaRepo = new MySQLFamigliaRepository();
    const movimentoService = new MovimentoService(movimentoRepo, famigliaRepo);

    // Crea l'introito
    const introito = await movimentoService.createIntroito({
      famigliaId: data.famigliaId,
      userId: session.user.id,
      descrizione: data.descrizione,
      importo: data.importo,
      data: new Date(data.data),
      categoria: data.categoria,
    });

    return NextResponse.json(introito, { status: 201 });
  } catch (error: any) {
    console.error('Errore nella creazione dell\'introito:', error);

    if (error.message?.includes('permessi')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nella creazione dell\'introito' },
      { status: 500 }
    );
  }
}
