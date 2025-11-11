'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types/user.types';

interface AbitazioneListItem {
  userId: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: UserRole;
  joinedAt: Date;
}

interface AbitazioniListProps {
  abitazioni: AbitazioneListItem[];
  famigliaId: string;
}

export default function AbitazioniList({ abitazioni, famigliaId }: AbitazioniListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveMembro = async (userId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questo membro dalla famiglia?')) {
      return;
    }

    setRemovingId(userId);

    try {
      const response = await fetch('/api/famiglie/membri', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          famigliaId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nella rimozione del membro');
      }

      // Ricarica la pagina per aggiornare la lista
      window.location.reload();
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nella rimozione del membro');
    } finally {
      setRemovingId(null);
    }
  };


  return (
    <div className="space-y-4">
      {abitazioni.map((abitazione) => (
        <div
          key={membro.userId}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                {membro.nome.charAt(0)}
                {membro.cognome.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {membro.nome} {membro.cognome}
                </h3>
                <p className="text-sm text-gray-600">{membro.email}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <select
                className="rounded-full bg-gray-400 p-[1px] text-center"
                defaultValue={membro.ruolo?.toLowerCase() === 'lavoratore' ? 'Lavoratore' : 'Membro'}
                onChange={() => {}}
              >
                <option value="Membro">Membro</option>
                <option value="Lavoratore">Lavoratore</option>
              </select>

            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => handleRemoveMembro(membro.userId)}
              disabled={removingId === membro.userId}
            >
              {removingId === membro.userId ? 'Rimozione...' : 'Rimuovi'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
