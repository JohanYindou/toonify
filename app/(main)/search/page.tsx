"use client"

import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MangaCard } from "@/components/manga/MangaCard"

const TYPES = ["MANGA", "MANHWA", "MANHUA", "WEBTOON", "ONE_SHOT"]
const STATUSES = ["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"]
type MangaResult = {
    id: string
    slug: string
    title: string
    coverUrl: string | null
    contentType: string
    status: string
    _count: { chapters: number }
    genres: { genre: { id: string; name: string } }[]
  }

async function fetchMangas(params: {
  search?: string
  type?: string
  status?: string
  genre?: string
  page: number
}) {
  const query = new URLSearchParams({
    page: params.page.toString(),
    ...(params.search && { search: params.search }),
    ...(params.type && { type: params.type }),
    ...(params.status && { status: params.status }),
    ...(params.genre && { genre: params.genre }),
  })
  const res = await fetch(`/api/manga?${query}`)
  return res.json()
}

async function fetchGenres() {
  const res = await fetch("/api/genres")
  return res.json()
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "")
  const [type, setType] = useState(searchParams.get("type") ?? "")
  const [status, setStatus] = useState(searchParams.get("status") ?? "")
  const [genre, setGenre] = useState(searchParams.get("genre") ?? "")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["search", search, type, status, genre, page],
    queryFn: () => fetchMangas({ search, type, status, genre, page }),
  })

  const { data: genresData } = useQuery({
    queryKey: ["genres"],
    queryFn: fetchGenres,
  })

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (type) params.set("type", type)
    if (status) params.set("status", status)
    if (genre) params.set("genre", genre)
    router.replace(`/search?${params.toString()}`, { scroll: false })
  }, [search, type, status, genre, router])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  function toggle(val: string, current: string, setter: (v: string) => void) {
    setter(current === val ? "" : val)
    setPage(1)
  }

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-black text-white">Recherche</h1>

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
      <div className="space-y-4 rounded-xl border border-[#2A2A38] bg-[#15151C] p-5">

        {/* Type */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Type</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => toggle(t, type, setType)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  type === t
                    ? "bg-[#E8472B] text-white"
                    : "border border-[#2A2A38] text-[#8A8A9A] hover:border-[#E8472B] hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Statut</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => toggle(s, status, setStatus)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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

        {/* Genres */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Genre</p>
          <div className="flex flex-wrap gap-2">
            {genresData?.genres?.map((g: { id: string; name: string; slug: string }) => (
              <button
                key={g.id}
                onClick={() => toggle(g.slug, genre, setGenre)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  genre === g.slug
                    ? "bg-blue-500 text-white"
                    : "border border-[#2A2A38] text-[#8A8A9A] hover:border-blue-500 hover:text-white"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Results count */}
      {data && (
        <p className="text-sm text-[#4A4A5A]">
          {data.total} résultat{data.total > 1 ? "s" : ""}
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
          Aucun résultat trouvé.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {data?.mangas?.map((manga: MangaResult) => (
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