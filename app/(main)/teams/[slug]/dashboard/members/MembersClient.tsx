"use client"

import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

const ROLES = ["MEMBER", "TRANSLATOR", "PROOFREADER", "CLEANER", "TYPESETTER", "ADMIN"]

type Member = {
  id: string
  role: string
  joinedAt: Date
  userId: string
  user: {
    id: string
    username: string
    avatarUrl: string | null
    email: string
  }
}

type Props = {
  team: { id: string; name: string; slug: string }
  members: Member[]
  currentUserId: string
}

export function MembersClient({ team, members, currentUserId }: Props) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      fetch(`/api/teams/${team.slug}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role }),
      }).then(r => r.json()),
    onSuccess: () => {
      setSuccess("Rôle mis à jour !")
      setError("")
      router.refresh()
    },
    onError: () => setError("Erreur lors de la mise à jour."),
  })

  const removeMutation = useMutation({
    mutationFn: (memberId: string) =>
      fetch(`/api/teams/${team.slug}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      }).then(r => r.json()),
    onSuccess: () => {
      setSuccess("Membre retiré.")
      setError("")
      router.refresh()
    },
    onError: () => setError("Erreur lors de la suppression."),
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Membres — {team.name}</h1>
        <Link
          href={`/teams/${team.slug}/dashboard`}
          className="text-sm text-[#8A8A9A] hover:text-white transition-colors"
        >
          ← Retour
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
      {success && <p className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400">{success}</p>}

      <div className="space-y-3">
        {members.map(member => (
          <div
            key={member.id}
            className="flex items-center gap-4 rounded-lg border border-[#2A2A38] bg-[#15151C] px-4 py-3"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#E8472B]">
              {member.user.avatarUrl ? (
                <Image src={member.user.avatarUrl} alt={member.user.username} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-black text-white">
                  {member.user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-white">{member.user.username}</p>
              <p className="text-xs text-[#4A4A5A]">{member.user.email}</p>
            </div>

            {member.role !== "OWNER" && member.userId !== currentUserId ? (
              <select
                defaultValue={member.role}
                onChange={e => updateRoleMutation.mutate({ memberId: member.id, role: e.target.value })}
                className="rounded border border-[#2A2A38] bg-[#1E1E28] px-2 py-1 text-xs text-white focus:border-[#E8472B] focus:outline-none"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            ) : (
              <span className="rounded border border-[#2A2A38] px-2 py-1 text-xs text-[#8A8A9A]">
                {member.role}
              </span>
            )}

            {member.role !== "OWNER" && member.userId !== currentUserId && (
              <button
                onClick={() => removeMutation.mutate(member.id)}
                className="text-xs text-[#4A4A5A] hover:text-red-400 transition-colors"
              >
                Retirer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}