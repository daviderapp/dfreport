import { getCurrentSession } from '@/lib/session';
import { userHasFamiglie, getUserFamiglie } from '@/lib/user-helpers';
import { MySQLFamigliaRepository } from '@/repositories/mysql/FamigliaRepository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import DashboardClient from './DashboardClient';
import Script from 'next/script';

export default async function DashboardPage() {
  const session = await getCurrentSession();
  const userId = session?.user?.id!;
  const hasFamiglie = await userHasFamiglie(userId);

  let ruoloInFamiglia = null;
  if (hasFamiglie) {
    const famiglie = await getUserFamiglie(userId);
    const famiglia = famiglie[0]; // L'utente ha solo 1 famiglia
    const famigliaRepository = new MySQLFamigliaRepository();
    const membro = await famigliaRepository.getMembro(userId, famiglia.id);
    ruoloInFamiglia = membro?.ruolo;
  }

  // Dashboard per utente SENZA famiglia
  if (!hasFamiglie) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Benvenuto, {session?.user?.nome}!
          </h1>
          <p className="mt-2 text-gray-600">
            Per iniziare devi prima creare o unirti a una famiglia
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-2">
            👋 Primo accesso
          </h2>
          <p className="text-green-800">
            Per gestire le tue finanze familiari, devi prima creare una nuova famiglia
            oppure unirti a una famiglia esistente usando un codice invito.
          </p>
        </div>

        {/* Due CTA principali */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Crea Famiglia */}
          <Card className="border-2 border-green-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-green-700">➕ Crea Famiglia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Crea una nuova famiglia e diventa Capofamiglia. Potrai invitare membri e gestire le finanze.
              </p>
              <Link href="/famiglia/nuova">
                <Button variant="primary" fullWidth>
                  Crea Famiglia
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card Aderisci */}
          <Card className="border-2 border-green-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-green-700">🔗 Aderisci a Famiglia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Hai ricevuto un codice invito da un Capofamiglia? Inseriscilo qui per unirti.
              </p>
              <Link href="/famiglia/join">
                <Button variant="primary" fullWidth>
                  Inserisci Codice
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard per utente CON famiglia
  const isCapofamiglia = ruoloInFamiglia === 'CAPOFAMIGLIA';
  const famiglie = await getUserFamiglie(userId);
  const famigliaId = famiglie[0]?.id;

  return (
    <>
      <Script
        id="famiglia-id"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.__FAMIGLIA_ID__ = "${famigliaId}";`,
        }}
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Benvenuto, {session?.user?.nome}!
          </h1>
          <p className="mt-2 text-gray-600">
            Gestisci le tue finanze familiari
            {ruoloInFamiglia && <span className="ml-2 text-sm font-semibold text-green-600">({ruoloInFamiglia})</span>}
          </p>
        </div>

        <DashboardClient isCapofamiglia={isCapofamiglia} />
      </div>
    </>
  );
}
