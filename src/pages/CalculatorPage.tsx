import { useRef, useState, useEffect, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useCalculator } from "@/hooks/useCalculator"
import { useAuth } from "@/hooks/useAuth"
import { StoreInfoForm } from "@/components/calculator/StoreInfoForm"
import { PlanSelector } from "@/components/calculator/PlanSelector"
import { PromotionSelector } from "@/components/calculator/PromotionSelector"
import { MaterialSelector } from "@/components/calculator/MaterialSelector"
import { BudgetSummary } from "@/components/calculator/BudgetSummary"
import { CalculatorSidebar } from "@/components/calculator/CalculatorSidebar"
import { SavedPresets } from "@/components/calculator/SavedPresets"
import { PdfTemplate } from "@/components/calculator/PdfTemplate"
import { PdfPreviewModal } from "@/components/calculator/PdfPreviewModal"
import { ActivityModal } from "@/components/calculator/ActivityModal"
import { exportToPdf } from "@/lib/pdf"
import { updateActivity, addPreset } from "@/data/store"
import { Calculator, Bookmark, X } from "lucide-react"
import type { StoreInfo, ActivityRecord, SubsidyConfig, CalculatorState } from "@/data/types"

const sectionIds = ["calc-store", "calc-plans", "calc-promo", "calc-material", "calc-budget"]

interface LocationState {
  editActivity?: ActivityRecord
}

