'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type UserProfile = {
  id: number;
  username: string;
  email: string;
  role: string;
  full_name?: string;
  phone?: string;
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
      } catch (err: any) {
        setError('Impossible de charger le profil');
      }
    }

    loadProfile();
  }, [router]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!user) {
    return <p>Chargement du profil...</p>;
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Bonjour, {user.full_name || user.username}</p>
      <p>Rôle : {user.role}</p>
      <p>Email : {user.email}</p>
      {user.role === 'recruiter' && (
        <p>Statut validation : {user.is_validated ? 'Validé' : 'En attente'}</p>
      )}
    </div>
  );
}
