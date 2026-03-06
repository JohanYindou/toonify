"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

async function fetchMangas() {
  const res = await fetch("/api/manga?limit=100")
  return res.json()
}

export default function UploadChapterPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    mangaId: "",
    number: "",
    title: "",
  })

  const [files, setFiles] = useState<File[]>([])

  const { data } = useQuery({
    queryKey: ["mangas-list"],
    queryFn: fetchMangas,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const sorted = Array.from(e.target.files).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    )
    setFiles(sorted)
  }

  async function handleSubmit() {
    if (!form.mangaId || !form.number || files.length === 0) {
      setError("Manga, numéro de chapitre et pages sont requis.")
      return
    }

    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("mangaId", form.mangaId)
    formData.append("number", form.number)
    formData.append("title", form.title)
    formData.append("teamSlug", slug)
    files.forEach(file => formData.append("pages", file))

    const res = await fetch("/api/chapters/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Erreur lors de l'upload.")
      setLoading(false)
      return
    }

    router.push(`/teams/${slug}/dashboard`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Uploader un chapitre</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-[#8A8A9A] hover:text-white transition-colors"
        >
          ← Retour
        </button>
      </div>

      <div className="space-y-5 rounded-xl border border-[#2A2A38] bg-[#15151C] p-6">

        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Manga */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A8A9A]">
            Manga <span className="text-[#E8472B]">*</span>
          </label>
          <select
            name="mangaId"
            value={form.mangaId}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white focus:border-[#E8472B] focus:outline-none"
          >
            <option value="">Sélectionner un manga...</option>
            {data?.mangas?.map((manga: { id: string; title: string }) => (
              <option key={manga.id} value={manga.id}>
                {manga.title}
              </option>
            ))}
          </select>
        </div>

        {/* Numéro */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A8A9A]">
            Numéro de chapitre <span className="text-[#E8472B]">*</span>
          </label>
          <input
            name="number"
            type="number"
            step="0.1"
            value={form.number}
            onChange={handleChange}
            placeholder="Ex: 1, 2.5..."
            className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
          />
        </div>

        {/* Titre optionnel */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A8A9A]">Titre du chapitre (optionnel)</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ex: Le début de l'aventure"
            className="w-full rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
          />
        </div>

        {/* Pages */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A8A9A]">
            Pages <span className="text-[#E8472B]">*</span>
          </label>
          <div className="rounded-lg border-2 border-dashed border-[#2A2A38] p-6 text-center hover:border-[#E8472B] transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
              id="pages-input"
            />
            <label htmlFor="pages-input" className="cursor-pointer space-y-2">
              <p className="text-2xl">🖼️</p>
              <p className="text-sm text-white">Cliquer pour sélectionner les pages</p>
              <p className="text-xs text-[#4A4A5A]">JPG, PNG, WEBP — triées automatiquement par nom</p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-[#8A8A9A]">{files.length} page{files.length > 1 ? "s" : ""} sélectionnée{files.length > 1 ? "s" : ""}</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 rounded bg-[#1E1E28] px-3 py-1">
                    <span className="text-xs text-[#4A4A5A]">{i + 1}.</span>
                    <span className="text-xs text-white truncate">{file.name}</span>
                    <span className="ml-auto text-xs text-[#4A4A5A]">
                      {(file.size / 1024).toFixed(0)}kb
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-[#E8472B] py-3 font-bold text-white hover:bg-[#D03820] transition-colors disabled:opacity-50"
        >
          {loading ? "Upload en cours..." : "Soumettre le chapitre"}
        </button>

      </div>
    </div>
  )
}