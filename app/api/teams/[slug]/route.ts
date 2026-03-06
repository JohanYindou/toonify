import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

type Props = {
  params: Promise<{ slug: string }>
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function PATCH(request: Request, { params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const team = await prisma.team.findUnique({
    where: { slug },
    include: { members: { where: { userId: user.id } } },
  })

  if (!team || !["OWNER", "ADMIN"].includes(team.members[0]?.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { name, description, website, discord } = await request.json()
  const newSlug = slugify(name)

  const updated = await prisma.team.update({
    where: { slug },
    data: {
      name,
      slug: newSlug,
      description: description || null,
      website: website || null,
      discord: discord || null,
    },
  })

  return NextResponse.json({ team: updated })
}

export async function DELETE(_request: Request, { params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const team = await prisma.team.findUnique({
    where: { slug },
    include: { members: { where: { userId: user.id } } },
  })

  if (!team || team.members[0]?.role !== "OWNER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  await prisma.team.delete({ where: { slug } })

  return NextResponse.json({ success: true })
}