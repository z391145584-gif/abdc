import { useNavigate, useLocation, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { LoginForm } from "@/components/user/LoginForm"
import { UserCircle } from "lucide-react"

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/"

  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleLoginSuccess = () => {
    navigate(from, { replace: true })
  }

  const handleForgotPassword = () => {
    navigate("/reset-password")
  }

  return (
    <div className="pt-20 pb-16 bg-background min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="bg-card rounded-2xl border border-border shadow-card p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <UserCircle size={28} className="text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">欢迎回来</h1>
            <p className="text-sm text-muted-foreground mt-1">
              登录您的账户以继续
            </p>
          </div>

          {/* Login Form */}
          <LoginForm
            onSuccess={handleLoginSuccess}
            onForgotPassword={handleForgotPassword}
          />
        </div>
      </div>
    </div>
  )
}
