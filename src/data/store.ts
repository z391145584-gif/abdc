import { plans as defaultPlans } from "./plans"
import { promotions as defaultPromotions } from "./promotions"
import { materials as defaultMaterials } from "./materials"
import { products as defaultProducts } from "./products"
import { activityProducts as defaultActivityProducts } from "./activityProducts"
import type { PlanData, PromotionData, MaterialData, ProductBudgetData, ActivityRecord, ActivityProductData, ActivityStatus, SavedPreset } from "./types"
import {
  pushPlans,
  pushPromotions,
  pushMaterials,
  pushProducts,
  pushActivityProducts,
  pushActivities,
  pushPreset,
  deletePresetRemote,
  updatePresetNameRemote,
} from "./supabase-store"

const KEYS = {
  plans: "store_plans",
  promotions: "store_promotions",
  materials: "store_materials",
  products: "store_products",
  activities: "store_activities",
  activityProducts: "store_activity_products",
} as const

function load<T>(key: string, defaults: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupted data, fall back */
  }
  return defaults
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

// --- Plans ---
export function getPlans(): PlanData[] {
  return load(KEYS.plans, defaultPlans)
}
export function savePlans(data: PlanData[]) {
  save(KEYS.plans, data)
  pushPlans(data).catch(() => {})
}

// --- Promotions ---
export function getPromotions(): PromotionData[] {
  return load(KEYS.promotions, defaultPromotions)
}
export function savePromotions(data: PromotionData[]) {
  save(KEYS.promotions, data)
  pushPromotions(data).catch(() => {})
}

// --- Materials ---
export function getMaterials(): MaterialData[] {
  return load(KEYS.materials, defaultMaterials)
}
export function saveMaterials(data: MaterialData[]) {
  save(KEYS.materials, data)
  pushMaterials(data).catch(() => {})
}

// --- Products ---
export function getProducts(): ProductBudgetData[] {
  return load(KEYS.products, defaultProducts)
}
export function saveProducts(data: ProductBudgetData[]) {
  save(KEYS.products, data)
  pushProducts(data).catch(() => {})
}

// --- Activities ---
export function getActivities(): ActivityRecord[] {
  return load(KEYS.activities, [])
}
export function saveActivities(data: ActivityRecord[]) {
  save(KEYS.activities, data)
  pushActivities(data).catch(() => {})
}
export function updateActivity(id: string, updates: Partial<ActivityRecord>): ActivityRecord[] {
  const all = getActivities()
  const updated = all.map((a) =>
    a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
  )
  saveActivities(updated)
  return updated
}
export function setActivityStatus(id: string, status: ActivityStatus): ActivityRecord[] {
  return updateActivity(id, { status })
}

// --- Activity Products ---
export function getActivityProducts(): ActivityProductData[] {
  return load(KEYS.activityProducts, defaultActivityProducts)
}
export function saveActivityProducts(data: ActivityProductData[]) {
  save(KEYS.activityProducts, data)
  pushActivityProducts(data).catch(() => {})
}

// --- Saved Presets (per user) ---
function presetsKey(userEmail: string): string {
  return `store_presets_${userEmail}`
}

export function getPresets(userEmail: string): SavedPreset[] {
  try {
    const raw = localStorage.getItem(presetsKey(userEmail))
    if (raw) return JSON.parse(raw)
  } catch { /* corrupted */ }
  return []
}

export function savePresets(userEmail: string, presets: SavedPreset[]) {
  localStorage.setItem(presetsKey(userEmail), JSON.stringify(presets))
}

export function addPreset(userEmail: string, preset: SavedPreset) {
  const all = getPresets(userEmail)
  all.unshift(preset)
  savePresets(userEmail, all)
  pushPreset(userEmail, preset).catch(() => {})
}

export function deletePreset(userEmail: string, presetId: string) {
  const all = getPresets(userEmail).filter((p) => p.id !== presetId)
  savePresets(userEmail, all)
  deletePresetRemote(presetId).catch(() => {})
}

export function renamePreset(userEmail: string, presetId: string, newName: string) {
  const all = getPresets(userEmail).map((p) =>
    p.id === presetId ? { ...p, name: newName } : p
  )
  savePresets(userEmail, all)
  updatePresetNameRemote(presetId, newName).catch(() => {})
}

// --- Reset to defaults ---
export function resetAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
