import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function TeamDashboardPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
      chapters: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          manga: { select: { title: true, slug: true } },
        },
      },
    },
  })

  if (!team) notFound()

  // Vérifie que l'utilisateur est membre de la team
  const member = team.members.find(m => m.userId === user.id)
  if (!member) redirect(`/teams/${slug}`)

  const isOwnerOrAdmin = ["OWNER", "ADMIN"].includes(member.role)

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">{team.name}</h1>
          <p className="text-sm text-[#4A4A5A]">Panel de gestion — {member.role}</p>
        </div>
        <Link
          href={`/teams/${slug}`}
          className="text-sm text-[#8A8A9A] hover:text-white transition-colors"
        >
          ← Page publique
        </Link>
      </div>

      {/* Actions rapides */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href={`/teams/${slug}/dashboard/upload`}
          className="rounded-xl border border-[#2A2A38] bg-[#15151C] p-5 hover:border-[#E8472B] transition-colors"
        >
          <p className="text-2xl">📤</p>
          <p className="mt-2 font-bold text-white">Uploader un chapitre</p>
          <p className="text-xs text-[#4A4A5A]">Soumettre un nouveau chapitre</p>
        </Link>

        {isOwnerOrAdmin && (
          <>
            <Link
              href={`/teams/${slug}/dashboard/members`}
              className="rounded-xl border border-[#2A2A38] bg-[#15151C] p-5 hover:border-[#E8472B] transition-colors"
            >
              <p className="text-2xl">👥</p>
              <p className="mt-2 font-bold text-white">Gérer les membres</p>
              <p className="text-xs text-[#4A4A5A]">{team.members.length} membre{team.members.length > 1 ? "s" : ""}</p>
            </Link>

            <Link
              href={`/teams/${slug}/dashboard/settings`}
              className="rounded-xl border border-[#2A2A38] bg-[#15151C] p-5 hover:border-[#E8472B] transition-colors"
            >
              <p className="text-2xl">⚙️</p>
              <p className="mt-2 font-bold text-white">Paramètres</p>
              <p className="text-xs text-[#4A4A5A]">Modifier la team</p>
            </Link>
          </>
        )}
      </div>

      {/* Chapitres récents */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Chapitres soumis</h2>

        {team.chapters.length === 0 ? (
          <p className="text-sm text-[#4A4A5A]">Aucun chapitre soumis.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#2A2A38]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A2A38] bg-[#15151C]">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Manga</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Chapitre</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A38] bg-[#0C0C10]">
                {team.chapters.map(chapter => (
                  <tr key={chapter.id} className="hover:bg-[#15151C] transition-colors">
                    <td className="px-4 py-3 text-sm text-white">
                      {chapter.manga.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8A8A9A]">
                      Chapitre {chapter.number}
                      {chapter.title && ` — ${chapter.title}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                        chapter.status === "PUBLISHED"
                          ? "bg-green-500/20 text-green-400"
                          : chapter.status === "PENDING"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : chapter.status === "REJECTED"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-[#2A2A38] text-[#8A8A9A]"
                      }`}>
                        {chapter.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4A4A5A]">
                      {new Date(chapter.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}