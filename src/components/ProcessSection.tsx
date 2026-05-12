import { cn } from "@/lib/utils"
import { CalendarCheck } from "lucide-react"
import { processSteps } from "@/data/process"
import { getIcon } from "@/data/icons"

const phases = [
  { key: "准备工作", color: "text-online", bg: "bg-online-muted", dot: "gradient-primary" },
  { key: "活动当天", color: "text-offline", bg: "bg-offline-muted", dot: "gradient-accent" },
  { key: "活动后", color: "text-accent-foreground", bg: "bg-accent", dot: "bg-accent-foreground" },
] as const

export function ProcessSection() {
  return (
    <section id="process" className="py-20 gradient-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <CalendarCheck size={14} />
            活动流程
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            竞对活动执行流程
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            具体的活动方案以门店实际为准，流程涵盖准备工作、活动执行和活动复盘
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {phases.map((phase) => {
            const steps = processSteps.filter((s) => s.phase === phase.key)
            if (steps.length === 0) return null

            return (
              <div key={phase.key}>
                {/* Phase header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-3 h-3 rounded-full", phase.dot)} />
                  <h3 className={cn("text-lg font-bold", phase.color)}>{phase.key}</h3>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">{steps.length} 步</span>
                </div>

                {/* Compact step grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {steps.map((step, idx) => {
                    const Icon = getIcon(step.iconName)
                    return (
                      <div
                        key={idx}
                        className="bg-card rounded-lg border border-border p-3.5 transition-smooth hover:shadow-card-hover"
                      >
                        {/* Top row: icon + task + time */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0", phase.bg, phase.color)}>
                            <Icon size={14} />
                          </div>
                          <h4 className="font-semibold text-foreground text-sm flex-1 truncate">{step.task}</h4>
                          <span className="text-[11px] text-muted-foreground flex-shrink-0">{step.time}</span>
                        </div>

                        {/* Detail */}
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                          {step.detail}
                        </p>

                        {/* Bottom row: materials + executor/checker */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          {step.materials ? (
                            <span className="text-[11px] text-muted-foreground bg-muted rounded px-2 py-0.5 truncate max-w-[60%]">
                              {step.materials}
                            </span>
                          ) : (
                            <span />
                          )}
                          <div className="flex items-center gap-2 text-[11px] flex-shrink-0">
                            <span className="font-medium text-primary px-1.5 py-0.5 rounded bg-online-muted">
                              {step.executor}
                            </span>
                            <span className="font-medium text-secondary px-1.5 py-0.5 rounded bg-offline-muted">
                              {step.checker}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
