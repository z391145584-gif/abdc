import type { ActivityProductData } from "./types"

export const activityProducts: ActivityProductData[] = [
  // 饮料类
  { id: "aprod-1", name: "可口可乐330ml", category: "饮料", costPrice: 2.5, retailPrice: 3.5, defaultQty: 200 },
  { id: "aprod-2", name: "百事可乐330ml", category: "饮料", costPrice: 2.4, retailPrice: 3.5, defaultQty: 200 },
  { id: "aprod-3", name: "统一冰红茶500ml", category: "饮料", costPrice: 2.8, retailPrice: 4.0, defaultQty: 150 },
  // 零食类
  { id: "aprod-4", name: "乐事薯片75g", category: "零食", costPrice: 4.5, retailPrice: 7.9, defaultQty: 100 },
  { id: "aprod-5", name: "奥利奥饼干97g", category: "零食", costPrice: 3.8, retailPrice: 6.9, defaultQty: 100 },
  { id: "aprod-6", name: "德芙巧克力43g", category: "零食", costPrice: 5.2, retailPrice: 9.9, defaultQty: 80 },
  // 日用品类
  { id: "aprod-7", name: "清风抽纸3包装", category: "日用品", costPrice: 6.5, retailPrice: 12.9, defaultQty: 50 },
  { id: "aprod-8", name: "蓝月亮洗手液500ml", category: "日用品", costPrice: 8.0, retailPrice: 15.9, defaultQty: 30 },
]
