'use client';

import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      password2: formData.get('password2'),
      role: formData.get('role'),
      full_name: formData.get('full_name'),
      phone: formData.get('phone'),
    };

    try {
      const data = await apiFetch('/users/register/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setMessage(data.message || 'Inscription réussie');
      form.reset();
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors de l’inscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Inscription</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="username"
          placeholder="Nom d’utilisateur"
          required
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="full_name"
          placeholder="Nom complet"
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="phone"
          placeholder="Téléphone"
          className="w-full rounded border px-3 py-2"
        />
        <select
          name="role"
          className="w-full rounded border px-3 py-2"
          defaultValue="candidate"
          required
        >
          <option value="candidate">Candidat</option>
          <option value="recruiter">Recruteur</option>
        </select>
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          required
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="password2"
          type="password"
          placeholder="Confirmer le mot de passe"
          required
          className="w-full rounded border px-3 py-2"
        />

        <button
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Inscription...' : 'S’inscrire'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}
    </div>
  );
}

