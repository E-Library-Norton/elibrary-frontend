import HeroSection from "@/components/home/HeroSection";
import TrustedBySection from "@/components/home/TrustedBySection";
import StatsSection from "@/components/home/StatsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturedBooks from "@/components/home/FeaturedBooks";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedVideos from "@/components/home/FeaturedVideos";
import FeaturedAudios from "@/components/home/FeaturedAudios";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustedBySection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturedBooks />
      <CategoriesSection />
      <FeaturedVideos />
      <FeaturedAudios />
      <TestimonialsSection />
    </main>
  );
}
