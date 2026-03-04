import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Vérifie le rôle admin dans la base
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!dbUser || !["ADMIN", "SUPERADMIN", "MODERATOR"].includes(dbUser.role)) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-[#0C0C10]">
      {/* Admin navbar */}
      <header className="border-b border-[#2A2A38] bg-[#0C0C10]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-black text-white">
              <span className="text-[#E8472B]">T</span>OONIFY
              <span className="ml-2 rounded bg-[#E8472B] px-2 py-0.5 text-xs">ADMIN</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/admin" className="text-sm text-[#8A8A9A] hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/mangas" className="text-sm text-[#8A8A9A] hover:text-white transition-colors">
                Mangas
              </Link>
              <Link href="/admin/users" className="text-sm text-[#8A8A9A] hover:text-white transition-colors">
                Utilisateurs
              </Link>
            </nav>
          </div>
          <Link href="/" className="text-xs text-[#4A4A5A] hover:text-white transition-colors">
            ← Retour au site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}