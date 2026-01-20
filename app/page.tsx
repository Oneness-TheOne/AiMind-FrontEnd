import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { StatsSection } from "@/components/stats-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { DailyTipSection } from "@/components/daily-tip-section"
import { CTASection } from "@/components/cta-section"

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
