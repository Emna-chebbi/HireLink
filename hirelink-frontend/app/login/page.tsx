'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const data = await apiFetch('/users/login/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_id', String(data.user_id));
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Connexion</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          required
          className="w-full rounded border px-3 py-2"
        />
        <button
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
