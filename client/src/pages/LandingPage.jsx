import { Hero } from '@/components/features/landing/Hero'
import {
  ProblemSolution,
  FeaturesGrid,
  HowItWorks,
  LiveDemos,
  PricingSection,
  CTABanner,
} from '@/components/features/landing/sections'

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}>
      <Hero />
      <ProblemSolution />
      <FeaturesGrid />
      <HowItWorks />
      <LiveDemos />
      <PricingSection />
      <CTABanner />
    </div>
  )
}
