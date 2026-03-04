import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminMangasPage() {
  const mangas = await prisma.manga.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      authors: { include: { author: true } },
      _count: { select: { chapters: true } },
    },
  })

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Mangas ({mangas.length})</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#2A2A38]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A2A38] bg-[#15151C]">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Titre</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Chapitres</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Approuvé</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#4A4A5A]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A38] bg-[#0C0C10]">
            {mangas.map(manga => (
              <tr key={manga.id} className="hover:bg-[#15151C] transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{manga.title}</p>
                    {manga.authors.length > 0 && (
                      <p className="text-xs text-[#4A4A5A]">
                        {manga.authors.map(a => a.author.name).join(", ")}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-[#E8472B] px-2 py-0.5 text-xs font-bold text-white">
                    {manga.contentType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                    manga.status === "ONGOING"
                      ? "bg-green-500/20 text-green-400"
                      : manga.status === "COMPLETED"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {manga.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#8A8A9A]">
                  {manga._count.chapters.toString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                    manga.isApproved
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {manga.isApproved ? "Oui" : "Non"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/manga/${manga.slug}`}
                    className="text-xs text-[#E8472B] hover:underline"
                  >
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}