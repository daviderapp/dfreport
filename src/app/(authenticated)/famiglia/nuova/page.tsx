'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function NuovaFamigliaPage() {
  const router = useRouter();
  const { update } = useSession();
  const [cognomeFamiliare, setCognomeFamiliare] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [codiceInvito, setCodiceInvito] = useState('');
  const [copiato, setCopiato] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/famiglie/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cognomeFamiliare }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore durante la creazione della famiglia');
      } else {
        // Famiglia creata con successo - aggiorna la sessione
        await update();

        // Mostra modal con codice invito
        setCodiceInvito(data.data.codiceInvito);
        setShowModal(true);
      }
    } catch (err) {
      setError('Errore di connessione al server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCodice = async () => {
    try {
      await navigator.clipboard.writeText(codiceInvito);
      setCopiato(true);
    } catch (err) {
      console.error('Errore nella copia del codice:', err);
    }
  };

  const handleCloseModal = async () => {
    setShowModal(false);
    // Aggiorna la sessione prima di reindirizzare (per sicurezza)
    await update();
    // Reindirizza alla dashboard e forza il refresh
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Crea una Nuova Famiglia
        </h1>
        <p className="mt-2 text-gray-600">
          Diventerai automaticamente il Capofamiglia e potrai invitare altri membri
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informazioni Famiglia</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Cognome Familiare"
              type="text"
              value={cognomeFamiliare}
              onChange={(e) => setCognomeFamiliare(e.target.value)}
              placeholder="Es: Rossi"
              helperText="Questo sarà il nome della tua famiglia"
              required
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !cognomeFamiliare}
                className="flex-1"
              >
                {isLoading ? 'Creazione in corso...' : 'Crea Famiglia'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal Codice Invito */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Famiglia Creata con Successo!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Ecco il codice invito per far unire altri membri alla tua famiglia.
                Puoi copiarlo una sola volta.
              </p>

              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">
                  Codice Invito
                </p>
                <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                  {codiceInvito}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleCopyCodice}
                  disabled={copiato}
                  variant={copiato ? 'secondary' : 'primary'}
                  fullWidth
                >
                  {copiato ? '✓ Codice Copiato!' : 'Copia Codice Invito'}
                </Button>

                <Button
                  onClick={handleCloseModal}
                  variant="secondary"
                  fullWidth
                  disabled={!copiato}
                >
                  {copiato ? 'Vai alla Dashboard' : 'Copia prima il codice'}
                </Button>
              </div>

              {!copiato && (
                <p className="text-xs text-red-600 mt-4">
                  ⚠️ Ricorda di copiare il codice prima di chiudere!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
