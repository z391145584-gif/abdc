import { useState, useEffect } from "react"
import { X, Check, Target, Users, TrendingUp, Info, Calendar } from "lucide-react"
import type { ActivityRecord } from "@/data/types"
import { computeActivityStatus } from "@/lib/activityStatus"

interface Props {
  activity: ActivityRecord
  onSave: (updates: Partial<ActivityRecord>) => void
  onClose: () => void
}

export function EditActivityModal({ activity, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    activityName: activity.activityName,
    startDate: activity.startDate || "",
    endDate: activity.endDate || "",
    purpose: activity.purpose,
    competitor: activity.competitor,
    owner: activity.owner,
    expectedSales: activity.expectedSales,
    expectedDailySales: activity.expectedDailySales,
    expectedTraffic: activity.expectedTraffic,
    expectedNewMembers: activity.expectedNewMembers,
    expectedRedemptionRate: activity.expectedRedemptionRate,
    expectedROI: activity.expectedROI,
  })

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
    onSave(form)
  }

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // 实时计算当前日期设定下的预期状态
  const previewStatus = computeActivityStatus({ startDate: form.startDate, endDate: form.endDate, actualData: activity.actualData })
  const statusLabel = { pending: "待开始", active: "进行中", awaiting_input: "待录入数据", completed: "已结束" }[previewStatus]
  const statusColor = { pending: "text-slate-600", active: "text-blue-600", awaiting_input: "text-amber-600", completed: "text-green-600" }[previewStatus]

  const currentStatus = computeActivityStatus(activity)
  const isCompleted = currentStatus === "completed" || currentStatus === "awaiting_input"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-foreground">编辑活动</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-smooth">
            <X size={18} />
          </button>
        </div>

        {isCompleted && (
          <div className="mx-6 mt-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            该活动已结束，修改仅影响记录信息，不影响已生成的分析报告。
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
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">活动目的/说明</span>
              <textarea
                value={form.purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">竞对信息</span>
                <input
                  value={form.competitor}
                  onChange={(e) => updateField("competitor", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">活动负责人</span>
                <input
                  value={form.owner}
                  onChange={(e) => updateField("owner", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            </div>
          </fieldset>

          {/* 活动时间 */}
          <fieldset className="space-y-3">
            <legend className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
              <Calendar size={14} className="text-primary" />
              活动时间（决定活动状态自动流转）
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">开始日期 <span className="text-destructive">*</span></span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">结束日期 <span className="text-destructive">*</span></span>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </label>
            </div>
            {form.startDate && form.endDate && (
              <p className="text-xs text-muted-foreground">
                根据当前日期设定，活动状态将为：<span className={`font-medium ${statusColor}`}>{statusLabel}</span>
              </p>
            )}
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
                />
              </label>
            </div>
          </fieldset>

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
              <Check size={15} /> 保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
