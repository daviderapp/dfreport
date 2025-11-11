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
    const mese = parseInt(searchParams.get('mese') || String(new Date().getMonth() + 1));
    const anno = parseInt(searchParams.get('anno') || String(new Date().getFullYear()));

    // Crea il service
    const movimentoRepo = new MySQLMovimentoRepository();
    const famigliaRepo = new MySQLFamigliaRepository();
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

    return NextResponse.json(
      { error: 'Errore nel recupero degli introiti' },
      { status: 500 }
    );
  }
}
