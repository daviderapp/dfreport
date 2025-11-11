'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TipoMovimento, Categoria, ResponsabileSpesa } from '@/types/movimento.types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Movimento {
  id: string;
  tipo: TipoMovimento;
  descrizione: string;
  importo: number;
  data: string;
  categoria: Categoria;
  responsabile?: ResponsabileSpesa;
  nomeUtente: string;
  cognomeUtente: string;
  coloreCategoria: string;
}

interface StatisticaCategoria {
  categoria: Categoria;
  colore: string;
  totale: number;
  numeroMovimenti: number;
  percentuale: number;
}

export default function ReportPage() {
  const { data: session } = useSession();
  const [movimenti, setMovimenti] = useState<Movimento[]>([]);
  const [statisticheSpese, setStatisticheSpese] = useState<StatisticaCategoria[]>([]);
  const [statisticheIntroiti, setStatisticheIntroiti] = useState<StatisticaCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mese, setMese] = useState(new Date().getMonth() + 1);
  const [anno, setAnno] = useState(new Date().getFullYear());

  // Filtri
  const [filtri, setFiltri] = useState({
    tipo: [] as TipoMovimento[],
    categorie: [] as Categoria[],
    importoMin: '',
    importoMax: '',
    responsabile: '',
  });

  const famigliaId = (session?.user as any)?.famigliaId;

  const fetchMovimenti = async () => {
    if (!famigliaId) return;

    try {
      setLoading(true);

      // Calcola date inizio e fine mese
      const dataInizio = new Date(anno, mese - 1, 1).toISOString().split('T')[0];
      const dataFine = new Date(anno, mese, 0).toISOString().split('T')[0];

      // Costruisci query string
      const params = new URLSearchParams({
        famigliaId,
        dataInizio,
        dataFine,
      });

      if (filtri.tipo.length > 0) {
        params.append('tipo', filtri.tipo.join(','));
      }
      if (filtri.categorie.length > 0) {
        params.append('categorie', filtri.categorie.join(','));
      }
      if (filtri.importoMin) {
        params.append('importoMin', filtri.importoMin);
      }
      if (filtri.importoMax) {
        params.append('importoMax', filtri.importoMax);
      }
      if (filtri.responsabile) {
        params.append('responsabile', filtri.responsabile);
      }

      const response = await fetch(`/api/movimenti?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Errore nel caricamento dei movimenti');
      }

      const data = await response.json();
      setMovimenti(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistiche = async () => {
    if (!famigliaId) return;

    try {
      // Fetch statistiche spese
      const responseSpese = await fetch(
        `/api/report/statistiche-spese?famigliaId=${famigliaId}&mese=${mese}&anno=${anno}`
      );
      if (responseSpese.ok) {
        const dataSpese = await responseSpese.json();
        setStatisticheSpese(dataSpese);
      }

      // Fetch statistiche introiti
      const responseIntroiti = await fetch(
        `/api/report/statistiche-introiti?famigliaId=${famigliaId}&mese=${mese}&anno=${anno}`
      );
      if (responseIntroiti.ok) {
        const dataIntroiti = await responseIntroiti.json();
        setStatisticheIntroiti(dataIntroiti);
      }
    } catch (err: any) {
      console.error('Errore nel caricamento delle statistiche:', err);
    }
  };

  useEffect(() => {
    if (session && famigliaId) {
      fetchMovimenti();
      fetchStatistiche();
    }
  }, [session, famigliaId, mese, anno]);

  const handleFiltri = () => {
    fetchMovimenti();
  };

  const resetFiltri = () => {
    setFiltri({
      tipo: [],
      categorie: [],
      importoMin: '',
      importoMax: '',
      responsabile: '',
    });
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

  const totaleSpese = movimenti
    .filter((m) => m.tipo === TipoMovimento.SPESA)
    .reduce((sum, m) => sum + m.importo, 0);

  const totaleIntroiti = movimenti
    .filter((m) => m.tipo === TipoMovimento.INTROITO)
    .reduce((sum, m) => sum + m.importo, 0);

  const bilancio = totaleIntroiti - totaleSpese;

  if (!famigliaId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent>
            <p className="text-center text-gray-600 py-8">
              Devi prima unirti o creare una famiglia per visualizzare i report
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Report Mensile</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Selezione mese/anno */}
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
            </div>
          </CardContent>
        </Card>

        {/* Riepilogo bilancio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Totale Introiti</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totaleIntroiti)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Totale Spese</h3>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totaleSpese)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Bilancio</h3>
              <p className={`text-2xl font-bold ${bilancio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(bilancio)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistiche per categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Statistiche Spese */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione Spese per Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {statisticheSpese.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nessuna spesa nel periodo selezionato</p>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statisticheSpese.map(stat => ({
                          name: stat.categoria,
                          value: stat.totale,
                          percentuale: stat.percentuale
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentuale }) => `${name} (${percentuale.toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statisticheSpese.map((stat, index) => (
                          <Cell key={`cell-${index}`} fill={stat.colore} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistiche Introiti */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione Introiti per Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {statisticheIntroiti.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nessun introito nel periodo selezionato</p>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statisticheIntroiti.map(stat => ({
                          name: stat.categoria,
                          value: stat.totale,
                          percentuale: stat.percentuale
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentuale }) => `${name} (${percentuale.toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statisticheIntroiti.map((stat, index) => (
                          <Cell key={`cell-${index}`} fill={stat.colore} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filtri */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtri Movimenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtri.tipo.includes(TipoMovimento.SPESA)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFiltri({ ...filtri, tipo: [...filtri.tipo, TipoMovimento.SPESA] });
                        } else {
                          setFiltri({ ...filtri, tipo: filtri.tipo.filter(t => t !== TipoMovimento.SPESA) });
                        }
                      }}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Spesa</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtri.tipo.includes(TipoMovimento.INTROITO)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFiltri({ ...filtri, tipo: [...filtri.tipo, TipoMovimento.INTROITO] });
                        } else {
                          setFiltri({ ...filtri, tipo: filtri.tipo.filter(t => t !== TipoMovimento.INTROITO) });
                        }
                      }}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Introito</span>
                  </label>
                </div>
              </div>

              <Input
                label="Importo Minimo (€)"
                type="number"
                step="0.01"
                value={filtri.importoMin}
                onChange={(e) => setFiltri({ ...filtri, importoMin: e.target.value })}
              />

              <Input
                label="Importo Massimo (€)"
                type="number"
                step="0.01"
                value={filtri.importoMax}
                onChange={(e) => setFiltri({ ...filtri, importoMax: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleFiltri}>Applica Filtri</Button>
              <Button variant="secondary" onClick={resetFiltri}>
                Reset Filtri
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista movimenti */}
        <Card>
          <CardHeader>
            <CardTitle>Movimenti del periodo</CardTitle>
          </CardHeader>
          <CardContent>
            {movimenti.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nessun movimento trovato per i filtri selezionati
              </p>
            ) : (
              <div className="space-y-2">
                {movimenti.map((movimento) => (
                  <div
                    key={movimento.id}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            movimento.tipo === TipoMovimento.SPESA
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {movimento.tipo}
                        </span>
                        <h3 className="font-semibold text-gray-900">{movimento.descrizione}</h3>
                      </div>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span>{formatDate(movimento.data)}</span>
                        <span
                          className="px-2 py-0.5 rounded text-white text-xs"
                          style={{ backgroundColor: movimento.coloreCategoria }}
                        >
                          {movimento.categoria}
                        </span>
                        <span>
                          {movimento.nomeUtente} {movimento.cognomeUtente}
                        </span>
                        {movimento.responsabile && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {movimento.responsabile}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${
                          movimento.tipo === TipoMovimento.SPESA ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {movimento.tipo === TipoMovimento.SPESA ? '-' : '+'}
                        {formatCurrency(movimento.importo)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
