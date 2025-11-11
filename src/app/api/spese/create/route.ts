import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { MovimentoService } from '@/services/MovimentoService';
import { MySQLMovimentoRepository, MySQLFamigliaRepository } from '@/repositories/mysql';
import { CategoriaSpesa, ResponsabileSpesa } from '@/types/movimento.types';
import { z } from 'zod';

const createSpesaSchema = z.object({
  famigliaId: z.string().uuid(),
  descrizione: z.string().min(1, 'La descrizione è obbligatoria').max(255),
  importo: z.number().positive('L\'importo deve essere positivo'),
  data: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data non valida',
  }),
  categoria: z.nativeEnum(CategoriaSpesa),
  responsabile: z.nativeEnum(ResponsabileSpesa),
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

    // 🔍 AGGIUNGI QUESTI LOG
    console.log('📦 Body ricevuto:', body);
    console.log('📝 Tipo categoria:', typeof body.categoria, body.categoria);
    console.log('📝 Tipo responsabile:', typeof body.responsabile, body.responsabile);
    console.log('🔢 Enum CategoriaSpesa:', Object.values(CategoriaSpesa));
    console.log('🔢 Enum ResponsabileSpesa:', Object.values(ResponsabileSpesa));
    const validationResult = createSpesaSchema.safeParse(body);

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

    // Crea la spesa
    const spesa = await movimentoService.createSpesa({
      famigliaId: data.famigliaId,
      userId: session.user.id,
      descrizione: data.descrizione,
      importo: data.importo,
      data: new Date(data.data),
      categoria: data.categoria,
      responsabile: data.responsabile,
    });

    return NextResponse.json(spesa, { status: 201 });
  } catch (error: any) {
    console.error('Errore nella creazione della spesa:', error);

    if (error.message?.includes('permessi')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nella creazione della spesa' },
      { status: 500 }
    );
  }
}
