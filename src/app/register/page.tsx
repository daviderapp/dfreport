'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Image from 'next/image';


export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confirmPassword: '',
    dataNascita: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'La password deve contenere almeno 8 caratteri';
    }

    if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'La password deve contenere almeno una lettera maiuscola';
    }

    if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'La password deve contenere almeno una lettera minuscola';
    }

    if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'La password deve contenere almeno un numero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          cognome: formData.cognome,
          email: formData.email,
          password: formData.password,
          dataNascita: new Date(formData.dataNascita),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // Errori di validazione Zod
          const zodErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            zodErrors[error.path[0]] = error.message;
          });
          setErrors(zodErrors);
        } else {
          setErrors({ general: data.error || 'Errore durante la registrazione' });
        }
      } else {
        // Registrazione riuscita, reindirizza al login
        router.push('/login?registered=true');
      }
    } catch (err) {
      setErrors({ general: 'Errore di connessione al server' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8 flex flex-col items-center gap-2">
                      <Image src="/dfreport-logo.png" alt="DFReport" width={200} height={200} />
                  <p className="text-gray-600">Gestione Economica Familiare</p>
                </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrati</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.general}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  error={errors.nome}
                  required
                />

                <Input
                  label="Cognome"
                  type="text"
                  value={formData.cognome}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                  error={errors.cognome}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                placeholder="tua@email.com"
                required
              />

              <Input
                label="Data di Nascita"
                type="date"
                value={formData.dataNascita}
                onChange={(e) => setFormData({ ...formData, dataNascita: e.target.value })}
                error={errors.dataNascita}
                required
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                helperText="Min. 8 caratteri, maiuscola, minuscola, numero"
                required
              />

              <Input
                label="Conferma Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                required
              />

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Registrazione in corso...' : 'Registrati'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Hai già un account?{' '}
                <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Accedi
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
