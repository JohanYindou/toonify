"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

type Notification = {
  id: string
  title: string
  body: string | null
  isRead: boolean
  link: string | null
  createdAt: string
  type: string
}

async function fetchNotifications() {
  const res = await fetch("/api/notifications")
  return res.json()
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Rafraîchit toutes les 30s
  })

  const markAllMutation = useMutation({
    mutationFn: () =>
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const markOneMutation = useMutation({
    mutationFn: (notificationId: string) =>
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const unreadCount = data?.unreadCount ?? 0

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg border border-[#2A2A38] p-2 text-[#8A8A9A] hover:text-white transition-colors"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E8472B] text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-[#2A2A38] bg-[#15151C] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2A2A38] px-4 py-3">
              <h3 className="font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="text-xs text-[#E8472B] hover:underline"
                >
                  Tout marquer lu
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {!data?.notifications?.length ? (
                <p className="px-4 py-8 text-center text-sm text-[#4A4A5A]">
                  Aucune notification.
                </p>
              ) : (
                data.notifications.map((notif: Notification) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markOneMutation.mutate(notif.id)
                      if (notif.link) window.location.href = notif.link
                      setOpen(false)
                    }}
                    className={`cursor-pointer border-b border-[#2A2A38] px-4 py-3 hover:bg-[#1E1E28] transition-colors ${
                      !notif.isRead ? "bg-[#1E1E28]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E8472B]" />
                      )}
                      <div className={!notif.isRead ? "" : "ml-4"}>
                        <p className="text-sm font-medium text-white">{notif.title}</p>
                        {notif.body && (
                          <p className="text-xs text-[#4A4A5A]">{notif.body}</p>
                        )}
                        <p className="mt-1 text-xs text-[#4A4A5A]">
                          {new Date(notif.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}