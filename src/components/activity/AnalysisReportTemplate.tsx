import { forwardRef } from "react"
import type { ActivityRecord } from "@/data/types"
import { cn } from "@/lib/utils"

interface Props {
  activity: ActivityRecord
}

interface Metric {
  label: string
  expected: number
  actual: number
  unit: string
  isPercent?: boolean
}

function getMetrics(activity: ActivityRecord): Metric[] {
  const d = activity.actualData!
  return [
    { label: "总销售额", expected: activity.expectedSales, actual: d.actualSales, unit: "元" },
    { label: "日均销售额", expected: activity.expectedDailySales, actual: d.actualDailySales, unit: "元" },
    { label: "客流量", expected: activity.expectedTraffic, actual: d.actualTraffic, unit: "人次" },
    { label: "新增会员", expected: activity.expectedNewMembers, actual: d.actualNewMembers, unit: "人" },
    { label: "券核销率", expected: activity.expectedRedemptionRate, actual: d.actualRedemptionRate, unit: "%", isPercent: true },
    { label: "投入产出比", expected: activity.expectedROI, actual: d.actualROI, unit: "", isPercent: true },
  ]
}

function completionRate(expected: number, actual: number): number {
  if (expected <= 0) return actual > 0 ? 100 : 0
  return Math.round((actual / expected) * 100)
}

function getScoreLevel(avgCompletion: number): { label: string; color: string; bg: string } {
  if (avgCompletion >= 120) return { label: "超额完成", color: "text-green-600", bg: "bg-green-50" }
  if (avgCompletion >= 100) return { label: "达标完成", color: "text-blue-600", bg: "bg-blue-50" }
  if (avgCompletion >= 80) return { label: "基本达标", color: "text-amber-600", bg: "bg-amber-50" }
  if (avgCompletion >= 60) return { label: "部分达标", color: "text-orange-600", bg: "bg-orange-50" }
  return { label: "未达标", color: "text-red-600", bg: "bg-red-50" }
}

