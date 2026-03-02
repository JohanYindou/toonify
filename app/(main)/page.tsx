"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { MangaCard } from "@/components/manga/MangaCard"

const TYPES = ["MANGA", "MANHWA", "MANHUA", "WEBTOON"]
const STATUSES = ["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"]

async function fetchMangas(params: {
  page: number
  type?: string
  status?: string
  search?: string
}) {
  const query = new URLSearchParams({
    page: params.page.toString(),
    ...(params.type && { type: params.type }),
    ...(params.status && { status: params.status }),
    ...(params.search && { search: params.search }),
  })
  const res = await fetch(`/api/manga?${query}`)
  return res.json()
}

export default function HomePage() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["mangas", page, type, status, search],
    queryFn: () => fetchMangas({ page, type, status, search }),
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  function handleType(t: string) {
    setType(prev => prev === t ? "" : t)
    setPage(1)
  }

  function handleStatus(s: string) {
    setStatus(prev => prev === s ? "" : s)
    setPage(1)
  }

  return (
    <div className="space-y-8">

      {/* Hero */}
      <div className="text-center space-y-2 py-8">
        <h1 className="text-4xl font-black text-white">
          <span className="text-[#E8472B]">T</span>OONIFY
        </h1>
        <p className="text-[#8A8A9A] italic">Votre univers manga, sans limites.</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          placeholder="Rechercher un manga, manhwa..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="flex-1 rounded-lg border border-[#2A2A38] bg-[#15151C] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#E8472B] px-6 py-3 font-bold text-white hover:bg-[#D03820] transition-colors"
        >
          Rechercher
        </button>
      </form>

      {/* Filters */}
      <div className="space-y-3">
        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => handleType(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                type === t
                  ? "bg-[#E8472B] text-white"
                  : "border border-[#2A2A38] text-[#8A8A9A] hover:border-[#E8472B] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                status === s
                  ? "bg-[#C9A84C] text-black"
                  : "border border-[#2A2A38] text-[#8A8A9A] hover:border-[#C9A84C] hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {data && (
        <p className="text-sm text-[#4A4A5A]">
          {data.total} manga{data.total > 1 ? "s" : ""} trouvé{data.total > 1 ? "s" : ""}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-[#1E1E28]" />
          ))}
        </div>
      ) : data?.mangas?.length === 0 ? (
        <div className="py-24 text-center text-[#4A4A5A]">
          Aucun manga trouvé.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {data?.mangas?.map((manga: any) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-[#2A2A38] px-4 py-2 text-sm text-white disabled:opacity-30 hover:bg-[#1E1E28] transition-colors"
          >
            Précédent
          </button>
          <span className="text-sm text-[#4A4A5A]">
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="rounded-lg border border-[#2A2A38] px-4 py-2 text-sm text-white disabled:opacity-30 hover:bg-[#1E1E28] transition-colors"
          >
            Suivant
          </button>
        </div>
      )}

    </div>
  )
}