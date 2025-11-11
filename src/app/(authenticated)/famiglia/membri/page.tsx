import { getCurrentSession } from '@/lib/session';
import { getUserFamiglie } from '@/lib/user-helpers';
import { MySQLFamigliaRepository } from '@/repositories/mysql/FamigliaRepository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { redirect } from 'next/navigation';
import MembriList from './MembriList';

export default async function GestioneMembriPage() {
  const session = await getCurrentSession();
  const userId = session?.user?.id!;

  const famiglie = await getUserFamiglie(userId);

  if (famiglie.length === 0) {
    redirect('/dashboard');
  }

  const famiglia = famiglie[0];
  const famigliaRepository = new MySQLFamigliaRepository();

  // Verifica che sia capofamiglia
  const membro = await famigliaRepository.getMembro(userId, famiglia.id);
  if (membro?.ruolo !== 'CAPOFAMIGLIA') {
    redirect('/dashboard');
  }

  // Ottieni tutti i membri con dettagli
  const famigliaConMembri = await famigliaRepository.findConMembri(famiglia.id);

  if (!famigliaConMembri) {
    return <div>Errore nel caricamento dei membri</div>;
  }

  // Escludi il capofamiglia dalla lista
  const membriSenzaCapo = famigliaConMembri.membri.filter(m => m.userId !== userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Gestione Membri
        </h1>
        <p className="mt-2 text-gray-600">
          Famiglia {famiglia.cognomeFamiliare}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membri della Famiglia</CardTitle>
        </CardHeader>
        <CardContent>
          {membriSenzaCapo.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessun membro nella famiglia. Condividi il codice invito per aggiungere membri.
            </div>
          ) : (
            <MembriList
              membri={membriSenzaCapo}
              famigliaId={famiglia.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
