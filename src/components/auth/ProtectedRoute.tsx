import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Loader2 } from "lucide-react"

interface Props {
  children: React.ReactNode
  role?: "admin"
}

export function ProtectedRoute({ children, role }: Props) {
  const { user, profile, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role === "admin" && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">无访问权限</h2>
          <p className="text-muted-foreground mb-4">
            此页面仅管理员可访问。当前账户角色：{profile?.role ?? "未知"}
          </p>
          <a href="/" className="text-primary hover:underline text-sm">返回首页</a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
