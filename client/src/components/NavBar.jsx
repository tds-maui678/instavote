import { Link } from "react-router-dom";
import { auth } from "../lib/auth";

export default function NavBar() {
  const user = auth.user;
  const logout = () => { auth.token=""; auth.user=null; location.href="/"; };
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-semibold">InstaVote</Link>
        <nav className="ml-auto flex items-center gap-2">
          <Link to="/create" className="px-3 py-1.5 rounded border hover:bg-gray-50">Create</Link>
          <Link to="/join" className="px-3 py-1.5 rounded border hover:bg-gray-50">Join</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="px-3 py-1.5 rounded border hover:bg-gray-50">My Polls</Link>
              <button onClick={logout} className="px-3 py-1.5 rounded border hover:bg-gray-50">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 rounded border hover:bg-gray-50">Sign in</Link>
              <Link to="/register" className="px-3 py-1.5 rounded bg-black text-white">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
