import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { StatsSection } from "@/components/home/stats-section"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { DailyTipSection } from "@/components/home/daily-tip-section"
import { CTASection } from "@/components/home/cta-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero with header overlay - no top padding needed */}
        <div className="-mt-14">
          <HeroSection />
        </div>
        <FeaturesSection />
        <StatsSection />
        <HowItWorksSection />
        <DailyTipSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
