import { getCurrentSession } from '@/lib/session';
import { getUserFamiglie } from '@/lib/user-helpers';
import { MySQLFamigliaRepository } from '@/repositories/mysql/FamigliaRepository';
import { MySQLAbitazioneRepository } from '@/repositories/mysql/AbitazioneRepository';

import { Card, CardContent } from '@/components/ui/Card';
import { redirect } from 'next/navigation';

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

      {/* Messaggio Work in Progress */}
      <Card className="border-2 border-yellow-400 bg-yellow-50">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Funzionalità in Sviluppo
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              La gestione delle abitazioni è attualmente in fase di sviluppo.
              Questa funzionalità sarà presto disponibile per permetterti di gestire
              le proprietà della tua famiglia.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
