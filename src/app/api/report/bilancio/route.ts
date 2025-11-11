import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { MovimentoService } from '@/services/MovimentoService';
import { MySQLMovimentoRepository, MySQLFamigliaRepository } from '@/repositories/mysql';

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Ottieni parametri dalla query string
    const searchParams = request.nextUrl.searchParams;
    const famigliaId = searchParams.get('famigliaId');
    const anno = parseInt(searchParams.get('anno') || String(new Date().getFullYear()));

    if (!famigliaId) {
      return NextResponse.json(
        { error: 'famigliaId è obbligatorio' },
        { status: 400 }
      );
    }

    // Crea il service
    const movimentoRepo = new MySQLMovimentoRepository();
    const famigliaRepo = new MySQLFamigliaRepository();
    const movimentoService = new MovimentoService(movimentoRepo, famigliaRepo);

    // Ottieni il bilancio mensile
    const bilancio = await movimentoService.getBilancioMensile(
      famigliaId,
      session.user.id,
      anno
    );

    return NextResponse.json(bilancio, { status: 200 });
  } catch (error: any) {
    console.error('Errore nel recupero del bilancio:', error);

    if (error.message?.includes('permessi')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nel recupero del bilancio' },
      { status: 500 }
    );
  }
}
