import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4">
        <section className="mt-10 bg-white rounded-xl shadow p-6 space-y-4">
          <h1 className="text-2xl font-bold">Welcome to InstaVote</h1>
          <p className="text-gray-600">
            Create a live poll, share the code, and watch votes update instantly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="/create" className="text-center py-2 rounded bg-black text-white hover:opacity-90">Create a Poll</a>
            <a href="/join"   className="text-center py-2 rounded border hover:bg-gray-50">Join a Poll</a>
          </div>
        </section>
      </main>
    </div>
  );
}
