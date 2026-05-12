import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Menu, X, Calculator, Settings, ClipboardList } from "lucide-react"
import { UserMenu } from "@/components/auth/UserMenu"
import { useAuth } from "@/hooks/useAuth"

const navItems = [
  { label: "活动方案", href: "/#plans" },
  { label: "预算参考", href: "/#budget" },
  { label: "活动流程", href: "/#process" },
  { label: "宣传参考", href: "/#promotion" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { isAdmin, isAuthenticated } = useAuth()
  const isSubPage = location.pathname !== "/"

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-smooth",
        scrolled || isSubPage
          ? "bg-card/90 backdrop-blur-lg shadow-card border-b border-border"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">竞</span>
          </div>
          <span
            className={cn(
              "font-semibold text-lg transition-smooth",
              scrolled || isSubPage ? "text-foreground" : "text-primary-foreground"
            )}
          >
            竞对活动
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-smooth",
                scrolled || isSubPage
                  ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                  : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              )}
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/calculator"
            className={cn(
              "ml-2 px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 transition-spring",
              location.pathname === "/calculator"
                ? "gradient-primary text-primary-foreground"
                : "gradient-accent text-secondary-foreground hover:scale-105 shadow-accent"
            )}
          >
            <Calculator size={15} />
            方案计算器
          </Link>
          <Link
            to="/activities"
            className={cn(
              "ml-1 p-2 rounded-lg transition-smooth",
              location.pathname === "/activities"
                ? "text-foreground bg-accent"
                : scrolled || isSubPage
                  ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            )}
            title="活动管理"
          >
            <ClipboardList size={16} />
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "ml-1 p-2 rounded-lg transition-smooth",
                location.pathname === "/admin"
                  ? "text-foreground bg-accent"
                  : scrolled || isSubPage
                    ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              )}
              title="数据维护"
            >
              <Settings size={16} />
            </Link>
          )}
          <div className="ml-2">
            <UserMenu />
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn(
            "md:hidden p-2 rounded-md transition-smooth",
            scrolled || isSubPage ? "text-foreground" : "text-primary-foreground"
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-lg border-b border-border animate-fade-in">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/calculator"
              className="px-4 py-3 rounded-lg text-sm font-semibold gradient-accent text-secondary-foreground text-center mt-2 inline-flex items-center justify-center gap-1.5"
              onClick={() => setMobileOpen(false)}
            >
              <Calculator size={15} />
              方案计算器
            </Link>
            <Link
              to="/activities"
              className="px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth inline-flex items-center gap-1.5"
              onClick={() => setMobileOpen(false)}
            >
              <ClipboardList size={15} />
              活动管理
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth inline-flex items-center gap-1.5"
                onClick={() => setMobileOpen(false)}
              >
                <Settings size={15} />
                数据维护
              </Link>
            )}
            <div className="border-t border-border mt-2 pt-2">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth block"
                  onClick={() => setMobileOpen(false)}
                >
                  个人中心
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-3 rounded-md text-sm font-medium text-primary hover:bg-accent transition-smooth block"
                  onClick={() => setMobileOpen(false)}
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
