import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Palette, Printer, ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Paper projects",
    description: "Thesis, journals, reports — share your title, abstract, and files so we can work with you.",
    href: "/paper-project",
    icon: FileText,
    action: "Start a project",
    variant: "default" as const,
  },
  {
    title: "Graphic Design",
    description: "Posters, social creatives, branding — premium layouts for print and digital.",
    href: "/graphic-design",
    icon: Palette,
    action: "Open Graphic Design",
    variant: "default" as const,
  },
  {
    title: "Xerox and Prints",
    description: "Copying, printing, binding, and everything you already love — order online in a few clicks.",
    href: "/xerox-prints",
    icon: Printer,
    action: "Browse services",
    variant: "default" as const,
  },
];

const LandingCategoriesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1 text-xs font-medium">
            Choose a category
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            What do you need today?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Paper projects, design, or print services — we guide you end-to-end and deliver your final work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Card className="h-full overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-white/95 to-primary/10 shadow-md hover:shadow-xl hover:border-primary/25 transition-all duration-300">
                  <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-foreground tracking-tight">{c.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{c.description}</p>
                    <div className="mt-6">
                      <Button variant={c.variant} className="w-full sm:w-auto gap-2" asChild>
                        <Link to={c.href}>
                          {c.action}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingCategoriesSection;
