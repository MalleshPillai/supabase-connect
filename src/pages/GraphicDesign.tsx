import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageCircle, Phone, Sparkles, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PosterCategory = "Automotive" | "Festival" | "Social Media" | "Event";

type Poster = {
  title: string;
  category: PosterCategory;
  description: string;
  imageWebp: string;
  imageFallbackSvg: string;
};

function PosterImg({
  webpSrc,
  fallbackSvgSrc,
  alt,
  className,
}: {
  webpSrc: string;
  fallbackSvgSrc: string;
  alt: string;
  className?: string;
}) {
  const [useFallback, setUseFallback] = useState(false);
  const src = useFallback ? fallbackSvgSrc : webpSrc;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setUseFallback(true)}
    />
  );
}

function setOrUpdateMeta(name: string, content: string, id: string) {
  let el = document.getElementById(id) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.id = id;
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const GraphicDesign = () => {
  const seo = useMemo(
    () => ({
      title: "Graphic Design Services in Chennai | Posters, Creatives & Branding",
      description:
        "Get high-quality poster designs, social media creatives, and branding solutions. Perfect for businesses, events, and students.",
      keywords: ["graphic design Chennai", "poster design", "social media creatives", "branding services", "event posters"].join(
        ", "
      ),
    }),
    []
  );

  useEffect(() => {
    document.title = seo.title;
    setOrUpdateMeta("description", seo.description, "graphic-design-meta-description");
    setOrUpdateMeta("keywords", seo.keywords, "graphic-design-meta-keywords");
  }, [seo]);

  const posters: Poster[] = useMemo(
    () => [
      {
        // Note: We load the JPEGs if present; otherwise we fall back to the existing SVGs.
        title: "Ad Campaign Poster",
        category: "Event",
        description: "Premium ad-ready poster layouts designed for maximum visibility.",
        imageWebp: "/designs/Add%20poster.jpeg",
        imageFallbackSvg: "/placeholder.svg",
      },
      {
        title: "Pongal Festival Poster",
        category: "Festival",
        description: "Vibrant festival artwork designed to stand out on streets and feeds.",
        imageWebp: "/designs/pongal%20poster.jpeg",
        imageFallbackSvg: "/placeholder.svg",
      },
      {
        title: "Porsche Campaign Poster",
        category: "Automotive",
        description: "Luxury campaign poster with bold contrast and premium typography.",
        imageWebp: "/designs/Porche%20poster.jpeg",
        imageFallbackSvg: "/placeholder.svg",
      },
    ],
    []
  );

  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);
  const [contact, setContact] = useState({ name: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const whatsappHref =
    "https://wa.me/919363926173?text=Hi%2C%20I%20need%20a%20graphic%20design%20for%20posters%2Fcreatives%20in%20Chennai.";

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ServicesCard = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: LucideIcon;
    title: string;
    description: string;
  }) => (
    <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground leading-relaxed">{description}</p>
        <div className="mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-accent/40 border border-primary/10 text-foreground/80">
          Starting from ₹499
        </div>
      </CardContent>
    </Card>
  );

  const ServiceIconMap = {
    poster: Wand2,
    insta: Sparkles,
    event: MessageCircle,
    flyer: Phone,
  } satisfies Record<string, LucideIcon>;

  const onSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name.trim() || !contact.phone.trim() || !contact.message.trim()) {
      toast({ title: "Please fill all contact fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny.from("inquiries").insert({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        email: null,
        message: contact.message.trim(),
        source: "graphic-design",
      });
      if (error) throw error;

      toast({ title: "Request sent!", description: "We’ll contact you shortly." });
      setContact({ name: "", phone: "", message: "" });
    } catch (err: any) {
      toast({ title: "Error sending request", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col scroll-smooth bg-gradient-to-b from-transparent via-transparent to-primary/5">
      <Header />

      <motion.main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-primary/10 to-orange-500/10" />
          <div className="absolute inset-0 opacity-70 [background:radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-2 gap-10 items-center"
            >
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/60 backdrop-blur px-4 py-2 text-sm text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Premium poster & creative design in Chennai
                </div>

                <h1 className="mt-6 text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-foreground">
                  Designs that don’t just look good — they get attention.
                </h1>

                <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
                  Posters, social media creatives, branding — crafted to stand out and convert.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    onClick={() => scrollToId("contact")}
                    className="bg-primary hover:opacity-95 touch-manipulation"
                  >
                    Get a Design
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => scrollToId("portfolio")}
                    className="border-primary/20 hover:bg-primary/10 touch-manipulation"
                  >
                    View Portfolio
                  </Button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
                  {[
                    { k: "Fast turnaround", v: "24-72 hours" },
                    { k: "Premium output", v: "Print + web ready" },
                    { k: "Unlimited revisions", v: "Up to your satisfaction" },
                    { k: "Budget-friendly", v: "Starting from ₹499" },
                  ].map((x) => (
                    <div
                      key={x.k}
                      className="rounded-2xl border border-primary/10 bg-white/60 backdrop-blur p-4"
                    >
                      <p className="text-xs text-muted-foreground">{x.k}</p>
                      <p className="font-semibold text-foreground">{x.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="rounded-3xl border border-primary/10 bg-gradient-card p-1 shadow-lg">
                  <div className="rounded-[22px] overflow-hidden border border-primary/10 bg-black/5">
                    <div className="p-5 sm:p-7">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Featured</p>
                          <p className="text-lg font-semibold">Portfolio Preview</p>
                        </div>
                        <div className="rounded-full bg-primary/10 border border-primary/10 px-3 py-1 text-xs font-medium">
                          High impact designs
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {posters.slice(0, 4).map((p, idx) => (
                          <button
                            key={p.title}
                            className={cn(
                              "group relative overflow-hidden rounded-2xl border border-primary/10 bg-white/60 hover:shadow-md transition-shadow",
                              idx === 0 ? "col-span-2" : ""
                            )}
                            onClick={() => setSelectedPoster(p)}
                            type="button"
                            aria-label={`View design: ${p.title}`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <PosterImg
                              webpSrc={p.imageWebp}
                              fallbackSvgSrc={p.imageFallbackSvg}
                              alt={p.title}
                              className="h-40 sm:h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                            />
                            <div className="absolute left-3 bottom-3 right-3 flex items-center justify-between gap-3">
                              <div className="text-left">
                                <p className="text-xs font-semibold text-white/95 truncate">{p.category}</p>
                                <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                              </div>
                              <div className="rounded-full bg-white/15 border border-white/20 backdrop-blur px-3 py-1 text-xs text-white">
                                View
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <p className="mt-4 text-sm text-muted-foreground">
                        Click any preview to see it larger.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Portfolio */}
        <section id="portfolio" className="py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Portfolio</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                Explore a few premium poster and creative layouts designed for attention and action.
              </p>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
              {posters.map((p) => (
                <div
                  key={p.title}
                  className="group relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-white/90 to-primary/5 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-[4/3]">
                    <PosterImg
                      webpSrc={p.imageWebp}
                      fallbackSvgSrc={p.imageFallbackSvg}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-100">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white/95">{p.category}</p>
                          <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                        </div>
                        <span className="hidden sm:inline-flex rounded-full bg-white/15 border border-white/20 backdrop-blur px-3 py-1 text-xs text-white">
                          View Design
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="absolute inset-0 flex items-end justify-start p-4"
                      onClick={() => setSelectedPoster(p)}
                      aria-label={`Open design: ${p.title}`}
                    >
                      <span className="pointer-events-none inline-flex items-center rounded-full bg-white/15 border border-white/20 backdrop-blur px-3 py-2 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        View Design
                      </span>
                    </button>
                  </div>

                  <div className="p-5">
                    <p className="text-sm font-semibold text-foreground">{p.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-14 sm:py-20 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Services</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                Designed to look premium and convert. Choose a service and we’ll tailor the output to your brand.
              </p>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <ServicesCard
                icon={ServiceIconMap.poster}
                title="Poster Design"
                description="Luxury print-ready poster layouts with sharp hierarchy and premium visuals."
              />
              <ServicesCard
                icon={ServiceIconMap.insta}
                title="Instagram Creatives"
                description="Scroll-stopping posts and story creatives built for engagement."
              />
              <ServicesCard
                icon={ServiceIconMap.event}
                title="Event Banners"
                description="Impact banners and promotional creatives with bold readability at distance."
              />
              <ServicesCard
                icon={ServiceIconMap.flyer}
                title="Business Flyers"
                description="Clean, modern flyers for offers, businesses, and local campaigns."
              />
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Loved by customers</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                Quick turnaround, premium design quality, and clear communication throughout the process.
              </p>
            </motion.div>

            <div className="mt-8">
              <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5 overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">“The poster looked premium and got more enquiries!”</p>
                      <p className="mt-2 text-muted-foreground">
                        The design was delivered fast and the visuals were exactly what we needed for our campaign.
                      </p>
                      <p className="mt-4 text-xs text-muted-foreground">- Verified customer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact CTA + section */}
        <section id="contact" className="py-14 sm:py-20 bg-gradient-to-b from-primary/10 via-transparent to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Need a design that stands out?</h2>
                <p className="mt-3 text-muted-foreground">
                  Tell us what you need and we’ll suggest the best design format for print and social media.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex">
                    <Button className="bg-green-600 hover:bg-green-700 text-white touch-manipulation">
                      Contact Us
                    </Button>
                  </a>
                </div>
              </div>

              <div className="w-full lg:max-w-lg">
                <Card className="border-primary/10 bg-gradient-card shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle>Send a quick request</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <form onSubmit={onSubmitContact} className="space-y-4">
                      <Input
                        placeholder="Your Name"
                        value={contact.name}
                        onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
                        maxLength={100}
                      />
                      <Input
                        placeholder="Phone / WhatsApp number"
                        value={contact.phone}
                        onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                        maxLength={15}
                      />
                      <Textarea
                        placeholder="What do you want to design? (poster/creative/banner + size)"
                        value={contact.message}
                        onChange={(e) => setContact((p) => ({ ...p, message: e.target.value }))}
                        rows={4}
                        maxLength={1000}
                      />

                      <div className="flex items-center gap-3">
                        <Button type="submit" disabled={submitting} className="w-full touch-manipulation">
                          {submitting ? "Sending..." : "Send Request"}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          +91 93639 26173
                        </span>
                        <a href="mailto:info@precisionscripthub.com" className="hover:underline inline-flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          info@precisionscripthub.com
                        </a>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Callout */}
        <section className="py-12 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-primary/10 bg-gradient-to-r from-purple-900/20 via-primary/10 to-orange-500/20 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="max-w-2xl">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">We offer graphic design too.</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Posters, creative layouts, and branding that help your message stand out.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => scrollToId("contact")}
                    className="bg-primary hover:opacity-95 touch-manipulation"
                  >
                    Request a Design
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </motion.main>

      <Footer />

      {/* WhatsApp Floating Button */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-4 bottom-6 z-50"
        aria-label="Chat on WhatsApp"
      >
        <div className="flex items-center gap-2 rounded-full bg-green-600 text-white px-4 py-3 shadow-lg border border-white/20 hover:bg-green-700 transition-colors touch-manipulation">
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline-flex text-sm font-semibold">WhatsApp</span>
        </div>
      </a>

      <Dialog
        open={!!selectedPoster}
        onOpenChange={(v) => {
          if (!v) setSelectedPoster(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedPoster?.title ?? "Design"}</DialogTitle>
          </DialogHeader>
          {selectedPoster && (
            <div className="space-y-4">
              <PosterImg
                webpSrc={selectedPoster.imageWebp}
                fallbackSvgSrc={selectedPoster.imageFallbackSvg}
                alt={selectedPoster.title}
                className="w-full max-h-[420px] object-cover rounded-xl border border-primary/10"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold rounded-full bg-accent/40 border border-primary/10 px-3 py-1 text-foreground/80">
                  {selectedPoster.category}
                </span>
              </div>
              <p className="text-muted-foreground">{selectedPoster.description}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={() => scrollToId("contact")} className="bg-primary hover:opacity-95 touch-manipulation">
                  Get a Design
                </Button>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-primary/20 hover:bg-primary/10 touch-manipulation">
                    WhatsApp Us
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GraphicDesign;

