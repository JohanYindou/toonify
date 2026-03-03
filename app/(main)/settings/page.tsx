"use client"

import { useReaderStore } from "@/store/readerStore"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { layout, theme, zoom, pageSpacing, setLayout, setTheme, setZoom, setPageSpacing } = useReaderStore()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">

      <h1 className="text-2xl font-black text-white">Paramètres</h1>

      {/* Préférences reader */}
      <div className="space-y-6 rounded-xl border border-[#2A2A38] bg-[#15151C] p-6">
        <h2 className="text-lg font-bold text-white">Lecteur</h2>

        {/* Layout */}
        <div className="space-y-2">
          <label className="text-sm text-[#8A8A9A]">Mode de lecture</label>
          <div className="flex gap-2">
            {[
              { value: "single_rtl", label: "RTL (Manga)" },
              { value: "single_ltr", label: "LTR (Manhwa)" },
              { value: "scroll", label: "Défilement" },
            ].map(o => (
              <button
                key={o.value}
                onClick={() => setLayout(o.value as "single_rtl" | "single_ltr" | "scroll")}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  layout === o.value
                    ? "bg-[#E8472B] text-white"
                    : "border border-[#2A2A38] text-[#8A8A9A] hover:border-[#E8472B] hover:text-white"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <label className="text-sm text-[#8A8A9A]">Thème du lecteur</label>
          <div className="flex gap-2">
            {[
              { value: "dark", label: "Sombre" },
              { value: "light", label: "Clair" },
              { value: "sepia", label: "Sépia" },
            ].map(o => (
              <button
                key={o.value}
                onClick={() => setTheme(o.value as "dark" | "light" | "sepia")}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  theme === o.value
                    ? "bg-[#E8472B] text-white"
                    : "border border-[#2A2A38] text-[#8A8A9A] hover:border-[#E8472B] hover:text-white"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom */}
        <div className="space-y-2">
          <label className="text-sm text-[#8A8A9A]">Zoom par défaut</label>
          <div className="flex gap-2">
            {[
              { value: "width", label: "Largeur" },
              { value: "height", label: "Hauteur" },
              { value: "original", label: "Original" },
            ].map(o => (
              <button
                key={o.value}
                onClick={() => setZoom(o.value as "width" | "height" | "original")}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  zoom === o.value
                    ? "bg-[#E8472B] text-white"
                    : "border border-[#2A2A38] text-[#8A8A9A] hover:border-[#E8472B] hover:text-white"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Page spacing */}
        <div className="space-y-2">
          <label className="text-sm text-[#8A8A9A]">
            Espacement entre les pages : {pageSpacing}px
          </label>
          <input
            type="range"
            min={0}
            max={32}
            step={4}
            value={pageSpacing}
            onChange={e => setPageSpacing(parseInt(e.target.value))}
            className="w-full accent-[#E8472B]"
          />
        </div>
      </div>

      {/* Compte */}
      <div className="space-y-4 rounded-xl border border-[#2A2A38] bg-[#15151C] p-6">
        <h2 className="text-lg font-bold text-white">Compte</h2>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-red-500/30 px-6 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Se déconnecter
        </button>
      </div>

    </div>
  )
}