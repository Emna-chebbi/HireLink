// app/page.tsx
export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-slate-50">
      <h1 className="text-4xl font-bold mb-4">Bienvenue sur HireLink</h1>
      <p className="text-slate-300 max-w-2xl">
        Portail de recrutement avec backend Django (authentification JWT,
        rôles administrateur, candidat et recruteur) et frontend Next.js moderne.
      </p>
    </main>
  );
}
