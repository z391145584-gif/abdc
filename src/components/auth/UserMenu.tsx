import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { User, LogOut, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function UserMenu() {
  const { profile, isAuthenticated, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  if (!isAuthenticated || !profile) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
      >
        <User size={16} />
        登录
      </Link>
    )
  }

  const initials = (profile.display_name ?? profile.email.charAt(0)).charAt(0).toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-smooth",
          open ? "bg-accent" : "hover:bg-accent"
        )}
      >
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-foreground hidden md:inline max-w-[80px] truncate">
          {profile.display_name || profile.email.split("@")[0]}
        </span>
        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border border-border shadow-card-hover py-2 z-50">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground truncate">
              {profile.display_name || "未设置姓名"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent transition-smooth"
            >
              <User size={14} className="text-muted-foreground" />
              个人资料
            </Link>
          </div>
          <div className="border-t border-border pt-1">
            <button
              onClick={() => {
                setOpen(false)
                signOut()
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-smooth"
            >
              <LogOut size={14} />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
