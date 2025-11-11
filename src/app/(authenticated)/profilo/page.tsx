import { getCurrentSession } from '@/lib/session';
import { MySQLUserRepository } from '@/repositories/mysql/UserRepository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import ProfiloForm from './ProfiloForm';

export default async function ProfiloPage() {
  const session = await getCurrentSession();
  const userId = session?.user?.id!;

  const userRepository = new MySQLUserRepository();
  const user = await userRepository.findById(userId);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Errore: utente non trovato</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Il mio Profilo
        </h1>
        <p className="mt-2 text-gray-600">
          Gestisci i tuoi dati personali
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informazioni Personali</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfiloForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
