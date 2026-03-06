import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

type Props = {
  params: Promise<{ slug: string }>
}

export async function PATCH(request: Request, { params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { memberId, role } = await request.json()

  const team = await prisma.team.findUnique({
    where: { slug },
    include: { members: { where: { userId: user.id } } },
  })

  if (!team || !["OWNER", "ADMIN"].includes(team.members[0]?.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const updated = await prisma.teamMember.update({
    where: { id: memberId },
    data: { role },
  })

  return NextResponse.json({ member: updated })
}

export async function DELETE(request: Request, { params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { memberId } = await request.json()

  const team = await prisma.team.findUnique({
    where: { slug },
    include: { members: { where: { userId: user.id } } },
  })

  if (!team || !["OWNER", "ADMIN"].includes(team.members[0]?.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  await prisma.teamMember.delete({ where: { id: memberId } })

  return NextResponse.json({ success: true })
}