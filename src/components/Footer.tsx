export function Footer() {
  return (
    <footer className="py-10 border-t border-border bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">竞</span>
            </div>
            <span className="font-semibold text-foreground">门店竞对活动</span>
          </div>
          <p className="text-sm text-muted-foreground">
            活动可组合搭配，商品与金额可调整，以门店实际沟通为准
          </p>
        </div>
      </div>
    </footer>
  )
}