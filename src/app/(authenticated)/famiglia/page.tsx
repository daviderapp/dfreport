import { getCurrentSession } from '@/lib/session';
import { MySQLFamigliaRepository } from '@/repositories/mysql/FamigliaRepository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function famigliaPage() {
  const session = await getCurrentSession();
  const userId = session?.user?.id!;

  const famigliaRepository = new MySQLFamigliaRepository();
  const famiglie = await famigliaRepository.findByUserId(userId);

  // Se non ha famiglia, mostra opzioni per creare o unirsi
  if (famiglie.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            La Mia Famiglia
          </h1>
          <p className="mt-2 text-gray-600">
            Crea o unisciti a una famiglia per iniziare
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nessuna Famiglia
            </h3>
            <p className="text-gray-600 mb-6">
              Crea una nuova famiglia o unisciti a una esistente per iniziare a gestire le tue finanze
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/famiglia/nuova">
                <Button variant="primary">
                  Crea Famiglia
                </Button>
              </Link>
              <Link href="/famiglia/join">
                <Button variant="secondary">
                  Inserisci Codice Invito
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ha una famiglia - mostra le informazioni
  const famiglia = famiglie[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Famiglia {famiglia.cognomeFamiliare}
        </h1>
        <p className="mt-2 text-gray-600">
          Informazioni sulla tua famiglia
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Codice Invito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Condividi questo codice per invitare nuovi membri</p>
              <p className="font-mono text-2xl font-bold text-gray-900 text-center">
                {famiglia.codiceInvito}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informazioni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nome Famiglia</p>
                <p className="font-semibold text-gray-900">Famiglia {famiglia.cognomeFamiliare}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Creata il</p>
                <p className="font-semibold text-gray-900">
                  {new Date(famiglia.createdAt).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
