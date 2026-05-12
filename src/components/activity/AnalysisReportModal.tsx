import { useRef, useState, useEffect } from "react"
import { X, FileDown, Printer, Loader2 } from "lucide-react"
import type { ActivityRecord } from "@/data/types"
import { AnalysisReportTemplate } from "./AnalysisReportTemplate"
import { exportToPdf } from "@/lib/pdf"

interface Props {
  activity: ActivityRecord
  onClose: () => void
}

export function AnalysisReportModal({ activity, onClose }: Props) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleEsc)
    }
  }, [onClose])

  const handleExportPdf = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const filename = `${activity.activityName}_效果分析报告_${new Date().toISOString().slice(0, 10)}.pdf`
      await exportToPdf(reportRef.current, filename)
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    const printContent = reportRef.current
    if (!printContent) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activity.activityName} - 效果分析报告</title>
          <style>
            body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
            @media print { body { padding: 0; } }
          </style>
          <link rel="stylesheet" href="${window.location.origin}/assets/index.css" />
        </head>
        <body>${printContent.outerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm" onClick={onClose}>
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-card border-b border-border px-6 py-3 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2 className="text-sm font-bold text-foreground">活动效果分析报告</h2>
          <p className="text-xs text-muted-foreground">{activity.activityName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
          >
            <Printer size={14} />
            打印
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-smooth disabled:opacity-50"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            导出 PDF
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-smooth text-muted-foreground">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Report preview */}
      <div className="flex-1 overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="shadow-xl rounded-xl overflow-hidden mx-auto w-fit">
          <AnalysisReportTemplate ref={reportRef} activity={activity} />
        </div>
      </div>
    </div>
  )
}
