import NavBar from "../components/NavBar";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4">
        <div className="mt-10 bg-white rounded-xl shadow p-6 text-center space-y-3">
          <h1 className="text-2xl font-bold">404</h1>
          <p className="text-gray-600">We couldn’t find that page.</p>
          <a href="/" className="inline-block px-4 py-2 rounded bg-black text-white hover:opacity-90">
            Go Home
          </a>
        </div>
      </main>
    </div>
  );
}
