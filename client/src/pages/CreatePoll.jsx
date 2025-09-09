import { useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import BackButton from "../components/BackButton";
import { useToast } from "../ui/ToastProvider";
import { auth } from "../lib/auth";


async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url; // Cloudinary URL
}

export default function CreatePoll() {
  const nav = useNavigate();
  const toast = useToast();

  const isLoggedIn = !!auth.token;

  // store each option as { text, imageUrl }
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { text: "", imageUrl: "" },
    { text: "", imageUrl: "" },
  ]);
  const [isPublic, setIsPublic] = useState(!isLoggedIn); 
  const [loading, setLoading] = useState(false);

  function updateOption(i, key, value) {
    setOptions((o) => o.map((opt, idx) => (idx === i ? { ...opt, [key]: value } : opt)));
  }

  async function onPickFile(i, file) {
    if (!file) return;
    try {
      const url = await uploadFile(file);
      updateOption(i, "imageUrl", url);
      toast.push("Image uploaded", "success");
    } catch {
      toast.push("Upload failed", "error");
    }
  }

  async function submit(e) {
    e.preventDefault();
    const q = question.trim();

    const cleaned = options
      .map((o) => ({ text: o.text.trim(), imageUrl: (o.imageUrl || "").trim() }))
      .filter((o) => o.text.length > 0);

    if (!q) return toast.push("Add a question", "error");
    if (cleaned.length < 2) return toast.push("Add at least 2 options", "error");

    try {
      setLoading(true);

      const texts = cleaned.map((o) => o.text);
      const images = cleaned.map((o) => o.imageUrl);

      const { data } = await api.post("/polls", {
        question: q,
        options: texts,
        optionsImages: images,
        isPublic, // respected for logged-in users; guests are forced public on server
      });

      toast.push("Poll created!", "success");

      if (data?.adminUrl) {
        window.location.href = data.adminUrl; // admin controls
      } else {
        nav(`/poll/${data.code}`);
      }
    } catch (err) {
      toast.push(err?.response?.data?.error || "Failed to create poll", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4">
        <div className="mt-6 flex items-center justify-between">
          <BackButton />
        </div>

        <div className="mt-4 bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Create Poll</h2>

          <form onSubmit={submit} className="space-y-4">
            <input
              className="w-full border p-2 rounded"
              placeholder="What's your question?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            {/* Visibility toggle */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={!isLoggedIn} // guests are always public
              />
              <span>
                Make this poll public {isLoggedIn ? "(can be discovered in Public Polls)" : "(guests are always public)"}
              </span>
            </label>

            <div className="space-y-4">
              {options.map((opt, i) => (
                <div key={i} className="rounded border p-3 space-y-3">
                  <div className="flex gap-2">
                    <input
                      className="w-full border p-2 rounded"
                      placeholder={`Option ${i + 1}`}
                      value={opt.text}
                      onChange={(e) => updateOption(i, "text", e.target.value)}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        className="px-3 rounded border hover:bg-gray-50"
                        onClick={() => setOptions((o) => o.filter((_, idx) => idx !== i))}
                        aria-label="Remove option"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickFile(i, e.target.files?.[0] || null)}
                    className="block w-full text-sm"
                  />

                  {opt.imageUrl ? (
                    <img
                      src={opt.imageUrl}
                      alt=""
                      className="h-24 w-full object-cover rounded"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-2 border rounded hover:bg-gray-50"
                onClick={() => setOptions((o) => [...o, { text: "", imageUrl: "" }])}
              >
                Add option
              </button>

              <button
                className="ml-auto px-4 py-2 rounded bg-black text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}