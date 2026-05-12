import { HeroSection } from "@/components/HeroSection"
import { PlansSection } from "@/components/PlansSection"
import { BudgetSection } from "@/components/BudgetSection"
import { ProcessSection } from "@/components/ProcessSection"
import { PromotionSection } from "@/components/PromotionSection"

export function HomePage() {
  return (
    <>
      <HeroSection />
      <PlansSection />
      <BudgetSection />
      <ProcessSection />
      <PromotionSection />
    </>
  )
}