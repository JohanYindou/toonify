"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

const STATUSES = [
  { value: "", label: "Tout" },
  { value: "READING", label: "En cours" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "PLAN_TO_READ", label: "Planifié" },
  { value: "ON_HOLD", label: "En pause" },
  { value: "DROPPED", label: "Abandonné" },
]
type LibraryEntry = {
    id: string
    status: string
    manga: {
      id: string
      slug: string
      title: string
      coverUrl: string | null
      _count: { chapters: number }
      genres: { genre: { id: string; name: string } }[]
    }
  }

async function fetchLibrary(status: string) {
  const query = status ? `?status=${status}` : ""
  const res = await fetch(`/api/library${query}`)
  return res.json()
}

export default function LibraryPage() {
  const [activeStatus, setActiveStatus] = useState("")
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["library", activeStatus],
    queryFn: () => fetchLibrary(activeStatus),
  })

  const deleteMutation = useMutation({
    mutationFn: (mangaId: string) =>
      fetch("/api/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mangaId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library"] }),
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Ma bibliothèque</h1>
        <span className="text-sm text-[#4A4A5A]">
          {data?.library?.length ?? 0} manga{(data?.library?.length ?? 0) > 1 ? "s" : ""}
        </span>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setActiveStatus(s.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeStatus === s.value
                ? "bg-[#E8472B] text-white"
                : "border border-[#2A2A38] text-[#8A8A9A] hover:border-[#E8472B] hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-[#1E1E28]" />
          ))}
        </div>
      ) : data?.library?.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <p className="text-[#4A4A5A]">Aucun manga dans cette liste.</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-[#E8472B] px-6 py-3 text-sm font-bold text-white hover:bg-[#D03820] transition-colors"
          >
            Découvrir des mangas
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.library?.map((entry: LibraryEntry) => (
            <div
              key={entry.id}
              className="flex gap-4 rounded-lg border border-[#2A2A38] bg-[#15151C] p-4 hover:border-[#E8472B] transition-colors"
            >
              {/* Cover */}
              <Link href={`/manga/${entry.manga.slug}`}>
                <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded bg-[#1E1E28]">
                  {entry.manga.coverUrl ? (
                    <Image
                      src={entry.manga.coverUrl}
                      alt={entry.manga.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xl font-black text-[#2A2A38]">
                        {entry.manga.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 space-y-1">
                <Link href={`/manga/${entry.manga.slug}`}>
                  <h3 className="font-semibold text-white hover:text-[#E8472B] transition-colors">
                    {entry.manga.title}
                  </h3>
                </Link>
                <p className="text-xs text-[#4A4A5A]">
                  {entry.manga._count.chapters} chapitre{entry.manga._count.chapters > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-1">
                  {entry.manga.genres.slice(0, 3).map(({ genre }: { genre: { id: string; name: string } }) => (
                    <span key={genre.id} className="rounded-full border border-[#2A2A38] px-2 py-0.5 text-xs text-[#4A4A5A]">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end justify-between gap-2">
                <select
                  defaultValue={entry.status}
                  onChange={async e => {
                    await fetch("/api/library", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ mangaId: entry.manga.id, status: e.target.value }),
                    })
                    queryClient.invalidateQueries({ queryKey: ["library"] })
                  }}
                  className="rounded border border-[#2A2A38] bg-[#1E1E28] px-2 py-1 text-xs text-white focus:border-[#E8472B] focus:outline-none"
                >
                  {STATUSES.filter(s => s.value).map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <button
                  onClick={() => deleteMutation.mutate(entry.manga.id)}
                  className="text-xs text-[#4A4A5A] hover:text-red-400 transition-colors"
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}