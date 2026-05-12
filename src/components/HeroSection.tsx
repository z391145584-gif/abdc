import { ChevronDown } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-banner.png"
          alt="门店竞对活动方案横幅"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-sm text-primary-foreground/90">
              活动可组合搭配 / 商品与金额可调整
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
            门店竞对
            <br />
            <span className="text-gradient-accent">活动方案与流程</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mb-8 leading-relaxed">
            涵盖线上线下活动方案、预算参考、物料清单与完整执行流程，
            以门店实际沟通为准。
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#plans"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-accent text-secondary-foreground font-semibold shadow-accent transition-spring hover:scale-105"
            >
              查看活动方案
            </a>
            <a
              href="#process"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground font-semibold backdrop-blur-sm transition-smooth hover:bg-primary-foreground/20"
            >
              了解执行流程
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <a href="#plans">
          <ChevronDown className="text-primary-foreground/60" size={28} />
        </a>
      </div>
    </section>
  )
}