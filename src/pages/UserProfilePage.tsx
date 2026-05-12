import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { UserProfile } from "@/components/user/UserProfile"
import { UserCircle, Lock, Loader2, AlertCircle, Check } from "lucide-react"

export function UserProfilePage() {
  const { updatePassword } = useAuth()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError("")
    setPwSuccess(false)

    if (newPassword.length < 6) {
      setPwError("密码至少需要6个字符")
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError("两次输入的密码不一致")
      return
    }

    setPwLoading(true)
    const result = await updatePassword(newPassword)
    setPwLoading(false)

    if (result.error) {
      setPwError(result.error)
    } else {
      setPwSuccess(true)
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordForm(false)
      setTimeout(() => setPwSuccess(false), 3000)
    }
  }

  return (
    <div className="pt-20 pb-16 bg-background min-h-screen">
      <div className="container mx-auto px-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <UserCircle size={14} />
            个人中心
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">个人资料</h1>
          <p className="text-muted-foreground">管理您的账户信息和安全设置</p>
        </div>

        {/* Profile component */}
        <UserProfile />

        {/* Password section */}
        <div className="mt-6 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">安全设置</h3>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
              >
                <Lock size={12} />
                修改密码
              </button>
            )}
          </div>

          {pwSuccess && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
              <Check size={16} className="flex-shrink-0" />
              密码修改成功
            </div>
          )}

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
              {pwError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {pwError}
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
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setPwError("")
                    setNewPassword("")
                    setConfirmPassword("")
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-smooth disabled:opacity-50"
                >
                  {pwLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  确认修改
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
