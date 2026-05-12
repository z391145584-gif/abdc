import { useRef, useEffect, useState, useCallback } from "react"
import { X, FileDown } from "lucide-react"
import type { ActivityRecord, CalculatorState, BudgetBreakdown } from "@/data/types"
import { PdfTemplate } from "@/components/calculator/PdfTemplate"
import { getPromotions, getMaterials, getProducts, getPlans, getActivityProducts } from "@/data/store"
import { exportToPdf } from "@/lib/pdf"

interface Props {
  activity: ActivityRecord
  onClose: () => void
}

function rebuildBudget(state: CalculatorState): BudgetBreakdown {
  const promotions = getPromotions()
  const materials = getMaterials()
  const products = getProducts()
  const activityProducts = getActivityProducts()
  const plans = getPlans()

  const selectedPromos = promotions.filter((p) => state.selectedPromotionIds.includes(p.id))
  const promotionItems = selectedPromos.map((p) => ({ name: p.content, price: p.price }))
  const promotionTotal = promotionItems.reduce((s, i) => s + i.price, 0)

  const materialItems = Object.entries(state.selectedMaterials)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const m = materials.find((x) => x.id === id)
      return { name: m?.name ?? id, qty, unitPrice: m?.unitPrice ?? 0, total: (m?.unitPrice ?? 0) * qty }
    })
  const materialTotal = materialItems.reduce((s, i) => s + i.total, 0)

  const selectedPlanObjs = plans.filter((p) => state.selectedPlanIds.includes(p.id))
  const linkedProductIds = selectedPlanObjs.flatMap((p) => p.linkedActivityProductIds ?? [])
  const uniqueLinked = [...new Set(linkedProductIds)]
  const activityProductItems = uniqueLinked.map((pid) => {
    const p = activityProducts.find((x) => x.id === pid)
    if (!p) return { name: pid, category: "", qty: 0, costPrice: 0, retailPrice: 0, total: 0 }
    const qty = state.activityProductQtys[p.id] ?? p.defaultQty
    return { name: p.name, category: p.category, qty, costPrice: p.costPrice, retailPrice: p.retailPrice, total: p.costPrice * qty }
  })
  const activityProductTotal = activityProductItems.reduce((s, i) => s + i.total, 0)

  const relevantProducts = products.filter((p) => p.linkedPlanIds.some((id) => state.selectedPlanIds.includes(id)))
  const productItems = relevantProducts.map((p) => ({
    name: p.name, category: p.category, qty: p.defaultQty, unitCost: p.unitCost, total: p.unitCost * p.defaultQty,
  }))
  const productTotal = productItems.reduce((s, i) => s + i.total, 0)

  const grandTotal = promotionTotal + materialTotal + productTotal + activityProductTotal
  const subsidizedTotal = relevantProducts.reduce((s, p) => s + p.unitCost * p.defaultQty * p.subsidyRate, 0)

  return { promotionTotal, materialTotal, productTotal, activityProductTotal, grandTotal, subsidyAmount: grandTotal - subsidizedTotal, subsidizedTotal, promotionItems, materialItems, productItems, activityProductItems }
}

export function ActivityPreviewModal({ activity, onClose }: Props) {
  const pdfRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const state: CalculatorState = {
    storeInfo: activity.planSnapshot.storeInfo ?? {
      storeName: activity.activityName,
      supervisorName: "",
      regionalManagerName: "",
      startDate: "",
      endDate: "",
    },
    selectedPlanIds: activity.planSnapshot.selectedPlanIds,
    selectedPromotionIds: activity.planSnapshot.selectedPromotionIds,
    selectedMaterials: activity.planSnapshot.selectedMaterials ?? {},
    activityProductQtys: activity.planSnapshot.activityProductQtys ?? {},
    subsidy: activity.planSnapshot.subsidy ?? { type: "percentage", value: 50 },
    materialDimensions: activity.planSnapshot.materialDimensions ?? {},
  }

  const budget = rebuildBudget(state)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const handleExport = useCallback(async () => {
    if (!pdfRef.current) return
    setExporting(true)
    try {
      const filename = `${activity.activityName}_活动方案.pdf`
      await exportToPdf(pdfRef.current, filename)
    } finally {
      setExporting(false)
    }
  }, [activity.activityName])

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <h2 className="text-base font-semibold text-foreground">方案预览 - {activity.activityName}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-lg text-sm font-semibold gradient-accent text-secondary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown size={15} />
            {exporting ? "正在生成..." : "导出 PDF"}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-y-auto py-8 px-4">
        <div className="max-w-[850px] mx-auto rounded-xl shadow-xl overflow-hidden">
          <PdfTemplate ref={pdfRef} state={state} budget={budget} preview />
        </div>
      </div>
    </div>
  )
}
