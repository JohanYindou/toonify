import { prisma } from "@/lib/prisma"

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          library: true,
          comments: true,
          teamMemberships: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Utilisateurs ({users.length})</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#2A2A38]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A2A38] bg-[#15151C]">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Utilisateur</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Rôle</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Bibliothèque</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Commentaires</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Teams</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A38] bg-[#0C0C10]">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-[#15151C] transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user.username ?? "—"}
                    </p>
                    <p className="text-xs text-[#4A4A5A]">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                    user.role === "SUPERADMIN"
                      ? "bg-[#E8472B]/20 text-[#E8472B]"
                      : user.role === "ADMIN"
                      ? "bg-[#C9A84C]/20 text-[#C9A84C]"
                      : user.role === "MODERATOR"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-[#2A2A38] text-[#8A8A9A]"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#8A8A9A]">
                  {user._count.library}
                </td>
                <td className="px-4 py-3 text-sm text-[#8A8A9A]">
                  {user._count.comments}
                </td>
                <td className="px-4 py-3 text-sm text-[#8A8A9A]">
                  {user._count.teamMemberships}
                </td>
                <td className="px-4 py-3 text-xs text-[#4A4A5A]">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}