import { useEffect, useState } from "react";
import { api } from "../lib/api";
import NavBar from "../components/NavBar";
import { auth } from "../lib/auth";

export default function Dashboard() {
  const [polls, setPolls] = useState([]);
  useEffect(() => {
    if (!auth.token) return;
    api.get("/me/polls").then(({data}) => setPolls(data));
  }, []);
  if (!auth.token) return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4">
        <div className="mt-10 bg-white rounded-xl shadow p-6 text-center">
          <p>Sign in to see your polls.</p>
          <a className="inline-block mt-3 px-4 py-2 rounded bg-black text-white" href="/login">Sign in</a>
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4">
        <h2 className="mt-8 text-xl font-semibold">Your Polls</h2>
        <ul className="mt-4 space-y-3">
          {polls.map(p => (
            <li key={p._id} className="bg-white rounded-xl shadow p-4">
              <div className="font-medium">{p.question}</div>
              <div className="text-sm text-gray-600">Code: {p.code}</div>
              <div className="mt-2 flex gap-2">
                <a className="px-3 py-1.5 rounded border" href={`/poll/${p.code}`}>Open</a>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
