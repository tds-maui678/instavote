import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { socket } from "../lib/socket";
import NavBar from "../components/NavBar";
import BackButton from "../components/BackButton";
import { useToast } from "../ui/ToastProvider";

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-6 bg-gray-200 rounded w-2/3" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded" />
      ))}
    </div>
  );
}

export default function Vote() {
  const { code } = useParams();
  const location = useLocation();
  const toast = useToast();

  // normalize code and read admin key from URL
  const pollCode = (code || "").toUpperCase();
  const params = new URLSearchParams(location.search);
  const adminKey = params.get("admin") || "";

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  // total votes (from current state; may be masked by backend until voted)
  const total = useMemo(
    () => poll?.options?.reduce((s, o) => s + (o.votes || 0), 0) ?? 0,
    [poll]
  );

  useEffect(() => {
    // join the socket room for this poll
    socket.emit("poll:join", pollCode);

    // initial fetch (include admin key if present so owners see ownership)
    const url = `/polls/${pollCode}${adminKey ? `?admin=${adminKey}` : ""}`;
    api
      .get(url)
      .then(({ data }) => setPoll(data))
      .catch(() => toast.push("Poll not found", "error"))
      .finally(() => setLoading(false));

    // live updates (mask counts if viewer hasn't voted yet)
    const onUpdate = (p) => {
      if (p.code !== pollCode) return;
      setPoll((prev) => {
        if (!prev) return p; // before first GET returns
        // If the viewer has voted OR the poll is closed and viewer is owner, show true counts
        const viewerCanSeeCounts =
          prev.hasVoted || (!p.isActive && prev.isOwner);
        if (viewerCanSeeCounts) return p;
        // Otherwise, mask counts until the viewer has voted
        return { ...p, options: p.options.map((o) => ({ ...o, votes: 0 })) };
      });
    };

    socket.on("poll:updated", onUpdate);
    return () => socket.off("poll:updated", onUpdate);
  }, [pollCode, adminKey, toast]);

  async function voteAt(index) {
    if (!poll?.isActive) return;
    if (poll?.hasVoted) return; // client-side guard; server also enforces
    try {
      await api.post(`/polls/${pollCode}/vote`, { index });
      // after a successful vote, refetch to reveal results
      const url = `/polls/${pollCode}${adminKey ? `?admin=${adminKey}` : ""}`;
      const { data } = await api.get(url);
      setPoll(data);
    } catch (e) {
      const msg = e?.response?.data?.error || "Vote failed";
      toast.push(msg, "error");
    }
  }

  async function closePoll() {
    try {
      await api.post(`/polls/${pollCode}/close`, { admin: adminKey || undefined });
      const { data } = await api.get(`/polls/${pollCode}${adminKey ? `?admin=${adminKey}` : ""}`);
      setPoll(data);
      toast.push("Poll closed", "success");
    } catch (e) {
      toast.push(e?.response?.data?.error || "Unable to close poll", "error");
    }
  }

  // Hide counts until the viewer has voted; BUT if poll is closed and viewer is owner, show counts.
  const showCounts = !!(poll?.hasVoted || (!poll?.isActive && poll?.isOwner));
  const disableVoting = !poll?.isActive || !!poll?.hasVoted;

  // --- Owner summary after close ---
  function Summary() {
    if (!poll) return null;
    const totalVotes = poll.options.reduce((s, o) => s + (o.votes || 0), 0);
    return (
      <div className="mt-4 border rounded p-4 bg-gray-50">
        <h3 className="font-semibold mb-2">Summary</h3>
        <ul className="space-y-1">
          {poll.options.map((o, i) => {
            const pct = totalVotes ? Math.round((o.votes / totalVotes) * 100) : 0;
            return (
              <li key={i} className="flex justify-between text-sm">
                <span>{o.text}</span>
                <span className="tabular-nums">{o.votes} ({pct}%)</span>
              </li>
            );
          })}
        </ul>
        <div className="text-sm text-gray-600 mt-2">Total: {totalVotes}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4">
        <div className="mt-6 flex items-center justify-between">
          <BackButton />
          {poll && (
            <span
              className={`text-sm rounded px-2 py-1 ${
                poll.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {poll.isActive ? "Live" : "Closed"}
            </span>
          )}
        </div>

        <div className="mt-4 bg-white rounded-xl shadow p-6 space-y-4">
          {loading && <Skeleton />}

          {!loading && !poll && <div className="text-gray-600">Poll not found.</div>}

          {!loading && poll && (
            <>
              <h2 className="text-xl font-semibold">{poll.question}</h2>

              <div className="space-y-3">
                {poll.options.map((opt, i) => {
                  const pct = total ? Math.round((opt.votes / total) * 100) : 0;
                  return (
                    <button
                      key={i}
                      onClick={() => voteAt(i)}
                      disabled={disableVoting}
                      className="w-full text-left border rounded p-3 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {opt.imageUrl ? (
                        <img
                          src={opt.imageUrl}
                          alt=""
                          className="h-24 w-full object-cover rounded mb-2"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : null}

                      <div className="flex justify-between">
                        <span className="font-medium">{opt.text}</span>
                        <span className="tabular-nums">
                          {showCounts ? `${opt.votes} (${pct}%)` : "—"}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                        <div
                          className="h-2 bg-black/80 rounded"
                          style={{ width: showCounts ? `${pct}%` : "0%" }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-sm text-gray-600">
                Code: <span className="font-mono">{poll.code}</span> • Total votes:{" "}
                {showCounts ? total : "—"}
              </div>

              <div className="flex gap-2">
                {poll.isOwner && poll.isActive && (
                  <button
                    className="px-3 py-2 border rounded hover:bg-gray-50"
                    onClick={closePoll}
                  >
                    Close Poll
                  </button>
                )}
              </div>

              {/* Owner-only summary after close */}
              {poll.isOwner && !poll.isActive && <Summary />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}