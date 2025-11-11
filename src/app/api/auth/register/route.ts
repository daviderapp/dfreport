import { NextRequest, NextResponse } from 'next/server';
import { MySQLUserRepository } from '@/repositories/mysql/UserRepository';
import { UserService } from '@/services/UserService';
import { RegisterUserSchema } from '@/lib/validation';
import { ZodError } from 'zod';

/**
 * POST /api/auth/register
 * Registra un nuovo utente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Valida i dati
    const validatedData = RegisterUserSchema.parse(body);

    // Crea il service
    const userRepository = new MySQLUserRepository();
    const userService = new UserService(userRepository);

    // Registra l'utente
    const user = await userService.register(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: 'Registrazione completata con successo',
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
