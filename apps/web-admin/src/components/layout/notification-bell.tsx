"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Notification } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  BellRing,
  CheckCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}j`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}h`;
  const diffWeek = Math.floor(diffDay / 7);
  return `${diffWeek}mg`;
}

function getNotificationLink(notif: Notification): string {
  return notif.linkTo || "#";
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const hasFetched = useRef(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get<{ data: Notification[] }>("/notifications?limit=5").catch(() => null),
        api.get<{ count: number }>("/notifications/count").catch(() => null),
      ]);

      if (notifRes && "data" in notifRes) {
        setNotifications(notifRes.data);
      }
      if (countRes && "count" in countRes) {
        setUnreadCount(countRes.count);
      } else {
        // Fallback: count unread from data
        if (notifRes && "data" in notifRes) {
          setUnreadCount(notifRes.data.filter((n) => !n.isRead).length);
        }
      }
    } catch {
      // Silent fail — notifications are non-critical
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.patch("/notifications/read-all", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("Semua notifikasi ditandai sudah dibaca");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menandai notifikasi");
      }
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await api.patch(`/notifications/${id}/read`, {});
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <button
            className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={`Notifikasi${hasUnread ? ` (${unreadCount} belum dibaca)` : ""}`}
          />
        }
      >
        {hasUnread ? (
          <BellRing className="h-4 w-4 text-primary" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {hasUnread && (
          <Badge
            variant="default"
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none pointer-events-none"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80"
      >
        {/* Header */}
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-1.5 py-1">
            <DropdownMenuLabel className="px-0 text-sm font-semibold">
              Notifikasi
            </DropdownMenuLabel>
            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                Tandai dibaca
              </button>
            )}
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Notification list */}
        <div className="max-h-[320px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Tidak ada notifikasi
              </p>
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notif) => {
                const linkTo = getNotificationLink(notif);
                return (
                  <DropdownMenuItem
                    key={notif.id}
                    className={cn(
                      "flex flex-col items-start gap-0.5 py-2 cursor-pointer",
                      !notif.isRead && "bg-muted/50",
                    )}
                    onClick={() => {
                      if (!notif.isRead) {
                        handleMarkRead(notif.id);
                      }
                      if (linkTo && linkTo !== "#") {
                        router.push(linkTo);
                      }
                    }}
                  >
                    <div className="flex w-full items-start gap-2">
                      {!notif.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                      <div className={cn("flex-1 min-w-0", notif.isRead && "pl-4")}>
                        <p className="text-sm font-medium truncate">
                          {notif.judul}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notif.pesan}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground/60">
                            {timeAgo(notif.createdAt)}
                          </span>
                          {linkTo && linkTo !== "#" && (
                            <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/40" />
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Footer */}
        <div className="px-1.5 py-1">
          <Link
            href="/notifications"
            className="flex items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => setOpen(false)}
          >
            Lihat Semua Notifikasi
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
