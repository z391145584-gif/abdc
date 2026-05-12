import type { PromotionData } from "./types"

export const promotions: PromotionData[] = [
  {
    id: "promo-1",
    content: "宣传车",
    time: "早上8点 - 晚上9:30",
    price: 1200,
    priceLabel: "1,200 元",
    iconName: "Volume2",
  },
  {
    id: "promo-2",
    content: "舞台",
    time: "晚高峰",
    price: 9000,
    priceLabel: "9,000 元",
    iconName: "Music",
  },
  {
    id: "promo-3",
    content: "主持/小丑",
    time: "晚高峰",
    price: 1450,
    priceLabel: "1,450 元",
    iconName: "Mic",
  },
  {
    id: "promo-4",
    content: "腰鼓队",
    time: "全天",
    price: 1600,
    priceLabel: "1,600 元",
    iconName: "Music",
  },
]