import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-transparent via-transparent to-primary/5 overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustStrip />
        <ServicesSection searchQuery={searchQuery} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
