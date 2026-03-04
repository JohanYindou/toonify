import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const { id, email, username } = await request.json()

  try {
    const user = await prisma.user.create({
      data: {
        id,
        email,
        username,
        emailVerified: false,
        role: "USER",
        isBanned: false,
        locale: "fr",
        timezone: "Europe/Paris",
      },
    })
    return NextResponse.json({ user })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erreur création utilisateur" }, { status: 500 })
  }
}