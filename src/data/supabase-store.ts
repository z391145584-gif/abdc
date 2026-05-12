/**
 * Supabase 数据同步层
 * 负责将本地数据与远程 Supabase 数据库同步
 */
import { supabase, supabaseConfigured } from "@/lib/supabase"
import type {
  PlanData,
  PromotionData,
  MaterialData,
  ProductBudgetData,
  ActivityProductData,
  ActivityRecord,
  SavedPreset,
  DemoAccount,
} from "./types"
import { plans as defaultPlansData } from "./plans"
import { promotions as defaultPromotionsData } from "./promotions"
import { materials as defaultMaterialsData } from "./materials"
import { products as defaultProductsData } from "./products"
import { activityProducts as defaultActivityProductsData } from "./activityProducts"

// ============ 字段映射：camelCase <-> snake_case ============

function planToDb(p: PlanData) {
  return {
    id: p.id,
    type: p.type,
    store_type: p.storeType,
    title: p.title,
    icon_name: p.iconName,
    description: p.description,
    details: p.details,
    note: p.note || null,
    example: p.example || null,
    cost: p.cost || null,
    estimated_cost: p.estimatedCost ?? null,
    linked_activity_product_ids: p.linkedActivityProductIds || [],
    maintainer: p.maintainer || null,
    creator_id: p.creatorId || null,
    is_public: p.isPublic ?? true,
  }
}

function planFromDb(row: Record<string, unknown>): PlanData {
  return {
    id: row.id as string,
    type: row.type as PlanData["type"],
    storeType: row.store_type as PlanData["storeType"],
    title: row.title as string,
    iconName: row.icon_name as string,
    description: row.description as string,
    details: (row.details as string[]) || [],
    note: row.note as string | undefined,
    example: row.example as string | undefined,
    cost: row.cost as string | undefined,
    estimatedCost: row.estimated_cost as number | undefined,
    linkedActivityProductIds: (row.linked_activity_product_ids as string[]) || [],
    maintainer: row.maintainer as string | undefined,
    creatorId: row.creator_id as string | undefined,
    isPublic: row.is_public as boolean | undefined,
  }
}

function promotionToDb(p: PromotionData) {
  return {
    id: p.id,
    content: p.content,
    time: p.time,
    price: p.price,
    price_label: p.priceLabel,
    icon_name: p.iconName,
    maintainer: p.maintainer || null,
    creator_id: p.creatorId || null,
    is_public: p.isPublic ?? true,
  }
}

function promotionFromDb(row: Record<string, unknown>): PromotionData {
  return {
    id: row.id as string,
    content: row.content as string,
    time: row.time as string,
    price: row.price as number,
    priceLabel: row.price_label as string,
    iconName: row.icon_name as string,
    maintainer: row.maintainer as string | undefined,
    creatorId: row.creator_id as string | undefined,
    isPublic: row.is_public as boolean | undefined,
  }
}

function materialToDb(m: MaterialData) {
  return {
    id: m.id,
    name: m.name,
    category: m.category,
    unit_price: m.unitPrice,
    default_qty: m.defaultQty,
    unit: m.unit,
    billing_mode: m.billingMode || "quantity",
    default_length: m.defaultLength ?? null,
    default_width: m.defaultWidth ?? null,
    maintainer: m.maintainer || null,
    creator_id: m.creatorId || null,
    is_public: m.isPublic ?? true,
  }
}

function materialFromDb(row: Record<string, unknown>): MaterialData {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as MaterialData["category"],
    unitPrice: row.unit_price as number,
    defaultQty: row.default_qty as number,
    unit: row.unit as string,
    billingMode: row.billing_mode as MaterialData["billingMode"],
    defaultLength: row.default_length as number | undefined,
    defaultWidth: row.default_width as number | undefined,
    maintainer: row.maintainer as string | undefined,
    creatorId: row.creator_id as string | undefined,
    isPublic: row.is_public as boolean | undefined,
  }
}

function productToDb(p: ProductBudgetData) {
  return {
    id: p.id,
    category: p.category,
    name: p.name,
    unit_cost: p.unitCost,
    default_qty: p.defaultQty,
    subsidy_rate: p.subsidyRate,
    linked_plan_ids: p.linkedPlanIds,
  }
}

