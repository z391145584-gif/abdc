import type { BudgetBreakdown, SubsidyConfig } from "@/data/types"
import { DollarSign, Eye, ClipboardPlus, Save, Percent, Banknote, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  budget: BudgetBreakdown
  subsidy: SubsidyConfig
  onSubsidyChange: (subsidy: SubsidyConfig) => void
  onPreview: () => void
  onCreateActivity: () => void
  onSavePreset: () => void
  canExport: boolean
  editMode?: boolean
}

export function BudgetSummary({ budget, subsidy, onSubsidyChange, onPreview, onCreateActivity, onSavePreset, canExport, editMode }: Props) {
  const hasContent =
    budget.promotionItems.length > 0 ||
    budget.materialItems.length > 0 ||
    budget.productItems.length > 0 ||
    budget.activityProductItems.length > 0

  return (
    <section id="calc-budget" className="scroll-mt-24">
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
            <DollarSign size={18} className="text-secondary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-lg">预算汇总</h2>
            <p className="text-xs text-muted-foreground">根据所选方案自动计算预算</p>
          </div>
        </div>

        {!hasContent ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            请先选择活动方案、宣传方式或物料，预算将自动计算
          </div>
        ) : (
          <div className="space-y-6">
            {/* Promotion budget */}
            {budget.promotionItems.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">宣传预算</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">项目</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budget.promotionItems.map((item) => (
                        <tr key={item.name} className="border-b border-border/50">
                          <td className="py-2 px-3 text-foreground">{item.name}</td>
                          <td className="py-2 px-3 text-right text-foreground">{item.price.toLocaleString()} 元</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td className="py-2 px-3 font-medium text-foreground">小计</td>
                        <td className="py-2 px-3 text-right font-bold text-secondary">
                          {budget.promotionTotal.toLocaleString()} 元
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Material budget */}
            {budget.materialItems.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">物料预算</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">物料</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">规格/数量</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">单价</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budget.materialItems.map((item) => (
                        <tr key={item.name} className="border-b border-border/50">
                          <td className="py-2 px-3 text-foreground">{item.name}</td>
                          <td className="py-2 px-3 text-right text-foreground">
                            {item.billingMode === "size" && item.dimensions ? (
                              <span className="text-xs">
                                {item.dimensions.length}×{item.dimensions.width}cm ({item.dimensions.area.toFixed(2)}m²)
                                {item.qty > 1 && ` ×${item.qty}`}
                              </span>
                            ) : (
                              item.qty
                            )}
                          </td>
                          <td className="py-2 px-3 text-right text-foreground">
                            {item.unitPrice > 0
                              ? `${item.unitPrice} 元${item.billingMode === "size" ? "/m²" : ""}`
                              : "免费"}
                          </td>
                          <td className="py-2 px-3 text-right text-foreground">
                            {item.total > 0 ? `${item.total.toLocaleString()} 元` : "免费"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td colSpan={3} className="py-2 px-3 font-medium text-foreground">小计</td>
                        <td className="py-2 px-3 text-right font-bold text-secondary">
                          {budget.materialTotal.toLocaleString()} 元
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Product budget */}
            {budget.productItems.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">商品预算</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">类别</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">商品</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">数量</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">单价</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budget.productItems.map((item) => (
                        <tr key={item.name} className="border-b border-border/50">
                          <td className="py-2 px-3 text-muted-foreground">{item.category}</td>
                          <td className="py-2 px-3 text-foreground">{item.name}</td>
                          <td className="py-2 px-3 text-right text-foreground">{item.qty}</td>
                          <td className="py-2 px-3 text-right text-foreground">{item.unitCost.toLocaleString()} 元</td>
                          <td className="py-2 px-3 text-right text-foreground">{item.total.toLocaleString()} 元</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td colSpan={4} className="py-2 px-3 font-medium text-foreground">小计</td>
                        <td className="py-2 px-3 text-right font-bold text-secondary">
                          {budget.productTotal.toLocaleString()} 元
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Activity product budget */}
            {budget.activityProductItems.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">活动商品预算</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">分类</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">商品</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">数量</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">成本价</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">零售价</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">成本金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budget.activityProductItems.map((item) => (
                        <tr key={item.name} className="border-b border-border/50">
                          <td className="py-2 px-3 text-muted-foreground">{item.category}</td>
                          <td className="py-2 px-3 text-foreground">{item.name}</td>
                          <td className="py-2 px-3 text-right text-foreground">{item.qty}</td>
                          <td className="py-2 px-3 text-right text-foreground">{item.costPrice.toLocaleString()} 元</td>
                          <td className="py-2 px-3 text-right text-foreground">{item.retailPrice.toLocaleString()} 元</td>
                          <td className="py-2 px-3 text-right text-foreground">{item.total.toLocaleString()} 元</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td colSpan={5} className="py-2 px-3 font-medium text-foreground">小计</td>
                        <td className="py-2 px-3 text-right font-bold text-secondary">
                          {budget.activityProductTotal.toLocaleString()} 元
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Subsidy config */}
            <div className="rounded-xl border border-border p-4 bg-muted/20">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Banknote size={16} className="text-primary" />
                门店补贴
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => onSubsidyChange({ type: "percentage", value: subsidy.type === "percentage" ? subsidy.value : 50 })}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors",
                      subsidy.type === "percentage"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Percent size={12} />
                    比例补贴
                  </button>
                  <button
                    onClick={() => onSubsidyChange({ type: "fixed", value: subsidy.type === "fixed" ? subsidy.value : 0 })}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors",
                      subsidy.type === "fixed"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Banknote size={12} />
                    固定补贴
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {subsidy.type === "percentage" ? (
                    <>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={subsidy.value}
                        onChange={(e) => onSubsidyChange({ type: "percentage", value: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
                        className="w-20 px-2 py-1.5 text-sm text-center rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </>
                  ) : (
                    <>
                      <input
                        type="number"
                        min={0}
                        value={subsidy.value}
                        onChange={(e) => onSubsidyChange({ type: "fixed", value: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-28 px-2 py-1.5 text-sm text-center rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-sm text-muted-foreground">元</span>
                    </>
                  )}
                </div>
                {budget.grandTotal > 0 && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    补贴金额: {budget.subsidyAmount.toLocaleString()} 元
                  </span>
                )}
              </div>
            </div>

            {/* Grand total */}
            <div className="rounded-xl gradient-primary p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary-foreground/80 text-sm">总计</span>
                <span className="text-primary-foreground text-xl font-bold">
                  {budget.grandTotal.toLocaleString()} 元
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-foreground/80 text-sm">
                  {subsidy.type === "percentage" ? `${subsidy.value}% 补贴后` : "补贴后"}
                </span>
                <span className="text-primary-foreground text-2xl font-bold">
                  {budget.subsidizedTotal.toLocaleString()} 元
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={onCreateActivity}
                disabled={!canExport}
                className="py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm inline-flex items-center justify-center gap-2 transition-spring hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {editMode ? <Save size={18} /> : <ClipboardPlus size={18} />}
                {editMode ? "更新活动" : "创建活动"}
              </button>
              <button
                onClick={onSavePreset}
                disabled={!hasContent}
                className="py-3 rounded-xl border-2 border-primary text-primary font-semibold text-sm inline-flex items-center justify-center gap-2 transition-spring hover:scale-[1.02] hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Bookmark size={18} />
                保存方案
              </button>
              <button
                onClick={onPreview}
                disabled={!canExport}
                className="py-3 rounded-xl gradient-accent text-secondary-foreground font-semibold text-sm inline-flex items-center justify-center gap-2 transition-spring hover:scale-[1.02] shadow-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Eye size={18} />
                预览方案
              </button>
            </div>
            {!canExport && (
              <p className="text-xs text-muted-foreground text-center">
                请填写门店名称并至少选择一个活动方案后操作
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
