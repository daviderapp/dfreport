import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session';
import { MySQLFamigliaRepository } from '@/repositories/mysql/FamigliaRepository';
import { FamigliaService } from '@/services/FamigliaService';
import { UserRole } from '@/types/user.types';

/**
 * DELETE /api/famiglia/membri
 * Rimuove un membro dalla famiglia
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verifica autenticazione
    const userId = await getCurrentUserId();

    const body = await request.json();
    const { famigliaId, userId: targetUserId } = body;

    if (!famigliaId || !targetUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'famigliaId e userId sono richiesti',
        },
        { status: 400 }
      );
    }

    // Crea il service
    const famigliaRepository = new MySQLFamigliaRepository();
    const famigliaService = new FamigliaService(famigliaRepository);

    // Rimuove il membro
    await famigliaService.removeMembro(famigliaId, targetUserId, userId);

    return NextResponse.json(
      {
        success: true,
        message: 'Membro rimosso con successo',
      },
      { status: 200 }
    );
  } catch (error) {
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

/**
 * PATCH /api/famiglia/membri
 * Aggiorna il ruolo di un membro
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verifica autenticazione
    const userId = await getCurrentUserId();

    const body = await request.json();
    const { famigliaId, userId: targetUserId, nuovoRuolo } = body;

    if (!famigliaId || !targetUserId || !nuovoRuolo) {
      return NextResponse.json(
        {
          success: false,
          error: 'famigliaId, userId e nuovoRuolo sono richiesti',
        },
        { status: 400 }
      );
    }

    // Valida che il ruolo sia valido
    if (!Object.values(UserRole).includes(nuovoRuolo)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ruolo non valido',
        },
        { status: 400 }
      );
    }

    // Crea il service
    const famigliaRepository = new MySQLFamigliaRepository();
    const famigliaService = new FamigliaService(famigliaRepository);

    // Aggiorna il ruolo
    await famigliaService.updateRuoloMembro({
      famigliaId,
      userId: targetUserId,
      nuovoRuolo,
      richiedenteId: userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Ruolo aggiornato con successo',
      },
      { status: 200 }
    );
  } catch (error) {
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
