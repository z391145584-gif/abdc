import { createContext, useEffect, useState, useCallback } from "react"
import type { ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { supabaseConfigured } from "@/lib/supabase"
import type { Profile, DemoAccount } from "@/data/types"
import {
  authenticateUser,
  fetchAllProfiles,
  upsertProfile,
  initSync,
} from "@/data/supabase-store"

interface AuthResponse {
  error?: string
}

export interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResponse>
  updateProfile: (updates: Partial<Pick<Profile, "display_name" | "phone" | "avatar_url">>) => Promise<AuthResponse>
  updatePassword: (newPassword: string) => Promise<AuthResponse>
  // 管理员账号管理
  getAllAccounts: () => DemoAccount[]
  createAccount: (account: DemoAccount) => AuthResponse
  updateAccount: (email: string, updates: Partial<DemoAccount>) => AuthResponse
  resetAccountPassword: (email: string, newPassword: string) => AuthResponse
  toggleAccountEnabled: (email: string) => AuthResponse
}

export const AuthContext = createContext<AuthContextType | null>(null)

// ====== 本地演示模式账号管理 ======
const ACCOUNTS_STORAGE_KEY = "demo_accounts"
const LOCAL_AUTH_KEY = "demo_auth_user"

const DEFAULT_ACCOUNTS: DemoAccount[] = [
  { email: "admin@demo.com", password: "admin123", role: "admin", displayName: "管理员", enabled: true },
  { email: "user@demo.com", password: "user123", role: "user", displayName: "普通用户", enabled: true },
]

function loadAccounts(): DemoAccount[] {
  try {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return [...DEFAULT_ACCOUNTS]
}

function saveAccounts(accounts: DemoAccount[]) {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
}

function getDemoSession(): { profile: Profile } | null {
  try {
    const stored = localStorage.getItem(LOCAL_AUTH_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return null
}

function setDemoSession(profile: Profile | null) {
  if (profile) {
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ profile }))
  } else {
    localStorage.removeItem(LOCAL_AUTH_KEY)
  }
}

