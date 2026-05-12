import { useState, useCallback, useMemo } from "react"
import {
  getPlans,
  savePlans,
  getPromotions,
  savePromotions,
  getMaterials,
  saveMaterials,
  getActivityProducts,
  saveActivityProducts,
} from "@/data/store"
import type { PlanData, PromotionData, MaterialData, ActivityProductData, DemoAccount } from "@/data/types"
import {
  Settings,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Users,
  ShieldCheck,
  ShieldOff,
  Lock,
  ToggleLeft,
  ToggleRight,
  UserCircle,
  Globe,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

type Tab = "accounts" | "plans" | "promotions" | "materials-onetime" | "materials-reusable" | "activity-products"

const tabs: { key: Tab; label: string }[] = [
  { key: "accounts", label: "账号管理" },
  { key: "plans", label: "活动方案" },
  { key: "promotions", label: "宣传方式" },
  { key: "materials-onetime", label: "物料选择" },
  { key: "materials-reusable", label: "循环物料" },
  { key: "activity-products", label: "活动商品" },
]

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("accounts")

  return (
    <div className="pt-20 pb-16 bg-background min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <Settings size={14} />
            数据维护
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">维护中心</h1>
          <p className="text-muted-foreground max-w-xl">
            管理活动方案、宣传方式和物料数据。修改后会实时生效到计算器和首页。
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 bg-muted rounded-xl w-fit max-w-full overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-smooth flex-shrink-0 whitespace-nowrap",
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "accounts" && <AccountsPanel />}
        {activeTab === "plans" && <PlansPanel />}
        {activeTab === "promotions" && <PromotionsPanel />}
        {activeTab === "materials-onetime" && <MaterialsPanel category="onetime" />}
        {activeTab === "materials-reusable" && <MaterialsPanel category="reusable" />}
        {activeTab === "activity-products" && <ActivityProductsPanel />}
      </div>
    </div>
  )
}

/* ========== 来源标识组件 ========== */
function SourceBadge({ isPublic, hasCreator }: { isPublic?: boolean; hasCreator?: boolean }) {
  if (isPublic || !hasCreator) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 inline-flex items-center gap-0.5">
        <Globe size={10} /> 公共
      </span>
    )
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 inline-flex items-center gap-0.5">
      <User size={10} /> 个人
    </span>
  )
}

/* ========== Plans Panel ========== */

const emptyPlan: PlanData = {
  id: "",
  type: "offline",
  storeType: "convenience",
  title: "",
  iconName: "ClipboardList",
  description: "",
  details: [],
  note: "",
  estimatedCost: 0,
}