function productFromDb(row: Record<string, unknown>): ProductBudgetData {
  return {
    id: row.id as string,
    category: row.category as string,
    name: row.name as string,
    unitCost: row.unit_cost as number,
    defaultQty: row.default_qty as number,
    subsidyRate: row.subsidy_rate as number,
    linkedPlanIds: (row.linked_plan_ids as string[]) || [],
  }
}

function activityProductToDb(p: ActivityProductData) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    cost_price: p.costPrice,
    retail_price: p.retailPrice,
    default_qty: p.defaultQty,
    maintainer: p.maintainer || null,
    creator_id: p.creatorId || null,
    is_public: p.isPublic ?? true,
  }
}

function activityProductFromDb(row: Record<string, unknown>): ActivityProductData {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    costPrice: row.cost_price as number,
    retailPrice: row.retail_price as number,
    defaultQty: row.default_qty as number,
    maintainer: row.maintainer as string | undefined,
    creatorId: row.creator_id as string | undefined,
    isPublic: row.is_public as boolean | undefined,
  }
}

function activityToDb(a: ActivityRecord) {
  return {
    id: a.id,
    creator_id: a.creatorId,
    status: a.status,
    activity_name: a.activityName,
    purpose: a.purpose,
    competitor: a.competitor,
    owner: a.owner,
    start_date: a.startDate,
    end_date: a.endDate,
    expected_sales: a.expectedSales,
    expected_daily_sales: a.expectedDailySales,
    expected_traffic: a.expectedTraffic,
    expected_new_members: a.expectedNewMembers,
    expected_redemption_rate: a.expectedRedemptionRate,
    expected_roi: a.expectedROI,
    plan_snapshot: a.planSnapshot,
    actual_data: a.actualData || null,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  }
}

