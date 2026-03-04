import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Base blue gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/95 to-slate-900" />

      {/* Floating blue waves — SVG layers */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-40 animate-wave-float" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-blue-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(221, 83%, 55%)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(221, 83%, 35%)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path fill="url(#wave-blue-1)" d="M0 120 Q250 80 500 120 T1000 120 T1500 120 T2000 120 V200 H0 Z" />
          <path fill="url(#wave-blue-1)" d="M0 180 Q300 140 600 180 T1200 180 T1800 180 T2400 180 V260 H0 Z" />
          <path fill="url(#wave-blue-1)" d="M0 240 Q200 200 400 240 T800 240 T1200 240 T1600 240 V320 H0 Z" />
        </svg>
        <svg className="absolute inset-0 w-full h-full opacity-35 animate-wave-float-slow" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-blue-2" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="hsl(217, 91%, 45%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(220, 70%, 30%)" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <path fill="url(#wave-blue-2)" d="M0 160 Q400 100 800 160 T1600 160 T2400 160 V240 H0 Z" />
          <path fill="url(#wave-blue-2)" d="M0 220 Q350 180 700 220 T1400 220 T2100 220 V300 H0 Z" />
        </svg>
        <svg className="absolute inset-0 w-full h-full opacity-25 animate-wave-float" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-blue-3" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="hsl(221, 83%, 60%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(221, 83%, 40%)" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path fill="url(#wave-blue-3)" d="M0 200 Q500 150 1000 200 T2000 200 V280 H0 Z" />
        </svg>
      </div>

      {/* Soft radial glow orbs (floating feel) */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 20% 30%, hsl(221 83% 55% / 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 70%, hsl(217 91% 45% / 0.4) 0%, transparent 50%)
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
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-white/15 to-white/5 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm mb-8"
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
                className="h-12 px-8 rounded-full text-base font-semibold bg-gradient-to-r from-white via-slate-50 to-primary/10 text-primary hover:opacity-95 shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-glow"
              >
                Order Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-full text-base font-semibold border-2 border-white/40 text-white bg-gradient-to-r from-transparent to-white/5 hover:from-white/15 hover:to-white/10 hover:border-white/60"
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
