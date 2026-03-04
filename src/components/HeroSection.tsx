import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[520px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBanner} alt="Professional printing and binding services" className="w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6">
            Welcome to{" "}
            <span className="text-primary">Precision Script Hub</span>
          </h1>
          <p className="text-lg sm:text-xl text-background/80 mb-8 leading-relaxed">
            Professional printing, binding, and document services tailored to your needs. From xerox copies to hardbound books — we deliver quality you can trust.
          </p>
          <Link to="/#services">
            <Button size="lg" className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all">
              Order Now <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
