import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  const [totalMangas, totalUsers, totalChapters, pendingChapters] = await Promise.all([
    prisma.manga.count(),
    prisma.user.count(),
    prisma.chapter.count(),
    prisma.chapter.count({ where: { status: "PENDING" } }),
  ])

  const recentMangas = await prisma.manga.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, title: true, slug: true, isApproved: true, createdAt: true },
  })

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, email: true, username: true, role: true, createdAt: true },
  })

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-black text-white">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Mangas", value: totalMangas, color: "text-[#E8472B]" },
          { label: "Utilisateurs", value: totalUsers, color: "text-[#C9A84C]" },
          { label: "Chapitres", value: totalChapters, color: "text-blue-400" },
          { label: "En attente", value: pendingChapters, color: "text-yellow-400" },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-[#2A2A38] bg-[#15151C] p-4 text-center">
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value.toString()}</p>
            <p className="text-xs text-[#4A4A5A]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">

        {/* Mangas récents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Mangas récents</h2>
            <Link href="/admin/mangas" className="text-sm text-[#E8472B] hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="space-y-2">
            {recentMangas.map(manga => (
              <div key={manga.id} className="flex items-center justify-between rounded-lg border border-[#2A2A38] bg-[#15151C] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{manga.title}</p>
                  <p className="text-xs text-[#4A4A5A]">
                    {new Date(manga.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                  manga.isApproved
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {manga.isApproved ? "Approuvé" : "En attente"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Utilisateurs récents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Utilisateurs récents</h2>
            <Link href="/admin/users" className="text-sm text-[#E8472B] hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="space-y-2">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border border-[#2A2A38] bg-[#15151C] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {user.username ?? user.email}
                  </p>
                  <p className="text-xs text-[#4A4A5A]">{user.email}</p>
                </div>
                <span className="rounded border border-[#2A2A38] px-2 py-0.5 text-xs text-[#8A8A9A]">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}