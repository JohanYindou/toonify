import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params

  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      members: {
        include: { user: { select: { id: true, username: true, avatarUrl: true, role: true } } },
        orderBy: { joinedAt: "asc" },
      },
      chapters: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          manga: { select: { title: true, slug: true, coverUrl: true } },
        },
      },
      _count: {
        select: { members: true, chapters: true },
      },
    },
  })

  if (!team) notFound()

  return (
    <div className="space-y-8">

      {/* Banner */}
      <div className="relative h-40 overflow-hidden rounded-xl bg-[#1E1E28] md:h-52">
        {team.bannerUrl && (
          <Image src={team.bannerUrl} alt={team.name} fill className="object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C10] to-transparent" />
      </div>

      {/* Header */}
      <div className="flex gap-5 -mt-16 relative z-10 px-2">
        {/* Logo */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#1E1E28] shadow-xl border border-[#2A2A38]">
          {team.logoUrl ? (
            <Image src={team.logoUrl} alt={team.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-3xl font-black text-[#2A2A38]">{team.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2 pt-14">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-white">{team.name}</h1>
            {team.isVerified && (
              <span className="rounded bg-[#C9A84C]/20 px-2 py-0.5 text-xs font-bold text-[#C9A84C]">
                ✓ Vérifiée
              </span>
            )}
          </div>
          {team.description && (
            <p className="text-sm text-[#8A8A9A]">{team.description}</p>
          )}
          <div className="flex gap-4">
            {team.website && (
              <a href={team.website} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#E8472B] hover:underline">
                Site web ↗
              </a>
            )}
            {team.discord && (
              <a href={team.discord} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#8A8A9A] hover:text-white transition-colors">
                Discord ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#2A2A38] bg-[#15151C] p-4 text-center">
          <p className="text-3xl font-black text-[#E8472B]">{team._count.members}</p>
          <p className="text-xs text-[#4A4A5A]">membre{team._count.members > 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-xl border border-[#2A2A38] bg-[#15151C] p-4 text-center">
          <p className="text-3xl font-black text-[#C9A84C]">{team._count.chapters}</p>
          <p className="text-xs text-[#4A4A5A]">chapitre{team._count.chapters > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Membres */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Membres</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {team.members.map(member => (
            <div key={member.id}
              className="flex items-center gap-3 rounded-lg border border-[#2A2A38] bg-[#15151C] px-4 py-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#E8472B]">
                {member.user.avatarUrl ? (
                  <Image src={member.user.avatarUrl} alt={member.user.username} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-black text-white">
                    {member.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{member.user.username}</p>
                <p className="text-xs text-[#4A4A5A]">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chapitres récents */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Dernières sorties</h2>
        {team.chapters.length === 0 ? (
          <p className="text-sm text-[#4A4A5A]">Aucun chapitre publié.</p>
        ) : (
          <div className="space-y-2">
            {team.chapters.map(chapter => (
              <Link
                key={chapter.id}
                href={`/manga/${chapter.manga.slug}/chapter/${chapter.number}`}
                className="flex items-center gap-4 rounded-lg border border-[#2A2A38] bg-[#15151C] px-4 py-3 hover:border-[#E8472B] transition-colors"
              >
                <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-[#1E1E28]">
                  {chapter.manga.coverUrl && (
                    <Image src={chapter.manga.coverUrl} alt={chapter.manga.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{chapter.manga.title}</p>
                  <p className="text-xs text-[#4A4A5A]">
                    Chapitre {chapter.number}
                    {chapter.title && ` — ${chapter.title}`}
                  </p>
                </div>
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