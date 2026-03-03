import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ReaderControls } from "@/components/manga/ReaderControls"
import { ReaderPages } from "@/components/manga/ReaderPages"

type Props = {
  params: Promise<{ slug: string; number: string }>
}

export default async function ChapterPage({ params }: Props) {
  const { slug, number } = await params

  const manga = await prisma.manga.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true },
  })

  if (!manga) notFound()

  const chapter = await prisma.chapter.findFirst({
    where: {
      mangaId: manga.id,
      number: parseFloat(number),
      status: "PUBLISHED",
    },
    include: {
      pages: { orderBy: { pageNumber: "asc" } },
    },
  })

  if (!chapter) notFound()

  // Chapitres précédent / suivant
  const [prevChapter, nextChapter] = await Promise.all([
    prisma.chapter.findFirst({
      where: {
        mangaId: manga.id,
        number: { lt: chapter.number },
        status: "PUBLISHED",
      },
      orderBy: { number: "desc" },
      select: { number: true },
    }),
    prisma.chapter.findFirst({
      where: {
        mangaId: manga.id,
        number: { gt: chapter.number },
        status: "PUBLISHED",
      },
      orderBy: { number: "asc" },
      select: { number: true },
    }),
  ])

  return (
    <div className="space-y-4">

      {/* Header navigation */}
      <div className="flex items-center justify-between rounded-lg border border-[#2A2A38] bg-[#15151C] px-4 py-3">
        <Link
          href={`/manga/${slug}`}
          className="text-sm text-[#8A8A9A] hover:text-white transition-colors"
        >
          ← {manga.title}
        </Link>
        <span className="text-sm font-bold text-white">
          Chapitre {chapter.number}
          {chapter.title && ` — ${chapter.title}`}
        </span>
        <div className="flex gap-2">
          {prevChapter ? (
            <Link
              href={`/manga/${slug}/chapter/${prevChapter.number}`}
              className="rounded border border-[#2A2A38] px-3 py-1 text-xs text-white hover:bg-[#1E1E28] transition-colors"
            >
              ← Préc.
            </Link>
          ) : (
            <span className="rounded border border-[#2A2A38] px-3 py-1 text-xs text-[#4A4A5A] opacity-30">
              ← Préc.
            </span>
          )}
          {nextChapter ? (
            <Link
              href={`/manga/${slug}/chapter/${nextChapter.number}`}
              className="rounded border border-[#2A2A38] px-3 py-1 text-xs text-white hover:bg-[#1E1E28] transition-colors"
            >
              Suiv. →
            </Link>
          ) : (
            <span className="rounded border border-[#2A2A38] px-3 py-1 text-xs text-[#4A4A5A] opacity-30">
              Suiv. →
            </span>
          )}
        </div>
      </div>

      <ReaderControls />

      {/* Pages */}
      <div className="flex flex-col items-center gap-1">
        {chapter.pages.length === 0 ? (
        <p className="py-24 text-center text-[#4A4A5A]">
          Aucune page disponible.
        </p>
      ) : (
        <ReaderPages pages={chapter.pages} />
      )}
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-center gap-4 py-8">
        {prevChapter && (
          <Link
            href={`/manga/${slug}/chapter/${prevChapter.number}`}
            className="rounded-lg border border-[#2A2A38] px-6 py-3 text-sm text-white hover:bg-[#1E1E28] transition-colors"
          >
            ← Chapitre précédent
          </Link>
        )}
        <Link
          href={`/manga/${slug}`}
          className="rounded-lg bg-[#E8472B] px-6 py-3 text-sm font-bold text-white hover:bg-[#D03820] transition-colors"
        >
          Retour au manga
        </Link>
        {nextChapter && (
          <Link
            href={`/manga/${slug}/chapter/${nextChapter.number}`}
            className="rounded-lg border border-[#2A2A38] px-6 py-3 text-sm text-white hover:bg-[#1E1E28] transition-colors"
          >
            Chapitre suivant →
          </Link>
        )}
      </div>

    </div>
  )
}