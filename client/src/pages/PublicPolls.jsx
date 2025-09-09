import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import NavBar from "../components/NavBar";
import BackButton from "../components/BackButton";
import { useToast } from "../ui/ToastProvider";

export default function PublicPolls() {
  const toast = useToast();
  const [polls, setPolls] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/polls/public?limit=50")
      .then(({ data }) => setPolls(data))
      .catch(() => toast.push("Failed to load public polls", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4">
        <div className="mt-6 flex items-center justify-between">
          <BackButton />
        </div>

        <div className="mt-4 bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Public Polls</h2>

          {loading && <div className="text-gray-600">Loading…</div>}

          {!loading && (!polls || polls.length === 0) && (
            <div className="text-gray-600">No public polls yet.</div>
          )}

          {!loading && polls && (
            <ul className="space-y-3">
              {polls.map((p) => {
                const total = p.options?.reduce((s, o) => s + (o.votes || 0), 0) ?? 0;
                return (
                  <li key={p.code} className="rounded border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{p.question}</div>
                      <span
                        className={`text-xs rounded px-2 py-0.5 ${
                          p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.isActive ? "Live" : "Closed"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Code: <span className="font-mono">{p.code}</span> • Total votes: {total}
                    </div>
                    <div className="mt-2">
                      <Link
                        to={`/poll/${p.code}`}
                        className="inline-block text-sm px-3 py-1 border rounded hover:bg-gray-50"
                      >
                        Open
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}