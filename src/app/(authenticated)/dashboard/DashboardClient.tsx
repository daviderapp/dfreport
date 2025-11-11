'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CategoriaSpesa, ResponsabileSpesa, CategoriaIntroito } from '@/types/movimento.types';
import Link from 'next/link';

interface Spesa {
  id: string;
  descrizione: string;
  importo: number;
  data: string;
  categoria: CategoriaSpesa;
  responsabile: ResponsabileSpesa;
}

interface Introito {
  id: string;
  descrizione: string;
  importo: number;
  data: string;
  categoria: CategoriaIntroito;
}

interface DashboardClientProps {
  isCapofamiglia: boolean;
  canManageIntroiti: boolean;
}

export default function DashboardClient({ isCapofamiglia, canManageIntroiti }: DashboardClientProps) {
  const { data: session, status } = useSession();
  const famigliaId = (session?.user as any)?.famigliaId;
  const [spese, setSpese] = useState<Spesa[]>([]);
  const [introiti, setIntroiti] = useState<Introito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showSpesaForm, setShowSpesaForm] = useState(false);
  const [showIntroitoForm, setShowIntroitoForm] = useState(false);

  const [mese] = useState(new Date().getMonth() + 1);
  const [anno] = useState(new Date().getFullYear());

  // Form Spesa
  const [spesaForm, setSpesaForm] = useState({
    descrizione: '',
    importo: '',
    data: new Date().toISOString().split('T')[0],
    categoria: CategoriaSpesa.ALIMENTARI,
    responsabile: ResponsabileSpesa.PERSONALE,
  });

  // Form Introito
  const [introitoForm, setIntroitoForm] = useState({
    descrizione: '',
    importo: '',
    data: new Date().toISOString().split('T')[0],
    categoria: CategoriaIntroito.REDDITO,
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch spese (with cache busting)
      const spesaRes = await fetch(`/api/spese/mie?mese=${mese}&anno=${anno}&t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (spesaRes.ok) {
        const spesaData = await spesaRes.json();
        setSpese(spesaData);
      }

      // Fetch introiti (with cache busting)
      const introitoRes = await fetch(`/api/introiti/miei?mese=${mese}&anno=${anno}&t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (introitoRes.ok) {
        const introitoData = await introitoRes.json();
        setIntroiti(introitoData);
      }
    } catch (err: any) {
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (famigliaId) {
      fetchData();
    }
  }, [famigliaId]);

  const handleCreateSpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!famigliaId) {
      setError('Errore: famigliaId non disponibile. Ricarica la pagina.');
      return;
    }

    try {
      const response = await fetch('/api/spese/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          famigliaId,
          descrizione: spesaForm.descrizione,
          importo: parseFloat(spesaForm.importo),
          data: spesaForm.data,
          categoria: spesaForm.categoria,
          responsabile: spesaForm.responsabile,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nella creazione della spesa');
      }

      setSpesaForm({
        descrizione: '',
        importo: '',
        data: new Date().toISOString().split('T')[0],
        categoria: CategoriaSpesa.ALIMENTARI,
        responsabile: ResponsabileSpesa.PERSONALE,
      });
      setShowSpesaForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSpesa = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa spesa?')) return;

    try {
      const response = await fetch(`/api/spese/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione della spesa');
      }
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateIntroito = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!famigliaId) {
      setError('Errore: famigliaId non disponibile. Ricarica la pagina.');
      return;
    }

    try {
      const response = await fetch('/api/introiti/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          famigliaId,
          descrizione: introitoForm.descrizione,
          importo: parseFloat(introitoForm.importo),
          data: introitoForm.data,
          categoria: introitoForm.categoria,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nella creazione dell\'introito');
      }

      setIntroitoForm({
        descrizione: '',
        importo: '',
        data: new Date().toISOString().split('T')[0],
        categoria: CategoriaIntroito.REDDITO,
      });
      setShowIntroitoForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteIntroito = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo introito?')) return;

    try {
      const response = await fetch(`/api/introiti/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione dell\'introito');
      }
      fetchData();
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

  // Show loading state while session is loading or famiglia is not yet available
  if (status === 'loading' || (loading && !famigliaId)) {
    return <div className="text-center py-8">Caricamento...</div>;
  }

  // If session is loaded but no famigliaId, show error
  if (!famigliaId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Famiglia non disponibile</p>
        <p className="text-sm mt-1">Ricarica la pagina per aggiornare la sessione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Quick Links */}
      {isCapofamiglia && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/famiglia/membri">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-4">
                <div className="text-center">
                  <span className="text-2xl mb-2 block">👥</span>
                  <span className="font-semibold">Gestione Membri</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/report">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-4">
                <div className="text-center">
                  <span className="text-2xl mb-2 block">📊</span>
                  <span className="font-semibold">Report</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/abitazioni">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-4">
                <div className="text-center">
                  <span className="text-2xl mb-2 block">🏠</span>
                  <span className="font-semibold">Abitazioni</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      <div className={`grid grid-cols-1 ${canManageIntroiti ? 'lg:grid-cols-2' : ''} gap-6`}>
        {/* Sezione Spese */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Le Mie Spese</CardTitle>
              <Button size="sm" onClick={() => setShowSpesaForm(!showSpesaForm)}>
                {showSpesaForm ? 'Annulla' : '+ Nuova Spesa'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showSpesaForm && (
              <form onSubmit={handleCreateSpesa} className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  label="Descrizione"
                  value={spesaForm.descrizione}
                  onChange={(e) => setSpesaForm({ ...spesaForm, descrizione: e.target.value })}
                  required
                />
                <Input
                  label="Importo (€)"
                  type="number"
                  step="0.01"
                  value={spesaForm.importo}
                  onChange={(e) => setSpesaForm({ ...spesaForm, importo: e.target.value })}
                  required
                />
                <Input
                  label="Data"
                  type="date"
                  value={spesaForm.data}
                  onChange={(e) => setSpesaForm({ ...spesaForm, data: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={spesaForm.categoria}
                    onChange={(e) => setSpesaForm({ ...spesaForm, categoria: e.target.value as CategoriaSpesa })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    {Object.values(CategoriaSpesa).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsabile</label>
                  <select
                    value={spesaForm.responsabile}
                    onChange={(e) => setSpesaForm({ ...spesaForm, responsabile: e.target.value as ResponsabileSpesa })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value={ResponsabileSpesa.PERSONALE}>Personale</option>
                    <option value={ResponsabileSpesa.FAMILIARE}>Familiare</option>
                  </select>
                </div>
                <Button type="submit" fullWidth>Crea Spesa</Button>
              </form>
            )}

            {spese.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nessuna spesa registrata</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {spese.map((spesa) => (
                  <div key={spesa.id} className="flex justify-between items-start p-3 border-solid border-[#80808030] rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{spesa.descrizione}</h4>
                      <div className="flex gap-2 mt-1 text-xs text-gray-600">
                        <span>{formatDate(spesa.data)}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{spesa.categoria}</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded">{spesa.responsabile}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-600">{formatCurrency(spesa.importo)}</span>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteSpesa(spesa.id)}>×</Button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Totale:</span>
                    <span className="text-red-600">{formatCurrency(spese.reduce((sum, s) => sum + s.importo, 0))}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sezione Introiti - Solo per CAPOFAMIGLIA e LAVORATORE */}
        {canManageIntroiti && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>I Miei Introiti</CardTitle>
              <Button size="sm" onClick={() => setShowIntroitoForm(!showIntroitoForm)}>
                {showIntroitoForm ? 'Annulla' : '+ Nuovo Introito'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showIntroitoForm && (
              <form onSubmit={handleCreateIntroito} className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  label="Descrizione"
                  value={introitoForm.descrizione}
                  onChange={(e) => setIntroitoForm({ ...introitoForm, descrizione: e.target.value })}
                  required
                />
                <Input
                  label="Importo (€)"
                  type="number"
                  step="0.01"
                  value={introitoForm.importo}
                  onChange={(e) => setIntroitoForm({ ...introitoForm, importo: e.target.value })}
                  required
                />
                <Input
                  label="Data"
                  type="date"
                  value={introitoForm.data}
                  onChange={(e) => setIntroitoForm({ ...introitoForm, data: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={introitoForm.categoria}
                    onChange={(e) => setIntroitoForm({ ...introitoForm, categoria: e.target.value as CategoriaIntroito })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    {Object.values(CategoriaIntroito).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" fullWidth>Crea Introito</Button>
              </form>
            )}

            {introiti.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nessun introito registrato</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {introiti.map((introito) => (
                  <div key={introito.id} className="flex justify-between items-start p-3 border-solid border-[#80808030] rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{introito.descrizione}</h4>
                      <div className="flex gap-2 mt-1 text-xs text-gray-600">
                        <span>{formatDate(introito.data)}</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">{introito.categoria}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-600">{formatCurrency(introito.importo)}</span>
                      <Button className="bg-transparent bg-none text-[red]" variant="danger" size="sm" onClick={() => handleDeleteIntroito(introito.id)}>×</Button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Totale:</span>
                    <span className="text-green-600">{formatCurrency(introiti.reduce((sum, i) => sum + i.importo, 0))}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
