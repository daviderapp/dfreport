import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session';
import { MySQLFamigliaRepository } from '@/repositories/mysql/FamigliaRepository';
import { FamigliaService } from '@/services/FamigliaService';
import { CreateFamigliaSchema } from '@/lib/validation';
import { ZodError } from 'zod';

/**
 * POST /api/famiglia/create
 * Crea una nuova famiglia
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const userId = await getCurrentUserId();

    const body = await request.json();

    // Valida i dati
    const validatedData = CreateFamigliaSchema.parse(body);

    // Crea il service
    const famigliaRepository = new MySQLFamigliaRepository();
    const famigliaService = new FamigliaService(famigliaRepository);

    // Crea la famiglia
    const famiglia = await famigliaService.createFamiglia({
      cognomeFamiliare: validatedData.cognomeFamiliare,
      capofamigliaId: userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: famiglia,
        message: 'Famiglia creata con successo',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dati non validi',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server',
      },
      { status: 500 }
    );
  }
}
