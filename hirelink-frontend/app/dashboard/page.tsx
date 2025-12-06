// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type UserProfile = {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'candidate' | 'recruiter' | string;
  full_name?: string;
  is_validated?: boolean;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const access =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;

    if (!access) {
      router.replace('/login');
      return;
    }

    async function loadProfile() {
      try {
        const data = await apiFetch('/users/profile/', { method: 'GET' }, access!);
        setUser(data);
      } catch {
        setError('Impossible de charger votre profil. Veuillez vous reconnecter.');
      }
    }

    loadProfile();
  }, [router]);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-red-300">
        {error}
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-slate-200">
        Chargement du tableau de bord...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-slate-900 dark:text-slate-50">
      <h1 className="text-3xl font-bold mb-4">Tableau de bord</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Profil
          </h2>
          <p className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">Nom :</span>{' '}
            <span className="font-medium">
              {user.full_name || user.username}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">Email :</span>{' '}
            <span className="font-medium">{user.email}</span>
          </p>
          <p className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">Rôle :</span>{' '}
            <span className="font-medium capitalize">{user.role}</span>
          </p>
          {user.role === 'recruiter' && (
            <p className="mt-2 text-xs text-slate-400">
              Statut du compte recruteur :{' '}
              <span className="font-semibold text-slate-200">
                {user.is_validated ? 'Validé par un administrateur' : 'En attente de validation'}
              </span>
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Accès rapides
          </h2>
          <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-300">
            {user.role === 'candidate' && (
              <>
                <li>Consulter les offres disponibles</li>
                <li>Suivre vos candidatures</li>
              </>
            )}
            {user.role === 'recruiter' && (
              <>
                <li>Publier une nouvelle offre</li>
                <li>Gérer les candidatures reçues</li>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <li>Valider les comptes recruteurs</li>
                <li>Superviser l’activité de la plateforme</li>
              </>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}
