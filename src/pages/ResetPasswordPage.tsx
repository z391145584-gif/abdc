import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"

export function ResetPasswordPage() {
  const { resetPassword, updatePassword, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  // If user arrives with a recovery session, show password form
  const [isRecovery, setIsRecovery] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordUpdated, setPasswordUpdated] = useState(false)

  useEffect(() => {
    // Check if this is a password recovery redirect (user has a session from the email link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    if (hashParams.get("type") === "recovery" || (user && window.location.hash.includes("recovery"))) {
      setIsRecovery(true)
    }
  }, [user])

  // Also detect when user session appears (from Supabase recovery)
  useEffect(() => {
    if (user && !passwordUpdated) {
      const hash = window.location.hash
      if (hash.includes("type=recovery")) {
        setIsRecovery(true)
      }
    }
  }, [user, passwordUpdated])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim()) {
      setError("请输入邮箱地址")
      return
    }
    setLoading(true)
    const result = await resetPassword(email)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setEmailSent(true)
    }
  }

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (newPassword.length < 6) {
      setError("密码至少需要6个字符")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致")
      return
    }
    setLoading(true)
    const result = await updatePassword(newPassword)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setPasswordUpdated(true)
    }
  }

  return (
    <div className="pt-20 pb-16 bg-background min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="bg-card rounded-2xl border border-border shadow-card p-8">
          {/* Password updated success */}
          {passwordUpdated && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">密码重置成功</h2>
              <p className="text-sm text-muted-foreground mb-4">您的密码已更新，现在可以使用新密码登录。</p>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-smooth"
              >
                前往登录
              </button>
            </div>
          )}

          {/* New password form (recovery mode) */}
          {isRecovery && !passwordUpdated && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} className="text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">设置新密码</h2>
                <p className="text-sm text-muted-foreground mt-1">请输入您的新密码</p>
              </div>

              <form onSubmit={handleSetNewPassword} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {error}
                  </div>
                )}
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="新密码（至少6个字符）"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-base"
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="确认新密码"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-base"
                  autoComplete="new-password"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center justify-center gap-2 hover:opacity-90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  确认重置
                </button>
              </form>
            </>
          )}

          {/* Email sent success */}
          {emailSent && !isRecovery && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">邮件已发送</h2>
              <p className="text-sm text-muted-foreground mb-4">
                密码重置链接已发送至 <span className="font-medium text-foreground">{email}</span>
                <br />
                请查看邮箱并点击链接重置密码。
              </p>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-primary hover:underline font-medium"
              >
                返回登录
              </button>
            </div>
          )}

          {/* Request reset form */}
          {!emailSent && !isRecovery && !passwordUpdated && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} className="text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">忘记密码</h2>
                <p className="text-sm text-muted-foreground mt-1">输入您的邮箱，我们将发送重置链接</p>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {error}
                  </div>
                )}
                <label className="block">
                  <span className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <Mail size={14} className="text-muted-foreground" />
                    邮箱地址
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-base"
                    autoComplete="email"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center justify-center gap-2 hover:opacity-90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  发送重置链接
                </button>
              </form>

              <button
                onClick={() => navigate("/login")}
                className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1 transition-smooth"
              >
                <ArrowLeft size={14} />
                返回登录
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
