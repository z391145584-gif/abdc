import { useState, useEffect } from "react"
import { X, Check, Loader2 } from "lucide-react"
import type { ActivityRecord } from "@/data/types"

interface Props {
  activity: ActivityRecord
  onSave: (data: ActivityRecord["actualData"]) => void
  onClose: () => void
}

export function ActualDataModal({ activity, onSave, onClose }: Props) {
  const existing = activity.actualData
  const [form, setForm] = useState({
    actualSales: existing?.actualSales ?? 0,
    actualDailySales: existing?.actualDailySales ?? 0,
    actualTraffic: existing?.actualTraffic ?? 0,
    actualNewMembers: existing?.actualNewMembers ?? 0,
    actualRedemptionRate: existing?.actualRedemptionRate ?? 0,
    actualROI: existing?.actualROI ?? 0,
    notes: existing?.notes ?? "",
  })
  const [saving, setSaving] = useState(false)

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
    setSaving(true)
    onSave({
      completedAt: existing?.completedAt ?? new Date().toISOString(),
      ...form,
    })
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
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-foreground">录入实际数据</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{activity.activityName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-smooth">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 预期对照提示 */}
          <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground grid grid-cols-3 gap-2">
            <span>预期销售: ¥{activity.expectedSales.toLocaleString()}</span>
            <span>预期客流: {activity.expectedTraffic} 人</span>
            <span>预期ROI: {activity.expectedROI}%</span>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground mb-1">销售数据</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">实际总销售额 (元)</span>
                <input
                  type="number" min={0}
                  value={form.actualSales || ""}
                  onChange={(e) => updateField("actualSales", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">实际日均销售额 (元)</span>
                <input
                  type="number" min={0}
                  value={form.actualDailySales || ""}
                  onChange={(e) => updateField("actualDailySales", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground mb-1">客流 / 会员</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">实际客流量 (人次)</span>
                <input
                  type="number" min={0}
                  value={form.actualTraffic || ""}
                  onChange={(e) => updateField("actualTraffic", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">实际新增会员</span>
                <input
                  type="number" min={0}
                  value={form.actualNewMembers || ""}
                  onChange={(e) => updateField("actualNewMembers", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground mb-1">核销率 / ROI</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">实际券核销率 (%)</span>
                <input
                  type="number" min={0} max={100} step={0.1}
                  value={form.actualRedemptionRate || ""}
                  onChange={(e) => updateField("actualRedemptionRate", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">实际投入产出比 (ROI)</span>
                <input
                  type="number" min={0} step={0.1}
                  value={form.actualROI || ""}
                  onChange={(e) => updateField("actualROI", Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </label>
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-foreground mb-1 block">备注说明</span>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="活动执行情况备注..."
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition-smooth">
              取消
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              保存数据
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
