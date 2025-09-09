import { useNavigate } from "react-router-dom";
export default function BackButton({ label = "Back" }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(-1)}
      className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-100"
      aria-label="Go back"
    >
      ← {label}
    </button>
  );
}