function activityFromDb(row: Record<string, unknown>): ActivityRecord {
  return {
    id: row.id as string,
    creatorId: row.creator_id as string,
    status: row.status as ActivityRecord["status"],
    activityName: row.activity_name as string,
    purpose: (row.purpose as string) || "",
    competitor: (row.competitor as string) || "",
    owner: (row.owner as string) || "",
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    expectedSales: (row.expected_sales as number) || 0,
    expectedDailySales: (row.expected_daily_sales as number) || 0,
    expectedTraffic: (row.expected_traffic as number) || 0,
    expectedNewMembers: (row.expected_new_members as number) || 0,
    expectedRedemptionRate: (row.expected_redemption_rate as number) || 0,
    expectedROI: (row.expected_roi as number) || 0,
    planSnapshot: (row.plan_snapshot as ActivityRecord["planSnapshot"]) || {},
    actualData: row.actual_data as ActivityRecord["actualData"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function presetToDb(p: SavedPreset, userEmail: string) {
  return {
    id: p.id,
    user_email: userEmail,
    name: p.name,
    state: p.state,
    created_at: p.createdAt,
  }
}

function presetFromDb(row: Record<string, unknown>): SavedPreset {
  return {
    id: row.id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
    state: row.state as SavedPreset["state"],
  }
}

// ============ 远程 CRUD 操作 ============

export async function fetchPlans(): Promise<PlanData[] | null> {
  if (!supabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from("plans").select("*")
  if (error) { console.warn("[Supabase] fetchPlans error:", error.message); return null }
  return (data || []).map(planFromDb)
}

export async function pushPlans(plans: PlanData[]): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false
  const { error } = await supabase
    .from("plans")
    .upsert(plans.map(planToDb), { onConflict: "id" })
  if (error) { console.warn("[Supabase] pushPlans error:", error.message); return false }
  return true
}

export async function fetchPromotions(): Promise<PromotionData[] | null> {
  if (!supabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from("promotions").select("*")
  if (error) { console.warn("[Supabase] fetchPromotions error:", error.message); return null }
  return (data || []).map(promotionFromDb)
}

export async function pushPromotions(promotions: PromotionData[]): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false
  const { error } = await supabase
    .from("promotions")
    .upsert(promotions.map(promotionToDb), { onConflict: "id" })
  if (error) { console.warn("[Supabase] pushPromotions error:", error.message); return false }
  return true
}

export async function fetchMaterials(): Promise<MaterialData[] | null> {
  if (!supabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from("materials").select("*")
  if (error) { console.warn("[Supabase] fetchMaterials error:", error.message); return null }
  return (data || []).map(materialFromDb)
}

export async function pushMaterials(materials: MaterialData[]): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false
  const { error } = await supabase
    .from("materials")
    .upsert(materials.map(materialToDb), { onConflict: "id" })
  if (error) { console.warn("[Supabase] pushMaterials error:", error.message); return false }
  return true
}

export async function fetchProducts(): Promise<ProductBudgetData[] | null> {
  if (!supabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from("products").select("*")
  if (error) { console.warn("[Supabase] fetchProducts error:", error.message); return null }
  return (data || []).map(productFromDb)
}

export async function pushProducts(products: ProductBudgetData[]): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false
  const { error } = await supabase
    .from("products")
    .upsert(products.map(productToDb), { onConflict: "id" })
  if (error) { console.warn("[Supabase] pushProducts error:", error.message); return false }
  return true
}

export async function fetchActivityProducts(): Promise<ActivityProductData[] | null> {
  if (!supabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from("activity_products").select("*")
  if (error) { console.warn("[Supabase] fetchActivityProducts error:", error.message); return null }
  return (data || []).map(activityProductFromDb)
}

export async function pushActivityProducts(items: ActivityProductData[]): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false
  const { error } = await supabase
    .from("activity_products")
    .upsert(items.map(activityProductToDb), { onConflict: "id" })
  if (error) { console.warn("[Supabase] pushActivityProducts error:", error.message); return false }
  return true
}

export async function fetchActivities(): Promise<ActivityRecord[] | null> {
  if (!supabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from("activities").select("*").order("created_at", { ascending: false })
  if (error) { console.warn("[Supabase] fetchActivities error:", error.message); return null }
  return (data || []).map(activityFromDb)
}

export async function pushActivities(activities: ActivityRecord[]): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false
  const { error } = await supabase
    .from("activities")
    .upsert(activities.map(activityToDb), { onConflict: "id" })
  if (error) { console.warn("[Supabase] pushActivities error:", error.message); return false }
  return true
}

export async function deleteActivityRemote(id: string): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false
  const { error } = await supabase.from("activities").delete().eq("id", id)
  if (error) { console.warn("[Supabase] deleteActivity error:", error.message); return false }
  return true
}

export async function fetchPresets(userEmail: string): Promise<SavedPreset[] | null> {
  if (!supabaseConfigured || !supabase) return null
  const { data, error } = await supabase
    .from("saved_presets")
    .select("*")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false })
  if (error) { console.warn("[Supabase] fetchPresets error:", error.message); return null }
  return (data || []).map(presetFromDb)
}

export async function pushPreset(userEmail: string, preset: SavedPreset): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false
  const { error } = await supabase
    .from("saved_presets")
    .upsert(presetToDb(preset, userEmail), { onConflict: "id" })
  if (error) { console.warn("[Supabase] pushPreset error:", error.message); return false }
  return true
}

export async function deletePresetRemote(presetId: string): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false
  const { error } = await supabase.from("saved_presets").delete().eq("id", presetId)
  if (error) { console.warn("[Supabase] deletePreset error:", error.message); return false }
  return true
}

export async function updatePresetNameRemote(presetId: string, newName: string): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false
  const { error } = await supabase.from("saved_presets").update({ name: newName }).eq("id", presetId)
  if (error) { console.warn("[Supabase] updatePresetName error:", error.message); return false }
  return true
}

// ============ 用户认证 (profiles 表) ============

export async function authenticateUser(email: string, password: string): Promise<DemoAccount | null> {
  if (!supabaseConfigured || !supabase) return null
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single()
  if (error || !data) return null
  if (!data.enabled) return null
  return {
    email: data.email,
    password: data.password,
    role: data.role,
    displayName: data.display_name || email,
    enabled: data.enabled,
  }
}