// ====== Demo Auth Provider (当 Supabase 未配置时使用) ======
function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<DemoAccount[]>(loadAccounts)

  useEffect(() => {
    const session = getDemoSession()
    if (session) {
      // 验证账号是否仍然启用
      const accts = loadAccounts()
      const account = accts.find(a => a.email === session.profile.email)
      if (account && account.enabled) {
        setProfile(session.profile)
      } else {
        setDemoSession(null)
      }
    }
    setLoading(false)
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const currentAccounts = loadAccounts()
    const account = currentAccounts.find(a => a.email === email && a.password === password)
    if (!account) return { error: "邮箱或密码错误" }
    if (!account.enabled) return { error: "该账号已被禁用，请联系管理员" }
    const p: Profile = {
      id: account.email,
      email: account.email,
      display_name: account.displayName,
      avatar_url: null,
      phone: null,
      role: account.role,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setProfile(p)
    setDemoSession(p)
    return {}
  }, [])

  const signOutFn = useCallback(async () => {
    setProfile(null)
    setDemoSession(null)
  }, [])

  const resetPasswordFn = useCallback(async (_email: string): Promise<AuthResponse> => {
    return { error: "演示模式下请联系管理员重置密码" }
  }, [])

  const updateProfileFn = useCallback(async (
    updates: Partial<Pick<Profile, "display_name" | "phone" | "avatar_url">>
  ): Promise<AuthResponse> => {
    setProfile(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates, updated_at: new Date().toISOString() }
      setDemoSession(updated)
      return updated
    })
    return {}
  }, [])

  const updatePasswordFn = useCallback(async (_newPassword: string): Promise<AuthResponse> => {
    return { error: "演示模式下请联系管理员修改密码" }
  }, [])

  // 管理员账号管理方法
  const getAllAccounts = useCallback((): DemoAccount[] => {
    return loadAccounts()
  }, [accounts]) // eslint-disable-line react-hooks/exhaustive-deps

  const createAccount = useCallback((account: DemoAccount): AuthResponse => {
    const current = loadAccounts()
    if (current.find(a => a.email === account.email)) {
      return { error: "该邮箱已存在" }
    }
    const updated = [...current, account]
    saveAccounts(updated)
    setAccounts(updated)
    return {}
  }, [])

  const updateAccount = useCallback((email: string, updates: Partial<DemoAccount>): AuthResponse => {
    const current = loadAccounts()
    const idx = current.findIndex(a => a.email === email)
    if (idx === -1) return { error: "账号不存在" }
    current[idx] = { ...current[idx], ...updates }
    saveAccounts(current)
    setAccounts([...current])
    return {}
  }, [])

  const resetAccountPassword = useCallback((email: string, newPassword: string): AuthResponse => {
    if (newPassword.length < 6) return { error: "密码至少需要6个字符" }
    const current = loadAccounts()
    const idx = current.findIndex(a => a.email === email)
    if (idx === -1) return { error: "账号不存在" }
    current[idx].password = newPassword
    saveAccounts(current)
    setAccounts([...current])
    return {}
  }, [])

  const toggleAccountEnabled = useCallback((email: string): AuthResponse => {
    const current = loadAccounts()
    const idx = current.findIndex(a => a.email === email)
    if (idx === -1) return { error: "账号不存在" }
    current[idx].enabled = !current[idx].enabled
    saveAccounts(current)
    setAccounts([...current])
    // 如果禁用的是当前登录用户，强制登出
    if (!current[idx].enabled && profile?.email === email) {
      setProfile(null)
      setDemoSession(null)
    }
    return {}
  }, [profile])

  const value: AuthContextType = {
    user: profile ? { id: profile.id, email: profile.email } as unknown as User : null,
    profile,
    loading,
    isAuthenticated: !!profile,
    isAdmin: profile?.role === "admin",
    signIn,
    signOut: signOutFn,
    resetPassword: resetPasswordFn,
    updateProfile: updateProfileFn,
    updatePassword: updatePasswordFn,
    getAllAccounts,
    createAccount,
    updateAccount,
    resetAccountPassword,
    toggleAccountEnabled,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ====== Supabase Auth Provider (使用 profiles 表认证) ======
function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<DemoAccount[]>(loadAccounts)
  const [supabaseReady, setSupabaseReady] = useState(false)

  useEffect(() => {
    // 初始化 Supabase 数据同步
    initSync().then(async (ok) => {
      setSupabaseReady(ok)
      if (ok) {
        // 同步远程账号到本地
        const remoteAccounts = await fetchAllProfiles()
        if (remoteAccounts && remoteAccounts.length > 0) {
          saveAccounts(remoteAccounts)
          setAccounts(remoteAccounts)
        }
      }
      // 恢复登录会话
      const session = getDemoSession()
      if (session) {
        const accts = loadAccounts()
        const account = accts.find(a => a.email === session.profile.email)
        if (account && account.enabled) {
          setProfile(session.profile)
        } else {
          setDemoSession(null)
        }
      }
      setLoading(false)
    }).catch(() => {
      // 即使同步失败也要结束加载状态
      const session = getDemoSession()
      if (session) {
        setProfile(session.profile)
      }
      setLoading(false)
    })
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    // 优先尝试远程认证
    if (supabaseReady) {
      const remoteAccount = await authenticateUser(email, password)
      if (remoteAccount) {
        const p: Profile = {
          id: remoteAccount.email,
          email: remoteAccount.email,
          display_name: remoteAccount.displayName,
          avatar_url: null,
          phone: null,
          role: remoteAccount.role,
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setProfile(p)
        setDemoSession(p)
        return {}
      }
    }
    // 降级到本地认证
    const currentAccounts = loadAccounts()
    const account = currentAccounts.find(a => a.email === email && a.password === password)
    if (!account) return { error: "邮箱或密码错误" }
    if (!account.enabled) return { error: "该账号已被禁用，请联系管理员" }
    const p: Profile = {
      id: account.email,
      email: account.email,
      display_name: account.displayName,
      avatar_url: null,
      phone: null,
      role: account.role,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setProfile(p)
    setDemoSession(p)
    return {}
  }, [supabaseReady])

  const signOutFn = useCallback(async () => {
    setProfile(null)
    setDemoSession(null)
  }, [])

  const resetPasswordFn = useCallback(async (_email: string): Promise<AuthResponse> => {
    return { error: "请联系管理员重置密码" }
  }, [])

  const updateProfileFn = useCallback(async (
    updates: Partial<Pick<Profile, "display_name" | "phone" | "avatar_url">>
  ): Promise<AuthResponse> => {
    setProfile(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates, updated_at: new Date().toISOString() }
      setDemoSession(updated)
      // 同步到远程
      if (supabaseReady) {
        upsertProfile({
          email: updated.email,
          password: "",
          role: updated.role,
          displayName: updated.display_name || "",
          enabled: updated.enabled,
        }).catch(() => {})
      }
      return updated
    })
    return {}
  }, [supabaseReady])

  const updatePasswordFn = useCallback(async (newPassword: string): Promise<AuthResponse> => {
    if (!profile) return { error: "未登录" }
    if (newPassword.length < 6) return { error: "密码至少需要6个字符" }
    const current = loadAccounts()
    const idx = current.findIndex(a => a.email === profile.email)
    if (idx !== -1) {
      current[idx].password = newPassword
      saveAccounts(current)
      setAccounts([...current])
      if (supabaseReady) {
        upsertProfile(current[idx]).catch(() => {})
      }
    }
    return {}
  }, [profile, supabaseReady])

  // 管理员账号管理
  const getAllAccounts = useCallback((): DemoAccount[] => {
    return loadAccounts()
  }, [accounts]) // eslint-disable-line react-hooks/exhaustive-deps

  const createAccount = useCallback((account: DemoAccount): AuthResponse => {
    const current = loadAccounts()
    if (current.find(a => a.email === account.email)) {
      return { error: "该邮箱已存在" }
    }
    const updated = [...current, account]
    saveAccounts(updated)
    setAccounts(updated)
    if (supabaseReady) {
      upsertProfile(account).catch(() => {})
    }
    return {}
  }, [supabaseReady])

  const updateAccount = useCallback((email: string, updates: Partial<DemoAccount>): AuthResponse => {
    const current = loadAccounts()
    const idx = current.findIndex(a => a.email === email)
    if (idx === -1) return { error: "账号不存在" }
    current[idx] = { ...current[idx], ...updates }
    saveAccounts(current)
    setAccounts([...current])
    if (supabaseReady) {
      upsertProfile(current[idx]).catch(() => {})
    }
    return {}
  }, [supabaseReady])

  const resetAccountPassword = useCallback((email: string, newPassword: string): AuthResponse => {
    if (newPassword.length < 6) return { error: "密码至少需要6个字符" }
    const current = loadAccounts()
    const idx = current.findIndex(a => a.email === email)
    if (idx === -1) return { error: "账号不存在" }
    current[idx].password = newPassword
    saveAccounts(current)
    setAccounts([...current])
    if (supabaseReady) {
      upsertProfile(current[idx]).catch(() => {})
    }
    return {}
  }, [supabaseReady])

  const toggleAccountEnabled = useCallback((email: string): AuthResponse => {
    const current = loadAccounts()
    const idx = current.findIndex(a => a.email === email)
    if (idx === -1) return { error: "账号不存在" }
    current[idx].enabled = !current[idx].enabled
    saveAccounts(current)
    setAccounts([...current])
    if (supabaseReady) {
      upsertProfile(current[idx]).catch(() => {})
    }
    // 如果禁用的是当前登录用户，强制登出
    if (!current[idx].enabled && profile?.email === email) {
      setProfile(null)
      setDemoSession(null)
    }
    return {}
  }, [profile, supabaseReady])

  const value: AuthContextType = {
    user: profile ? { id: profile.id, email: profile.email } as unknown as User : null,
    profile,
    loading,
    isAuthenticated: !!profile,
    isAdmin: profile?.role === "admin",
    signIn,
    signOut: signOutFn,
    resetPassword: resetPasswordFn,
    updateProfile: updateProfileFn,
    updatePassword: updatePasswordFn,
    getAllAccounts,
    createAccount,
    updateAccount,
    resetAccountPassword,
    toggleAccountEnabled,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ====== 根据配置自动选择 Provider ======
export function AuthProvider({ children }: { children: ReactNode }) {
  if (supabaseConfigured) {
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
  }
  return <DemoAuthProvider>{children}</DemoAuthProvider>
}
