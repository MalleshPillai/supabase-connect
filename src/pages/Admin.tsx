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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trash2, ExternalLink, Save } from "lucide-react";
import { motion } from "framer-motion";

const statusOptions = ["pending", "printing", "ready", "delivered"];
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  printing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-muted text-muted-foreground",
};

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({ title: "Access denied", variant: "destructive" });
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Pricing
  const { data: pricing, isLoading: pricingLoading } = useQuery({
    queryKey: ["admin-pricing"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing").select("*").order("key");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const [pricingEdits, setPricingEdits] = useState<Record<string, number>>({});

  useEffect(() => {
    if (pricing) {
      const map: Record<string, number> = {};
      pricing.forEach((p: any) => { map[p.id] = Number(p.value); });
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-foreground mb-8">
            Admin Dashboard
          </motion.h1>

          <Tabs defaultValue="orders">
            <TabsList className="mb-6">
              <TabsTrigger value="orders">Orders ({orders?.length || 0})</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardContent className="p-0">
                  {ordersLoading ? (
                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                  ) : !orders?.length ? (
                    <div className="p-8 text-center text-muted-foreground">No orders yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
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
            </TabsContent>

            <TabsContent value="pricing">
              <Card>
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
