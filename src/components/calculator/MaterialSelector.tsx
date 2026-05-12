import { cn } from "@/lib/utils"
import { getMaterials } from "@/data/store"
import { Package, Ruler } from "lucide-react"

interface Props {
  selectedMaterials: Record<string, number>
  materialDimensions: Record<string, { length: number; width: number }>
  onSetMaterial: (materialId: string, qty: number) => void
  onSetDimensions: (materialId: string, length: number, width: number) => void
}

export function MaterialSelector({ selectedMaterials, materialDimensions, onSetMaterial, onSetDimensions }: Props) {
  const materials = getMaterials()
  const onetimeItems = materials.filter((m) => m.category === "onetime")
  const reusableItems = materials.filter((m) => m.category === "reusable")

  const handleToggle = (id: string, defaultQty: number) => {
    if (selectedMaterials[id]) {
      onSetMaterial(id, 0)
    } else {
      onSetMaterial(id, defaultQty)
    }
  }

  const handleSelectAll = (items: typeof materials) => {
    const allSelected = items.every((m) => (selectedMaterials[m.id] || 0) > 0)
    for (const m of items) {
      onSetMaterial(m.id, allSelected ? 0 : m.defaultQty)
    }
  }

  const isAllSelected = (items: typeof materials) =>
    items.length > 0 && items.every((m) => (selectedMaterials[m.id] || 0) > 0)

  const computeSizeCost = (mat: typeof materials[0], qty: number) => {
    const dims = materialDimensions[mat.id] ?? {
      length: mat.defaultLength ?? 100,
      width: mat.defaultWidth ?? 100,
    }
    const area = (dims.length * dims.width) / 10000
    return Math.round(area * mat.unitPrice * qty * 100) / 100
  }

  return (
    <section id="calc-material" className="scroll-mt-24">
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Package size={18} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-lg">物料选择</h2>
            <p className="text-xs text-muted-foreground">选择所需物料并调整数量</p>
          </div>
        </div>

        {/* One-time materials */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">一次性物料</h3>
            <button
              onClick={() => handleSelectAll(onetimeItems)}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-smooth"
            >
              {isAllSelected(onetimeItems) ? "取消全选" : "全选"}
            </button>
          </div>
          <div className="space-y-2">
            {onetimeItems.map((mat) => {
              const qty = selectedMaterials[mat.id] || 0
              const isSelected = qty > 0
              const isSizeMode = mat.billingMode === "size"
              const dims = materialDimensions[mat.id] ?? {
                length: mat.defaultLength ?? 100,
                width: mat.defaultWidth ?? 100,
              }

              return (
                <div
                  key={mat.id}
                  className={cn(
                    "p-3 rounded-lg border transition-base",
                    isSelected ? "border-online/30 bg-online-muted/30" : "border-border bg-background"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(mat.id, mat.defaultQty)}
                      className={cn(
                        "w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-base",
                        isSelected ? "border-online bg-online" : "border-muted-foreground/30"
                      )}
                    >
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-foreground">{mat.name}</span>
                      {mat.unitPrice > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {mat.unitPrice} 元/{isSizeMode ? "m²" : mat.unit}
                        </span>
                      )}
                      {isSizeMode && (
                        <span className="inline-flex items-center gap-0.5 ml-2 text-xs text-primary/70">
                          <Ruler size={10} />按尺寸
                        </span>
                      )}
                    </div>
                    {isSelected && !isSizeMode && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) => onSetMaterial(mat.id, Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-20 px-2 py-1 text-sm text-center rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <span className="text-xs text-muted-foreground w-6">{mat.unit}</span>
                        <span className="text-sm font-medium text-secondary w-20 text-right">
                          {(qty * mat.unitPrice).toLocaleString()} 元
                        </span>
                      </div>
                    )}
                    {isSelected && isSizeMode && (
                      <span className="text-sm font-medium text-secondary">
                        {computeSizeCost(mat, qty).toLocaleString()} 元
                      </span>
                    )}
                  </div>

                  {/* Size-based billing inputs */}
                  {isSelected && isSizeMode && (
                    <div className="mt-3 ml-8 p-3 rounded-lg bg-background border border-border/50">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs text-muted-foreground">长</label>
                          <input
                            type="number"
                            min={1}
                            value={dims.length}
                            onChange={(e) => onSetDimensions(mat.id, Math.max(1, parseInt(e.target.value) || 1), dims.width)}
                            className="w-20 px-2 py-1 text-sm text-center rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <span className="text-xs text-muted-foreground">cm</span>
                        </div>
                        <span className="text-muted-foreground">×</span>
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs text-muted-foreground">宽</label>
                          <input
                            type="number"
                            min={1}
                            value={dims.width}
                            onChange={(e) => onSetDimensions(mat.id, dims.length, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 px-2 py-1 text-sm text-center rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <span className="text-xs text-muted-foreground">cm</span>
                        </div>
                        <span className="text-xs text-muted-foreground">=</span>
                        <span className="text-sm font-medium text-foreground">
                          {((dims.length * dims.width) / 10000).toFixed(2)} m²
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs text-muted-foreground">数量</label>
                          <input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={(e) => onSetMaterial(mat.id, Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 px-2 py-1 text-sm text-center rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <span className="text-xs text-muted-foreground">{mat.unit}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {((dims.length * dims.width) / 10000).toFixed(2)} m² × {mat.unitPrice} 元/m² × {qty} = {computeSizeCost(mat, qty).toLocaleString()} 元
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Reusable materials */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">
              循环物料
              <span className="text-xs font-normal text-muted-foreground ml-2">(免费借用)</span>
            </h3>
            <button
              onClick={() => handleSelectAll(reusableItems)}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-smooth"
            >
              {isAllSelected(reusableItems) ? "取消全选" : "全选"}
            </button>
          </div>
          <div className="space-y-2">
            {reusableItems.map((mat) => {
              const qty = selectedMaterials[mat.id] || 0
              const isSelected = qty > 0
              return (
                <div
                  key={mat.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-base",
                    isSelected ? "border-primary/20 bg-accent/30" : "border-border bg-background"
                  )}
                >
                  <button
                    onClick={() => handleToggle(mat.id, mat.defaultQty)}
                    className={cn(
                      "w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-base",
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <span className="text-sm text-foreground flex-1">
                    {mat.name}
                  </span>
                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => onSetMaterial(mat.id, Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 px-2 py-1 text-sm text-center rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-xs text-muted-foreground w-6">{mat.unit}</span>
                      <span className="text-xs text-muted-foreground w-20 text-right">免费</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
