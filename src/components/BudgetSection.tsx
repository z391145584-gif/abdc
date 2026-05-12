import { useState } from "react"
import { cn } from "@/lib/utils"
import { DollarSign, Package, ShoppingBag, Megaphone } from "lucide-react"

type BudgetTab = "promotion" | "material" | "product"

interface TableRow {
  cells: string[]
  highlight?: boolean
}

interface BudgetTable {
  key: BudgetTab
  label: string
  icon: React.ReactNode
  headers: string[]
  rows: TableRow[]
  total: string
}

const budgetData: BudgetTable[] = [
  {
    key: "promotion",
    label: "宣传预算",
    icon: <Megaphone size={18} />,
    headers: ["类别", "内容", "价格", "日期/数量", "补贴比例", "总价"],
    rows: [
      { cells: ["宣传", "宣传车（早上8点-晚上9:30）", "1,200", "1天", "50%", "1,200"] },
      { cells: ["宣传", "腰鼓队（一天）", "80元/人", "15人", "50%", "1,200"] },
      { cells: ["宣传", "舞台", "/", "1", "50%", "9,000"] },
    ],
    total: "11,400",
  },
  {
    key: "material",
    label: "物料预算",
    icon: <Package size={18} />,
    headers: ["类别", "物料名称", "单价", "数量", "总价"],
    rows: [
      { cells: ["一次性物料", "活动展架画面 177mm*70mm", "60", "2", "120"] },
      { cells: ["一次性物料", "红毯", "-", "1", "80-100"] },
      { cells: ["一次性物料", "DM单", "800元", "10,000", "800"] },
      { cells: ["一次性物料", "抽奖箱（含贴纸）", "200", "1", "200"] },
      { cells: ["一次性物料", "赠品KT板", "20/m\u00b2", "约6块", "120"] },
      { cells: ["一次性物料", "横幅", "10/米", "1", "80"] },
      { cells: ["一次性物料", "桌子挡板", "20/m\u00b2", "2套", "80"] },
      { cells: ["循环物料", "帐篷 / 音响 / 大刀旗 / 收银机 / 折叠桌", "0", "若干", "0"] },
    ],
    total: "1,500",
  },
  {
    key: "product",
    label: "商品预算",
    icon: <ShoppingBag size={18} />,
    headers: ["类别", "商品名称", "进货价/差价", "数量", "补贴比例", "总价"],
    rows: [
      { cells: ["满赠", "吾尚乳酸菌一排", "11.2", "800", "50%", "8,960"] },
      { cells: ["满赠", "可口可乐一提", "9.42", "500", "50%", "4,710"] },
      { cells: ["满赠", "蒙牛真果粒一箱", "27", "100", "50%", "2,700"] },
      { cells: ["抽奖", "白象方便面5连包", "8.7", "100", "50%", "870"] },
      { cells: ["抽奖", "大霸王鸭脖子一根", "3.1", "100", "50%", "310"] },
      { cells: ["抽奖", "大展宏图大礼包一袋", "17", "50", "50%", "850"] },
      { cells: ["抽奖", "爱尚咪咪虾条70g", "1.5", "200", "50%", "300"] },
      { cells: ["换购", "新希望小白袋1件", "7.5", "200", "50%", "1,500"] },
      { cells: ["换购", "伊利纯牛奶200ml*24", "6.1", "200", "50%", "1,220"] },
      { cells: ["换购", "娃哈哈AD钙1板", "1.7", "500", "50%", "850"] },
    ],
    total: "22,270",
  },
]

function BudgetTableComponent({ table }: { table: BudgetTable }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {table.headers.map((h, i) => (
              <th
                key={i}
                className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                "border-b border-border/50 transition-base hover:bg-accent/50",
                row.highlight && "bg-accent/30"
              )}
            >
              {row.cells.map((cell, j) => (
                <td key={j} className="py-3 px-4 text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/50">
            <td
              colSpan={table.headers.length - 1}
              className="py-3 px-4 font-semibold text-foreground"
            >
              合计金额
            </td>
            <td className="py-3 px-4 font-bold text-secondary text-lg">
              {table.total} 元
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export function BudgetSection() {
  const [activeTab, setActiveTab] = useState<BudgetTab>("promotion")
  const activeTable = budgetData.find((t) => t.key === activeTab)!

  return (
    <section id="budget" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <DollarSign size={14} />
            预算参考
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            预算参考明细
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            包含宣传预算、物料预算和商品预算三大类，总预算约 17,585 元（50%补贴后）
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {budgetData.map((table) => (
            <button
              key={table.key}
              onClick={() => setActiveTab(table.key)}
              className={cn(
                "p-5 rounded-xl border text-left transition-smooth",
                activeTab === table.key
                  ? "bg-card border-primary/30 shadow-card-hover"
                  : "bg-card border-border hover:border-primary/20 shadow-card hover:shadow-card-hover"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-smooth",
                    activeTab === table.key
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {table.icon}
                </div>
                <span className="font-semibold text-foreground">{table.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {table.total}
                <span className="text-sm font-normal text-muted-foreground ml-1">元</span>
              </div>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            {activeTable.icon}
            <h3 className="font-semibold text-foreground">{activeTable.label}明细</h3>
          </div>
          <BudgetTableComponent table={activeTable} />
        </div>

        {/* Total */}
        <div className="mt-6 p-6 rounded-xl gradient-primary">
          <div className="flex items-center justify-between">
            <span className="text-primary-foreground text-lg font-medium">
              总金额（50%补贴后）
            </span>
            <span className="text-primary-foreground text-3xl font-bold">
              17,585 元
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}