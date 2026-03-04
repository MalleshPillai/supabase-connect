import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Services", to: "/#services" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/15 shadow-md bg-gradient-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <img
              src="/IMG_20250714_213759_672.webp"
              alt="Precision Script Hub"
              className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-primary/25 transition-all duration-300 group-hover:shadow-primary/40 group-hover:scale-105"
            />
            <span className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors hidden sm:inline">
              Precision Script Hub
            </span>
          </Link>

          {/* Desktop: search + nav */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-1 max-w-xl mx-6">
            <form onSubmit={handleSearch} className="w-full max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-full border-primary/20 bg-white/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </form>
          </div>

          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-1.5" /> Logout
              </Button>
            ) : (
              <Link to="/auth" className="ml-2">
                <Button size="sm" className="rounded-full px-4 shadow-md shadow-primary/20 hover:shadow-primary/30">
                  <User className="h-4 w-4 mr-1.5" /> Login
                </Button>
              </Link>
            )}
          </nav>

          <button
            type="button"
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-lg hover:bg-primary/10 active:bg-primary/15 text-foreground touch-manipulation"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-primary/10 bg-gradient-header overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 rounded-full pl-9 bg-white/50 border border-primary/10"
                  />
                </div>
              </form>
              <div className="flex flex-col gap-0.5 pt-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="min-h-[44px] flex items-center px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg touch-manipulation"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="min-h-[44px] flex items-center px-3 py-3 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg gap-2 touch-manipulation"
                  >
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                )}
                {user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start mt-2 min-h-[44px] touch-manipulation"
                    onClick={() => { signOut(); setMobileOpen(false); }}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                ) : (
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="mt-2 block">
                    <Button size="sm" className="w-full rounded-full min-h-[44px] touch-manipulation">
                      <User className="h-4 w-4 mr-2" /> Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
