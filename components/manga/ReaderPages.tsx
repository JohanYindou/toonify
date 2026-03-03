"use client"

import { useReaderStore } from "@/store/readerStore"
import Image from "next/image"

type Page = {
  id: string
  pageNumber: number
  imageUrl: string
  width: number | null
  height: number | null
}

export function ReaderPages({ pages }: { pages: Page[] }) {
  const { layout, theme, zoom } = useReaderStore()

  const bgColor =
    theme === "dark" ? "bg-[#0C0C10]" :
    theme === "light" ? "bg-white" :
    "bg-[#F4ECD8]"

  const imgClass =
    zoom === "width" ? "w-full" :
    zoom === "height" ? "h-screen object-contain" :
    "max-w-none"

  return (
    <div className={`${bgColor} flex flex-col items-center gap-${layout === "scroll" ? "0" : "1"}`}>
      {pages.map(page => (
        <div
          key={page.id}
          className={`relative ${zoom === "width" ? "w-full max-w-3xl" : "flex justify-center"}`}
        >
          <Image
            src={page.imageUrl}
            alt={`Page ${page.pageNumber}`}
            width={page.width ?? 800}
            height={page.height ?? 1200}
            className={imgClass}
            priority={page.pageNumber <= 3}
          />
        </div>
      ))}
    </div>
  )
}