import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react"

interface Props {
  onSuccess?: () => void
  onForgotPassword: () => void
}

const SAVED_CREDENTIALS_KEY = "login_saved_credentials"

function getSavedCredentials(): { email: string; password: string } {
  try {
    const raw = localStorage.getItem(SAVED_CREDENTIALS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { email: "", password: "" }
}

function saveCredentials(email: string, password: string) {
  localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify({ email, password }))
}

export function LoginForm({ onSuccess, onForgotPassword }: Props) {
  const { signIn } = useAuth()
  const saved = getSavedCredentials()
  const [email, setEmail] = useState(saved.email)
  const [password, setPassword] = useState(saved.password)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("请输入邮箱地址")
      return
    }
    if (!password) {
      setError("请输入密码")
      return
    }

    setLoading(true)
    const result = await signIn(email, password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      saveCredentials(email, password)
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <label className="block">
        <span className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
          <Lock size={14} className="text-muted-foreground" />
          密码
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="输入密码"
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-base"
          autoComplete="current-password"
        />
      </label>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-xs text-primary hover:underline"
        >
          忘记密码？
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center justify-center gap-2 hover:opacity-90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        登录
      </button>

      <p className="text-center text-xs text-muted-foreground">
        账号由管理员统一分配，如需开通请联系管理员
      </p>
    </form>
  )
}
