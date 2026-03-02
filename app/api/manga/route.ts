import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma, MangaStatus,ContentType } from "@prisma/client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "24")
  const type = searchParams.get("type")
  // eslint-disable-next-line
  const status = searchParams.get("status") as MangaStatus | null
  const genre = searchParams.get("genre")
  const search = searchParams.get("search")

  const where: Prisma.MangaWhereInput = {
    isApproved: true,
    ...(type && { contentType: type as ContentType }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { titleAlternative: { has: search } },
      ],
    }),
    ...(genre && {
      genres: { some: { genre: { slug: genre } } },
    }),
  }

  const [mangas, total] = await Promise.all([
    prisma.manga.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { viewCount: "desc" },
      include: {
        genres: { include: { genre: true } },
        authors: { include: { author: true } },
        _count: { select: { chapters: true } },
      },
    }),
    prisma.manga.count({ where }),
  ])

  return NextResponse.json({
    mangas,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}