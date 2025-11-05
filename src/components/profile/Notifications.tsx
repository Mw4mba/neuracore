// src/components/profile/Notifications.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import NotificationItem from "./NotificationItem";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  user_id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const hasUnread = notifications.some(n => !n.is_read);
  const router = useRouter();

  useEffect(() => {
    let supabase: any;
    let subscription: any;

    async function init() {
      try {
        // fetch current notifications via server API (server handles auth)
        const res = await fetch("/api/notifications");
        const payload = await res.json();
        if (payload?.notifications) {
          setNotifications(payload.notifications);
        }

        // create client to subscribe to realtime changes
        supabase = createClient();

        const { data: { user } = {} } = await supabase.auth.getUser();
        const userId = user?.id;

        if (!userId) {
          setLoading(false);
          return;
        }

        subscription = supabase
          .channel("public:notifications")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "notifications" },
            (payload: any) => {
              const newNotif = payload?.new;
              if (!newNotif) return;
              if (newNotif.user_id === userId) {
                setNotifications((prev) => [newNotif, ...prev]);
              }
            }
          )
          .subscribe();

      } catch (err) {
        console.error("Notifications: failed to initialize", err);
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      try {
        if (subscription && supabase) supabase.removeChannel(subscription);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds: unreadIds }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const iconForType = (type: string) => {
    switch (type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "follow":
        return "👥";
      case "achievement":
        return "🏆";
      default:
        return "🔔";
    }
  };

  return (
    <div className="bg-bg-dark p-8 rounded-lg border border-border-secondary">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="text-text-secondary" />
            {hasUnread && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Notifications</h3>
        </div>
        <div>
          <button
            onClick={markAllRead}
            className="text-sm text-text-secondary hover:underline"
          >
            Mark all read
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-text-secondary">No notifications</p>
      ) : (
        <div>
          {notifications.map((n) => {
            // compute destination for notification
            let href: string | undefined = undefined;
            if ((n as any).idea_id) {
              href = `/idea/${(n as any).idea_id}`;
              if ((n as any).comment_id) href += `#comment-${(n as any).comment_id}`;
            } else if ((n as any).comment_id && !(n as any).idea_id) {
              // we only have comment id; will resolve idea id on click
              href = undefined;
            }

            const handleClick = async (e?: any) => {
              if (e && e.preventDefault) e.preventDefault();

              // Mark this notification as read
              try {
                const res = await fetch("/api/notifications", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ notificationIds: [n.id] }),
                });
                if (res.ok) {
                  setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
                }
              } catch (err) {
                console.error("Failed to mark notification read:", err);
              }

              // Determine destination and navigate
              try {
                if ((n as any).idea_id) {
                  let dest = `/idea/${(n as any).idea_id}`;
                  if ((n as any).comment_id) dest += `#comment-${(n as any).comment_id}`;
                  router.push(dest);
                  return;
                }

                if ((n as any).comment_id && !(n as any).idea_id) {
                  // fetch comment to get idea_id, then navigate to comment fragment
                  const resp = await fetch(`/api/comments/get?comment_id=${(n as any).comment_id}`);
                  if (resp.ok) {
                    const data = await resp.json();
                    const ideaId = data?.idea_id;
                    if (ideaId) {
                      const dest = `/idea/${ideaId}#comment-${(n as any).comment_id}`;
                      router.push(dest);
                      return;
                    }
                  }
                }

                // fallback: open notifications center page
                router.push("/notifications");
              } catch (err) {
                console.error("Failed to navigate after notification click:", err);
              }
            };

            return (
              <NotificationItem
                key={n.id}
                icon={iconForType(n.type)}
                text={n.content}
                time={new Date(n.created_at).toLocaleString()}
                isUnread={!n.is_read}
                href={href}
                onClick={handleClick}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