export const AnalysisReportTemplate = forwardRef<HTMLDivElement, Props>(
  function AnalysisReportTemplate({ activity }, ref) {
    const metrics = getMetrics(activity)
    const completionRates = metrics.map((m) => completionRate(m.expected, m.actual))
    const avgCompletion = Math.round(completionRates.reduce((s, r) => s + r, 0) / completionRates.length)
    const score = getScoreLevel(avgCompletion)

    return (
      <div ref={ref} className="bg-white text-gray-900 p-8 w-[794px] mx-auto" style={{ fontFamily: "system-ui, sans-serif" }}>
        {/* Header */}
        <div data-pdf-section className="text-center mb-8 pb-6 border-b-2 border-blue-600">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">活动效果分析报告</h1>
          <p className="text-sm text-gray-500">{activity.activityName}</p>
          <div className="flex justify-center gap-6 mt-3 text-xs text-gray-500">
            <span>创建时间: {new Date(activity.createdAt).toLocaleDateString("zh-CN")}</span>
            {activity.actualData?.completedAt && (
              <span>完成时间: {new Date(activity.actualData.completedAt).toLocaleDateString("zh-CN")}</span>
            )}
            <span>负责人: {activity.owner || "未指定"}</span>
          </div>
        </div>

        {/* Score summary card */}
        <div data-pdf-section className="mb-8">
          <div className={cn("rounded-xl p-6 text-center", score.bg)}>
            <p className="text-sm text-gray-600 mb-1">活动综合达成率</p>
            <p className={cn("text-4xl font-bold", score.color)}>{avgCompletion}%</p>
            <p className={cn("text-sm font-semibold mt-1", score.color)}>{score.label}</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div data-pdf-section className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4 pb-1 border-b border-gray-200">核心指标概览</h2>
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((m, i) => {
              const rate = completionRates[i]
              const rateColor = rate >= 100 ? "text-green-600" : rate >= 80 ? "text-amber-600" : "text-red-600"
              return (
                <div key={m.label} className="border border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {m.actual.toLocaleString()}{m.isPercent ? "%" : ""}
                  </p>
                  <p className={cn("text-xs font-semibold", rateColor)}>
                    完成率 {rate}%
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Comparison table */}
        <div data-pdf-section className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4 pb-1 border-b border-gray-200">预期 vs 实际对比</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2.5 px-3 font-semibold text-gray-700 border border-gray-200">指标</th>
                <th className="text-right py-2.5 px-3 font-semibold text-gray-700 border border-gray-200">预期值</th>
                <th className="text-right py-2.5 px-3 font-semibold text-gray-700 border border-gray-200">实际值</th>
                <th className="text-right py-2.5 px-3 font-semibold text-gray-700 border border-gray-200">差异</th>
                <th className="text-right py-2.5 px-3 font-semibold text-gray-700 border border-gray-200">完成率</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => {
                const diff = m.actual - m.expected
                const rate = completionRates[i]
                const diffColor = diff >= 0 ? "text-green-600" : "text-red-600"
                const rateColor = rate >= 100 ? "text-green-600" : rate >= 80 ? "text-amber-600" : "text-red-600"
                return (
                  <tr key={m.label}>
                    <td className="py-2 px-3 border border-gray-200 text-gray-700">{m.label}</td>
                    <td className="py-2 px-3 border border-gray-200 text-right">
                      {m.expected.toLocaleString()} {m.unit}
                    </td>
                    <td className="py-2 px-3 border border-gray-200 text-right font-medium">
                      {m.actual.toLocaleString()} {m.unit}
                    </td>
                    <td className={cn("py-2 px-3 border border-gray-200 text-right font-medium", diffColor)}>
                      {diff >= 0 ? "+" : ""}{diff.toLocaleString()} {m.unit}
                    </td>
                    <td className={cn("py-2 px-3 border border-gray-200 text-right font-bold", rateColor)}>
                      {rate}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Bar chart visualization */}
        <div data-pdf-section className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4 pb-1 border-b border-gray-200">指标完成率图表</h2>
          <div className="space-y-3">
            {metrics.map((m, i) => {
              const rate = completionRates[i]
              const barWidth = Math.min(rate, 150)
              const barColor = rate >= 100 ? "bg-blue-500" : rate >= 80 ? "bg-amber-500" : "bg-red-500"
              return (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20 text-right flex-shrink-0">{m.label}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className={cn("h-full rounded-full transition-all", barColor)}
                      style={{ width: `${(barWidth / 150) * 100}%` }}
                    />
                    {/* 100% mark */}
                    <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-gray-400" style={{ left: `${(100 / 150) * 100}%` }} />
                  </div>
                  <span className={cn("text-xs font-bold w-12 text-right", rate >= 100 ? "text-green-600" : rate >= 80 ? "text-amber-600" : "text-red-600")}>
                    {rate}%
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-right">虚线表示100%目标线</p>
        </div>

        {/* Budget info */}
        <div data-pdf-section className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4 pb-1 border-b border-gray-200">预算投入</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500">活动预算</p>
              <p className="text-lg font-bold text-gray-900">¥{activity.planSnapshot.budgetTotal.toLocaleString()}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500">选用方案</p>
              <p className="text-lg font-bold text-gray-900">{activity.planSnapshot.selectedPlanIds.length} 个</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500">宣传方式</p>
              <p className="text-lg font-bold text-gray-900">{activity.planSnapshot.selectedPromotionIds.length} 个</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {activity.actualData?.notes && (
          <div data-pdf-section className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-1 border-b border-gray-200">执行备注</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.actualData.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div data-pdf-section className="pt-4 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-400">
            本报告由系统自动生成 | {new Date().toLocaleDateString("zh-CN")} | 门店竞对活动方案系统
          </p>
        </div>
      </div>
    )
  }
)