function PlansPanel() {
  const { profile, isAdmin } = useAuth()
  const [items, setItems] = useState<PlanData[]>(getPlans)
  const [editing, setEditing] = useState<PlanData | null>(null)
  const [isNew, setIsNew] = useState(false)

  const persist = useCallback((next: PlanData[]) => {
    setItems(next)
    savePlans(next)
  }, [])

  // 数据过滤：管理员看全部，普通用户看自己的 + 公共的 + 无creatorId的遗留数据
  const visibleItems = useMemo(() => {
    if (isAdmin) return items
    const userId = profile?.email || ""
    return items.filter((item) => item.isPublic || !item.creatorId || item.creatorId === userId)
  }, [items, isAdmin, profile])

  const handleAdd = () => {
    setEditing({ ...emptyPlan, id: `plan-${Date.now()}` })
    setIsNew(true)
  }

  const handleEdit = (item: PlanData) => {
    setEditing({ ...item, details: [...item.details] })
    setIsNew(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("确定删除此方案？")) {
      persist(items.filter((p) => p.id !== id))
    }
  }

  const handleSave = (data: PlanData) => {
    const withMeta = {
      ...data,
      maintainer: profile?.display_name || profile?.email || "未知",
      creatorId: isNew ? (profile?.email || "unknown") : data.creatorId,
    }
    if (isNew) {
      persist([...items, withMeta])
    } else {
      persist(items.map((p) => (p.id === data.id ? withMeta : p)))
    }
    setEditing(null)
  }

  const canModify = (item: PlanData) => isAdmin || item.creatorId === profile?.email

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          活动方案 <span className="text-muted-foreground text-sm font-normal">({visibleItems.length} 项)</span>
        </h2>
        <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth">
          <Plus size={15} /> 新增方案
        </button>
      </div>

      {editing && (
        <PlanForm
          data={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          isNew={isNew}
          showPublicOption={isAdmin}
        />
      )}

      <div className="space-y-3">
        {visibleItems.map((plan) => (
          <div key={plan.id} className="p-4 bg-card rounded-xl border border-border flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  plan.type === "online" ? "bg-online/10 text-online" : "bg-offline/10 text-offline"
                )}>
                  {plan.type === "online" ? "线上" : "线下"}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {plan.storeType === "wholesale" ? "批发超市" : "便利店"}
                </span>
                <SourceBadge isPublic={plan.isPublic} hasCreator={!!plan.creatorId} />
                <span className="font-medium text-foreground">{plan.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              {(plan.estimatedCost ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground mt-1">预估费用：{plan.estimatedCost?.toLocaleString()} 元</p>
              )}
              {plan.maintainer && (
                <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1"><UserCircle size={11} />创建人：{plan.maintainer}</p>
              )}
            </div>
            {canModify(plan) && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => handleEdit(plan)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(plan.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth">
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PlanForm({ data, onSave, onCancel, isNew, showPublicOption }: { data: PlanData; onSave: (d: PlanData) => void; onCancel: () => void; isNew: boolean; showPublicOption: boolean }) {
  const [form, setForm] = useState(data)
  const [detailsText, setDetailsText] = useState(data.details.join("\n"))
  const activityProducts = getActivityProducts()

  const linkedIds = form.linkedActivityProductIds ?? []

  const toggleProduct = (productId: string) => {
    const exists = linkedIds.includes(productId)
    const next = exists
      ? linkedIds.filter((id) => id !== productId)
      : [...linkedIds, productId]
    setForm({ ...form, linkedActivityProductIds: next })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({
      ...form,
      details: detailsText.split("\n").filter((l) => l.trim()),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{isNew ? "新增方案" : "编辑方案"}</h3>
            <button type="button" onClick={onCancel} className="p-1 rounded-md hover:bg-accent"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">类型</span>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "online" | "offline" })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="online">线上</option>
                <option value="offline">线下</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">预估费用 (元)</span>
              <input type="number" value={form.estimatedCost ?? 0} onChange={(e) => setForm({ ...form, estimatedCost: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
          </div>

          <div>
            <span className="text-sm font-medium text-foreground mb-2 block">门店类型 <span className="text-destructive">*</span></span>
            <div className="flex gap-3">
              <label className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-smooth text-sm font-medium",
                form.storeType === "convenience" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/50"
              )}>
                <input type="radio" name="storeType" value="convenience" checked={form.storeType === "convenience"} onChange={() => setForm({ ...form, storeType: "convenience" })} className="sr-only" />
                便利店
              </label>
              <label className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-smooth text-sm font-medium",
                form.storeType === "wholesale" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/50"
              )}>
                <input type="radio" name="storeType" value="wholesale" checked={form.storeType === "wholesale"} onChange={() => setForm({ ...form, storeType: "wholesale" })} className="sr-only" />
                批发超市
              </label>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-foreground mb-1 block">标题 <span className="text-destructive">*</span></span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="例：方案一：会员折扣" required />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground mb-1 block">描述</span>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="简短描述" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground mb-1 block">详细内容 (每行一条)</span>
            <textarea value={detailsText} onChange={(e) => setDetailsText(e.target.value)} rows={4} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" placeholder="每行一条活动内容" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground mb-1 block">备注</span>
            <input value={form.note ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="可选备注" />
          </label>

          {/* 关联活动商品 */}
          <div>
            <span className="text-sm font-medium text-foreground mb-2 block">关联活动商品</span>
            {activityProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无活动商品，请先在"活动商品"模块中创建。</p>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                {activityProducts.map((product) => {
                  const checked = linkedIds.includes(product.id)
                  return (
                    <label
                      key={product.id}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-smooth text-sm",
                        checked ? "bg-primary/10 text-foreground" : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleProduct(product.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{product.category}</span>
                      <span className={cn("flex-1", checked && "font-medium")}>{product.name}</span>
                      <span className="text-xs text-muted-foreground">x{product.defaultQty}</span>
                    </label>
                  )
                })}
              </div>
            )}
            {linkedIds.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">已选 {linkedIds.length} 项商品</p>
            )}
          </div>

          {/* 公共方案选项 - 仅管理员可见 */}
          {showPublicOption && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-blue-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic ?? false}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="rounded border-border text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Globe size={14} className="text-blue-600" /> 设为公共方案
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">勾选后此方案将对所有用户可见并可使用</span>
              </div>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition-smooth">取消</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth">
              <Check size={15} /> 保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ========== Promotions Panel ========== */

const emptyPromotion: PromotionData = {
  id: "",
  content: "",
  time: "",
  price: 0,
  priceLabel: "",
  iconName: "Music",
}

function PromotionsPanel() {
  const { profile, isAdmin } = useAuth()
  const [items, setItems] = useState<PromotionData[]>(getPromotions)
  const [editing, setEditing] = useState<PromotionData | null>(null)
  const [isNew, setIsNew] = useState(false)

  const persist = useCallback((next: PromotionData[]) => {
    setItems(next)
    savePromotions(next)
  }, [])

  const visibleItems = useMemo(() => {
    if (isAdmin) return items
    const userId = profile?.email || ""
    return items.filter((item) => item.isPublic || !item.creatorId || item.creatorId === userId)
  }, [items, isAdmin, profile])

  const handleAdd = () => {
    setEditing({ ...emptyPromotion, id: `promo-${Date.now()}` })
    setIsNew(true)
  }

  const handleEdit = (item: PromotionData) => {
    setEditing({ ...item })
    setIsNew(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("确定删除此宣传方式？")) {
      persist(items.filter((p) => p.id !== id))
    }
  }

  const handleSave = (data: PromotionData) => {
    const withMeta = {
      ...data,
      priceLabel: `${data.price.toLocaleString()} 元`,
      maintainer: profile?.display_name || profile?.email || "未知",
      creatorId: isNew ? (profile?.email || "unknown") : data.creatorId,
    }
    if (isNew) {
      persist([...items, withMeta])
    } else {
      persist(items.map((p) => (p.id === data.id ? withMeta : p)))
    }
    setEditing(null)
  }

  const canModify = (item: PromotionData) => isAdmin || item.creatorId === profile?.email

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          宣传方式 <span className="text-muted-foreground text-sm font-normal">({visibleItems.length} 项)</span>
        </h2>
        <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth">
          <Plus size={15} /> 新增
        </button>
      </div>

      {editing && (
        <PromotionForm data={editing} onSave={handleSave} onCancel={() => setEditing(null)} isNew={isNew} showPublicOption={isAdmin} />
      )}

      <div className="space-y-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="p-4 bg-card rounded-xl border border-border flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <SourceBadge isPublic={item.isPublic} hasCreator={!!item.creatorId} />
                <span className="font-medium text-foreground">{item.content}</span>
                <span className="text-sm text-muted-foreground">时段：{item.time}</span>
                <span className="text-sm text-offline font-semibold">{item.priceLabel}</span>
              </div>
              {item.maintainer && (
                <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1"><UserCircle size={11} />创建人：{item.maintainer}</p>
              )}
            </div>
            {canModify(item) && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"><Trash2 size={15} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PromotionForm({ data, onSave, onCancel, isNew, showPublicOption }: { data: PromotionData; onSave: (d: PromotionData) => void; onCancel: () => void; isNew: boolean; showPublicOption: boolean }) {
  const [form, setForm] = useState(data)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{isNew ? "新增宣传方式" : "编辑宣传方式"}</h3>
            <button type="button" onClick={onCancel} className="p-1 rounded-md hover:bg-accent"><X size={18} /></button>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-foreground mb-1 block">名称 <span className="text-destructive">*</span></span>
            <input value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" required />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground mb-1 block">时段</span>
            <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="例：早上8点 - 晚上9:30" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground mb-1 block">费用 (元)</span>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </label>

          {showPublicOption && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-blue-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic ?? false}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="rounded border-border text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Globe size={14} className="text-blue-600" /> 设为公共方案
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">勾选后此宣传方式将对所有用户可见</span>
              </div>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition-smooth">取消</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth">
              <Check size={15} /> 保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ========== Materials Panel ========== */

function MaterialsPanel({ category }: { category: "onetime" | "reusable" }) {
  const { profile, isAdmin } = useAuth()
  const isReusable = category === "reusable"
  const label = isReusable ? "循环物料" : "物料选择"

  const [allMaterials, setAllMaterials] = useState<MaterialData[]>(getMaterials)
  const items = allMaterials.filter((m) => m.category === category)
  const [editing, setEditing] = useState<MaterialData | null>(null)
  const [isNew, setIsNew] = useState(false)

  const persist = useCallback((next: MaterialData[]) => {
    setAllMaterials(next)
    saveMaterials(next)
  }, [])

  const visibleItems = useMemo(() => {
    if (isAdmin) return items
    const userId = profile?.email || ""
    return items.filter((item) => item.isPublic || !item.creatorId || item.creatorId === userId)
  }, [items, isAdmin, profile])

  const handleAdd = () => {
    setEditing({
      id: `mat-${Date.now()}`,
      name: "",
      category,
      unitPrice: 0,
      defaultQty: 1,
      unit: "个",
    })
    setIsNew(true)
  }

  const handleEdit = (item: MaterialData) => {
    setEditing({ ...item })
    setIsNew(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm(`确定删除此${label}？`)) {
      persist(allMaterials.filter((m) => m.id !== id))
    }
  }

  const handleSave = (data: MaterialData) => {
    const fixed = isReusable
      ? { ...data, unitPrice: 0, category: "reusable" as const, maintainer: profile?.display_name || profile?.email || "未知", creatorId: isNew ? (profile?.email || "unknown") : data.creatorId }
      : { ...data, category: "onetime" as const, maintainer: profile?.display_name || profile?.email || "未知", creatorId: isNew ? (profile?.email || "unknown") : data.creatorId }
    if (isNew) {
      persist([...allMaterials, fixed])
    } else {
      persist(allMaterials.map((m) => (m.id === data.id ? fixed : m)))
    }
    setEditing(null)
  }

  const canModify = (item: MaterialData) => isAdmin || item.creatorId === profile?.email

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {label} <span className="text-muted-foreground text-sm font-normal">({visibleItems.length} 项)</span>
        </h2>
        <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth">
          <Plus size={15} /> 新增
        </button>
      </div>

      {editing && (
        <MaterialForm data={editing} onSave={handleSave} onCancel={() => setEditing(null)} isNew={isNew} isReusable={isReusable} showPublicOption={isAdmin} />
      )}

      <div className="space-y-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="p-4 bg-card rounded-xl border border-border flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <SourceBadge isPublic={item.isPublic} hasCreator={!!item.creatorId} />
                <span className="font-medium text-foreground">{item.name}</span>
                {!isReusable && item.billingMode === "size" && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">按尺寸</span>
                )}
                <span className="text-sm text-muted-foreground">默认 {item.defaultQty} {item.unit}</span>
                {!isReusable && item.unitPrice > 0 && (
                  <span className="text-sm text-offline font-semibold">
                    {item.unitPrice} 元/{item.billingMode === "size" ? "m²" : item.unit}
                  </span>
                )}
                {!isReusable && item.billingMode === "size" && item.defaultLength && item.defaultWidth && (
                  <span className="text-xs text-muted-foreground">
                    ({item.defaultLength}×{item.defaultWidth}cm)
                  </span>
                )}
                {isReusable && (
                  <span className="text-sm text-green-600 font-medium">免费</span>
                )}
              </div>
              {item.maintainer && (
                <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1"><UserCircle size={11} />创建人：{item.maintainer}</p>
              )}
            </div>
            {canModify(item) && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"><Trash2 size={15} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function MaterialForm({ data, onSave, onCancel, isNew, isReusable, showPublicOption }: { data: MaterialData; onSave: (d: MaterialData) => void; onCancel: () => void; isNew: boolean; isReusable: boolean; showPublicOption: boolean }) {
  const [form, setForm] = useState(data)
  const billingMode = form.billingMode || "quantity"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{isNew ? "新增" : "编辑"}{isReusable ? "循环物料" : "物料"}</h3>
            <button type="button" onClick={onCancel} className="p-1 rounded-md hover:bg-accent"><X size={18} /></button>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-foreground mb-1 block">名称 <span className="text-destructive">*</span></span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" required />
          </label>

          {/* Billing mode selector - only for onetime materials */}
          {!isReusable && (
            <div className="block">
              <span className="text-sm font-medium text-foreground mb-2 block">计量模式</span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, billingMode: "quantity", defaultLength: undefined, defaultWidth: undefined })}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    billingMode === "quantity"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  按数量计费
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, billingMode: "size", defaultLength: form.defaultLength ?? 100, defaultWidth: form.defaultWidth ?? 100 })}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    billingMode === "size"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  按尺寸计费
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {billingMode === "quantity"
                  ? "按物料数量 × 单价计算费用"
                  : "按物料面积(长×宽) × 每平方米单价计算费用"}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">默认数量</span>
              <input type="number" min={1} value={form.defaultQty} onChange={(e) => setForm({ ...form, defaultQty: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">单位</span>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="个/张/条" />
            </label>
          </div>

          {/* Size defaults - only shown in size billing mode */}
          {!isReusable && billingMode === "size" && (
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
              <span className="text-sm font-medium text-foreground block">默认尺寸 (cm)</span>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs text-muted-foreground mb-1 block">长度</span>
                  <input type="number" min={1} value={form.defaultLength ?? 100} onChange={(e) => setForm({ ...form, defaultLength: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs text-muted-foreground mb-1 block">宽度</span>
                  <input type="number" min={1} value={form.defaultWidth ?? 100} onChange={(e) => setForm({ ...form, defaultWidth: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                默认面积: {(((form.defaultLength ?? 100) * (form.defaultWidth ?? 100)) / 10000).toFixed(2)} m²
              </p>
            </div>
          )}

          {!isReusable && (
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">
                单价 (元{billingMode === "size" ? "/m²" : ""})
              </span>
              <input type="number" step="0.01" min={0} value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
          )}

          {showPublicOption && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-blue-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic ?? false}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="rounded border-border text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Globe size={14} className="text-blue-600" /> 设为公共物料
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">勾选后此物料将对所有用户可见</span>
              </div>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition-smooth">取消</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth">
              <Check size={15} /> 保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ========== Activity Products Panel ========== */

const emptyActivityProduct: ActivityProductData = {
  id: "",
  name: "",
  category: "",
  costPrice: 0,
  retailPrice: 0,
  defaultQty: 1,
}

function ActivityProductsPanel() {
  const { profile, isAdmin } = useAuth()
  const [items, setItems] = useState<ActivityProductData[]>(getActivityProducts)
  const [editing, setEditing] = useState<ActivityProductData | null>(null)
  const [isNew, setIsNew] = useState(false)

  const persist = useCallback((next: ActivityProductData[]) => {
    setItems(next)
    saveActivityProducts(next)
  }, [])

  const visibleItems = useMemo(() => {
    if (isAdmin) return items
    const userId = profile?.email || ""
    return items.filter((item) => item.isPublic || !item.creatorId || item.creatorId === userId)
  }, [items, isAdmin, profile])

  const handleAdd = () => {
    setEditing({ ...emptyActivityProduct, id: `actprod-${Date.now()}` })
    setIsNew(true)
  }

  const handleEdit = (item: ActivityProductData) => {
    setEditing({ ...item })
    setIsNew(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("确定删除此活动商品？")) {
      persist(items.filter((p) => p.id !== id))
    }
  }

  const handleSave = (data: ActivityProductData) => {
    const withMeta = {
      ...data,
      maintainer: profile?.display_name || profile?.email || "未知",
      creatorId: isNew ? (profile?.email || "unknown") : data.creatorId,
    }
    if (isNew) {
      persist([...items, withMeta])
    } else {
      persist(items.map((p) => (p.id === data.id ? withMeta : p)))
    }
    setEditing(null)
  }

  const canModify = (item: ActivityProductData) => isAdmin || item.creatorId === profile?.email

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          活动商品 <span className="text-muted-foreground text-sm font-normal">({visibleItems.length} 项)</span>
        </h2>
        <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth">
          <Plus size={15} /> 新增商品
        </button>
      </div>

      {editing && (
        <ActivityProductForm data={editing} onSave={handleSave} onCancel={() => setEditing(null)} isNew={isNew} showPublicOption={isAdmin} />
      )}

      <div className="space-y-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="p-4 bg-card rounded-xl border border-border flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <SourceBadge isPublic={item.isPublic} hasCreator={!!item.creatorId} />
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {item.category}
                </span>
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="text-sm text-muted-foreground">默认 {item.defaultQty} 件</span>
                <span className="text-sm text-offline font-semibold">成本 {item.costPrice} 元</span>
                <span className="text-sm text-online font-semibold">零售 {item.retailPrice} 元</span>
              </div>
              {item.maintainer && (
                <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1"><UserCircle size={11} />创建人：{item.maintainer}</p>
              )}
            </div>
            {canModify(item) && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"><Trash2 size={15} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityProductForm({ data, onSave, onCancel, isNew, showPublicOption }: { data: ActivityProductData; onSave: (d: ActivityProductData) => void; onCancel: () => void; isNew: boolean; showPublicOption: boolean }) {
  const [form, setForm] = useState(data)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.category.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{isNew ? "新增活动商品" : "编辑活动商品"}</h3>
            <button type="button" onClick={onCancel} className="p-1 rounded-md hover:bg-accent"><X size={18} /></button>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-foreground mb-1 block">商品名称 <span className="text-destructive">*</span></span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="例：可口可乐330ml" required />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground mb-1 block">分类 <span className="text-destructive">*</span></span>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="例：饮料、零食、日用品" required />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">成本价 (元)</span>
              <input type="number" step="0.01" min={0} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">零售价 (元)</span>
              <input type="number" step="0.01" min={0} value={form.retailPrice} onChange={(e) => setForm({ ...form, retailPrice: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">默认数量</span>
              <input type="number" min={1} value={form.defaultQty} onChange={(e) => setForm({ ...form, defaultQty: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
          </div>

          {showPublicOption && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-blue-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic ?? false}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="rounded border-border text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Globe size={14} className="text-blue-600" /> 设为公共商品
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">勾选后此商品将对所有用户可见</span>
              </div>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition-smooth">取消</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth">
              <Check size={15} /> 保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ========== Accounts Panel ========== */

function AccountsPanel() {
  const { getAllAccounts, createAccount, updateAccount, resetAccountPassword, toggleAccountEnabled } = useAuth()
  const [accounts, setAccounts] = useState<DemoAccount[]>(getAllAccounts())
  const [editing, setEditing] = useState<DemoAccount | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [resetTarget, setResetTarget] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")

  const refresh = () => setAccounts(getAllAccounts())

  const handleAdd = () => {
    setEditing({ email: "", password: "", role: "user", displayName: "", enabled: true })
    setIsNew(true)
    setError("")
  }

  const handleEdit = (account: DemoAccount) => {
    setEditing({ ...account })
    setIsNew(false)
    setError("")
  }

  const handleSave = (data: DemoAccount) => {
    if (isNew) {
      if (!data.email.trim() || !data.password.trim()) {
        setError("邮箱和密码不能为空")
        return
      }
      if (data.password.length < 6) {
        setError("密码至少需要6个字符")
        return
      }
      const result = createAccount(data)
      if (result.error) {
        setError(result.error)
        return
      }
    } else {
      const result = updateAccount(data.email, {
        displayName: data.displayName,
        role: data.role,
      })
      if (result.error) {
        setError(result.error)
        return
      }
    }
    setEditing(null)
    setError("")
    refresh()
  }

  const handleToggleEnabled = (email: string) => {
    toggleAccountEnabled(email)
    refresh()
  }

  const handleResetPassword = () => {
    if (!resetTarget) return
    if (newPassword.length < 6) {
      setError("密码至少需要6个字符")
      return
    }
    const result = resetAccountPassword(resetTarget, newPassword)
    if (result.error) {
      setError(result.error)
      return
    }
    setResetTarget(null)
    setNewPassword("")
    setError("")
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          <span className="inline-flex items-center gap-2">
            <Users size={18} />
            账号管理
          </span>
          <span className="text-muted-foreground text-sm font-normal ml-2">({accounts.length} 个账号)</span>
        </h2>
        <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth">
          <Plus size={15} /> 创建账号
        </button>
      </div>

      {/* Create/Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{isNew ? "创建新账号" : "编辑账号"}</h3>
                <button type="button" onClick={() => setEditing(null)} className="p-1 rounded-md hover:bg-accent"><X size={18} /></button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">邮箱 <span className="text-destructive">*</span></span>
                <input
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  disabled={!isNew}
                  className={cn("w-full rounded-lg border border-border bg-background px-3 py-2 text-sm", !isNew && "opacity-60 cursor-not-allowed")}
                  placeholder="user@example.com"
                />
              </label>

              {isNew && (
                <label className="block">
                  <span className="text-sm font-medium text-foreground mb-1 block">初始密码 <span className="text-destructive">*</span></span>
                  <input
                    type="password"
                    value={editing.password}
                    onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="至少6个字符"
                  />
                </label>
              )}

              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">姓名</span>
                <input
                  value={editing.displayName}
                  onChange={(e) => setEditing({ ...editing, displayName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="用户姓名"
                />
              </label>

              <div>
                <span className="text-sm font-medium text-foreground mb-2 block">角色</span>
                <div className="flex gap-3">
                  <label className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-smooth text-sm font-medium",
                    editing.role === "user" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/50"
                  )}>
                    <input type="radio" name="role" value="user" checked={editing.role === "user"} onChange={() => setEditing({ ...editing, role: "user" })} className="sr-only" />
                    普通用户
                  </label>
                  <label className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-smooth text-sm font-medium",
                    editing.role === "admin" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/50"
                  )}>
                    <input type="radio" name="role" value="admin" checked={editing.role === "admin"} onChange={() => setEditing({ ...editing, role: "admin" })} className="sr-only" />
                    管理员
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition-smooth">取消</button>
                <button
                  onClick={() => handleSave(editing)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth"
                >
                  <Check size={15} /> {isNew ? "创建" : "保存"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => { setResetTarget(null); setError("") }}>
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">重置密码</h3>
                <button type="button" onClick={() => { setResetTarget(null); setError("") }} className="p-1 rounded-md hover:bg-accent"><X size={18} /></button>
              </div>
              <p className="text-sm text-muted-foreground">
                为 <span className="font-medium text-foreground">{resetTarget}</span> 设置新密码
              </p>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="新密码（至少6个字符）"
              />

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setResetTarget(null); setError("") }} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition-smooth">取消</button>
                <button
                  onClick={handleResetPassword}
                  className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth"
                >
                  <Check size={15} /> 确认重置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account List */}
      <div className="space-y-3">
        {accounts.map((account) => (
          <div key={account.email} className={cn(
            "p-4 bg-card rounded-xl border flex items-center gap-4",
            account.enabled ? "border-border" : "border-border opacity-60"
          )}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                  account.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {account.role === "admin" ? <ShieldCheck size={10} /> : <ShieldOff size={10} />}
                  {account.role === "admin" ? "管理员" : "用户"}
                </span>
                <span className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                  account.enabled ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                )}>
                  {account.enabled ? "启用" : "禁用"}
                </span>
                <span className="font-medium text-foreground">{account.displayName || "未命名"}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{account.email}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => handleEdit(account)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                title="编辑信息"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => { setResetTarget(account.email); setNewPassword(""); setError("") }}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                title="重置密码"
              >
                <Lock size={15} />
              </button>
              <button
                onClick={() => handleToggleEnabled(account.email)}
                className={cn(
                  "p-2 rounded-lg transition-smooth",
                  account.enabled
                    ? "text-green-600 hover:text-destructive hover:bg-destructive/10"
                    : "text-destructive hover:text-green-600 hover:bg-green-500/10"
                )}
                title={account.enabled ? "禁用账号" : "启用账号"}
              >
                {account.enabled ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
