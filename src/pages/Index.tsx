import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import LandingCategoriesSection from "@/components/LandingCategoriesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-transparent via-transparent to-primary/5 overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustStrip />
        <LandingCategoriesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
