import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    where: { isBanned: false },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          members: true,
          chapters: true,
        },
      },
    },
  })

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Teams de traduction</h1>
          <p className="text-sm text-[#4A4A5A]">{teams.length} team{teams.length > 1 ? "s" : ""} active{teams.length > 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/teams/create"
          className="rounded-lg bg-[#E8472B] px-4 py-2 text-sm font-bold text-white hover:bg-[#D03820] transition-colors"
        >
          Créer une team
        </Link>
      </div>

      {/* Grid */}
      {teams.length === 0 ? (
        <div className="py-24 text-center text-[#4A4A5A]">
          Aucune team pour le moment.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map(team => (
            <Link
              key={team.id}
              href={`/teams/${team.slug}`}
              className="group rounded-xl border border-[#2A2A38] bg-[#15151C] p-5 hover:border-[#E8472B] transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Logo */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#1E1E28]">
                  {team.logoUrl ? (
                    <Image
                      src={team.logoUrl}
                      alt={team.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xl font-black text-[#2A2A38]">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-bold text-white group-hover:text-[#E8472B] transition-colors">
                      {team.name}
                    </h2>
                    {team.isVerified && (
                      <span className="shrink-0 rounded bg-[#C9A84C]/20 px-1.5 py-0.5 text-xs font-bold text-[#C9A84C]">
                        ✓
                      </span>
                    )}
                  </div>
                  {team.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-[#4A4A5A]">
                      {team.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 flex gap-4 border-t border-[#2A2A38] pt-4">
                <div className="text-center">
                  <p className="text-lg font-black text-white">{team._count.members}</p>
                  <p className="text-xs text-[#4A4A5A]">membre{team._count.members > 1 ? "s" : ""}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-white">{team._count.chapters}</p>
                  <p className="text-xs text-[#4A4A5A]">chapitre{team._count.chapters > 1 ? "s" : ""}</p>
                </div>
                {team.discord && (
                  <div className="ml-auto flex items-center">
                    <span className="text-xs text-[#4A4A5A]">Discord ↗</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  )
}