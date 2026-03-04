import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Target, Eye, Heart } from "lucide-react";

const AboutUs = () => {
  const sections = [
    {
      icon: Heart,
      title: "Who We Are",
      content:
        "Precision Script Hub is a trusted name in printing, binding, and document services. We cater to students, professionals, and businesses with quality craftsmanship and attention to detail. Our commitment to excellence drives everything we do.",
    },
    {
      icon: Target,
      title: "Our Mission",
      content:
        "To deliver high-quality, affordable, and timely printing and binding services that empower individuals and organizations to present their work with confidence and professionalism.",
    },
    {
      icon: Eye,
      title: "Our Vision",
      content:
        "To become the most reliable and innovative printing hub, setting new standards in quality, speed, and customer satisfaction across the region.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
              <h1 className="text-4xl font-bold text-foreground mb-4">About Us</h1>
              <p className="text-muted-foreground text-lg">
                Learn more about Precision Script Hub and our commitment to quality.
              </p>
            </motion.div>

            <div className="space-y-12">
              {sections.map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <section.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">{section.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
