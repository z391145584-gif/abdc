import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getActivities, saveActivities, updateActivity } from "@/data/store"
import type { ActivityRecord, ActivityStatus } from "@/data/types"
import {
  Eye, TrendingUp, Users, Target, Calendar, AlertCircle,
  ClipboardEdit, BarChart3, CheckCircle2, Pencil, Play,
  Clock, FileText, Archive, ClipboardList, Calculator
} from "lucide-react"
import { cn } from "@/lib/utils"
import { computeActivityStatus } from "@/lib/activityStatus"
import { useAuth } from "@/hooks/useAuth"
import { ActualDataModal } from "@/components/activity/ActualDataModal"
import { AnalysisReportModal } from "@/components/activity/AnalysisReportModal"
import { EditActivityModal } from "@/components/activity/EditActivityModal"
import { ActivityPreviewModal } from "@/components/activity/ActivityPreviewModal"

const STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "待开始", color: "bg-slate-100 text-slate-700", icon: Clock },
  active: { label: "进行中", color: "bg-blue-50 text-blue-700", icon: Play },
  awaiting_input: { label: "待录入数据", color: "bg-amber-50 text-amber-700", icon: ClipboardList },
  completed: { label: "已结束", color: "bg-green-50 text-green-700", icon: CheckCircle2 },
}

type FilterStatus = "all" | ActivityStatus

