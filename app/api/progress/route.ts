import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { chapterId, lastPage, isCompleted } = await request.json()

  const progress = await prisma.chapterProgress.upsert({
    where: {
      userId_chapterId: { userId: user.id, chapterId },
    },
    update: { lastPage, isCompleted },
    create: { userId: user.id, chapterId, lastPage, isCompleted },
  })

  return NextResponse.json({ progress })
}