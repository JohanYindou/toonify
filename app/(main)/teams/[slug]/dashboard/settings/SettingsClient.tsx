"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Team = {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  discord: string | null
}

export function SettingsClient({ team }: { team: Team }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: team.name,
    description: team.description ?? "",
    website: team.website ?? "",
    discord: team.discord ?? "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setLoading(true)
    setError("")
    setSuccess("")

    const res = await fetch(`/api/teams/${team.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Erreur lors de la sauvegarde.")
      setLoading(false)
      return
    }

    setSuccess("Paramètres sauvegardés !")
    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("Supprimer définitivement cette team ? Cette action est irréversible.")) return

    const res = await fetch(`/api/teams/${team.slug}`, {
      method: "DELETE",
    })

    if (res.ok) {
      router.push("/teams")
    } else {
      setError("Erreur lors de la suppression.")
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Paramètres — {team.name}</h1>
        <Link
          href={`/teams/${team.slug}/dashboard`}
          className="text-sm text-[#8A8A9A] hover:text-white transition-colors"
        >
          ← Retour
        </Link>
      </div>

      <div className="space-y-5 rounded-xl border border-[#2A2A38] bg-[#15151C] p-6">

        {error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
        {success && <p className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400">{success}</p>}

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A8A9A]">Nom de la team</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A8A9A]">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none resize-none"
          />
        </div>

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
          onClick={handleSave}
          disabled={loading}
          className="w-full rounded-lg bg-[#E8472B] py-3 font-bold text-white hover:bg-[#D03820] transition-colors disabled:opacity-50"
        >
          {loading ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      {/* Zone danger */}
      <div className="space-y-4 rounded-xl border border-red-500/30 bg-[#15151C] p-6">
        <h2 className="font-bold text-red-400">Zone dangereuse</h2>
        <p className="text-sm text-[#4A4A5A]">
          Supprimer la team supprimera également tous les chapitres associés.
        </p>
        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-500/30 px-6 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Supprimer la team
        </button>
      </div>

    </div>
  )
}