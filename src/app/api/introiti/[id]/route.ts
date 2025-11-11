import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { MovimentoService } from '@/services/MovimentoService';
import { MySQLMovimentoRepository, MySQLFamigliaRepository } from '@/repositories/mysql';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifica autenticazione
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Crea il service
    const movimentoRepo = new MySQLMovimentoRepository();
    const famigliaRepo = new MySQLFamigliaRepository();
    const movimentoService = new MovimentoService(movimentoRepo, famigliaRepo);

    // Elimina l'introito
    await movimentoService.delete(id, session.user.id);

    return NextResponse.json(
      { message: 'Introito eliminato con successo' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Errore nell\'eliminazione dell\'introito:', error);

    if (error.message?.includes('permessi')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error.message?.includes('non trovato')) {
      return NextResponse.json(
        { error: 'Introito non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'introito' },
      { status: 500 }
    );
  }
}
