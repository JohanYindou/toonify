import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0C0C10]">
      <h1 className="text-5xl font-black text-white">
        <span className="text-[#E8472B]">T</span>OONIFY
      </h1>
      <p className="mt-3 text-[#8A8A9A] italic">
        Votre univers manga, sans limites.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/library"
          className="rounded-lg bg-[#E8472B] px-6 py-3 font-bold text-white hover:bg-[#D03820] transition-colors"
        >
          Ma bibliothèque
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-[#2A2A38] px-6 py-3 text-white hover:bg-[#1E1E28] transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </main>
  )
}