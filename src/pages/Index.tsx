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
            <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-white/80 to-primary/5 shadow-sm">
              {/* Premium glow accents */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/25 via-primary/10 to-orange-500/25 pointer-events-none" />
              <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -right-24 -bottom-20 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />

              <div className="relative p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/60 backdrop-blur px-4 py-2 text-xs sm:text-sm font-medium text-foreground">
                      <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                      Premium graphic design for print + social
                    </div>

                    <h2 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                      Design that grabs attention and drives results
                    </h2>

                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      Posters, Instagram creatives, event banners, and branding—crafted to look premium and convert fast.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {[
                        { t: "Fast turnaround", s: "24-72 hours" },
                        { t: "Unlimited revisions", s: "Until you approve" },
                      ].map((x) => (
                        <div key={x.t} className="rounded-2xl border border-primary/10 bg-white/60 backdrop-blur px-4 py-3">
                          <p className="text-xs text-muted-foreground">{x.t}</p>
                          <p className="text-sm font-semibold text-foreground">{x.s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-3">
                    <Link to="/graphic-design">
                      <Button className="bg-primary hover:opacity-95 touch-manipulation px-6">
                        Get Graphic Design
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Starting from <span className="font-semibold text-foreground">₹499</span>
                    </p>
                  </div>
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
