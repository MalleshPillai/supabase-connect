import { motion } from "framer-motion";
import { Zap, Shield, IndianRupee } from "lucide-react";

const items = [
  {
    icon: Zap,
    label: "Quick turnaround",
    sub: "Fast print + binding, delivered to your doorstep",
  },
  {
    icon: Shield,
    label: "Quality guaranteed",
    sub: "Submission-ready finish with careful attention to detail",
  },
  {
    icon: IndianRupee,
    label: "Transparent pricing",
    sub: "Simple, guided ordering—no hidden surprises",
  },
];

const TrustStrip = () => {
  return (
    <section className="relative py-5 sm:py-6 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-8 items-center"
        >
          {items.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={label}
              className="flex items-center justify-center sm:justify-start gap-3 text-center sm:text-left"
            >
              <div className="mx-auto sm:mx-0 flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="font-semibold text-foreground text-sm sm:text-base leading-snug">{label}</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustStrip;
