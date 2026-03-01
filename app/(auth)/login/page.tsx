"use client"

import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return }
    router.push("/")
  }

  async function handleGithub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0C0C10]">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-[#2A2A38] bg-[#15151C] p-8">
        <h1 className="text-2xl font-bold text-white">Connexion</h1>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
        />

        <button
          onClick={handleLogin}
          className="w-full rounded-lg bg-[#E8472B] py-3 font-bold text-white hover:bg-[#D03820] transition-colors"
        >
          Se connecter
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleGithub}
            className="flex-1 rounded-lg border border-[#2A2A38] py-3 text-sm text-white hover:bg-[#1E1E28] transition-colors"
          >
            GitHub
          </button>
          <button
            onClick={handleGoogle}
            className="flex-1 rounded-lg border border-[#2A2A38] py-3 text-sm text-white hover:bg-[#1E1E28] transition-colors"
          >
            Google
          </button>
        </div>

        <p className="text-center text-sm text-[#4A4A5A]">
          Pas de compte ?{" "}
          <a href="/register" className="text-[#E8472B] hover:underline">
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  )
}