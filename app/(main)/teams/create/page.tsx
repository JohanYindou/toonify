"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateTeamPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
    discord: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError("")

    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Erreur lors de la création.")
      setLoading(false)
      return
    }

    router.push(`/teams/${data.team.slug}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">

      <h1 className="text-2xl font-black text-white">Créer une team</h1>

      <div className="space-y-5 rounded-xl border border-[#2A2A38] bg-[#15151C] p-6">

        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Nom */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A8A9A]">
            Nom de la team <span className="text-[#E8472B]">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ex: Scan Élite"
            className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A8A9A]">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Décrivez votre team, vos projets..."
            className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none resize-none"
          />
        </div>

        {/* Website */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A8A9A]">Site web</label>
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
          />
        </div>

        {/* Discord */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A8A9A]">Discord</label>
          <input
            name="discord"
            value={form.discord}
            onChange={handleChange}
            placeholder="https://discord.gg/..."
            className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !form.name}
          className="w-full rounded-lg bg-[#E8472B] py-3 font-bold text-white hover:bg-[#D03820] transition-colors disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer la team"}
        </button>

      </div>
    </div>
  )
}