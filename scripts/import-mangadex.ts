import "dotenv/config"
import { PrismaClient, MangaStatus, ContentType } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MANGADEX_API = "https://api.mangadex.org"

// Mapping genres MangaDex → slugs Toonify
const GENRE_MAP: Record<string, string> = {
  "Action": "action",
  "Adventure": "aventure",
  "Comedy": "comedie",
  "Drama": "drame",
  "Fantasy": "fantasy",
  "Horror": "horreur",
  "Mystery": "mystere",
  "Romance": "romance",
  "Sci-Fi": "science-fiction",
  "Slice of Life": "slice-of-life",
  "Sports": "sport",
  "Supernatural": "surnaturel",
  "Thriller": "thriller",
  "Isekai": "isekai",
  "Mecha": "mecha",
  "Martial Arts": "arts-martiaux",
  "Psychological": "psychologique",
  "Historical": "historique",
  "Medical": "medical",
  "Cooking": "culinaire",
}

// Mapping type MangaDex → ContentType Toonify
const TYPE_MAP: Record<string, ContentType> = {
  manga: ContentType.MANGA,
  manhwa: ContentType.MANHWA,
  manhua: ContentType.MANHUA,
  one_shot: ContentType.ONE_SHOT,
}

// Mapping status MangaDex → MangaStatus Toonify
const STATUS_MAP: Record<string, MangaStatus> = {
  ongoing: MangaStatus.ONGOING,
  completed: MangaStatus.COMPLETED,
  hiatus: MangaStatus.HIATUS,
  cancelled: MangaStatus.CANCELLED,
}

interface MangaDexTag {
  attributes?: {
    name?: {
      en?: string
    }
  }
}

interface MangaDexRelationship {
  type?: string
  attributes?: {
    fileName?: string
    name?: string
  }
}

interface MangaDexAttributes {
  title?: Record<string, string>
  description?: Record<string, string>
  originalLanguage?: string
  status?: string
  year?: number | null
  tags?: MangaDexTag[]
}

interface MangaDexManga {
  id: string
  attributes: MangaDexAttributes
  relationships?: MangaDexRelationship[]
}

async function fetchTopMangas(limit = 50, offset = 0) {
  const params = new URLSearchParams()
  params.set("limit", limit.toString())
  params.set("offset", offset.toString())
  params.append("order[followedCount]", "desc")
  params.append("availableTranslatedLanguage[]", "fr")
  params.append("contentRating[]", "safe")
  params.append("contentRating[]", "suggestive")
  params.append("includes[]", "cover_art")
  params.append("includes[]", "author")

  const res = await fetch(`${MANGADEX_API}/manga?${params}`)
  const data = await res.json()
  return data
}

async function getCoverUrl(mangaId: string, fileName: string) {
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.512.jpg`
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function importManga(mangaData: MangaDexManga) {
  const attrs = mangaData.attributes

  // Titre (priorité FR sinon EN)
  const title =
    attrs.title?.fr ??
    attrs.title?.en ??
    Object.values(attrs.title ?? {})[0] as string

  if (!title) return

  const slug = slugify(title)

  // Description
  const synopsis =
    attrs.description?.fr ??
    attrs.description?.en ??
    null

  // Cover
  const coverRel = mangaData.relationships?.find((r: MangaDexRelationship) => r.type === "cover_art")
  const coverUrl = coverRel?.attributes?.fileName
    ? await getCoverUrl(mangaData.id, coverRel.attributes.fileName)
    : null

  // Auteur
  const authorRel = mangaData.relationships?.find((r: MangaDexRelationship) => r.type === "author")
  const authorName = authorRel?.attributes?.name ?? null

  // Type
  const contentType = TYPE_MAP[attrs.originalLanguage ?? ""] ?? ContentType.MANGA

  // Status
  const status = STATUS_MAP[attrs.status ?? ""] ?? MangaStatus.ONGOING

  // Année
  const releaseYear = attrs.year ?? null

  try {
    const baseData = {
      title,
      synopsis,
      coverUrl,
      status,
      releaseYear,
    }

    const existing = await prisma.manga.findFirst({
      where: {
        externalId: mangaData.id,
        externalSource: "mangadex",
      },
    })

    const manga = existing
      ? await prisma.manga.update({
          where: { id: existing.id },
          data: baseData,
        })
      : await prisma.manga.create({
          data: {
            ...baseData,
            slug: `${slug}-${mangaData.id.slice(0, 6)}`,
            contentType,
            isApproved: true,
            externalId: mangaData.id,
            externalSource: "mangadex",
          },
        })

    // Auteur
    if (authorName) {
      const authorSlug = slugify(authorName)
      const author = await prisma.author.upsert({
        where: { slug: authorSlug },
        update: {
          name: authorName,
        },
        create: {
          name: authorName,
          slug: authorSlug,
        },
      })
      await prisma.mangaAuthor.upsert({
        where: { mangaId_authorId: { mangaId: manga.id, authorId: author.id } },
        update: {},
        create: { mangaId: manga.id, authorId: author.id },
      })
    }

    // Genres
    const tags = attrs.tags ?? []
    for (const tag of tags) {
    const tagName = tag.attributes?.name?.en
    if (!tagName) continue
    const genreSlug = GENRE_MAP[tagName]
      if (!genreSlug) continue

      const genre = await prisma.genre.findUnique({ where: { slug: genreSlug } })
      if (!genre) continue

      await prisma.mangaGenre.upsert({
        where: { mangaId_genreId: { mangaId: manga.id, genreId: genre.id } },
        update: {},
        create: { mangaId: manga.id, genreId: genre.id },
      })
    }

    console.log(`✓ ${title}`)
  } catch (err) {
    console.error(`✗ ${title}:`, err)
  }
}

async function main() {
  console.log("Import MangaDex démarré...\n")

  let imported = 0
  const total = 100 // Nombre de mangas à importer

  for (let offset = 0; offset < total; offset += 50) {
    const data = await fetchTopMangas(50, offset)
    const mangas = data.data ?? []

    console.log(`\nBatch ${offset / 50 + 1} — ${mangas.length} mangas`)

    for (const manga of mangas) {
      await importManga(manga)
      imported++
      // Pause pour respecter le rate limit MangaDex
      await new Promise(r => setTimeout(r, 200))
    }
  }

  console.log(`\n✅ Import terminé — ${imported} mangas traités`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())