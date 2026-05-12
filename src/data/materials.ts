import type { MaterialData } from "./types"

export const materials: MaterialData[] = [
  { id: "mat-1", name: "活动展架画面 177mm*70mm", category: "onetime", unitPrice: 60, defaultQty: 2, unit: "个" },
  { id: "mat-2", name: "红毯", category: "onetime", unitPrice: 90, defaultQty: 1, unit: "条", billingMode: "size", defaultLength: 100, defaultWidth: 100 },
  { id: "mat-3", name: "DM单", category: "onetime", unitPrice: 0.08, defaultQty: 10000, unit: "张" },
  { id: "mat-4", name: "抽奖箱（含贴纸）", category: "onetime", unitPrice: 200, defaultQty: 1, unit: "个" },
  { id: "mat-5", name: "赠品KT板", category: "onetime", unitPrice: 20, defaultQty: 6, unit: "块" },
  { id: "mat-6", name: "横幅", category: "onetime", unitPrice: 80, defaultQty: 1, unit: "条" },
  { id: "mat-7", name: "桌子挡板", category: "onetime", unitPrice: 40, defaultQty: 2, unit: "套" },
  { id: "mat-8", name: "帐篷", category: "reusable", unitPrice: 0, defaultQty: 2, unit: "顶" },
  { id: "mat-9", name: "音响", category: "reusable", unitPrice: 0, defaultQty: 1, unit: "台" },
  { id: "mat-10", name: "大刀旗", category: "reusable", unitPrice: 0, defaultQty: 4, unit: "面" },
  { id: "mat-11", name: "收银机", category: "reusable", unitPrice: 0, defaultQty: 2, unit: "台" },
  { id: "mat-12", name: "折叠桌", category: "reusable", unitPrice: 0, defaultQty: 2, unit: "张" },
]