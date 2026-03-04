import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative border-t border-primary/20 text-slate-100 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/90 to-slate-900 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <span className="font-extrabold text-lg">P</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Precision Script Hub</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Your trusted partner for professional printing, binding, and document services. Quality you can count on.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="font-semibold text-slate-100 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/#services", label: "Services" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h3 className="font-semibold text-slate-100 mb-4">Contact</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <a href="tel:+919363926173" className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <Phone className="h-4 w-4" />
                  </span>
                  +91 93639 26173
                </a>
              </li>
              <li>
                <a href="mailto:info@precisionscripthub.com" className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <Mail className="h-4 w-4" />
                  </span>
                  info@precisionscripthub.com
                </a>
              </li>
              <li>
                <span className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <MapPin className="h-4 w-4 mt-0.5" />
                  </span>
                  123 Print Street, Document City, IN 400001
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Precision Script Hub. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="https://wa.me/919363926173"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              WhatsApp
            </a>
            <a href="mailto:info@precisionscripthub.com" className="text-sm text-slate-500 hover:text-white transition-colors">
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
