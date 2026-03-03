import { create } from "zustand"
import { persist } from "zustand/middleware"

type ReaderLayout = "single_rtl" | "single_ltr" | "scroll"
type ReaderTheme = "dark" | "light" | "sepia"
type ReaderZoom = "width" | "height" | "original"

type ReaderStore = {
  layout: ReaderLayout
  theme: ReaderTheme
  zoom: ReaderZoom
  pageSpacing: number
  setLayout: (layout: ReaderLayout) => void
  setTheme: (theme: ReaderTheme) => void
  setZoom: (zoom: ReaderZoom) => void
  setPageSpacing: (spacing: number) => void
}

export const useReaderStore = create<ReaderStore>()(
  persist(
    set => ({
      layout: "single_rtl",
      theme: "dark",
      zoom: "width",
      pageSpacing: 0,
      setLayout: layout => set({ layout }),
      setTheme: theme => set({ theme }),
      setZoom: zoom => set({ zoom }),
      setPageSpacing: pageSpacing => set({ pageSpacing }),
    }),
    { name: "toonify-reader" }
  )
)