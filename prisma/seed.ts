import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
async function main() {
  // Genres
  const genres = [
    { name: "Action", slug: "action" },
    { name: "Aventure", slug: "aventure" },
    { name: "Comédie", slug: "comedie" },
    { name: "Drame", slug: "drame" },
    { name: "Fantasy", slug: "fantasy" },
    { name: "Horreur", slug: "horreur" },
    { name: "Mystère", slug: "mystere" },
    { name: "Romance", slug: "romance" },
    { name: "Science-Fiction", slug: "science-fiction" },
    { name: "Slice of Life", slug: "slice-of-life" },
    { name: "Sport", slug: "sport" },
    { name: "Surnaturel", slug: "surnaturel" },
    { name: "Thriller", slug: "thriller" },
    { name: "Isekai", slug: "isekai" },
    { name: "Mecha", slug: "mecha" },
    { name: "Arts Martiaux", slug: "arts-martiaux" },
    { name: "Psychologique", slug: "psychologique" },
    { name: "Historique", slug: "historique" },
    { name: "Médical", slug: "medical" },
    { name: "Culinaire", slug: "culinaire" },
  ]

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    })
  }
  console.log("✓ Genres créés")

  // Tags
  const tags = [
    { name: "Shounen", slug: "shounen" },
    { name: "Shoujo", slug: "shoujo" },
    { name: "Seinen", slug: "seinen" },
    { name: "Josei", slug: "josei" },
    { name: "Harem", slug: "harem" },
    { name: "Ecchi", slug: "ecchi" },
    { name: "Magie", slug: "magie" },
    { name: "Vampires", slug: "vampires" },
    { name: "Démons", slug: "demons" },
    { name: "Ninja", slug: "ninja" },
    { name: "Pirates", slug: "pirates" },
    { name: "Super-pouvoirs", slug: "super-pouvoirs" },
    { name: "Apocalypse", slug: "apocalypse" },
    { name: "Jeu vidéo", slug: "jeu-video" },
    { name: "Voyage dans le temps", slug: "voyage-dans-le-temps" },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    })
  }
  console.log("✓ Tags créés")

  // Feature Flags
  const flags = [
    { key: "FORUM_ENABLED",               isEnabled: false, description: "Forums de discussion par manga" },
    { key: "DONATIONS_ENABLED",           isEnabled: false, description: "Dons aux teams via Stripe" },
    { key: "CHAPTER_MODERATION_ENABLED",  isEnabled: true,  description: "Validation admin avant publication" },
    { key: "NSFW_ENABLED",                isEnabled: false, description: "Affichage contenu ADULT" },
    { key: "MOBILE_APP_ENABLED",          isEnabled: false, description: "Endpoints app mobile" },
  ]

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    })
  }
  console.log("✓ Feature flags créés")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })