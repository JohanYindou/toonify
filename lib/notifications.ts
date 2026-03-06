import { prisma } from "@/lib/prisma"
import { NotificationType } from "@prisma/client"

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: {
  userId: string
  type: NotificationType
  title: string
  body?: string
  link?: string
}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
    },
  })
}

// Notifie tous les abonnés d'un manga d'un nouveau chapitre
export async function notifyNewChapter({
  mangaId,
  mangaTitle,
  mangaSlug,
  chapterNumber,
}: {
  mangaId: string
  mangaTitle: string
  mangaSlug: string
  chapterNumber: number
}) {
  const subscribers = await prisma.userManga.findMany({
    where: {
      mangaId,
      status: "READING",
    },
    select: { userId: true },
  })

  if (subscribers.length === 0) return

  await prisma.notification.createMany({
    data: subscribers.map(s => ({
      userId: s.userId,
      type: "NEW_CHAPTER" as NotificationType,
      title: `Nouveau chapitre — ${mangaTitle}`,
      body: `Le chapitre ${chapterNumber} est disponible !`,
      link: `/manga/${mangaSlug}/chapter/${chapterNumber}`,
    })),
  })
}