export function CalculatorPage() {
  const { state, dispatch, budget } = useCalculator()
  const { profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const pdfRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [activeSection, setActiveSection] = useState("calc-store")
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [presetRefreshKey, setPresetRefreshKey] = useState(0)

  // Load activity state if in edit mode
  useEffect(() => {
    const locState = location.state as LocationState | null
    if (locState?.editActivity) {
      const activity = locState.editActivity
      setEditingActivity(activity)
      const snapshot = activity.planSnapshot
      dispatch({
        type: "LOAD_STATE",
        state: {
          storeInfo: snapshot.storeInfo ?? {
            storeName: "",
            supervisorName: "",
            regionalManagerName: "",
            startDate: activity.startDate || "",
            endDate: activity.endDate || "",
          },
          selectedPlanIds: snapshot.selectedPlanIds,
          selectedPromotionIds: snapshot.selectedPromotionIds,
          selectedMaterials: snapshot.selectedMaterials ?? {},
          activityProductQtys: snapshot.activityProductQtys ?? {},
          subsidy: snapshot.subsidy ?? { type: "percentage", value: 50 },
          materialDimensions: snapshot.materialDimensions ?? {},
        },
      })
      // Clear location state to avoid reloading on refresh
      window.history.replaceState({}, "")
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // IntersectionObserver for sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    )

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const canExport = state.storeInfo.storeName.trim() !== "" && state.selectedPlanIds.length > 0

  const handlePreview = useCallback(() => {
    if (!canExport) return
    setShowPreview(true)
  }, [canExport])

  const handleCreateActivity = useCallback(() => {
    if (!canExport) return
    if (editingActivity) {
      updateActivity(editingActivity.id, {
        startDate: state.storeInfo.startDate,
        endDate: state.storeInfo.endDate,
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
      })
      setUpdateSuccess(true)
      setTimeout(() => {
        navigate("/activities")
      }, 1200)
    } else {
      setShowActivity(true)
    }
  }, [canExport, editingActivity, state, budget.grandTotal, navigate])

  const handleExport = useCallback(async () => {
    if (!pdfRef.current || !canExport) return
    setExporting(true)
    try {
      const filename = `${state.storeInfo.storeName}_活动方案_${new Date().toISOString().slice(0, 10)}.pdf`
      await exportToPdf(pdfRef.current, filename)
    } finally {
      setExporting(false)
    }
  }, [state.storeInfo.storeName, canExport])

  const handleStoreChange = useCallback((field: keyof StoreInfo, value: string) => {
    dispatch({ type: "SET_STORE_FIELD", field, value })
  }, [dispatch])

  const handleTogglePlan = useCallback((planId: string) => {
    dispatch({ type: "TOGGLE_PLAN", planId })
  }, [dispatch])

  const handleTogglePromotion = useCallback((promotionId: string) => {
    dispatch({ type: "TOGGLE_PROMOTION", promotionId })
  }, [dispatch])

  const handleSetMaterial = useCallback((materialId: string, qty: number) => {
    dispatch({ type: "SET_MATERIAL", materialId, qty })
  }, [dispatch])

  const handleSetActivityProductQty = useCallback((productId: string, qty: number) => {
    dispatch({ type: "SET_ACTIVITY_PRODUCT_QTY", productId, qty })
  }, [dispatch])

  const handleSetDimensions = useCallback((materialId: string, length: number, width: number) => {
    dispatch({ type: "SET_MATERIAL_DIMENSIONS", materialId, length, width })
  }, [dispatch])

  const handleSubsidyChange = useCallback((subsidy: SubsidyConfig) => {
    dispatch({ type: "SET_SUBSIDY", subsidy })
  }, [dispatch])

  const handleLoadPreset = useCallback((presetState: CalculatorState) => {
    // 加载方案时保留当前门店信息
    dispatch({ type: "LOAD_STATE", state: { ...presetState, storeInfo: state.storeInfo } })
  }, [dispatch, state.storeInfo])

  const handleSavePreset = useCallback(() => {
    setPresetName("")
    setShowSaveDialog(true)
  }, [])

  const handleConfirmSavePreset = useCallback(() => {
    if (!presetName.trim() || !profile) return
    const stateToSave = structuredClone(state)
    stateToSave.storeInfo = { storeName: "", supervisorName: "", regionalManagerName: "", startDate: "", endDate: "" }
    addPreset(profile.email, {
      id: `preset_${Date.now()}`,
      name: presetName.trim(),
      createdAt: new Date().toISOString(),
      state: stateToSave,
    })
    setShowSaveDialog(false)
    setPresetRefreshKey((n) => n + 1)
  }, [presetName, profile, state])

  return (
    <div className="pt-20 pb-16 bg-background min-h-screen">
      <div className="container mx-auto px-6">
        {/* Page header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <Calculator size={14} />
            方案计算器
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {editingActivity ? "编辑活动方案" : "创建活动方案"}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {editingActivity
              ? `正在编辑「${editingActivity.activityName}」的方案配置，修改后点击"更新活动"保存。`
              : "选择活动方案、宣传方式和物料，系统将自动计算预算。完成后可预览并导出 PDF 文档。"}
          </p>
        </div>

        {/* Layout: sidebar + content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24">
              <CalculatorSidebar activeSection={activeSection} budget={budget} />
              {profile && (
                <div className="mt-3">
                  <SavedPresets
                    userEmail={profile.email}
                    onLoadPreset={handleLoadPreset}
                    refreshKey={presetRefreshKey}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mobile stepper */}
          <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border px-4 py-2">
            <CalculatorSidebar activeSection={activeSection} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-8 lg:mt-0 mt-14">
            <StoreInfoForm storeInfo={state.storeInfo} onChange={handleStoreChange} />
            <PlanSelector
              selectedIds={state.selectedPlanIds}
              onToggle={handleTogglePlan}
              activityProductQtys={state.activityProductQtys}
              onSetActivityProductQty={handleSetActivityProductQty}
            />
            <PromotionSelector selectedIds={state.selectedPromotionIds} onToggle={handleTogglePromotion} />
            <MaterialSelector
              selectedMaterials={state.selectedMaterials}
              materialDimensions={state.materialDimensions}
              onSetMaterial={handleSetMaterial}
              onSetDimensions={handleSetDimensions}
            />
            <BudgetSummary
              budget={budget}
              subsidy={state.subsidy}
              onSubsidyChange={handleSubsidyChange}
              onPreview={handlePreview}
              onCreateActivity={handleCreateActivity}
              onSavePreset={handleSavePreset}
              canExport={canExport}
              editMode={!!editingActivity}
            />
          </div>
        </div>
      </div>

      {/* Hidden PDF template for export */}
      <PdfTemplate ref={pdfRef} state={state} budget={budget} />

      {/* Preview modal */}
      {showPreview && (
        <PdfPreviewModal
          state={state}
          budget={budget}
          exporting={exporting}
          onExport={handleExport}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Activity modal */}
      {showActivity && (
        <ActivityModal
          state={state}
          budget={budget}
          onClose={() => setShowActivity(false)}
        />
      )}

      {/* Update success overlay */}
      {updateSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-xl p-8 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center">
              <Calculator size={28} className="text-primary-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">活动方案已更新</p>
            <p className="text-sm text-muted-foreground">正在返回活动管理页面...</p>
          </div>
        </div>
      )}

      {/* Save preset dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                  <Bookmark size={18} className="text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">保存方案</h3>
              </div>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-smooth"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">为当前方案配置命名，保存后可在常用方案中快速加载。</p>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmSavePreset()
                if (e.key === "Escape") setShowSaveDialog(false)
              }}
              placeholder="输入方案名称..."
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-smooth"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSavePreset}
                disabled={!presetName.trim()}
                className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
