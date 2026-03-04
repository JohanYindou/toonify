"use client"

import { useState, useEffect } from "react"

export function ReaderFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleChange)
    return () => document.removeEventListener("fullscreenchange", handleChange)
  }, [])

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  return (
    <button
      onClick={toggleFullscreen}
      className="rounded border border-[#2A2A38] px-3 py-1 text-xs text-[#8A8A9A] hover:border-[#E8472B] hover:text-white transition-colors"
    >
      {isFullscreen ? "⤡ Quitter" : "⤢ Plein écran"}
    </button>
  )
}