import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { SettingsClient } from "./SettingsClient"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function TeamSettingsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      members: { where: { userId: user.id } },
    },
  })

  if (!team) notFound()

  const member = team.members[0]
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    redirect(`/teams/${slug}/dashboard`)
  }

  return (
    <SettingsClient
      team={{
        id: team.id,
        name: team.name,
        slug: team.slug,
        description: team.description,
        website: team.website,
        discord: team.discord,
      }}
    />
  )
}