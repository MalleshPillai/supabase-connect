import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  FileText,
  Printer,
  Copy,
  BookOpen,
  Book,
  Disc,
  GraduationCap,
  School,
  ArrowUpRight,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Printer,
  Copy,
  BookOpen,
  Book,
  Disc,
  GraduationCap,
  School,
};

interface ServicesSectionProps {
  searchQuery?: string;
}

const ServicesSection = ({ searchQuery }: ServicesSectionProps) => {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const filtered = services?.filter(
    (s: { name?: string }) =>
      !searchQuery ||
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-transparent via-primary/5 to-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1 text-xs font-medium">
            What we offer
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Our Services
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From quick xerox to premium binding — everything you need under one roof.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl overflow-hidden animate-pulse h-44 border border-primary/10 bg-gradient-to-br from-white/80 to-primary/10 shadow-lg">
                <CardContent className="p-6" />
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered?.map((service: { id: string; icon?: string; name?: string; description?: string; slug?: string }, i: number) => {
              const Icon = (iconMap[service.icon ?? ""] || FileText) as React.ComponentType<{ className?: string }>;
              const isFeatured = i === 0;
              return (
                <motion.div key={service.id} variants={item}>
                  <Link to={`/order/${service.slug ?? ""}`}>
                    <Card
                      className={`group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-white/90 to-primary/10 shadow-md shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 ${
                        isFeatured ? "sm:col-span-2 lg:col-span-1" : ""
                      }`}
                    >
                      <CardContent className="p-6 sm:p-8 flex flex-col h-full min-h-[160px]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20">
                            <Icon className="h-7 w-7" />
                          </div>
                          <span className="rounded-full p-1.5 text-muted-foreground/70 group-hover:text-primary transition-colors">
                            <ArrowUpRight className="h-5 w-5" />
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {service.name}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
                          {service.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
