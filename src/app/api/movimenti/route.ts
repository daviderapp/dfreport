import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { MovimentoService } from '@/services/MovimentoService';
import { MySQLMovimentoRepository, MySQLFamigliaRepository } from '@/repositories/mysql';
import { TipoMovimento, Categoria } from '@/types/movimento.types';

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

    if (!famigliaId) {
      return NextResponse.json(
        { error: 'famigliaId è obbligatorio' },
        { status: 400 }
      );
    }

    // Costruisci i filtri opzionali
    const filters: any = {};

    const tipoParam = searchParams.get('tipo');
    if (tipoParam) {
      filters.tipo = tipoParam.split(',') as TipoMovimento[];
    }

    const categorieParam = searchParams.get('categorie');
    if (categorieParam) {
      filters.categorie = categorieParam.split(',') as Categoria[];
    }

    const importoMin = searchParams.get('importoMin');
    if (importoMin) {
      filters.importoMin = parseFloat(importoMin);
    }

    const importoMax = searchParams.get('importoMax');
    if (importoMax) {
      filters.importoMax = parseFloat(importoMax);
    }

    const responsabile = searchParams.get('responsabile');
    if (responsabile) {
      filters.responsabile = responsabile;
    }

    const dataInizio = searchParams.get('dataInizio');
    if (dataInizio) {
      filters.dataInizio = new Date(dataInizio);
    }

    const dataFine = searchParams.get('dataFine');
    if (dataFine) {
      filters.dataFine = new Date(dataFine);
    }

    // Crea il service
    const movimentoRepo = new MySQLMovimentoRepository();
    const famigliaRepo = new MySQLFamigliaRepository();
    const movimentoService = new MovimentoService(movimentoRepo, famigliaRepo);

    // Ottieni i movimenti
    const movimenti = await movimentoService.getByFamigliaId(
      famigliaId,
      session.user.id,
      filters
    );

    return NextResponse.json(movimenti, { status: 200 });
  } catch (error: any) {
    console.error('Errore nel recupero dei movimenti:', error);

    if (error.message?.includes('permessi')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nel recupero dei movimenti' },
      { status: 500 }
    );
  }
}
