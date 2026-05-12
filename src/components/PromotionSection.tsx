import { Clock, Volume2 } from "lucide-react"
import { getPromotions } from "@/data/store"
import { getIcon } from "@/data/icons"

export function PromotionSection() {
  const promotions = getPromotions()
  return (
    <section id="promotion" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <Volume2 size={14} />
            宣传参考
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            宣传内容参考
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            活动当天可选择的宣传方式及参考价格
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {promotions.map((item) => {
            const Icon = getIcon(item.iconName)
            return (
              <div
                key={item.id}
                className="group bg-card rounded-xl border border-border shadow-card p-6 text-center transition-smooth hover:shadow-card-hover hover:border-primary/20"
              >
                <div className="w-14 h-14 rounded-2xl bg-online-muted text-online flex items-center justify-center mx-auto mb-4 transition-smooth group-hover:gradient-primary group-hover:text-primary-foreground group-hover:scale-110">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  {item.content}
                </h3>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-3">
                  <Clock size={14} />
                  {item.time}
                </div>
                <div className="text-xl font-bold text-secondary">
                  {item.priceLabel}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}