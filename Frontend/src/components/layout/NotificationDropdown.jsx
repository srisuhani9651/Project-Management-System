import React, { useState } from "react"
import { Bell, Check, Trash2, CheckCircle2, Clock, Info, ShieldAlert } from "lucide-react"

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: "n-1",
      title: "Task Assigned to You",
      message: "Suhani assigned KAN-101 (Setup Auth Middleware) to you.",
      time: "3m ago",
      type: "info",
      unread: true,
    },
    {
      id: "n-2",
      title: "Project Progress Updated",
      message: "ProjectFlow Web App reached 65% completion.",
      time: "1h ago",
      type: "success",
      unread: true,
    },
    {
      id: "n-3",
      title: "Task Due Soon",
      message: "Database Schema Migration is due in 24 hours.",
      time: "3h ago",
      type: "warning",
      unread: true,
    },
  ])

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    )
  }

  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
      case "warning":
        return <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
      default:
        return <Info className="h-4 w-4 text-primary shrink-0" />
    }
  }

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg border border-border/80 bg-card hover:bg-accent text-foreground transition-colors h-9 w-9 flex items-center justify-center focus:outline-none"
        title="Notifications"
      >
        <Bell className="h-4 w-4 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold flex items-center justify-center border border-card shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop to close popover */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border/80 bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-extrabold text-[10px]">
                    {unreadCount} New
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            {/* Notification Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 flex items-start gap-3 transition-colors ${
                      item.unread ? "bg-primary/5 font-medium" : "hover:bg-accent/40"
                    }`}
                  >
                    {getIcon(item.type)}

                    <div className="flex-1 space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-foreground leading-snug">{item.title}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{item.message}</p>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleRead(item.id)}
                          className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                        >
                          {item.unread ? "Mark as read" : "Mark as unread"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismiss(item.id)}
                          className="text-[10px] font-semibold text-muted-foreground hover:text-destructive flex items-center gap-0.5"
                        >
                          <Trash2 className="h-2.5 w-2.5" /> Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 px-4 text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">All caught up! 🎉</p>
                  <p className="text-[11px]">No new notifications at this time.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-border/40 bg-muted/20 text-center">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Showing workspace notifications
              </span>
            </div>

          </div>
        </>
      )}
    </div>
  )
}

export default NotificationDropdown
