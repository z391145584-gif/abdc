import { cn } from "@/lib/utils"
import { getPromotions } from "@/data/store"
import { getIcon } from "@/data/icons"
import { Megaphone, Check, Clock } from "lucide-react"

interface Props {
  selectedIds: string[]
  onToggle: (promotionId: string) => void
}

export function PromotionSelector({ selectedIds, onToggle }: Props) {
  const promotions = getPromotions()

  return (
    <section id="calc-promo" className="scroll-mt-24">
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Megaphone size={18} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-lg">宣传方式选择</h2>
            <p className="text-xs text-muted-foreground">选择活动当天的宣传方式</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {promotions.map((item) => {
            const selected = selectedIds.includes(item.id)
            const Icon = getIcon(item.iconName)

            return (
              <button
                key={item.id}
                onClick={() => onToggle(item.id)}
                className={cn(
                  "relative p-4 rounded-xl border-2 text-center transition-smooth",
                  selected
                    ? "border-online bg-online-muted/50"
                    : "border-border hover:border-muted-foreground/30 bg-background"
                )}
              >
                {selected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                    <Check size={12} className="text-primary-foreground" />
                  </div>
                )}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3",
                  selected ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Icon size={20} />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-1">{item.content}</h3>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
                  <Clock size={12} />
                  {item.time}
                </div>
                <div className="text-sm font-bold text-secondary">
                  {item.priceLabel}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
