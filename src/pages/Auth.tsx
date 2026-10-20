import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Shield } from "lucide-react";

/**
 * Admin Login — the only login on the site.
 * There is no customer sign-up / user login: visitors place orders as guests.
 * Only the Supabase Auth account that has an `admin` row in `user_roles`
 * (the Precision Script Hub admin account) can get past this page.
 */
const Auth = () => {
  const [searchParams] = useSearchParams();
  // Only allow internal redirects, and default to the admin dashboard.
  const rawNext = searchParams.get("next") || "/admin";
  const nextPath = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isAdmin, loading: authLoading, signIn, signOut } = useAuth();
  const navigate = useNavigate();

  // Already signed in as admin → go straight to the dashboard.
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate(nextPath, { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate, nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please enter the admin email and password", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);

      // Enforce Admin-only: reject (and sign out) any non-admin account.
      const {
        data: { user: signedInUser },
      } = await supabase.auth.getUser();
      if (!signedInUser) throw new Error("Sign in failed. Please try again.");

      const { data: roleRow, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", signedInUser.id)
        .eq("role", "admin")
        .maybeSingle();
      if (roleError) throw roleError;

      if (!roleRow) {
        await signOut();
        toast({
          title: "Not an admin account",
          description: "This login is for Precision Script Hub admins only.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Welcome back, Admin!" });
      navigate(nextPath, { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast({ title: "Admin sign in failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-8 sm:py-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="shadow-xl border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
            <CardHeader className="text-center px-4 sm:px-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Sign in with the admin account to manage orders, services and pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  autoComplete="username"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <Button type="submit" className="w-full min-h-[48px]" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…
                    </>
                  ) : (
                    "Sign In as Admin"
                  )}
                </Button>
              </form>
              <p className="text-center text-xs text-muted-foreground">
                Customers don&apos;t need an account — you can place an order directly from our services.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