export function ActivitiesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null)
  const [editingActual, setEditingActual] = useState<ActivityRecord | null>(null)
  const [viewingReport, setViewingReport] = useState<ActivityRecord | null>(null)
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null)
  const [previewingActivity, setPreviewingActivity] = useState<ActivityRecord | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    setActivities(getActivities())
  }, [])

  // 每分钟更新一次，驱动倒计时刷新
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  // 数据隔离：只显示当前用户创建的活动
  const currentUserId = user?.id || "anonymous"
  const userActivities = activities.filter(
    (a) => !a.creatorId || a.creatorId === currentUserId
  )

  // 根据日期自动计算每条活动的当前状态
  const normalizedActivities = userActivities.map((a) => ({
    ...a,
    status: computeActivityStatus(a),
    updatedAt: a.updatedAt || a.createdAt,
  }))

  const filteredActivities = filterStatus === "all"
    ? normalizedActivities
    : normalizedActivities.filter((a) => a.status === filterStatus)

  function handleSaveEdit(activity: ActivityRecord, updates: Partial<ActivityRecord>) {
    if (activity.creatorId && activity.creatorId !== currentUserId) return
    const updated = updateActivity(activity.id, updates)
    setActivities(updated)
    setEditingActivity(null)
  }

  function handleSaveActualData(activity: ActivityRecord, data: ActivityRecord["actualData"]) {
    if (activity.creatorId && activity.creatorId !== currentUserId) return
    const updated = activities.map((a) =>
      a.id === activity.id ? { ...a, actualData: data, updatedAt: new Date().toISOString() } : a
    )
    saveActivities(updated)
    setActivities(updated)
    setEditingActual(null)
  }

  function isOwner(activity: ActivityRecord): boolean {
    return !activity.creatorId || activity.creatorId === currentUserId
  }

  const statusCounts = {
    all: normalizedActivities.length,
    pending: normalizedActivities.filter((a) => a.status === "pending").length,
    active: normalizedActivities.filter((a) => a.status === "active").length,
    awaiting_input: normalizedActivities.filter((a) => a.status === "awaiting_input").length,
    completed: normalizedActivities.filter((a) => a.status === "completed").length,
  }

  return (
    <div className="container mx-auto px-6 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">活动管理</h1>
        <p className="text-muted-foreground mt-1">跟踪和管理您创建的竞对活动，状态根据活动日期自动流转</p>
      </div>

      {/* Status filter tabs */}
      {normalizedActivities.length > 0 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {([
            { key: "all" as FilterStatus, label: "全部" },
            { key: "pending" as FilterStatus, label: "待开始" },
            { key: "active" as FilterStatus, label: "进行中" },
            { key: "awaiting_input" as FilterStatus, label: "待录入数据" },
            { key: "completed" as FilterStatus, label: "已结束" },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth",
                filterStatus === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              {label} ({statusCounts[key]})
            </button>
          ))}
        </div>
      )}

      {normalizedActivities.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg">暂无活动记录</p>
          <p className="text-sm mt-1">在方案计算器中创建活动后，将在此处展示</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Archive size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-base">当前筛选条件下无活动记录</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredActivities.map((activity) => {
            const hasActual = !!activity.actualData
            const statusConf = STATUS_CONFIG[activity.status]
            const StatusIcon = statusConf.icon
            const canEdit = isOwner(activity)
            const countdown = activity.status === "pending"
              ? formatCountdown(now, activity.startDate, "start")
              : activity.status === "active"
                ? formatCountdown(now, activity.endDate, "end")
                : null

            return (
              <div
                key={activity.id}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-card transition-smooth"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-base truncate">{activity.activityName}</h3>
                      {/* Status badge */}
                      <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", statusConf.color)}>
                        <StatusIcon size={11} />
                        {statusConf.label}
                      </span>
                      {/* Countdown */}
                      {countdown && (
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <Clock size={11} />
                          {countdown}
                        </span>
                      )}
                      {/* Date range */}
                      {(activity.startDate || activity.endDate) && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} />
                          {activity.startDate || "?"} ~ {activity.endDate || "?"}
                        </span>
                      )}
                      {hasActual && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                          <CheckCircle2 size={11} />
                          已录入实际数据
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={13} />
                        预期销售 ¥{activity.expectedSales.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} />
                        预期客流 {activity.expectedTraffic}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target size={13} />
                        ROI {activity.expectedROI}%
                      </span>
                      {activity.owner && <span>负责人: {activity.owner}</span>}
                    </div>

                    {/* Show actual results summary if available */}
                    {hasActual && (
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <span className={cn("flex items-center gap-1", activity.actualData!.actualSales >= activity.expectedSales ? "text-green-600" : "text-red-600")}>
                          <TrendingUp size={13} />
                          实际 ¥{activity.actualData!.actualSales.toLocaleString()}
                        </span>
                        <span className={cn("flex items-center gap-1", activity.actualData!.actualTraffic >= activity.expectedTraffic ? "text-green-600" : "text-red-600")}>
                          <Users size={13} />
                          实际 {activity.actualData!.actualTraffic} 人
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ml-4 shrink-0 flex-wrap">
                    {/* Preview plan */}
                    <button
                      onClick={() => setPreviewingActivity(activity)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                      title="预览方案"
                    >
                      <FileText size={16} />
                    </button>
                    {/* View details */}
                    <button
                      onClick={() => setSelectedActivity(activity)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                      title="查看详情"
                    >
                      <Eye size={16} />
                    </button>
                    {/* Edit activity - only for owner */}
                    {canEdit && (
                      <button
                        onClick={() => setEditingActivity(activity)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth"
                        title="编辑活动"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {/* Edit calculator plan - only for owner */}
                    {canEdit && (
                      <button
                        onClick={() => navigate("/calculator", { state: { editActivity: activity } })}
                        className="p-2 rounded-lg text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-smooth"
                        title="编辑方案计算器"
                      >
                        <Calculator size={16} />
                      </button>
                    )}
                    {/* Enter actual data - available when awaiting_input or completed, only for owner */}
                    {canEdit && (activity.status === "awaiting_input" || activity.status === "completed") && (
                      <button
                        onClick={() => setEditingActual(activity)}
                        className={cn(
                          "p-2 rounded-lg transition-smooth",
                          activity.status === "awaiting_input"
                            ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        )}
                        title={hasActual ? "修改实际数据" : "录入实际数据"}
                      >
                        <ClipboardEdit size={16} />
                      </button>
                    )}
                    {/* View report - only when actual data exists */}
                    {hasActual && (
                      <button
                        onClick={() => setViewingReport(activity)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-online hover:bg-online/10 transition-smooth"
                        title="查看分析报告"
                      >
                        <BarChart3 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedActivity && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedActivity(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">{selectedActivity.activityName}</h2>
            <div className="space-y-4">
              <Section title="基础信息">
                <InfoRow label="活动状态" value={STATUS_CONFIG[selectedActivity.status]?.label ?? "未知"} />
                <InfoRow label="开始日期" value={selectedActivity.startDate || "-"} />
                <InfoRow label="结束日期" value={selectedActivity.endDate || "-"} />
                <InfoRow label="活动目的" value={selectedActivity.purpose || "-"} />
                <InfoRow label="竞争对手" value={selectedActivity.competitor || "-"} />
                <InfoRow label="负责人" value={selectedActivity.owner || "-"} />
                <InfoRow label="创建时间" value={new Date(selectedActivity.createdAt).toLocaleString("zh-CN")} />
              </Section>
              <Section title="预期销售">
                <InfoRow label="预期总销售额" value={`¥${selectedActivity.expectedSales.toLocaleString()}`} />
                <InfoRow label="预期日均销售" value={`¥${selectedActivity.expectedDailySales.toLocaleString()}`} />
              </Section>
              <Section title="客流/会员">
                <InfoRow label="预期客流量" value={`${selectedActivity.expectedTraffic} 人`} />
                <InfoRow label="预期新增会员" value={`${selectedActivity.expectedNewMembers} 人`} />
              </Section>
              <Section title="核销/ROI">
                <InfoRow label="预期核销率" value={`${selectedActivity.expectedRedemptionRate}%`} />
                <InfoRow label="预期ROI" value={`${selectedActivity.expectedROI}%`} />
              </Section>
              <Section title="预算快照">
                <InfoRow label="预算总计" value={`¥${selectedActivity.planSnapshot.budgetTotal.toLocaleString()}`} />
                <InfoRow label="选择方案数" value={`${selectedActivity.planSnapshot.selectedPlanIds.length} 个`} />
                <InfoRow label="宣传方式数" value={`${selectedActivity.planSnapshot.selectedPromotionIds.length} 个`} />
              </Section>
              {selectedActivity.actualData && (
                <Section title="实际数据">
                  <InfoRow label="实际总销售额" value={`¥${selectedActivity.actualData.actualSales.toLocaleString()}`} />
                  <InfoRow label="实际日均销售" value={`¥${selectedActivity.actualData.actualDailySales.toLocaleString()}`} />
                  <InfoRow label="实际客流量" value={`${selectedActivity.actualData.actualTraffic} 人`} />
                  <InfoRow label="实际新增会员" value={`${selectedActivity.actualData.actualNewMembers} 人`} />
                  <InfoRow label="实际核销率" value={`${selectedActivity.actualData.actualRedemptionRate}%`} />
                  <InfoRow label="实际ROI" value={`${selectedActivity.actualData.actualROI}%`} />
                  {selectedActivity.actualData.notes && (
                    <InfoRow label="备注" value={selectedActivity.actualData.notes} />
                  )}
                </Section>
              )}
            </div>
            <button
              onClick={() => setSelectedActivity(null)}
              className="mt-6 w-full py-2.5 rounded-lg bg-accent text-foreground font-medium hover:bg-accent/80 transition-smooth"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onSave={(updates) => handleSaveEdit(editingActivity, updates)}
          onClose={() => setEditingActivity(null)}
        />
      )}

      {/* Activity Preview Modal */}
      {previewingActivity && (
        <ActivityPreviewModal
          activity={previewingActivity}
          onClose={() => setPreviewingActivity(null)}
        />
      )}

      {/* Actual Data Modal */}
      {editingActual && (
        <ActualDataModal
          activity={editingActual}
          onSave={(data) => handleSaveActualData(editingActual, data)}
          onClose={() => setEditingActual(null)}
        />
      )}

      {/* Analysis Report Modal */}
      {viewingReport && (
        <AnalysisReportModal
          activity={viewingReport}
          onClose={() => setViewingReport(null)}
        />
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function formatCountdown(now: Date, targetDate: string, type: "start" | "end"): string | null {
  if (!targetDate) return null
  const target = type === "start"
    ? new Date(targetDate + "T00:00:00")
    : new Date(targetDate + "T23:59:59")
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return null
  const totalHours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const prefix = type === "start" ? "距离开始" : "距离结束"
  if (days > 0) {
    return `${prefix} ${days} 天 ${hours} 小时`
  }
  return `${prefix} ${hours} 小时`
}
