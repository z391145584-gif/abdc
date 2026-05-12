import { cn } from "@/lib/utils"
import { Building2, Layers, Megaphone, Package, DollarSign } from "lucide-react"
import type { BudgetBreakdown } from "@/data/types"

const steps = [
  { id: "calc-store", label: "门店信息", icon: Building2 },
  { id: "calc-plans", label: "活动方案", icon: Layers },
  { id: "calc-promo", label: "宣传方式", icon: Megaphone },
  { id: "calc-material", label: "物料选择", icon: Package },
  { id: "calc-budget", label: "预算汇总", icon: DollarSign },
]

interface Props {
  activeSection: string
  budget?: BudgetBreakdown
}

export function CalculatorSidebar({ activeSection, budget }: Props) {
  return (
    <div>
      <nav className="hidden lg:flex flex-col gap-1 bg-card rounded-xl border border-border shadow-card p-3">
        {steps.map((step) => {
          const active = activeSection === step.id
          return (
            <a
              key={step.id}
              href={`#${step.id}`}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <step.icon size={16} />
              {step.label}
            </a>
          )
        })}
      </nav>

      {/* Budget mini panel - desktop only */}
      {budget && (
        <div className="hidden lg:block mt-3 bg-card rounded-xl border border-border shadow-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">费用汇总</h3>
          <div className="space-y-2 text-sm">
            {budget.promotionTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">宣传</span>
                <span className="font-medium text-foreground">{budget.promotionTotal.toLocaleString()}</span>
              </div>
            )}
            {budget.materialTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">物料</span>
                <span className="font-medium text-foreground">{budget.materialTotal.toLocaleString()}</span>
              </div>
            )}
            {budget.productTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">商品</span>
                <span className="font-medium text-foreground">{budget.productTotal.toLocaleString()}</span>
              </div>
            )}
            {budget.activityProductTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">活动商品</span>
                <span className="font-medium text-foreground">{budget.activityProductTotal.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-muted-foreground">总计</span>
              <span className="text-base font-bold text-foreground">{budget.grandTotal.toLocaleString()} 元</span>
            </div>
            {budget.subsidyAmount > 0 && (
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xs text-muted-foreground">补贴后</span>
                <span className="text-sm font-bold text-primary">{budget.subsidizedTotal.toLocaleString()} 元</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile horizontal bar */}
      <div className="lg:hidden flex gap-1 overflow-x-auto pb-2 -mx-2 px-2">
        {steps.map((step) => {
          const active = activeSection === step.id
          return (
            <a
              key={step.id}
              href={`#${step.id}`}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-smooth",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <step.icon size={14} />
              {step.label}
            </a>
          )
        })}
      </div>
    </div>
  )
}