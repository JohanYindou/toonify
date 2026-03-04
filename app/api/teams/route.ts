import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function GET() {
  const teams = await prisma.team.findMany({
    where: { isBanned: false },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true, chapters: true } },
    },
  })
  return NextResponse.json({ teams })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { name, description, website, discord } = await request.json()

  if (!name) return NextResponse.json({ error: "Le nom est requis" }, { status: 400 })

  const slug = slugify(name)

  // Vérifie si le nom ou slug existe déjà
  const existing = await prisma.team.findFirst({
    where: { OR: [{ name }, { slug }] },
  })

  if (existing) {
    return NextResponse.json({ error: "Ce nom de team est déjà pris" }, { status: 400 })
  }

  // Crée la team et ajoute le créateur comme OWNER
  const team = await prisma.team.create({
    data: {
      name,
      slug,
      description: description || null,
      website: website || null,
      discord: discord || null,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  })

  return NextResponse.json({ team })
}