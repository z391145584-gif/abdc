import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { User, Mail, Phone, Shield, Pencil, Check, X, Loader2, AlertCircle, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

export function UserProfile() {
  const { profile, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  if (!profile) return null

  const initials = (profile.display_name ?? profile.email.charAt(0)).charAt(0).toUpperCase()

  const handleSave = async () => {
    setError("")
    setSuccess(false)
    setLoading(true)

    const result = await updateProfile({
      display_name: displayName.trim() || null,
      phone: phone.trim() || null,
    })

    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const handleCancel = () => {
    setDisplayName(profile.display_name ?? "")
    setPhone(profile.phone ?? "")
    setEditing(false)
    setError("")
  }

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {initials}
            </div>
          )}
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth">
            <Camera size={13} />
          </button>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {profile.display_name || "未设置姓名"}
          </h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <span className={cn(
            "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1",
            profile.role === "admin"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}>
            <Shield size={10} />
            {profile.role === "admin" ? "管理员" : "普通用户"}
          </span>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
          <Check size={16} className="flex-shrink-0" />
          资料更新成功
        </div>
      )}

      {/* Info cards */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">个人信息</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
            >
              <Pencil size={12} />
              编辑
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
              >
                <X size={12} />
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-smooth disabled:opacity-50"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                保存
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User size={16} className="text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">姓名</p>
              {editing ? (
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="输入您的姓名"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-base"
                />
              ) : (
                <p className="text-sm text-foreground font-medium">
                  {profile.display_name || "未设置"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail size={16} className="text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">邮箱</p>
              <p className="text-sm text-foreground font-medium">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone size={16} className="text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">联系电话</p>
              {editing ? (
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="输入联系电话"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-base"
                />
              ) : (
                <p className="text-sm text-foreground font-medium">
                  {profile.phone || "未设置"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">账户信息</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">注册时间</p>
            <p className="text-foreground font-medium">
              {new Date(profile.created_at).toLocaleDateString("zh-CN")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">最后更新</p>
            <p className="text-foreground font-medium">
              {new Date(profile.updated_at).toLocaleDateString("zh-CN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
