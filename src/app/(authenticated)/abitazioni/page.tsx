import { getCurrentSession } from '@/lib/session';
import { getUserFamiglie } from '@/lib/user-helpers';
import { MySQLFamigliaRepository } from '@/repositories/mysql/FamigliaRepository';
import { MySQLAbitazioneRepository } from '@/repositories/mysql/AbitazioneRepository';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { redirect } from 'next/navigation';
import AbitazioniList from './AbitazioniList';

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

  const abitazioneRepository = new MySQLAbitazioneRepository();
  

  // Ottieni tutte le abitazioni con dettagli
  const abitazioni = await abitazioneRepository.findByFamigliaId(famiglia.id);

  if (!abitazioni) {
    return <div>Non ci sono abitazioni attive per la famiglia {famiglia.cognomeFamiliare}</div>;
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Gestione Abitazioni
        </h1>
        <p className="mt-2 text-gray-600">
          Famiglia {famiglia.cognomeFamiliare}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membri della Famiglia</CardTitle>
        </CardHeader>
            <AbitazioniList
              abitazioni={abitazioni}
              famigliaId={famiglia.id}
            />
      </Card>
    </div>
  );
}
