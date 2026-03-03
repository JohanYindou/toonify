import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Stats bibliothèque
  const [libraryStats, recentActivity] = await Promise.all([
    prisma.userManga.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { status: true },
    }),
    prisma.userManga.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        manga: {
          select: {
            title: true,
            slug: true,
            coverUrl: true,
          },
        },
      },
    }),
  ])

  const totalMangas = libraryStats.reduce((acc, s) => acc + s._count.status, 0)

  const STATUS_LABELS: Record<string, string> = {
    READING: "En cours",
    COMPLETED: "Terminés",
    PLAN_TO_READ: "Planifiés",
    ON_HOLD: "En pause",
    DROPPED: "Abandonnés",
  }

  const STATUS_COLORS: Record<string, string> = {
    READING: "text-green-400",
    COMPLETED: "text-blue-400",
    PLAN_TO_READ: "text-[#C9A84C]",
    ON_HOLD: "text-yellow-400",
    DROPPED: "text-red-400",
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">

      {/* Header profil */}
      <div className="flex items-center gap-6 rounded-xl border border-[#2A2A38] bg-[#15151C] p-6">
        {/* Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#E8472B] text-2xl font-black text-white">
          {user.email?.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1">
          <h1 className="text-xl font-black text-white">
            {user.user_metadata?.username ?? user.email}
          </h1>
          <p className="text-sm text-[#4A4A5A]">{user.email}</p>
          <p className="text-xs text-[#4A4A5A]">
            Membre depuis {new Date(user.created_at).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Statistiques</h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#2A2A38] bg-[#15151C] p-4 text-center">
            <p className="text-3xl font-black text-[#E8472B]">{totalMangas}</p>
            <p className="text-xs text-[#4A4A5A]">Total mangas</p>
          </div>

          {libraryStats.map(stat => (
            <div key={stat.status} className="rounded-xl border border-[#2A2A38] bg-[#15151C] p-4 text-center">
              <p className={`text-3xl font-black ${STATUS_COLORS[stat.status] ?? "text-white"}`}>
                {stat._count.status}
              </p>
              <p className="text-xs text-[#4A4A5A]">
                {STATUS_LABELS[stat.status] ?? stat.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Activité récente */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Activité récente</h2>
          <Link
            href="/library"
            className="text-sm text-[#E8472B] hover:underline"
          >
            Voir tout
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <p className="text-sm text-[#4A4A5A]">Aucune activité récente.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map(entry => (
              <Link
                key={entry.id}
                href={`/manga/${entry.manga.slug}`}
                className="flex items-center gap-4 rounded-lg border border-[#2A2A38] bg-[#15151C] p-3 hover:border-[#E8472B] transition-colors"
              >
                {/* Cover mini */}
                <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-[#1E1E28]">
                  {entry.manga.coverUrl ? (
                    <Image
                      src={entry.manga.coverUrl}
                      alt={entry.manga.title}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs font-black text-[#2A2A38]">
                        {entry.manga.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{entry.manga.title}</p>
                  <p className="text-xs text-[#4A4A5A]">
                    {STATUS_LABELS[entry.status] ?? entry.status}
                  </p>
                </div>

                <p className="text-xs text-[#4A4A5A]">
                  {new Date(entry.updatedAt).toLocaleDateString("fr-FR")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/library"
          className="rounded-lg bg-[#E8472B] px-6 py-3 text-sm font-bold text-white hover:bg-[#D03820] transition-colors"
        >
          Ma bibliothèque
        </Link>
        <Link
          href="/settings"
          className="rounded-lg border border-[#2A2A38] px-6 py-3 text-sm text-white hover:bg-[#1E1E28] transition-colors"
        >
          Paramètres
        </Link>
      </div>

    </div>
  )
}