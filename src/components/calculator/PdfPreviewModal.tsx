import { useRef, useEffect } from "react"
import { X, FileDown } from "lucide-react"
import type { CalculatorState, BudgetBreakdown } from "@/data/types"
import { PdfTemplate } from "./PdfTemplate"

interface Props {
  state: CalculatorState
  budget: BudgetBreakdown
  exporting: boolean
  onExport: () => void
  onClose: () => void
}

export function PdfPreviewModal({ state, budget, exporting, onExport, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <h2 className="text-base font-semibold text-foreground">方案预览</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            disabled={exporting}
            className="px-4 py-2 rounded-lg text-sm font-semibold gradient-accent text-secondary-foreground inline-flex items-center gap-1.5 hover:opacity-90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown size={15} />
            {exporting ? "正在生成..." : "导出 PDF"}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-y-auto py-8 px-4">
        <div className="max-w-[850px] mx-auto rounded-xl shadow-xl overflow-hidden">
          <PdfTemplate state={state} budget={budget} preview />
        </div>
      </div>
    </div>
  )
}
