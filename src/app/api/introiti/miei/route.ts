import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { MovimentoService } from '@/services/MovimentoService';
import { MySQLMovimentoRepository, MySQLFamigliaRepository } from '@/repositories/mysql';
import { canManageIntroiti } from '@/lib/auth-helpers';
import { getUserFamiglie } from '@/lib/user-helpers';

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

    // Verifica che l'utente appartenga a una famiglia
    const famiglie = await getUserFamiglie(session.user.id);
    if (famiglie.length === 0) {
      return NextResponse.json(
        { error: 'Devi appartenere a una famiglia per visualizzare gli introiti' },
        { status: 403 }
      );
    }

    // Verifica che l'utente abbia i permessi per gestire introiti (CAPOFAMIGLIA o LAVORATORE)
    const famigliaRepo = new MySQLFamigliaRepository();
    const membro = await famigliaRepo.getMembro(session.user.id, famiglie[0].id);

    if (!canManageIntroiti(membro)) {
      return NextResponse.json(
        { error: 'Non hai i permessi per visualizzare gli introiti. Solo il Capofamiglia e i Lavoratori possono gestire gli introiti.' },
        { status: 403 }
      );
    }

    // Ottieni parametri dalla query string
    const searchParams = request.nextUrl.searchParams;
    const mese = parseInt(searchParams.get('mese') || String(new Date().getMonth() + 1));
    const anno = parseInt(searchParams.get('anno') || String(new Date().getFullYear()));

    // Crea il service
    const movimentoRepo = new MySQLMovimentoRepository();
    const movimentoService = new MovimentoService(movimentoRepo, famigliaRepo);

    // Ottieni gli introiti personali
    const movimenti = await movimentoService.getByUserIdAndMonth(
      session.user.id,
      mese,
      anno
    );

    // Filtra solo gli introiti
    const introiti = movimenti.filter(m => m.tipo === 'INTROITO');

    return NextResponse.json(introiti, { status: 200 });
  } catch (error: any) {
    console.error('Errore nel recupero degli introiti:', error);

    if (error.message?.includes('permessi')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nel recupero degli introiti' },
      { status: 500 }
    );
  }
}
