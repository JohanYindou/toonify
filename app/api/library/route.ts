import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { UserMangaStatus } from "@prisma/client"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") as UserMangaStatus | null

  const library = await prisma.userManga.findMany({
    where: {
      userId: user.id,
      ...(status && { status }),
    },
    include: {
      manga: {
        include: {
          genres: { include: { genre: true } },
          _count: { select: { chapters: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ library })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { mangaId, status } = await request.json()

  const entry = await prisma.userManga.upsert({
    where: {
      userId_mangaId: { userId: user.id, mangaId },
    },
    update: { status },
    create: { userId: user.id, mangaId, status },
  })

  return NextResponse.json({ entry })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { mangaId } = await request.json()

  await prisma.userManga.delete({
    where: {
      userId_mangaId: { userId: user.id, mangaId },
    },
  })

  return NextResponse.json({ success: true })
}