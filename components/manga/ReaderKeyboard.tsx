"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

type Props = {
  slug: string
  prevNumber: number | null
  nextNumber: number | null
}

export function ReaderKeyboard({ slug, prevNumber, nextNumber }: Props) {
  const router = useRouter()

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && prevNumber !== null) {
        router.push(`/manga/${slug}/chapter/${prevNumber}`)
      }
      if (e.key === "ArrowRight" && nextNumber !== null) {
        router.push(`/manga/${slug}/chapter/${nextNumber}`)
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [slug, prevNumber, nextNumber, router])

  return null
}