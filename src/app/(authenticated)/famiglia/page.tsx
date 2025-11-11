import { getCurrentSession } from '@/lib/session';
import { MySQLFamigliaRepository } from '@/repositories/mysql/FamigliaRepository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function famigliaPage() {
  const session = await getCurrentSession();
  const userId = session?.user?.id!;

  const famigliaRepository = new MySQLFamigliaRepository();
  const famiglia = await famigliaRepository.findByUserId(userId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Le mie famiglia
          </h1>
          <p className="mt-2 text-gray-600">
            Gestisci le famiglia di cui fai parte
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/famiglia/join">
            <Button variant="secondary">
              Unisciti
            </Button>
          </Link>
          <Link href="/famiglia/nuova">
            <Button variant="primary">
              + Crea Famiglia
            </Button>
          </Link>
        </div>
      </div>

      {famiglia.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nessuna famiglia trovata
            </h3>
            <p className="text-gray-600 mb-6">
              Crea una nuova famiglia o unisciti a una esistente
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {famiglia.map((famiglia) => (
            <Card key={famiglia.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Famiglia {famiglia.cognomeFamiliare}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Codice Invito</p>
                    <p className="font-mono text-lg font-bold text-gray-900">
                      {famiglia.codiceInvito}
                    </p>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Creata il: {new Date(famiglia.createdAt).toLocaleDateString('it-IT')}</p>
                  </div>

                  <Link href={`/famiglia/${famiglia.id}`}>
                    <Button variant="primary" size="sm" fullWidth>
                      Gestisci Famiglia
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
