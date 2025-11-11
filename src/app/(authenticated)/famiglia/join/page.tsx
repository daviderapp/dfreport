'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function JoinFamigliaPage() {
  const router = useRouter();
  const [codiceInvito, setCodiceInvito] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/famiglie/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codiceInvito: codiceInvito.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore durante l\'adesione alla famiglia');
      } else {
        // Adesione completata con successo
        router.push('/famiglia?joined=true');
      }
    } catch (err) {
      setError('Errore di connessione al server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Unisciti a una Famiglia
        </h1>
        <p className="mt-2 text-gray-600">
          Inserisci il codice invito ricevuto dal Capofamiglia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Codice Invito</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Codice Invito"
              type="text"
              value={codiceInvito}
              onChange={(e) => setCodiceInvito(e.target.value.toUpperCase())}
              placeholder="Es: ABC12345"
              helperText="Il codice è di 8 caratteri (lettere e numeri)"
              maxLength={8}
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
                disabled={isLoading || codiceInvito.length !== 8}
                className="flex-1"
              >
                {isLoading ? 'Adesione in corso...' : 'Unisciti'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
