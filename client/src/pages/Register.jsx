import { useState } from "react";
import { api } from "../lib/api";
import NavBar from "../components/NavBar";
import { auth } from "../lib/auth";
import { useToast } from "../ui/ToastProvider";

export default function Register() {
  const t = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", form);
      auth.token = data.token; auth.user = data.user;
      t.push("Registered!", "success"); location.href = "/";
    } catch (e) {
      t.push(e?.response?.data?.error || "Register failed", "error");
    }
  }
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-md px-4">
        <form onSubmit={submit} className="mt-8 bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="text-xl font-semibold">Create Account</h2>
          <input className="w-full border p-2 rounded" placeholder="Name"
                 value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input className="w-full border p-2 rounded" placeholder="Email" type="email"
                 value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
          <input className="w-full border p-2 rounded" placeholder="Password" type="password"
                 value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
          <button className="w-full py-2 rounded bg-black text-white">Sign up</button>
        </form>
      </main>
    </div>
  );
}
