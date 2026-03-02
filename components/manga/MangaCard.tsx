import Link from "next/link"
import Image from "next/image"

type MangaCardProps = {
  manga: {
    id: string
    slug: string
    title: string
    coverUrl: string | null
    contentType: string
    status: string
    _count: { chapters: number }
    genres: { genre: { name: string } }[]
  }
}

export function MangaCard({ manga }: MangaCardProps) {
  return (
    <Link href={`/manga/${manga.slug}`} className="group relative block">
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-[#1E1E28]">
        {manga.coverUrl ? (
          <Image
            src={manga.coverUrl}
            alt={manga.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-black text-[#2A2A38]">
              {manga.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Type badge */}
        <span className="absolute left-2 top-2 rounded bg-[#E8472B] px-2 py-0.5 text-xs font-bold text-white">
          {manga.contentType}
        </span>

        {/* Chapters count on hover */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="text-xs text-white">
            {manga._count.chapters} chapitre{manga._count.chapters > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 space-y-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-white group-hover:text-[#E8472B] transition-colors">
          {manga.title}
        </h3>
        {manga.genres[0] && (
          <p className="text-xs text-[#4A4A5A]">{manga.genres[0].genre.name}</p>
        )}
      </div>
    </Link>
  )
}