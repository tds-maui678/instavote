import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import BackButton from "../components/BackButton";
import { useToast } from "../ui/ToastProvider";

export default function JoinPoll() {
  const nav = useNavigate();
  const toast = useToast();
  const [code, setCode] = useState("");

  function go() {
    const c = code.trim().toUpperCase();
    if (c.length < 4) return toast.push("Enter a valid code", "error");
    nav(`/poll/${c}`);
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4">
        <div className="mt-6 flex items-center justify-between">
          <BackButton />
        </div>

        <div className="mt-4 bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Join Poll</h2>
          <input
            className="w-full border p-2 rounded uppercase"
            maxLength={12}
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter code (e.g., 7K3P9X)"
          />
          <button onClick={go}
            className="w-full py-2 rounded bg-black text-white hover:opacity-90">
            Join
          </button>
        </div>
      </main>
    </div>
  );
}
