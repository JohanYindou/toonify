import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#0C0C10]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#2A2A38] bg-[#0C0C10]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-black text-white">
            <span className="text-[#E8472B]">T</span>OONIFY
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-[#8A8A9A] hover:text-white transition-colors">
              Accueil
            </Link>
            <Link href="/search" className="text-sm text-[#8A8A9A] hover:text-white transition-colors">
              Recherche
            </Link>
            <Link href="/library" className="text-sm text-[#8A8A9A] hover:text-white transition-colors">
              Bibliothèque
            </Link>
            <Link href="/teams" className="text-sm text-[#8A8A9A] hover:text-white transition-colors">
              Teams
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg border border-[#2A2A38] px-4 py-2 text-sm text-white hover:bg-[#1E1E28] transition-colors"
              >
                {user.email}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-[#8A8A9A] hover:text-white transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[#E8472B] px-4 py-2 text-sm font-bold text-white hover:bg-[#D03820] transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}