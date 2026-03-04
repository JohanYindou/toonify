import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const manga = await prisma.manga.findUnique({
    where: { slug },
    select: {
      title: true,
      synopsis: true,
      coverUrl: true,
    },
  })

  if (!manga) {
    return { title: "Manga introuvable — Toonify" }
  }

  return {
    title: `${manga.title} — Toonify`,
    description: manga.synopsis?.slice(0, 160) ?? `Lire ${manga.title} sur Toonify.`,
    openGraph: {
      title: manga.title,
      description: manga.synopsis?.slice(0, 160) ?? `Lire ${manga.title} sur Toonify.`,
      images: manga.coverUrl ? [{ url: manga.coverUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: manga.title,
      description: manga.synopsis?.slice(0, 160) ?? `Lire ${manga.title} sur Toonify.`,
      images: manga.coverUrl ? [manga.coverUrl] : [],
    },
  }
}

export default async function MangaPage({ params }: Props) {
  const { slug } = await params

  const manga = await prisma.manga.findUnique({
    where: { slug },
    include: {
      genres: { include: { genre: true } },
      tags: { include: { tag: true } },
      authors: { include: { author: true } },
      chapters: {
        where: { status: "PUBLISHED" },
        orderBy: { number: "desc" },
        take: 50,
      },
      _count: { select: { chapters: true } },
    },
  })

  if (!manga) notFound()

  return (
    <div className="space-y-8">

      {/* Hero banner */}
      <div className="relative h-48 overflow-hidden rounded-xl bg-[#1E1E28] md:h-64">
        {manga.bannerUrl && (
          <Image
            src={manga.bannerUrl}
            alt={manga.title}
            fill
            className="object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C10] to-transparent" />
      </div>

      {/* Main info */}
      <div className="flex gap-6 -mt-20 relative z-10 px-2">

        {/* Cover */}
        <div className="relative h-48 w-32 shrink-0 overflow-hidden rounded-lg bg-[#1E1E28] shadow-xl md:h-56 md:w-40">
          {manga.coverUrl ? (
            <Image
              src={manga.coverUrl}
              alt={manga.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-5xl font-black text-[#2A2A38]">
                {manga.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3 pt-20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-[#E8472B] px-2 py-0.5 text-xs font-bold text-white">
              {manga.contentType}
            </span>
            <span className={`rounded px-2 py-0.5 text-xs font-bold ${
              manga.status === "ONGOING"
                ? "bg-green-500/20 text-green-400"
                : manga.status === "COMPLETED"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}>
              {manga.status}
            </span>
            {manga.releaseYear && (
              <span className="text-xs text-[#4A4A5A]">{manga.releaseYear}</span>
            )}
          </div>

          <h1 className="text-2xl font-black text-white md:text-3xl">
            {manga.title}
          </h1>

          {manga.authors.length > 0 && (
            <p className="text-sm text-[#8A8A9A]">
              par {manga.authors.map(a => a.author.name).join(", ")}
            </p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {manga.genres.map(({ genre }) => (
              <span
                key={genre.id}
                className="rounded-full border border-[#2A2A38] px-3 py-1 text-xs text-[#8A8A9A]"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Synopsis du manga */}
      {manga.synopsis  && (
        <div className="rounded-xl border border-[#2A2A38] bg-[#15151C] p-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#4A4A5A]">
            Synopsis
          </h2>
          <p className="text-sm leading-relaxed text-[#8A8A9A]">
            {manga.synopsis }
          </p>
        </div>
      )}

      {/* Chapters list */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">
          Chapitres ({manga._count.chapters})
        </h2>

        {manga.chapters.length === 0 ? (
          <p className="text-sm text-[#4A4A5A]">Aucun chapitre disponible.</p>
        ) : (
          <div className="space-y-2">
            {manga.chapters.map(chapter => (
              <Link
                key={chapter.id}
                href={`/manga/${manga.slug}/chapter/${chapter.number}`}
                className="flex items-center justify-between rounded-lg border border-[#2A2A38] bg-[#15151C] px-4 py-3 hover:border-[#E8472B] hover:bg-[#1E1E28] transition-colors"
              >
                <span className="text-sm font-medium text-white">
                  Chapitre {chapter.number}
                  {chapter.title && (
                    <span className="ml-2 text-[#4A4A5A]">— {chapter.title}</span>
                  )}
                </span>
                {chapter.publishedAt && (
                  <span className="text-xs text-[#4A4A5A]">
                    {new Date(chapter.publishedAt).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}