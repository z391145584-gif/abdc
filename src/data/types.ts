export type PlanType = "online" | "offline"
export type StoreType = "convenience" | "wholesale"

export interface PlanData {
  id: string
  type: PlanType
  storeType: StoreType
  title: string
  iconName: string
  description: string
  details: string[]
  note?: string
  example?: string
  cost?: string
  estimatedCost?: number
  linkedActivityProductIds?: string[]
  maintainer?: string
  creatorId?: string
  isPublic?: boolean
}

export interface PromotionData {
  id: string
  content: string
  time: string
  price: number
  priceLabel: string
  iconName: string
  maintainer?: string
  creatorId?: string
  isPublic?: boolean
}

export interface MaterialData {
  id: string
  name: string
  category: "onetime" | "reusable"
  unitPrice: number
  defaultQty: number
  unit: string
  billingMode?: "quantity" | "size"
  defaultLength?: number
  defaultWidth?: number
  maintainer?: string
  creatorId?: string
  isPublic?: boolean
}

export interface ProductBudgetData {
  id: string
  category: string
  name: string
  unitCost: number
  defaultQty: number
  subsidyRate: number
  linkedPlanIds: string[]
}

export interface ProcessStepData {
  phase: string
  time: string
  task: string
  detail: string
  materials?: string
  executor: string
  checker: string
  iconName: string
}

export interface StoreInfo {
  storeName: string
  supervisorName: string
  regionalManagerName: string
  startDate: string
  endDate: string
}

export interface BudgetBreakdown {
  promotionTotal: number
  materialTotal: number
  productTotal: number
  activityProductTotal: number
  grandTotal: number
  subsidyAmount: number
  subsidizedTotal: number
  promotionItems: { name: string; price: number }[]
  materialItems: {
    name: string
    qty: number
    unitPrice: number
    total: number
    billingMode?: "quantity" | "size"
    dimensions?: { length: number; width: number; area: number }
  }[]
  productItems: {
    name: string
    category: string
    qty: number
    unitCost: number
    total: number
  }[]
  activityProductItems: {
    name: string
    category: string
    qty: number
    costPrice: number
    retailPrice: number
    total: number
  }[]
}

export interface SubsidyConfig {
  type: "fixed" | "percentage"
  value: number
}

export interface SavedPreset {
  id: string
  name: string
  createdAt: string
  state: CalculatorState
}

export interface CalculatorState {
  storeInfo: StoreInfo
  selectedPlanIds: string[]
  selectedPromotionIds: string[]
  selectedMaterials: Record<string, number>
  activityProductQtys: Record<string, number>
  subsidy: SubsidyConfig
  materialDimensions: Record<string, { length: number; width: number }>
}

export interface ActivityProductData {
  id: string
  name: string
  category: string
  costPrice: number
  retailPrice: number
  defaultQty: number
  maintainer?: string
  creatorId?: string
  isPublic?: boolean
}

export type ActivityStatus = "pending" | "active" | "completed" | "awaiting_input"

export interface ActivityRecord {
  id: string
  createdAt: string
  updatedAt: string
  creatorId: string
  status: ActivityStatus
  // 活动时间范围（用于自动状态流转）
  startDate: string
  endDate: string
  // 基础信息
  activityName: string
  purpose: string
  competitor: string
  owner: string
  // 预期销售
  expectedSales: number
  expectedDailySales: number
  // 客流/会员
  expectedTraffic: number
  expectedNewMembers: number
  // 核销/ROI
  expectedRedemptionRate: number
  expectedROI: number
  // 关联的计算器状态快照
  planSnapshot: {
    selectedPlanIds: string[]
    selectedPromotionIds: string[]
    selectedMaterials: Record<string, number>
    activityProductQtys: Record<string, number>
    budgetTotal: number
    storeInfo?: StoreInfo
    subsidy?: SubsidyConfig
    materialDimensions?: Record<string, { length: number; width: number }>
  }
  // 实际执行数据（活动结束后录入）
  actualData?: {
    completedAt: string
    actualSales: number
    actualDailySales: number
    actualTraffic: number
    actualNewMembers: number
    actualRedemptionRate: number
    actualROI: number
    notes: string
  }
}

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  role: "user" | "admin"
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface DemoAccount {
  email: string
  password: string
  role: "user" | "admin"
  displayName: string
  enabled: boolean
}
