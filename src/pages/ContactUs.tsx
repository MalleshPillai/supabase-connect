import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny.from("inquiries").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: null,
        message: form.message.trim(),
        source: "contact-us",
      });

      if (error) throw error;

      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      toast({ title: "Error sending message", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-20 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Contact Us</h1>
            <p className="text-muted-foreground text-base sm:text-lg px-2">Get in touch with us for any inquiries or orders.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                {[
                  { icon: Phone, label: "Phone", value: "+91 93639 26173" },
                  { icon: Mail, label: "Email", value: "info@precisionscripthub.com" },
                  { icon: MapPin, label: "Address", value: "123 Print Street, Document City, IN 400001" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4 p-4 bg-gradient-to-br from-white/90 to-primary/10 rounded-xl border border-primary/10">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://wa.me/919363926173?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full min-h-[48px] bg-green-600 hover:bg-green-700 text-white touch-manipulation">
                  <MessageCircle className="w-4 h-4 mr-2" /> Chat on WhatsApp
                </Button>
              </a>

              {/* Google Map */}
              <div className="rounded-xl overflow-hidden border h-[250px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.0!2d72.8!3d19.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAwJzAwLjAiTiA3MsKwNDgnMDAuMCJF!5e0!3m2!1sen!2sin!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Precision Script Hub Location"
                />
              </div>
            </div>

            {/* Contact Form */}
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="bg-gradient-to-br from-white/95 to-primary/5 border border-primary/10 rounded-2xl p-8 space-y-6 h-fit shadow-lg"
            >
              <h2 className="text-xl font-semibold text-foreground">Send us a message</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={100}
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={255}
                />
                <Textarea
                  placeholder="Your Message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={1000}
                />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </motion.form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;
