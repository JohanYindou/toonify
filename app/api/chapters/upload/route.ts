import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const formData = await request.formData()
  const mangaId = formData.get("mangaId") as string
  const number = parseFloat(formData.get("number") as string)
  const title = formData.get("title") as string | null
  const teamSlug = formData.get("teamSlug") as string
  const pages = formData.getAll("pages") as File[]

  if (!mangaId || !number || pages.length === 0) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 })
  }

  // Vérifie que l'user est membre de la team
  const team = await prisma.team.findUnique({
    where: { slug: teamSlug },
    include: { members: { where: { userId: user.id } } },
  })

  if (!team || team.members.length === 0) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  // Vérifie que le chapitre n'existe pas déjà
  const existing = await prisma.chapter.findFirst({
    where: { mangaId, number },
  })

  if (existing) {
    return NextResponse.json({ error: "Ce chapitre existe déjà" }, { status: 400 })
  }

  // Upload des pages sur Supabase Storage
  const pageUrls: { pageNumber: number; imageUrl: string }[] = []

  for (let i = 0; i < pages.length; i++) {
    const file = pages[i]
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${mangaId}/chapter-${number}/page-${i + 1}.${file.name.split(".").pop()}`

    const { error: uploadError } = await supabase.storage
      .from("chapters")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: `Erreur upload page ${i + 1}` }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from("chapters")
      .getPublicUrl(fileName)

    pageUrls.push({ pageNumber: i + 1, imageUrl: publicUrl })
  }

  // Crée le chapitre + pages en base
  const chapter = await prisma.chapter.create({
    data: {
      mangaId,
      teamId: team.id,
      number,
      title: title || null,
      status: "PENDING",
      pageCount: pages.length,
      pages: {
        create: pageUrls,
      },
    },
  })

  return NextResponse.json({ chapter })
}