export async function fetchAllProfiles(): Promise<DemoAccount[] | null> {
  if (!supabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from("profiles").select("*").order("created_at")
  if (error) { console.warn("[Supabase] fetchAllProfiles error:", error.message); return null }
  return (data || []).map((row) => ({
    email: row.email,
    password: row.password,
    role: row.role,
    displayName: row.display_name || row.email,
    enabled: row.enabled,
  }))
}

export async function upsertProfile(account: DemoAccount): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false
  const { error } = await supabase.from("profiles").upsert({
    email: account.email,
    display_name: account.displayName,
    role: account.role,
    password: account.password,
    enabled: account.enabled,
    updated_at: new Date().toISOString(),
  }, { onConflict: "email" })
  if (error) { console.warn("[Supabase] upsertProfile error:", error.message); return false }
  return true
}

// ============ 初始化同步 ============

const SYNC_FLAG_KEY = "supabase_synced"

export async function initSync(): Promise<boolean> {
  if (!supabaseConfigured || !supabase) return false

  try {
    // 测试连接是否正常（尝试查询 profiles 表）
    const { error } = await supabase.from("profiles").select("id").limit(1)
    if (error) {
      console.warn("[Supabase] 数据库连接失败或表不存在:", error.message)
      return false
    }

    // 检查是否已经做过初始同步（本地数据上传到远程）
    const synced = localStorage.getItem(SYNC_FLAG_KEY)
    if (!synced) {
      // 首次同步：将本地数据上推到 Supabase
      await uploadLocalData()
      localStorage.setItem(SYNC_FLAG_KEY, "true")
    }

    // 从远程拉取最新数据到 localStorage
    await pullRemoteData()
    return true
  } catch (err) {
    console.warn("[Supabase] initSync error:", err)
    return false
  }
}

async function uploadLocalData() {
  const KEYS = {
    plans: "store_plans",
    promotions: "store_promotions",
    materials: "store_materials",
    products: "store_products",
    activities: "store_activities",
    activityProducts: "store_activity_products",
  }

  function loadLocal<T>(key: string, defaults: T[]): T[] {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch { /* */ }
    return defaults
  }

  const plans = loadLocal(KEYS.plans, defaultPlansData)
  const promotions = loadLocal(KEYS.promotions, defaultPromotionsData)
  const materials = loadLocal(KEYS.materials, defaultMaterialsData)
  const products = loadLocal(KEYS.products, defaultProductsData)
  const activityProducts = loadLocal(KEYS.activityProducts, defaultActivityProductsData)
  const activities = loadLocal<ActivityRecord>(KEYS.activities, [])

  await Promise.all([
    pushPlans(plans),
    pushPromotions(promotions),
    pushMaterials(materials),
    pushProducts(products),
    pushActivityProducts(activityProducts),
    activities.length > 0 ? pushActivities(activities) : Promise.resolve(),
  ])
}

async function pullRemoteData() {
  const KEYS = {
    plans: "store_plans",
    promotions: "store_promotions",
    materials: "store_materials",
    products: "store_products",
    activities: "store_activities",
    activityProducts: "store_activity_products",
  }

  const [plans, promotions, materials, products, activityProducts, activities] = await Promise.all([
    fetchPlans(),
    fetchPromotions(),
    fetchMaterials(),
    fetchProducts(),
    fetchActivityProducts(),
    fetchActivities(),
  ])

  if (plans && plans.length > 0) localStorage.setItem(KEYS.plans, JSON.stringify(plans))
  if (promotions && promotions.length > 0) localStorage.setItem(KEYS.promotions, JSON.stringify(promotions))
  if (materials && materials.length > 0) localStorage.setItem(KEYS.materials, JSON.stringify(materials))
  if (products && products.length > 0) localStorage.setItem(KEYS.products, JSON.stringify(products))
  if (activityProducts && activityProducts.length > 0) localStorage.setItem(KEYS.activityProducts, JSON.stringify(activityProducts))
  if (activities) localStorage.setItem(KEYS.activities, JSON.stringify(activities))
}
