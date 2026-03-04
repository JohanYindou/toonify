"use client"

import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    })
    if (error) { setError(error.message); return }
  
    if (data.user) {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.user.id,
          email,
          username,
        }),
      })
      if (!res.ok) {
        setError("Erreur lors de la création du compte.")
        return
      }
    }
    setSuccess(true)
  }
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0C0C10]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Vérifie ton email !</h1>
          <p className="text-[#8A8A9A]">Un lien de confirmation t'a été envoyé.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0C0C10]">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-[#2A2A38] bg-[#15151C] p-8">
        <h1 className="text-2xl font-bold text-white">Créer un compte</h1>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
        />
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
          onClick={handleRegister}
          className="w-full rounded-lg bg-[#E8472B] py-3 font-bold text-white hover:bg-[#D03820] transition-colors"
        >
          S'inscrire
        </button>

        <p className="text-center text-sm text-[#4A4A5A]">
          Déjà un compte ?{" "}
          <a href="/login" className="text-[#E8472B] hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}