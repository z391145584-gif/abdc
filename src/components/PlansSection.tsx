import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Smartphone, Store } from "lucide-react"
import { getPlans } from "@/data/store"
import { getIcon } from "@/data/icons"
import type { PlanData, PlanType } from "@/data/types"

function PlanCard({ plan }: { plan: PlanData }) {
  const [expanded, setExpanded] = useState(false)
  const isOnline = plan.type === "online"
  const Icon = getIcon(plan.iconName)

  return (
    <Card
      className={cn(
        "group transition-smooth cursor-pointer hover:shadow-card-hover border",
        isOnline ? "hover:border-online/30" : "hover:border-offline/30"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-smooth",
              isOnline
                ? "bg-online-muted text-online group-hover:gradient-primary group-hover:text-primary-foreground"
                : "bg-offline-muted text-offline group-hover:gradient-accent group-hover:text-secondary-foreground"
            )}
          >
            <Icon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  isOnline
                    ? "bg-online-muted text-online"
                    : "bg-offline-muted text-offline"
                )}
              >
                {isOnline ? "线上" : "线下"}
              </span>
            </div>
            <CardTitle className="text-base">{plan.title}</CardTitle>
            <CardDescription className="mt-1">{plan.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {plan.details.map((detail, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span
                className={cn(
                  "flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5",
                  isOnline ? "bg-online/60" : "bg-offline/60"
                )}
              />
              {detail}
            </li>
          ))}
        </ul>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
            {plan.cost && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">费用估算：</span>
                <span className="text-secondary font-semibold">{plan.cost}</span>
              </div>
            )}
            {plan.note && (
              <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                <span className="font-medium">注：</span>
                {plan.note}
              </div>
            )}
            {plan.example && (
              <div className="text-xs text-muted-foreground bg-accent rounded-lg p-3">
                <span className="font-medium">举例：</span>
                {plan.example}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 text-xs text-muted-foreground text-center">
          {expanded ? "点击收起" : "点击展开详情"}
        </div>
      </CardContent>
    </Card>
  )
}

export function PlansSection() {
  const [activeTab, setActiveTab] = useState<PlanType | "all">("all")

  const plans = getPlans()
  const filteredPlans = activeTab === "all"
    ? plans
    : plans.filter((p) => p.type === activeTab)

  return (
    <section id="plans" className="py-20 gradient-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <Smartphone size={14} />
            <Store size={14} />
            活动方案
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            线上线下活动方案
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            下列活动可组合搭配，个别活动商品与金额可调整，以门店实际沟通为准
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted">
            {(["all", "online", "offline"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium transition-smooth",
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "all" ? "全部方案" : tab === "online" ? "线上方案" : "线下方案"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )
}