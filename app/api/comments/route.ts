import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chapterId = searchParams.get("chapterId")

  if (!chapterId) {
    return NextResponse.json({ error: "chapterId requis" }, { status: 400 })
  }

  const comments = await prisma.comment.findMany({
    where: {
      chapterId,
      parentId: null,
      status: "VISIBLE",
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
      replies: {
        where: { status: "VISIBLE" },
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
      _count: { select: { likes: true } },
    },
  })

  return NextResponse.json({ comments })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { chapterId, content, parentId } = await request.json()

  if (!chapterId || !content) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      chapterId,
      userId: user.id,
      content,
      parentId: parentId ?? null,
    },
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true } },
    },
  })

  return NextResponse.json({ comment })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { commentId } = await request.json()

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  })

  if (!comment) return NextResponse.json({ error: "Commentaire introuvable" }, { status: 404 })
  if (comment.userId !== user.id) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

  await prisma.comment.update({
    where: { id: commentId },
    data: { status: "DELETED" },
  })

  return NextResponse.json({ success: true })
}