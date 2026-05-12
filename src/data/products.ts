import type { ProductBudgetData } from "./types"

export const products: ProductBudgetData[] = [
  // 满赠商品 → 关联 offline-3（会员满赠）
  { id: "prod-1", category: "满赠", name: "吾尚乳酸菌一排", unitCost: 11.2, defaultQty: 800, subsidyRate: 0.5, linkedPlanIds: ["offline-3"] },
  { id: "prod-2", category: "满赠", name: "可口可乐一提", unitCost: 9.42, defaultQty: 500, subsidyRate: 0.5, linkedPlanIds: ["offline-3"] },
  { id: "prod-3", category: "满赠", name: "蒙牛真果粒一箱", unitCost: 27, defaultQty: 100, subsidyRate: 0.5, linkedPlanIds: ["offline-3"] },
  // 抽奖商品 → 关联 offline-4（满额抽奖）
  { id: "prod-4", category: "抽奖", name: "白象方便面5连包", unitCost: 8.7, defaultQty: 100, subsidyRate: 0.5, linkedPlanIds: ["offline-4"] },
  { id: "prod-5", category: "抽奖", name: "大霸王鸭脖子一根", unitCost: 3.1, defaultQty: 100, subsidyRate: 0.5, linkedPlanIds: ["offline-4"] },
  { id: "prod-6", category: "抽奖", name: "大展宏图大礼包一袋", unitCost: 17, defaultQty: 50, subsidyRate: 0.5, linkedPlanIds: ["offline-4"] },
  { id: "prod-7", category: "抽奖", name: "爱尚咪咪虾条70g", unitCost: 1.5, defaultQty: 200, subsidyRate: 0.5, linkedPlanIds: ["offline-4"] },
  // 换购商品 → 关联 offline-2（满额换购）
  { id: "prod-8", category: "换购", name: "新希望小白袋1件", unitCost: 7.5, defaultQty: 200, subsidyRate: 0.5, linkedPlanIds: ["offline-2"] },
  { id: "prod-9", category: "换购", name: "伊利纯牛奶200ml*24", unitCost: 6.1, defaultQty: 200, subsidyRate: 0.5, linkedPlanIds: ["offline-2"] },
  { id: "prod-10", category: "换购", name: "娃哈哈AD钙1板", unitCost: 1.7, defaultQty: 500, subsidyRate: 0.5, linkedPlanIds: ["offline-2"] },
]