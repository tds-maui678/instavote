export default function App() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-4 p-6 bg-white rounded-xl shadow">
          <h1 className="text-2xl font-bold text-center">InstaVote</h1>
          <a className="block text-center w-full py-2 bg-black text-white rounded" href="/create">Create a Poll</a>
          <a className="block text-center w-full py-2 border rounded" href="/join">Join a Poll</a>
        </div>
      </div>
    );
  }
  