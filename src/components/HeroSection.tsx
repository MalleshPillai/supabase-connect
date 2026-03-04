import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/95 to-slate-900" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(at 40% 20%, hsl(221 83% 55% / 0.4) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsl(220 60% 30% / 0.3) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsl(221 83% 45% / 0.25) 0px, transparent 50%)
          `,
        }}
      />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm mb-8"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Professional print & bind — delivered with care</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6"
          >
            Print. Bind.{" "}
            <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 bg-clip-text text-transparent">
              Deliver.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed mb-10"
          >
            From xerox copies to hardbound books — quality printing and binding for students, professionals, and businesses. Fast, reliable, and hassle-free.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link to="/#services">
              <Button
                size="lg"
                className="h-12 px-8 rounded-full text-base font-semibold bg-white text-primary hover:bg-white/95 shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-glow"
              >
                Order Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-full text-base font-semibold border-2 border-white/40 text-white bg-transparent hover:bg-white/10 hover:border-white/60"
              >
                Get in touch
              </Button>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 text-sm text-white/50"
          >
            Trusted by students & professionals · Quick turnaround · Transparent pricing
          </motion.p>
        </div>
      </div>

      {/* Decorative corner */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-primary/20 to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
