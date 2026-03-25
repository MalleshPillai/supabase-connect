import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Briefcase, Eye, Heart, MessageSquareText, Sparkles, Target, Truck, Zap } from "lucide-react";

const AboutUs = () => {
  const sections = [
    {
      icon: Heart,
      title: "Who We Are",
      content:
        "Precision Script Hub is where ideas get executed. We specialize in transforming concepts into fully developed projects, publication-ready papers, and professionally designed outputs. From research and writing to printing, binding, and doorstep delivery, we manage the entire process with accuracy, speed, and reliability.",
    },
    {
      icon: Target,
      title: "Our Mission",
      content:
        "Deliver end-to-end project and research support that meets real academic standards; ensure fast, reliable print and binding with doorstep delivery; create design work that is clear, functional, and impactful; remove complexity so clients can focus on results, not process.",
    },
    {
      icon: Eye,
      title: "Our Vision",
      content:
        "To become the most trusted execution partner for academic and creative work—where every idea is completed, delivered, and ready to succeed.",
    },
    {
      icon: Briefcase,
      title: "End-to-End Execution (One Partner)",
      content:
        "You bring the requirement—we handle the full journey. Instead of managing multiple vendors, you work with one team that coordinates intake, production choices, and delivery so your project stays consistent and on track.",
    },
    {
      icon: Truck,
      title: "Fast, Reliable Print + Binding to Your Doorstep",
      content:
        "We produce clean, submission-ready outputs with careful attention to detail—then deliver them to your provided address. The goal is simple: dependable print quality, strong binding, and a smoother timeline from order to handover.",
    },
    {
      icon: Sparkles,
      title: "Design That’s Clear, Functional, and Impactful",
      content:
        "For posters, creatives, and branding needs, we create layouts that are readable, well-structured, and designed to perform. Your message stays sharp—so your design looks professional and helps your work get noticed.",
    },
    {
      icon: MessageSquareText,
      title: "Reduced Complexity, Clear Communication",
      content:
        "Academic work has deadlines. Our process is built to keep things simple: guided steps, clear requirements, and hassle-free updates. You should never feel like you’re managing the logistics—just focus on your outcome.",
    },
    {
      icon: Zap,
      title: "Deadline-Driven Reliability",
      content:
        "Whether it’s a thesis submission, a report handover, or an event poster, we prioritize timely turnaround and consistent delivery. We treat speed and quality as partners—so your work arrives ready.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 sm:py-20 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 sm:mb-16">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">About Us</h1>
              <p className="text-muted-foreground text-base sm:text-lg px-2">
                Precision Script Hub manages the complete journey—from end-to-end project support to design, printing, binding, and doorstep delivery—so your work is ready with confidence.
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
