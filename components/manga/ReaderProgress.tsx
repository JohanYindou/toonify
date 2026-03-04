"use client"

import { useEffect, useRef } from "react"

type Props = {
  chapterId: string
  totalPages: number
}

export function ReaderProgress({ chapterId, totalPages }: Props) {
  const savedRef = useRef(false)

  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true

    // Sauvegarde la progression après 5 secondes de lecture
    const timer = setTimeout(async () => {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterId,
            lastPage: 1,
            isCompleted: false,
          }),
        })
      } catch (err) {
        console.error("Erreur sauvegarde progression:", err)
      }
    }, 5000)

    // Marque comme complété quand on arrive en bas de page
    function handleScroll() {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight

      if (scrolled >= total - 100) {
        clearTimeout(timer)
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterId,
            lastPage: totalPages,
            isCompleted: true,
          }),
        }).catch(console.error)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [chapterId, totalPages])

  return null
}