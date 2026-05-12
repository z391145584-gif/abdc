import type { StoreInfo } from "@/data/types"
import { Building2, User, Calendar } from "lucide-react"

interface Props {
  storeInfo: StoreInfo
  onChange: (field: keyof StoreInfo, value: string) => void
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-base"

export function StoreInfoForm({ storeInfo, onChange }: Props) {
  return (
    <section id="calc-store" className="scroll-mt-24">
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Building2 size={18} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-lg">门店信息</h2>
            <p className="text-xs text-muted-foreground">填写活动门店的基本信息</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
              <Building2 size={14} className="text-muted-foreground" />
              门店名称
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="如：四川省成都市高新区锦城万达店"
              value={storeInfo.storeName}
              onChange={(e) => onChange("storeName", e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
              <User size={14} className="text-muted-foreground" />
              督导姓名
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="请输入督导姓名"
              value={storeInfo.supervisorName}
              onChange={(e) => onChange("supervisorName", e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
              <User size={14} className="text-muted-foreground" />
              区域经理姓名
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="请输入区域经理姓名"
              value={storeInfo.regionalManagerName}
              onChange={(e) => onChange("regionalManagerName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                <Calendar size={14} className="text-muted-foreground" />
                开始日期
              </label>
              <input
                type="date"
                className={inputClass}
                value={storeInfo.startDate}
                onChange={(e) => onChange("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                <Calendar size={14} className="text-muted-foreground" />
                结束日期
              </label>
              <input
                type="date"
                className={inputClass}
                value={storeInfo.endDate}
                onChange={(e) => onChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}