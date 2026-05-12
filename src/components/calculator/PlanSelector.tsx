import { cn } from "@/lib/utils"
import { getPlans, getActivityProducts } from "@/data/store"
import { getIcon } from "@/data/icons"
import { Layers, Check, Minus, Plus, ShoppingCart } from "lucide-react"
import type { ActivityProductData } from "@/data/types"

interface Props {
  selectedIds: string[]
  onToggle: (planId: string) => void
  activityProductQtys: Record<string, number>
  onSetActivityProductQty: (productId: string, qty: number) => void
}

export function PlanSelector({ selectedIds, onToggle, activityProductQtys, onSetActivityProductQty }: Props) {
  const plans = getPlans()
  const allActivityProducts = getActivityProducts()

  return (
    <section id="calc-plans" className="scroll-mt-24">
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Layers size={18} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-lg">活动方案选择</h2>
            <p className="text-xs text-muted-foreground">可多选，线上线下方案可组合搭配</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const selected = selectedIds.includes(plan.id)
            const isOnline = plan.type === "online"
            const Icon = getIcon(plan.iconName)

            // Get linked activity products for this plan
            const linkedProducts: ActivityProductData[] = (plan.linkedActivityProductIds ?? [])
              .map((id) => allActivityProducts.find((p) => p.id === id))
              .filter((p): p is ActivityProductData => p != null)

            return (
              <div key={plan.id} className="flex flex-col">
                <button
                  onClick={() => onToggle(plan.id)}
                  className={cn(
                    "relative text-left p-4 rounded-xl border-2 transition-smooth",
                    selected
                      ? isOnline
                        ? "border-online bg-online-muted/50"
                        : "border-offline bg-offline-muted/50"
                      : "border-border hover:border-muted-foreground/30 bg-background",
                    selected && linkedProducts.length > 0 && "rounded-b-none border-b-0"
                  )}
                >
                  {/* Checkmark */}
                  {selected && (
                    <div
                      className={cn(
                        "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center",
                        isOnline ? "gradient-primary" : "gradient-accent"
                      )}
                    >
                      <Check size={14} className="text-primary-foreground" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                        isOnline ? "bg-online-muted text-online" : "bg-offline-muted text-offline"
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            isOnline ? "bg-online-muted text-online" : "bg-offline-muted text-offline"
                          )}
                        >
                          {isOnline ? "线上" : "线下"}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground text-sm mb-1">{plan.title}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                      {plan.estimatedCost !== undefined && plan.estimatedCost > 0 && (
                        <p className="text-xs font-semibold text-secondary mt-1.5">
                          预估费用：{plan.estimatedCost.toLocaleString()} 元
                        </p>
                      )}
                      {selected && linkedProducts.length > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <ShoppingCart size={11} />
                          含 {linkedProducts.length} 项活动商品
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {/* Linked activity products detail - shown when plan is selected */}
                {selected && linkedProducts.length > 0 && (
                  <div
                    className={cn(
                      "border-2 border-t-0 rounded-b-xl p-3 space-y-2",
                      isOnline ? "border-online bg-online-muted/20" : "border-offline bg-offline-muted/20"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShoppingCart size={12} className="text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">活动商品明细</span>
                    </div>
                    {linkedProducts.map((product) => {
                      const qty = activityProductQtys[product.id] ?? product.defaultQty
                      const total = qty * product.costPrice
                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 bg-background/60 rounded-lg px-3 py-2"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {product.category}
                              </span>
                              <span className="text-sm font-medium text-foreground truncate">
                                {product.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>成本 {product.costPrice} 元</span>
                              <span>零售 {product.retailPrice} 元</span>
                              <span className="font-medium text-secondary">
                                小计 {total.toLocaleString()} 元
                              </span>
                            </div>
                          </div>
                          {/* Quantity controls */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (qty > 1) onSetActivityProductQty(product.id, qty - 1)
                              }}
                              className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth disabled:opacity-40"
                              disabled={qty <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={qty}
                              onChange={(e) => {
                                const v = parseInt(e.target.value)
                                if (v > 0) onSetActivityProductQty(product.id, v)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-14 h-7 text-center text-sm font-medium border border-border rounded-md bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onSetActivityProductQty(product.id, qty + 1)
                              }}
                              className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
