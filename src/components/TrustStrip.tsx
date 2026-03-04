import { motion } from "framer-motion";
import { Zap, Shield, IndianRupee } from "lucide-react";

const items = [
  {
    icon: Zap,
    label: "Quick turnaround",
    sub: "Get your orders on time",
  },
  {
    icon: Shield,
    label: "Quality guaranteed",
    sub: "Professional finish every time",
  },
  {
    icon: IndianRupee,
    label: "Transparent pricing",
    sub: "No hidden charges",
  },
];

const TrustStrip = () => {
  return (
    <section className="relative py-12 border-b border-border/60 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6"
        >
          {items.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={label}
              className="flex items-center gap-4 text-center sm:text-left"
            >
              <div className="mx-auto sm:mx-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustStrip;
