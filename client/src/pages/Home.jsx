import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">InstaVote</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/create"
            className="block rounded-xl border p-5 hover:bg-gray-50 focus:outline-none focus:ring"
          >
            <div className="text-lg font-medium">Create a poll</div>
            <div className="text-sm text-gray-600">Start a new real-time poll</div>
          </Link>

          <Link
            to="/join"
            className="block rounded-xl border p-5 hover:bg-gray-50 focus:outline-none focus:ring"
          >
            <div className="text-lg font-medium">Join a poll</div>
            <div className="text-sm text-gray-600">Enter a code to vote</div>
          </Link>

          <Link
            to="/public"
            className="block rounded-xl border p-5 hover:bg-gray-50 focus:outline-none focus:ring sm:col-span-2"
          >
            <div className="text-lg font-medium">Check out public polls</div>
            <div className="text-sm text-gray-600">Browse polls shared publicly</div>
          </Link>
        </div>
      </main>
    </div>
  );
}