import { forwardRef } from "react"
import type { CalculatorState, BudgetBreakdown } from "@/data/types"
import { getPlans, getMaterials } from "@/data/store"
import { processSteps } from "@/data/process"

interface Props {
  state: CalculatorState
  budget: BudgetBreakdown
  preview?: boolean
}

export const PdfTemplate = forwardRef<HTMLDivElement, Props>(({ state, budget, preview }, ref) => {
  const allPlans = getPlans()
  const allMaterials = getMaterials()
  const selectedPlans = allPlans.filter((p) => state.selectedPlanIds.includes(p.id))
  const selectedMaterialsList = Object.entries(state.selectedMaterials)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const m = allMaterials.find((x) => x.id === id)!
      return { ...m, qty }
    })

  return (
    <div
      ref={ref}
      style={{
        ...(preview
          ? { width: "794px", margin: "0 auto" }
          : { position: "absolute", left: "-9999px", top: 0, width: "794px" }),
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif",
        background: "#fff",
        color: "#1a1a2e",
        padding: "40px",
        lineHeight: 1.6,
      }}
    >
      {/* Header */}
      <div data-pdf-section style={{ textAlign: "center", marginBottom: "32px", borderBottom: "3px solid #3b82f6", paddingBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1e40af", margin: "0 0 16px 0" }}>
          门店竞对活动方案
        </h1>
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", fontSize: "14px", color: "#64748b" }}>
          <span>门店：{state.storeInfo.storeName || "-"}</span>
          <span>督导：{state.storeInfo.supervisorName || "-"}</span>
          <span>区域经理：{state.storeInfo.regionalManagerName || "-"}</span>
        </div>
        {(state.storeInfo.startDate || state.storeInfo.endDate) && (
          <div style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>
            活动时间：{state.storeInfo.startDate || "-"} 至 {state.storeInfo.endDate || "-"}
          </div>
        )}
      </div>

      {/* Selected Plans */}
      {selectedPlans.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div data-pdf-section>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1e40af", marginBottom: "12px", borderLeft: "4px solid #3b82f6", paddingLeft: "12px" }}>
              活动方案
            </h2>
          </div>
          {selectedPlans.map((plan) => (
            <div data-pdf-section key={plan.id} style={{ marginBottom: "16px", padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
              <div style={{ marginBottom: "8px" }}>
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "12px",
                  background: plan.type === "online" ? "#dbeafe" : "#ffedd5",
                  color: plan.type === "online" ? "#1d4ed8" : "#c2410c",
                  display: "inline-block", marginRight: "8px", verticalAlign: "middle",
                }}>
                  {plan.type === "online" ? "线上" : "线下"}
                </span>
                <span style={{ fontSize: "15px", fontWeight: 600, verticalAlign: "middle" }}>{plan.title}</span>
              </div>
              <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "13px", color: "#475569" }}>
                {plan.details.map((d, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>{d}</li>
                ))}
              </ul>
              {plan.note && (
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px", padding: "8px", background: "#f8fafc", borderRadius: "4px" }}>
                  注：{plan.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Budget Tables */}
      <div style={{ marginBottom: "28px" }}>
        <div data-pdf-section>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1e40af", marginBottom: "12px", borderLeft: "4px solid #3b82f6", paddingLeft: "12px" }}>
            预算明细
          </h2>
        </div>

        {budget.promotionItems.length > 0 && (
          <div data-pdf-section style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>宣传预算</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>项目</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>金额</th>
                </tr>
              </thead>
              <tbody>
                {budget.promotionItems.map((item) => (
                  <tr key={item.name}>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9" }}>{item.name}</td>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>{item.price.toLocaleString()} 元</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f8fafc" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>小计</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#ea580c" }}>{budget.promotionTotal.toLocaleString()} 元</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {budget.materialItems.length > 0 && (
          <div data-pdf-section style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>物料预算</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>物料</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>数量</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>金额</th>
                </tr>
              </thead>
              <tbody>
                {budget.materialItems.map((item) => (
                  <tr key={item.name}>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9" }}>{item.name}</td>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>{item.qty}</td>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>{item.total > 0 ? `${item.total.toLocaleString()} 元` : "免费"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f8fafc" }}>
                  <td colSpan={2} style={{ padding: "8px 12px", fontWeight: 600 }}>小计</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#ea580c" }}>{budget.materialTotal.toLocaleString()} 元</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {budget.productItems.length > 0 && (
          <div data-pdf-section style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>商品预算</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>类别</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>商品</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>数量</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>金额</th>
                </tr>
              </thead>
              <tbody>
                {budget.productItems.map((item) => (
                  <tr key={item.name}>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{item.category}</td>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9" }}>{item.name}</td>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>{item.qty}</td>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>{item.total.toLocaleString()} 元</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f8fafc" }}>
                  <td colSpan={3} style={{ padding: "8px 12px", fontWeight: 600 }}>小计</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#ea580c" }}>{budget.productTotal.toLocaleString()} 元</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {budget.activityProductItems.length > 0 && (
          <div data-pdf-section style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>活动商品预算</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>分类</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>商品</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>数量</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>成本价</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>零售价</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>成本金额</th>
                </tr>
              </thead>
              <tbody>
                {budget.activityProductItems.map((item) => (
                  <tr key={item.name}>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{item.category}</td>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9" }}>{item.name}</td>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>{item.qty}</td>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>{item.costPrice.toLocaleString()} 元</td>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>{item.retailPrice.toLocaleString()} 元</td>
                    <td style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>{item.total.toLocaleString()} 元</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f8fafc" }}>
                  <td colSpan={5} style={{ padding: "8px 12px", fontWeight: 600 }}>小计</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#ea580c" }}>{budget.activityProductTotal.toLocaleString()} 元</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Grand total */}
        <div data-pdf-section style={{ padding: "16px 20px", background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", borderRadius: "8px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "13px", opacity: 0.8 }}>总计：{budget.grandTotal.toLocaleString()} 元</div>
            <div style={{ fontSize: "18px", fontWeight: 700 }}>补贴后：{budget.subsidizedTotal.toLocaleString()} 元</div>
          </div>
        </div>
      </div>

      {/* Materials list */}
      {selectedMaterialsList.length > 0 && (
        <div data-pdf-section style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1e40af", marginBottom: "12px", borderLeft: "4px solid #3b82f6", paddingLeft: "12px" }}>
            物料清单
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {selectedMaterialsList.map((m) => (
              <span key={m.id} style={{ padding: "4px 12px", background: "#f1f5f9", borderRadius: "6px", fontSize: "13px" }}>
                {m.name} x {m.qty}{m.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Process checklist */}
      <div data-pdf-section style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1e40af", marginBottom: "12px", borderLeft: "4px solid #3b82f6", paddingLeft: "12px" }}>
          执行流程清单
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid #e2e8f0" }}>阶段</th>
              <th style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid #e2e8f0" }}>时间</th>
              <th style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid #e2e8f0" }}>事项</th>
              <th style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid #e2e8f0" }}>执行</th>
              <th style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid #e2e8f0" }}>检定</th>
            </tr>
          </thead>
          <tbody>
            {processSteps.map((step, i) => (
              <tr key={i}>
                <td style={{ padding: "5px 10px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{step.phase}</td>
                <td style={{ padding: "5px 10px", borderBottom: "1px solid #f1f5f9" }}>{step.time}</td>
                <td style={{ padding: "5px 10px", borderBottom: "1px solid #f1f5f9" }}>{step.task}</td>
                <td style={{ padding: "5px 10px", borderBottom: "1px solid #f1f5f9" }}>{step.executor}</td>
                <td style={{ padding: "5px 10px", borderBottom: "1px solid #f1f5f9" }}>{step.checker}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div data-pdf-section style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", fontSize: "11px", color: "#94a3b8", textAlign: "center" }}>
        <p>生成日期：{new Date().toLocaleDateString("zh-CN")} | 以门店实际沟通为准</p>
      </div>
    </div>
  )
})
