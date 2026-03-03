"use client"

import { useReaderStore } from "@/store/readerStore"

export function ReaderControls() {
  const { layout, theme, zoom, setLayout, setTheme, setZoom } = useReaderStore()

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#2A2A38] bg-[#15151C] px-4 py-3">

      {/* Layout */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#4A4A5A]">Mode</span>
        <div className="flex rounded border border-[#2A2A38] overflow-hidden">
          {[
            { value: "single_rtl", label: "RTL" },
            { value: "single_ltr", label: "LTR" },
            { value: "scroll", label: "Scroll" },
          ].map(o => (
            <button
              key={o.value}
              onClick={() => setLayout(o.value as "single_rtl" | "single_ltr" | "scroll")}
              className={`px-3 py-1 text-xs transition-colors ${
                layout === o.value
                  ? "bg-[#E8472B] text-white"
                  : "text-[#8A8A9A] hover:text-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#4A4A5A]">Thème</span>
        <div className="flex rounded border border-[#2A2A38] overflow-hidden">
          {[
            { value: "dark", label: "Sombre" },
            { value: "light", label: "Clair" },
            { value: "sepia", label: "Sépia" },
          ].map(o => (
            <button
              key={o.value}
              onClick={() => setTheme(o.value as "dark" | "light" | "sepia")}
              className={`px-3 py-1 text-xs transition-colors ${
                theme === o.value
                  ? "bg-[#E8472B] text-white"
                  : "text-[#8A8A9A] hover:text-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#4A4A5A]">Zoom</span>
        <div className="flex rounded border border-[#2A2A38] overflow-hidden">
          {[
            { value: "width", label: "Largeur" },
            { value: "height", label: "Hauteur" },
            { value: "original", label: "Original" },
          ].map(o => (
            <button
              key={o.value}
              onClick={() => setZoom(o.value as "width" | "height" | "original")}
              className={`px-3 py-1 text-xs transition-colors ${
                zoom === o.value
                  ? "bg-[#E8472B] text-white"
                  : "text-[#8A8A9A] hover:text-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}