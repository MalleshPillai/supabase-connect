import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  Trash2,
  ExternalLink,
  Save,
  LayoutDashboard,
  ShoppingBag,
  IndianRupee,
  MessageCircle,
  Menu,
  X,
  TrendingUp,
  Clock,
  CheckCircle,
  Package,
  PlusCircle,
  ClipboardList,
  LayoutList,
  Palette,
} from "lucide-react";
import { AdminServicesPanel } from "@/components/admin/AdminServicesPanel";
import { AdminLandingFormFieldsPanel } from "@/components/admin/AdminLandingFormFieldsPanel";
import { motion, AnimatePresence } from "framer-motion";

const statusOptions = ["pending", "printing", "ready", "delivered"];
const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  printing: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  ready: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  delivered: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
};

type AdminView =
  | "dashboard"
  | "orders"
  | "pricing"
  | "graphic-design"
  | "enquiries"
  | "services-create"
  | "services-manage"
  | "landing-fields";

const GD_PLAN_PRICING_KEYS: string[] = ["gd_weekly_plan_price", "gd_monthly_plan_price"];

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState<AdminView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({ title: "Access denied", variant: "destructive" });
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: pricing, isLoading: pricingLoading } = useQuery({
    queryKey: ["admin-pricing"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing").select("*").order("key");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: enquiries, isLoading: enquiriesLoading } = useQuery({
    queryKey: ["admin-enquiries"],
    queryFn: async () => {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: isAdmin,
  });

  const [pricingEdits, setPricingEdits] = useState<Record<string, number>>({});

  useEffect(() => {
    if (pricing) {
      const map: Record<string, number> = {};
      pricing.forEach((p: { id: string; value: number }) => {
        map[p.id] = Number(p.value);
      });
      setPricingEdits(map);
    }
  }, [pricing]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Status updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Delete this order?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Order deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    }
  };

  const deleteInquiry = async (inquiryId: string) => {
    if (!confirm("Delete this enquiry?")) return;
    const { error } = await supabase.from("inquiries").delete().eq("id", inquiryId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Enquiry deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-enquiries"] });
    }
  };

  const savePricing = async (id: string) => {
    const { error } = await supabase.from("pricing").update({ value: pricingEdits[id], updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Pricing updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("order-files").getPublicUrl(filePath);
    return data.publicUrl;
  };

  // KPIs from orders
  const totalOrders = orders?.length ?? 0;
  const totalRevenue = orders?.reduce((sum: number, o: { total_amount?: number }) => sum + Number(o.total_amount ?? 0), 0) ?? 0;
  const pendingCount = orders?.filter((o: { status?: string }) => o.status === "pending").length ?? 0;
  const deliveredCount = orders?.filter((o: { status?: string }) => o.status === "delivered").length ?? 0;
  const recentOrders = orders?.slice(0, 5) ?? [];

  const navItems: { id: AdminView; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "pricing", label: "Pricing", icon: IndianRupee },
    { id: "graphic-design", label: "Graphic design", icon: Palette },
    { id: "enquiries", label: "Enquiries", icon: MessageCircle },
  ];

  const graphicDesignPricingRows =
    pricing?.filter((p: { key: string }) => GD_PLAN_PRICING_KEYS.includes(p.key)) ?? [];
  const sortedGraphicDesignPricing = [...graphicDesignPricingRows].sort(
    (a: { key: string }, b: { key: string }) => GD_PLAN_PRICING_KEYS.indexOf(a.key) - GD_PLAN_PRICING_KEYS.indexOf(b.key)
  );

  const servicesNav: { id: AdminView; label: string; icon: React.ElementType }[] = [
    { id: "services-create", label: "Create Service", icon: PlusCircle },
    { id: "services-manage", label: "Manage Services", icon: ClipboardList },
    { id: "landing-fields", label: "Landing form fields", icon: LayoutList },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-primary/10 bg-gradient-to-b from-slate-900/95 via-primary/90 to-slate-900/95 text-white">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-bold text-lg tracking-tight flex items-center gap-2">
              <Package className="h-5 w-5" /> Admin
            </h2>
          </div>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                  {item.id === "orders" && totalOrders > 0 && (
                    <span className="ml-auto bg-white/20 rounded-full px-2 py-0.5 text-xs">{totalOrders}</span>
                  )}
                </button>
              );
            })}
            <div className="pt-3 mt-2 border-t border-white/10">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">Services</p>
              {servicesNav.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Mobile sidebar trigger */}
        <div className="lg:hidden fixed bottom-4 left-4 z-40">
          <Button
            size="icon"
            className="rounded-full h-12 w-12 shadow-lg bg-gradient-to-r from-primary to-primary/80 text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed inset-y-0 left-0 w-72 z-50 flex flex-col bg-gradient-to-b from-slate-900 via-primary/95 to-slate-900 text-white shadow-2xl lg:hidden"
              >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="font-bold text-lg flex items-center gap-2"><Package className="h-5 w-5" /> Admin</h2>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setSidebarOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="p-3 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = view === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setView(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${active ? "bg-white/20" : "text-white/80 hover:bg-white/10"}`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                        {item.id === "orders" && totalOrders > 0 && (
                          <span className="ml-auto bg-white/20 rounded-full px-2 py-0.5 text-xs">{totalOrders}</span>
                        )}
                      </button>
                    );
                  })}
                  <div className="pt-3 mt-2 border-t border-white/10">
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">Services</p>
                    {servicesNav.map((item) => {
                      const Icon = item.icon;
                      const active = view === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setView(item.id); setSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${active ? "bg-white/20" : "text-white/80 hover:bg-white/10"}`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-primary/5 to-transparent min-h-[70vh]">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {view === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>

                  {/* KPI cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Total Orders",
                        value: totalOrders,
                        sub: "All time",
                        icon: ShoppingBag,
                        gradient: "from-primary/20 to-primary/5",
                        iconBg: "bg-primary/20",
                        iconColor: "text-primary",
                      },
                      {
                        label: "Total Revenue",
                        value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                        sub: "All orders",
                        icon: TrendingUp,
                        gradient: "from-emerald-500/20 to-emerald-500/5",
                        iconBg: "bg-emerald-500/20",
                        iconColor: "text-emerald-600",
                      },
                      {
                        label: "Pending",
                        value: pendingCount,
                        sub: "Awaiting action",
                        icon: Clock,
                        gradient: "from-amber-500/20 to-amber-500/5",
                        iconBg: "bg-amber-500/20",
                        iconColor: "text-amber-600",
                      },
                      {
                        label: "Delivered",
                        value: deliveredCount,
                        sub: "Completed",
                        icon: CheckCircle,
                        gradient: "from-blue-500/20 to-blue-500/5",
                        iconBg: "bg-blue-500/20",
                        iconColor: "text-blue-600",
                      },
                    ].map((kpi, i) => {
                      const Icon = kpi.icon;
                      return (
                        <motion.div
                          key={kpi.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <Card className={`overflow-hidden border-primary/10 bg-gradient-to-br from-white/95 to-primary/5 hover:shadow-lg transition-shadow`}>
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
                                </div>
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${kpi.iconBg} ${kpi.iconColor}`}>
                                  <Icon className="h-6 w-6" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Recent orders */}
                  <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ordersLoading ? (
                        <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                      ) : !recentOrders.length ? (
                        <p className="text-muted-foreground text-center py-6">No orders yet.</p>
                      ) : (
                        <div className="overflow-x-auto -mx-4 sm:mx-0" style={{ WebkitOverflowScrolling: "touch" }}>
                          <Table className="min-w-[400px]">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {recentOrders.map((order: any) => (
                                <TableRow key={order.id}>
                                  <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                                  <TableCell className="text-sm">{order.full_name}</TableCell>
                                  <TableCell className="font-semibold">₹{Number(order.total_amount).toFixed(2)}</TableCell>
                                  <TableCell>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status] ?? ""}`}>
                                      {order.status}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      {recentOrders.length > 0 && (
                        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setView("orders")}>
                          View all orders
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {view === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Orders</h1>
                  <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
                    <CardContent className="p-0">
                      {ordersLoading ? (
                        <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                      ) : !orders?.length ? (
                        <div className="p-8 text-center text-muted-foreground">No orders yet.</div>
                      ) : (
                        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0" style={{ WebkitOverflowScrolling: "touch" }}>
                          <Table className="min-w-[700px]">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>File</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orders.map((order: any) => (
                                <TableRow key={order.id}>
                                  <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                                  <TableCell className="text-sm">{order.service_slug}</TableCell>
                                  <TableCell>
                                    <div className="text-sm">{order.full_name}</div>
                                    <div className="text-xs text-muted-foreground">{order.phone}</div>
                                  </TableCell>
                                  <TableCell className="font-semibold">₹{Number(order.total_amount).toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                                      <SelectTrigger className="w-[130px] h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {statusOptions.map((s) => (
                                          <SelectItem key={s} value={s}>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[s]}`}>{s}</span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    {order.file_url && (
                                      <a href={getFileUrl(order.file_url)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" /> View
                                      </a>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteOrder(order.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {view === "enquiries" && (
                <motion.div
                  key="enquiries"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Enquiries</h1>
                  <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
                    <CardContent className="p-0">
                      {enquiriesLoading ? (
                        <div className="p-8 text-center">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                        </div>
                      ) : !enquiries?.length ? (
                        <div className="p-8 text-center text-muted-foreground">No enquiries yet.</div>
                      ) : (
                        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0" style={{ WebkitOverflowScrolling: "touch" }}>
                          <Table className="min-w-[900px]">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {enquiries.map((inq: any) => (
                                <TableRow key={inq.id}>
                                  <TableCell className="font-medium">{inq.name}</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">{inq.email ?? "—"}</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">{inq.phone ?? "—"}</TableCell>
                                  <TableCell className="text-sm">
                                    <div className="max-w-[420px] whitespace-pre-wrap">{inq.message}</div>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">{inq.source}</TableCell>
                                  <TableCell className="text-xs text-muted-foreground">{new Date(inq.created_at).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => deleteInquiry(inq.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {view === "pricing" && (
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Pricing</h1>
                  <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
                    <CardHeader>
                      <CardTitle>Pricing Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pricingLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                      ) : (
                        <div className="space-y-4">
                          {pricing?.map((p: any) => (
                            <div key={p.id} className="flex items-center gap-4">
                              <label className="text-sm font-medium text-foreground flex-1">{p.label}</label>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">₹</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  className="w-28"
                                  value={pricingEdits[p.id] ?? p.value}
                                  onChange={(e) => setPricingEdits({ ...pricingEdits, [p.id]: parseFloat(e.target.value) || 0 })}
                                />
                                <Button size="sm" variant="outline" onClick={() => savePricing(p.id)}>
                                  <Save className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {view === "graphic-design" && (
                <motion.div
                  key="graphic-design"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Graphic design</h1>
                  <p className="text-muted-foreground mb-6 max-w-2xl">
                    Set weekly and monthly plan rates. They appear on the public Graphic design page; visitors can enter how many weeks or months they need and see an estimated total.
                  </p>
                  <Card className="border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        Plan pricing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pricingLoading ? (
                        <div className="py-8 text-center">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                        </div>
                      ) : sortedGraphicDesignPricing.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No graphic design plan rows found. Run the latest database migration (adds{" "}
                          <code className="text-xs bg-muted px-1 rounded">gd_weekly_plan_price</code> and{" "}
                          <code className="text-xs bg-muted px-1 rounded">gd_monthly_plan_price</code>) then refresh.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {sortedGraphicDesignPricing.map((p: any) => (
                            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                              <label className="text-sm font-medium text-foreground flex-1">{p.label}</label>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-muted-foreground">₹</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  className="w-32"
                                  value={pricingEdits[p.id] ?? p.value}
                                  onChange={(e) =>
                                    setPricingEdits({ ...pricingEdits, [p.id]: parseFloat(e.target.value) || 0 })
                                  }
                                />
                                <Button size="sm" variant="outline" onClick={() => savePricing(p.id)}>
                                  <Save className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {view === "services-create" && (
                <motion.div
                  key="services-create"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create Service</h1>
                  <AdminServicesPanel mode="create" />
                </motion.div>
              )}

              {view === "services-manage" && (
                <motion.div
                  key="services-manage"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Services</h1>
                  <AdminServicesPanel mode="manage" />
                </motion.div>
              )}

              {view === "landing-fields" && (
                <motion.div
                  key="landing-fields"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Categories and form fields</h1>
                  <AdminLandingFormFieldsPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
