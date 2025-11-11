import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { userHasFamiglie, getUserFamiglie } from '@/lib/user-helpers';
import { MySQLFamigliaRepository } from '@/repositories/mysql/FamigliaRepository';
import { Navbar } from '@/components/layout/Navbar';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect('/login');
  }

  // Verifica ruoli e appartenenza famiglia
  const userId = session.user.id;
  const hasFamiglie = await userHasFamiglie(userId);
  let isCapofamiglia = false;
  let isLavoratore = false;

  if (hasFamiglie) {
    const famiglie = await getUserFamiglie(userId);
    const famiglia = famiglie[0];
    const famigliaRepository = new MySQLFamigliaRepository();
    const membro = await famigliaRepository.getMembro(userId, famiglia.id);

    isCapofamiglia = membro?.ruolo === 'CAPOFAMIGLIA';
    isLavoratore = membro?.isLavoratore ?? false;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={session.user}
        hasFamiglia={hasFamiglie}
        isCapofamiglia={isCapofamiglia}
        isLavoratore={isLavoratore}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
