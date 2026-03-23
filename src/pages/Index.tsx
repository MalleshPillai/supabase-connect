import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

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

        {/* Graphic Works Callout (additive; does not modify services logic) */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-primary/10 bg-gradient-to-r from-purple-900/20 via-primary/10 to-orange-500/20 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="max-w-2xl">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    We do graphic works too.
                  </h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Posters, creatives, event banners, and branding that convert.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/graphic-design">
                    <Button className="bg-primary hover:opacity-95 touch-manipulation">
                      View Graphic Design
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
