'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CategoriaIntroito } from '@/types/movimento.types';

interface Introito {
  id: string;
  descrizione: string;
  importo: number;
  data: string;
  categoria: CategoriaIntroito;
}

export default function IntroitiPage() {
  const { data: session } = useSession();
  const [introiti, setIntroiti] = useState<Introito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [mese, setMese] = useState(new Date().getMonth() + 1);
  const [anno, setAnno] = useState(new Date().getFullYear());

  const famigliaId = (session?.user as any)?.famigliaId;

  // Form state
  const [formData, setFormData] = useState({
    descrizione: '',
    importo: '',
    data: new Date().toISOString().split('T')[0],
    categoria: CategoriaIntroito.REDDITO,
  });

  const fetchIntroiti = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/introiti/miei?mese=${mese}&anno=${anno}`);

      if (!response.ok) {
        throw new Error('Errore nel caricamento degli introiti');
      }

      const data = await response.json();
      setIntroiti(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchIntroiti();
    }
  }, [session, mese, anno]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!famigliaId) {
        setError('Devi prima unirti o creare una famiglia');
        return;
      }

      const response = await fetch('/api/introiti/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          famigliaId,
          descrizione: formData.descrizione,
          importo: parseFloat(formData.importo),
          data: formData.data,
          categoria: formData.categoria,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella creazione dell\'introito');
      }

      // Reset form e ricarica introiti
      setFormData({
        descrizione: '',
        importo: '',
        data: new Date().toISOString().split('T')[0],
        categoria: CategoriaIntroito.REDDITO,
      });
      setShowForm(false);
      fetchIntroiti();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo introito?')) {
      return;
    }

    try {
      const response = await fetch(`/api/introiti/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nell\'eliminazione dell\'introito');
      }

      fetchIntroiti();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (!famigliaId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent>
            <p className="text-center text-gray-600 py-8">
              Devi prima unirti o creare una famiglia per gestire gli introiti
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Caricamento...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">I Miei Introiti</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annulla' : 'Nuovo Introito'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Filtri mese/anno */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex gap-4 items-end">
              <Input
                label="Mese"
                type="number"
                min="1"
                max="12"
                value={mese}
                onChange={(e) => setMese(parseInt(e.target.value))}
              />
              <Input
                label="Anno"
                type="number"
                min="2020"
                max="2100"
                value={anno}
                onChange={(e) => setAnno(parseInt(e.target.value))}
              />
              <Button onClick={fetchIntroiti}>Filtra</Button>
            </div>
          </CardContent>
        </Card>

        {/* Form creazione introito */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nuovo Introito</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Descrizione"
                  type="text"
                  value={formData.descrizione}
                  onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                  required
                />

                <Input
                  label="Importo (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.importo}
                  onChange={(e) => setFormData({ ...formData, importo: e.target.value })}
                  required
                />

                <Input
                  label="Data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value as CategoriaIntroito })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {Object.values(CategoriaIntroito).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <Button type="submit" fullWidth>
                  Crea Introito
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista introiti */}
        <Card>
          <CardHeader>
            <CardTitle>
              Introiti di {mese}/{anno}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {introiti.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nessun introito registrato per questo periodo
              </p>
            ) : (
              <div className="space-y-3">
                {introiti.map((introito) => (
                  <div
                    key={introito.id}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{introito.descrizione}</h3>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span>{formatDate(introito.data)}</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">
                          {introito.categoria}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(introito.importo)}
                      </span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(introito.id)}
                      >
                        Elimina
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Totale Introiti:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(introiti.reduce((sum, i) => sum + i.importo, 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
