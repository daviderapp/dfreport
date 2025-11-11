'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User } from '@/types/user.types';

interface ProfiloFormProps {
  user: User;
}

export default function ProfiloForm({ user }: ProfiloFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: user.nome,
    cognome: user.cognome,
    email: user.email,
    dataNascita: user.dataNascita.toString().split('T')[0], // YYYY-MM-DD format
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/profilo/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore durante l\'aggiornamento del profilo');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setError('Errore di connessione al server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          ✅ Profilo aggiornato con successo!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome"
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
        />

        <Input
          label="Cognome"
          type="text"
          value={formData.cognome}
          onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <Input
        label="Data di Nascita"
        type="date"
        value={formData.dataNascita}
        onChange={(e) => setFormData({ ...formData, dataNascita: e.target.value })}
        required
      />

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/dashboard')}
          className="flex-1"
        >
          Annulla
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
      </div>
    </form>
  );
}
