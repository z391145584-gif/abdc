import { useState, useEffect, useMemo } from "react"
import { X, Check, Target, Users, TrendingUp, Info } from "lucide-react"
import type { ActivityRecord, CalculatorState, BudgetBreakdown } from "@/data/types"
import { getActivities, saveActivities } from "@/data/store"
import { getPlans } from "@/data/store"
import { useAuth } from "@/hooks/useAuth"

interface Props {
  state: CalculatorState
  budget: BudgetBreakdown
  onClose: () => void
}

export function ActivityModal({ state, budget, onClose }: Props) {
  const { user } = useAuth()

  // 自动生成活动名称
  const autoName = useMemo(() => {
    const storeName = state.storeInfo.storeName || "未命名门店"
    const plans = getPlans()
    const selectedPlanTitles = state.selectedPlanIds
      .map((id) => plans.find((p) => p.id === id)?.title ?? "")
      .filter(Boolean)
    const planPart = selectedPlanTitles.length > 0
      ? selectedPlanTitles[0].replace(/^方案[一二三四五六七八九十]+[：:]\s*/, "")
      : "活动方案"
    const now = new Date()
    const datePart = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, "0")}月${String(now.getDate()).padStart(2, "0")}日`
    const budgetPart = `${budget.grandTotal}元`
    return `${storeName} - ${planPart} - ${datePart} - ${budgetPart}`
  }, [state.storeInfo.storeName, state.selectedPlanIds, budget.grandTotal])

  const [form, setForm] = useState({
    activityName: autoName,
    purpose: "",
    competitor: "",
    owner: "",
    expectedSales: 0,
    expectedDailySales: 0,
    expectedTraffic: 0,
    expectedNewMembers: 0,
    expectedRedemptionRate: 0,
    expectedROI: 0,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleEsc)
    }
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.activityName.trim()) return

    const now = new Date().toISOString()
    const record: ActivityRecord = {
      id: `activity-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      creatorId: user?.id || "anonymous",
      status: "pending",
      startDate: state.storeInfo.startDate || "",
      endDate: state.storeInfo.endDate || "",
      ...form,
      planSnapshot: {
        selectedPlanIds: [...state.selectedPlanIds],
        selectedPromotionIds: [...state.selectedPromotionIds],
        selectedMaterials: { ...state.selectedMaterials },
        activityProductQtys: { ...state.activityProductQtys },
        budgetTotal: budget.grandTotal,
        storeInfo: { ...state.storeInfo },
        subsidy: { ...state.subsidy },
        materialDimensions: { ...state.materialDimensions },
      },
    }

    const existing = getActivities()
    saveActivities([...existing, record])
    setSaved(true)
    setTimeout(() => onClose(), 1200)
  }

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-foreground">创建活动</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-smooth">
            <X size={18} />
          </button>
        </div>

        {/* Success overlay */}
        {saved && (
          <div className="absolute inset-0 z-20 bg-card/95 rounded-2xl flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center">
              <Check size={28} className="text-primary-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">活动创建成功</p>
            <p className="text-sm text-muted-foreground">已保存到本地记录，初始状态为"待开始"</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基础信息 */}
          <fieldset className="space-y-3">
            <legend className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
              <Info size={14} className="text-primary" />
              活动基础信息
            </legend>
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">活动名称 <span className="text-destructive">*</span></span>
              <input
                value={form.activityName}
                onChange={(e) => updateField("activityName", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="系统自动生成，可手动修改"
                required
              />
              <span className="text-xs text-muted-foreground mt-0.5 block">自动命名规则：门店名称 - 活动方案 - 日期</span>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">活动目的/说明</span>
              <textarea
                value={form.purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="简述活动的目标与背景"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">竞对信息</span>
                <input
                  value={form.competitor}
                  onChange={(e) => updateField("competitor", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="竞对门店名称"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">活动负责人</span>
                <input
                  value={form.owner}
                  onChange={(e) => updateField("owner", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="负责人姓名"
                />
              </label>
            </div>
          </fieldset>

          {/* 预期销售 */}
          <fieldset className="space-y-3">
            <legend className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
              <TrendingUp size={14} className="text-online" />
              预期销售目标
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">预期销售额 (元)</span>
                <input
                  type="number"
                  min={0}
                  value={form.expectedSales || ""}
                  onChange={(e) => updateField("expectedSales", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">预期日均销售额 (元)</span>
                <input
                  type="number"
                  min={0}
                  value={form.expectedDailySales || ""}
                  onChange={(e) => updateField("expectedDailySales", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </label>
            </div>
          </fieldset>

          {/* 客流/会员 */}
          <fieldset className="space-y-3">
            <legend className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
              <Users size={14} className="text-offline" />
              客流/会员目标
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">预期客流量 (人次)</span>
                <input
                  type="number"
                  min={0}
                  value={form.expectedTraffic || ""}
                  onChange={(e) => updateField("expectedTraffic", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">预期新增会员数</span>
                <input
                  type="number"
                  min={0}
                  value={form.expectedNewMembers || ""}
                  onChange={(e) => updateField("expectedNewMembers", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </label>
            </div>
          </fieldset>

          {/* 核销/ROI */}
          <fieldset className="space-y-3">
            <legend className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
              <Target size={14} className="text-secondary" />
              券核销率 / ROI
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">预期券核销率 (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={form.expectedRedemptionRate || ""}
                  onChange={(e) => updateField("expectedRedemptionRate", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">预期投入产出比 (ROI)</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.expectedROI || ""}
                  onChange={(e) => updateField("expectedROI", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="例：2.5"
                />
              </label>
            </div>
          </fieldset>

          {/* 关联信息提示 */}
          <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
            将自动关联当前选中的 {state.selectedPlanIds.length} 个活动方案、{state.selectedPromotionIds.length} 个宣传方式，预算总计 {budget.grandTotal.toLocaleString()} 元
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition-smooth"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth"
            >
              <Check size={15} /> 保存活动
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
