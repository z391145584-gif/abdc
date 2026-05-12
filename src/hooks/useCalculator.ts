import { useReducer, useMemo } from "react"
import type { CalculatorState, BudgetBreakdown, StoreInfo, SubsidyConfig } from "@/data/types"
import { getPromotions, getMaterials, getProducts, getPlans, getActivityProducts } from "@/data/store"

const initialState: CalculatorState = {
  storeInfo: {
    storeName: "",
    supervisorName: "",
    regionalManagerName: "",
    startDate: "",
    endDate: "",
  },
  selectedPlanIds: [],
  selectedPromotionIds: [],
  selectedMaterials: {},
  activityProductQtys: {},
  subsidy: { type: "percentage", value: 50 },
  materialDimensions: {},
}

type Action =
  | { type: "SET_STORE_FIELD"; field: keyof StoreInfo; value: string }
  | { type: "TOGGLE_PLAN"; planId: string }
  | { type: "TOGGLE_PROMOTION"; promotionId: string }
  | { type: "SET_MATERIAL"; materialId: string; qty: number }
  | { type: "SET_ACTIVITY_PRODUCT_QTY"; productId: string; qty: number }
  | { type: "SET_SUBSIDY"; subsidy: SubsidyConfig }
  | { type: "SET_MATERIAL_DIMENSIONS"; materialId: string; length: number; width: number }
  | { type: "LOAD_STATE"; state: CalculatorState }
  | { type: "RESET" }

function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case "SET_STORE_FIELD":
      return {
        ...state,
        storeInfo: { ...state.storeInfo, [action.field]: action.value },
      }
    case "TOGGLE_PLAN": {
      const exists = state.selectedPlanIds.includes(action.planId)
      return {
        ...state,
        selectedPlanIds: exists
          ? state.selectedPlanIds.filter((id) => id !== action.planId)
          : [...state.selectedPlanIds, action.planId],
      }
    }
    case "TOGGLE_PROMOTION": {
      const exists = state.selectedPromotionIds.includes(action.promotionId)
      return {
        ...state,
        selectedPromotionIds: exists
          ? state.selectedPromotionIds.filter((id) => id !== action.promotionId)
          : [...state.selectedPromotionIds, action.promotionId],
      }
    }
    case "SET_MATERIAL": {
      const next = { ...state.selectedMaterials }
      if (action.qty <= 0) {
        delete next[action.materialId]
      } else {
        next[action.materialId] = action.qty
      }
      return { ...state, selectedMaterials: next }
    }
    case "SET_ACTIVITY_PRODUCT_QTY": {
      const next = { ...state.activityProductQtys }
      if (action.qty <= 0) {
        delete next[action.productId]
      } else {
        next[action.productId] = action.qty
      }
      return { ...state, activityProductQtys: next }
    }
    case "SET_SUBSIDY":
      return { ...state, subsidy: action.subsidy }
    case "SET_MATERIAL_DIMENSIONS": {
      return {
        ...state,
        materialDimensions: {
          ...state.materialDimensions,
          [action.materialId]: { length: action.length, width: action.width },
        },
      }
    }
    case "RESET":
      return initialState
    case "LOAD_STATE":
      return action.state
    default:
      return state
  }
}

function computeBudget(state: CalculatorState): BudgetBreakdown {
  const promotions = getPromotions()
  const materials = getMaterials()
  const products = getProducts()
  const plans = getPlans()
  const activityProductsList = getActivityProducts()

  // Promotion budget
  const promotionItems = state.selectedPromotionIds.map((id) => {
    const p = promotions.find((x) => x.id === id)!
    return { name: p.content, price: p.price }
  })
  const promotionTotal = promotionItems.reduce((sum, x) => sum + x.price, 0)

  // Material budget - supports both quantity and size billing
  const materialItems = Object.entries(state.selectedMaterials).map(([id, qty]) => {
    const m = materials.find((x) => x.id === id)!
    const billingMode = m.billingMode || "quantity"

    if (billingMode === "size") {
      const dims = state.materialDimensions[id] ?? {
        length: m.defaultLength ?? 100,
        width: m.defaultWidth ?? 100,
      }
      const areaSqm = (dims.length * dims.width) / 10000
      const total = Math.round(areaSqm * m.unitPrice * qty * 100) / 100
      return {
        name: m.name,
        qty,
        unitPrice: m.unitPrice,
        total,
        billingMode: "size" as const,
        dimensions: { length: dims.length, width: dims.width, area: areaSqm },
      }
    }

    return { name: m.name, qty, unitPrice: m.unitPrice, total: qty * m.unitPrice }
  })
  const materialTotal = materialItems.reduce((sum, x) => sum + x.total, 0)

  // Product budget - based on selected plans
  const linkedProducts = products.filter((p) =>
    p.linkedPlanIds.some((lid) => state.selectedPlanIds.includes(lid))
  )
  const productItems = linkedProducts.map((p) => ({
    name: p.name,
    category: p.category,
    qty: p.defaultQty,
    unitCost: p.unitCost,
    total: p.unitCost * p.defaultQty,
  }))
  const productTotal = productItems.reduce((sum, x) => sum + x.total, 0)

  // Activity products budget - linked via plans
  const selectedPlans = plans.filter((p) => state.selectedPlanIds.includes(p.id))
  const linkedActivityProductIds = new Set<string>()
  for (const plan of selectedPlans) {
    if (plan.linkedActivityProductIds) {
      for (const pid of plan.linkedActivityProductIds) {
        linkedActivityProductIds.add(pid)
      }
    }
  }
  const activityProductItems = [...linkedActivityProductIds]
    .map((id) => activityProductsList.find((x) => x.id === id))
    .filter((p) => p != null)
    .map((p) => {
      const qty = state.activityProductQtys[p.id] ?? p.defaultQty
      return {
        name: p.name,
        category: p.category,
        qty,
        costPrice: p.costPrice,
        retailPrice: p.retailPrice,
        total: qty * p.costPrice,
      }
    })
  const activityProductTotal = activityProductItems.reduce((sum, x) => sum + x.total, 0)

  // Online plans have their own estimated costs
  const onlinePlansCost = state.selectedPlanIds
    .map((id) => plans.find((p) => p.id === id))
    .filter((p) => p?.type === "online")
    .reduce((sum, p) => sum + (p?.estimatedCost ?? 0), 0)

  const grandTotal = promotionTotal + materialTotal + productTotal + onlinePlansCost + activityProductTotal

  // Subsidy calculation
  let subsidyAmount: number
  if (state.subsidy.type === "fixed") {
    subsidyAmount = Math.min(state.subsidy.value, grandTotal)
  } else {
    subsidyAmount = Math.round(grandTotal * (state.subsidy.value / 100))
  }
  const subsidizedTotal = Math.max(0, grandTotal - subsidyAmount)

  return {
    promotionTotal,
    materialTotal,
    productTotal: productTotal + onlinePlansCost,
    activityProductTotal,
    grandTotal,
    subsidyAmount,
    subsidizedTotal,
    promotionItems,
    materialItems,
    productItems: onlinePlansCost > 0
      ? [
          ...state.selectedPlanIds
            .map((id) => plans.find((p) => p.id === id))
            .filter((p) => p?.type === "online")
            .map((p) => ({
              name: p!.title,
              category: "线上活动",
              qty: 1,
              unitCost: p!.estimatedCost ?? 0,
              total: p!.estimatedCost ?? 0,
            })),
          ...productItems,
        ]
      : productItems,
    activityProductItems,
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const budget = useMemo(() => computeBudget(state), [state])

  return { state, dispatch, budget }
}
