import type { ActivityRecord, ActivityStatus } from "@/data/types"

/**
 * 根据活动的开始日期、结束日期和实际数据录入情况自动计算当前状态
 * - 当前时间 < startDate → pending（待开始）
 * - startDate <= 当前时间 <= endDate → active（进行中）
 * - 当前时间 > endDate 且未录入实际数据 → awaiting_input（待录入数据）
 * - 当前时间 > endDate 且已录入实际数据 → completed（已结束）
 */
export function computeActivityStatus(
  activity: Pick<ActivityRecord, "startDate" | "endDate"> & { actualData?: unknown }
): ActivityStatus {
  const now = new Date()
  const start = activity.startDate ? new Date(activity.startDate + "T00:00:00") : null
  const end = activity.endDate ? new Date(activity.endDate + "T23:59:59") : null

  if (start && now < start) {
    return "pending"
  }
  if (end && now > end) {
    return activity.actualData ? "completed" : "awaiting_input"
  }
  if (start && now >= start) {
    return "active"
  }
  return "pending"
}
