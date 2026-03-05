"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import Image from "next/image"

type CommentUser = {
  id: string
  username: string
  avatarUrl: string | null
}

type CommentType = {
  id: string
  content: string
  createdAt: string
  user: CommentUser
  replies: CommentType[]
  _count: { likes: number }
}

async function fetchComments(chapterId: string) {
  const res = await fetch(`/api/comments?chapterId=${chapterId}`)
  return res.json()
}

function Avatar({ user }: { user: CommentUser }) {
  return (
    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#E8472B]">
      {user.avatarUrl ? (
        <Image src={user.avatarUrl} alt={user.username} fill className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-xs font-black text-white">
          {user.username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  chapterId,
  currentUserId,
}: {
  comment: CommentType
  chapterId: string
  currentUserId?: string
}) {
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const queryClient = useQueryClient()

  const replyMutation = useMutation({
    mutationFn: (content: string) =>
      fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, content, parentId: comment.id }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", chapterId] })
      setReplyContent("")
      setShowReply(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: comment.id }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", chapterId] }),
  })

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar user={comment.user} />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{comment.user.username}</span>
            <span className="text-xs text-[#4A4A5A]">
              {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
          <p className="text-sm text-[#8A8A9A]">{comment.content}</p>
          <div className="flex gap-3">
            <span className="text-xs text-[#4A4A5A]">
              {comment._count.likes} like{comment._count.likes > 1 ? "s" : ""}
            </span>
            {currentUserId && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-xs text-[#4A4A5A] hover:text-white transition-colors"
              >
                Répondre
              </button>
            )}
            {currentUserId === comment.user.id && (
              <button
                onClick={() => deleteMutation.mutate()}
                className="text-xs text-[#4A4A5A] hover:text-red-400 transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReply && (
            <div className="flex gap-2 pt-2">
              <input
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="Votre réponse..."
                className="flex-1 rounded-lg border border-[#2A2A38] bg-[#1E1E28] px-3 py-2 text-sm text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
              />
              <button
                onClick={() => replyMutation.mutate(replyContent)}
                disabled={!replyContent}
                className="rounded-lg bg-[#E8472B] px-4 py-2 text-sm font-bold text-white hover:bg-[#D03820] transition-colors disabled:opacity-50"
              >
                Envoyer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l border-[#2A2A38] pl-4">
          {comment.replies.map(reply => (
            <div key={reply.id} className="flex gap-3">
              <Avatar user={reply.user} />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{reply.user.username}</span>
                  <span className="text-xs text-[#4A4A5A]">
                    {new Date(reply.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <p className="text-sm text-[#8A8A9A]">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function Comments({
  chapterId,
  currentUserId,
}: {
  chapterId: string
  currentUserId?: string
}) {
  const [content, setContent] = useState("")
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["comments", chapterId],
    queryFn: () => fetchComments(chapterId),
  })

  const postMutation = useMutation({
    mutationFn: (content: string) =>
      fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, content }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", chapterId] })
      setContent("")
    },
  })

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-white">
        Commentaires {data?.comments?.length > 0 && `(${data.comments.length})`}
      </h2>

      {/* Post form */}
      {currentUserId ? (
        <div className="flex gap-3">
          <input
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Laisser un commentaire..."
            className="flex-1 rounded-lg border border-[#2A2A38] bg-[#15151C] px-4 py-3 text-white placeholder-[#4A4A5A] focus:border-[#E8472B] focus:outline-none"
          />
          <button
            onClick={() => postMutation.mutate(content)}
            disabled={!content}
            className="rounded-lg bg-[#E8472B] px-6 py-3 font-bold text-white hover:bg-[#D03820] transition-colors disabled:opacity-50"
          >
            Envoyer
          </button>
        </div>
      ) : (
        <p className="text-sm text-[#4A4A5A]">
          <a href="/login" className="text-[#E8472B] hover:underline">Connecte-toi</a> pour commenter.
        </p>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[#1E1E28]" />
          ))}
        </div>
      ) : data?.comments?.length === 0 ? (
        <p className="text-sm text-[#4A4A5A]">Aucun commentaire pour l&apos;instant.</p>
      ) : (
        <div className="space-y-6 divide-y divide-[#2A2A38]">
          {data?.comments?.map((comment: CommentType) => (
            <div key={comment.id} className="pt-6 first:pt-0">
              <CommentItem
                comment={comment}
                chapterId={chapterId}
                currentUserId={currentUserId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}