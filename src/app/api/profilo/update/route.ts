import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session';
import { MySQLUserRepository } from '@/repositories/mysql/UserRepository';
import { UserService } from '@/services/UserService';

/**
 * PUT /api/profilo/update
 * Aggiorna il profilo utente
 */
export async function PUT(request: NextRequest) {
  try {
    // Verifica autenticazione
    const userId = await getCurrentUserId();

    const body = await request.json();
    const { nome, cognome, email, dataNascita } = body;

    // Crea il service
    const userRepository = new MySQLUserRepository();
    const userService = new UserService(userRepository);

    // Aggiorna l'utente
    const updatedUser = await userService.update(userId, {
      nome,
      cognome,
      email,
      dataNascita: new Date(dataNascita),
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: 'Profilo aggiornato con successo',
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
