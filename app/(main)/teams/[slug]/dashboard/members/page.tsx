import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { MembersClient } from "./MembersClient"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function TeamMembersPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: { select: { id: true, username: true, avatarUrl: true, email: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  })

  if (!team) notFound()

  const member = team.members.find(m => m.userId === user.id)
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    redirect(`/teams/${slug}/dashboard`)
  }

  return (
    <MembersClient
      team={{ id: team.id, name: team.name, slug: team.slug }}
      members={team.members}
      currentUserId={user.id}
    />
  )
}