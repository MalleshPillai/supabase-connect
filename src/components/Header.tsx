import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, User, LogOut, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const MAX_SUGGESTIONS = 6;

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownFocused, setDropdownFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, slug")
        .eq("status", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const suggestions = (services ?? []).filter(
    (s: { name?: string | null }) =>
      s.name &&
      searchQuery.trim() &&
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, MAX_SUGGESTIONS);

  const showDropdown = searchQuery.trim().length > 0 && dropdownFocused;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        searchRef.current && !searchRef.current.contains(target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(target)
      ) {
        setDropdownFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Services", to: "/#services" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  const submitSearch = (query: string) => {
    const q = query.trim();
    if (q) {
      navigate(`/?search=${encodeURIComponent(q)}`);
      setSearchQuery("");
      setDropdownFocused(false);
      setMobileOpen(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const selected = suggestions[highlightedIndex];
    if (selected?.name) {
      submitSearch(selected.name);
    } else {
      submitSearch(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Escape") {
      setDropdownFocused(false);
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
              <div ref={searchRef} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setDropdownFocused(true)}
                  onKeyDown={handleKeyDown}
                  className="h-9 w-full rounded-full border-primary/20 bg-white/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
                  autoComplete="off"
                />
                <AnimatePresence>
                  {showDropdown && (
                    <motion.ul
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1 py-1 rounded-lg border border-primary/20 bg-white shadow-lg z-50 max-h-56 overflow-auto"
                      role="listbox"
                    >
                      {suggestions.length > 0 ? (
                        suggestions.map((s: { id: string; name: string }, i: number) => (
                          <li
                            key={s.id}
                            role="option"
                            aria-selected={i === highlightedIndex}
                            onMouseEnter={() => setHighlightedIndex(i)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              submitSearch(s.name);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                              i === highlightedIndex ? "bg-primary/15 text-primary" : "text-foreground hover:bg-primary/10"
                            }`}
                          >
                            {s.name}
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-sm text-muted-foreground">
                          No matching services
                        </li>
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
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
                <div ref={mobileSearchRef} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setDropdownFocused(true)}
                    onKeyDown={handleKeyDown}
                    className="h-10 rounded-full pl-9 bg-white/50 border border-primary/10"
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.ul
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 py-1 rounded-lg border border-primary/20 bg-white shadow-lg z-50 max-h-56 overflow-auto"
                        role="listbox"
                      >
                        {suggestions.length > 0 ? (
                          suggestions.map((s: { id: string; name: string }, i: number) => (
                            <li
                              key={s.id}
                              role="option"
                              aria-selected={i === highlightedIndex}
                              onMouseEnter={() => setHighlightedIndex(i)}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                submitSearch(s.name);
                              }}
                              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                i === highlightedIndex ? "bg-primary/15 text-primary" : "text-foreground hover:bg-primary/10"
                              }`}
                            >
                              {s.name}
                            </li>
                          ))
                        ) : (
                          <li className="px-3 py-2 text-sm text-muted-foreground">
                            No matching services
                          </li>
                        )}
                      </motion.ul>
                    )}
                  </AnimatePresence>
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
