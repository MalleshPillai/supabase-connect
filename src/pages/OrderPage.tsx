import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePricing, calculateTotal } from "@/hooks/usePricing";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Settings, User, Receipt, CheckCircle, ArrowLeft, ArrowRight, Loader2, LogIn } from "lucide-react";

const ORDER_DRAFT_KEY = "psh_order_draft_v1";
const MAX_DRAFT_FILE_BYTES = 4 * 1024 * 1024;

interface OrderData {
  file: File | null;
  fileName: string;
  fileUrl: string;
  printAllPages: boolean;
  pageRange: string;
  numPages: number;
  numCopies: number;
  colorMode: string;
  firstPageColor: boolean;
  firstPagePhotoSheet: boolean;
  glassWhiteSheet: boolean;
  spiralColor: string;
  pageColor: string;
  fullName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  preferredTiming: string;
}

const defaultOrderData: OrderData = {
  file: null, fileName: "", fileUrl: "",
  printAllPages: true, pageRange: "", numPages: 1, numCopies: 1,
  colorMode: "bw", firstPageColor: false, firstPagePhotoSheet: false, glassWhiteSheet: false,
  spiralColor: "black", pageColor: "white",
  fullName: "", phone: "", email: "", deliveryAddress: "", preferredTiming: "",
};

const spiralColors = ["Black", "White", "Blue", "Red", "Green", "Yellow", "Pink"];
const pageColors = ["White", "Light Blue", "Light Yellow", "Light Green", "Light Pink"];

const OrderPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, signIn, signInWithGoogle } = useAuth();
  const { data: pricing, isLoading: pricingLoading } = usePricing();
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState<OrderData>(defaultOrderData);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceLoadState, setServiceLoadState] = useState<"loading" | "ok" | "missing">("loading");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isSpiral = slug === "spiral-binding";
  /** Spiral: 1–5 flow, 6 sign-in, 7 success. Non-spiral: 1–4 flow, 5 sign-in, 6 success. */
  const loginStep = isSpiral ? 6 : 5;
  const totalSteps = isSpiral ? 7 : 6;

  useEffect(() => {
    if (!slug) {
      setServiceLoadState("missing");
      setServiceName("");
      return;
    }
    setServiceLoadState("loading");
    supabase
      .from("services")
      .select("name")
      .eq("slug", slug)
      .eq("status", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data?.name) {
          setServiceName("");
          setServiceLoadState("missing");
        } else {
          setServiceName(data.name);
          setServiceLoadState("ok");
        }
      });
  }, [slug]);

  const persistOrderDraft = useCallback(async () => {
    if (!slug) return;
    const { file, ...rest } = order;
    let fileDataUrl: string | null = null;
    if (file && file.size <= MAX_DRAFT_FILE_BYTES) {
      fileDataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(new Error("read failed"));
        r.readAsDataURL(file);
      });
    } else if (file && file.size > MAX_DRAFT_FILE_BYTES) {
      toast({
        title: "Large file",
        description: "After Google sign-in, you may need to re-upload your file if the draft cannot be restored.",
      });
    }
    sessionStorage.setItem(
      ORDER_DRAFT_KEY,
      JSON.stringify({
        v: 1,
        slug,
        targetStep: loginStep,
        order: { ...rest, fileDataUrl, fileName: order.fileName, hadFile: !!file },
      })
    );
  }, [slug, order, loginStep]);

  useEffect(() => {
    if (!slug) return;
    const raw = sessionStorage.getItem(ORDER_DRAFT_KEY);
    if (!raw) return;
    let cancelled = false;
    (async () => {
      try {
        const d = JSON.parse(raw);
        if (d.v !== 1 || d.slug !== slug) return;
        const o = d.order;
        let file: File | null = null;
        if (o.fileDataUrl && o.fileName) {
          const blob = await (await fetch(o.fileDataUrl)).blob();
          file = new File([blob], o.fileName, { type: blob.type || "application/pdf" });
        } else if (o.hadFile) {
          toast({ title: "Please upload your file again", description: "Then continue to place your order.", variant: "destructive" });
          if (!cancelled) {
            setStep(1);
            setOrder((prev) => ({
              ...defaultOrderData,
              fullName: o.fullName || "",
              phone: o.phone || "",
              email: o.email || "",
              deliveryAddress: o.deliveryAddress || "",
              preferredTiming: o.preferredTiming || "",
            }));
          }
          sessionStorage.removeItem(ORDER_DRAFT_KEY);
          return;
        }
        if (cancelled) return;
        const nextOrder = {
          file,
          fileName: o.fileName || "",
          fileUrl: "",
          printAllPages: o.printAllPages ?? true,
          pageRange: o.pageRange || "",
          numPages: o.numPages ?? 1,
          numCopies: o.numCopies ?? 1,
          colorMode: o.colorMode || "bw",
          firstPageColor: !!o.firstPageColor,
          firstPagePhotoSheet: !!o.firstPagePhotoSheet,
          glassWhiteSheet: !!o.glassWhiteSheet,
          spiralColor: o.spiralColor || "black",
          pageColor: o.pageColor || "white",
          fullName: o.fullName || "",
          phone: o.phone || "",
          email: o.email || "",
          deliveryAddress: o.deliveryAddress || "",
          preferredTiming: o.preferredTiming || "",
        };
        if (cancelled) return;
        setOrder(nextOrder);
        if (cancelled) return;
        setStep(d.targetStep ?? loginStep);
        sessionStorage.removeItem(ORDER_DRAFT_KEY);
        toast({ title: "You're signed in", description: "Review and place your order below." });
      } catch {
        sessionStorage.removeItem(ORDER_DRAFT_KEY);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, loginStep]);

  const update = (fields: Partial<OrderData>) => setOrder((prev) => ({ ...prev, ...fields }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF or image file.", variant: "destructive" });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 50MB.", variant: "destructive" });
      return;
    }
    update({ file, fileName: file.name });
  };

  const uploadFile = async () => {
    if (!order.file || !user) return "";
    setUploading(true);
    const ext = order.file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("order-files").upload(path, order.file);
    setUploading(false);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return "";
    }
    return path;
  };

  const prices = pricing
    ? calculateTotal(pricing, {
        numPages: order.numPages,
        numCopies: order.numCopies,
        colorMode: order.colorMode,
        firstPageColor: order.firstPageColor,
        firstPagePhotoSheet: order.firstPagePhotoSheet,
        glassWhiteSheet: order.glassWhiteSheet,
        serviceSlug: slug || "",
      })
    : { subtotal: 0, bindingCharges: 0, specialCharges: 0, total: 0 };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!order.file) { toast({ title: "Please upload a file", variant: "destructive" }); return false; }
        return true;
      case 2:
        if (order.numPages < 1) { toast({ title: "Enter valid number of pages", variant: "destructive" }); return false; }
        if (order.numCopies < 1) { toast({ title: "Enter valid number of copies", variant: "destructive" }); return false; }
        if (!order.printAllPages && !order.pageRange.trim()) { toast({ title: "Enter page range", variant: "destructive" }); return false; }
        return true;
      case 3:
        if (isSpiral) return true;
        // For non-spiral, step 3 is user details
        return validateUserDetails();
      case 4:
        if (isSpiral) return validateUserDetails();
        return true; // bill summary
      default:
        return true;
    }
  };

  const validateUserDetails = () => {
    if (!order.fullName.trim()) { toast({ title: "Enter your full name", variant: "destructive" }); return false; }
    if (!order.phone.trim() || order.phone.length < 10) { toast({ title: "Enter valid phone number", variant: "destructive" }); return false; }
    if (!order.email.trim() || !order.email.includes("@")) { toast({ title: "Enter valid email", variant: "destructive" }); return false; }
    if (!order.deliveryAddress.trim()) { toast({ title: "Enter delivery address", variant: "destructive" }); return false; }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, totalSteps));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const getStepContent = () => {
    if (isSpiral) {
      switch (step) {
        case 1: return renderFileUpload();
        case 2: return renderPrintOptions();
        case 3: return renderSpiralOptions();
        case 4: return renderUserDetails();
        case 5: return renderBillSummary();
        case 6: return renderLoginToPlaceOrder();
        case 7: return renderConfirmation();
      }
    } else {
      switch (step) {
        case 1: return renderFileUpload();
        case 2: return renderPrintOptions();
        case 3: return renderUserDetails();
        case 4: return renderBillSummary();
        case 5: return renderLoginToPlaceOrder();
        case 6: return renderConfirmation();
      }
    }
  };

  const isBillSummaryStep = isSpiral ? step === 5 : step === 4;
  const isLoginStep = step === loginStep;
  const isSuccessStep = isSpiral ? step === 7 : step === 6;

  const handleGoogleContinue = async () => {
    setGoogleLoading(true);
    try {
      await persistOrderDraft();
      await signInWithGoogle(`/order/${slug}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not start Google sign-in";
      toast({ title: "Google sign-in failed", description: message, variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      toast({ title: "Enter email and password", variant: "destructive" });
      return;
    }
    setLoginLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast({ title: "Signed in", description: "Place your order when you're ready." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      toast({ title: "Sign in failed", description: message, variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const filePath = await uploadFile();
      if (!filePath) { setSubmitting(false); return; }

      const { data: orderNumData } = await supabase.rpc("generate_order_number");
      const num = orderNumData || `PSH-${Date.now()}`;

      const { error } = await supabase.from("orders").insert({
        order_number: num,
        user_id: user.id,
        service_slug: slug || "",
        file_url: filePath,
        file_name: order.fileName,
        print_all_pages: order.printAllPages,
        page_range: order.pageRange || null,
        num_pages: order.numPages,
        num_copies: order.numCopies,
        color_mode: order.colorMode,
        first_page_color: order.firstPageColor,
        first_page_photo_sheet: order.firstPagePhotoSheet,
        glass_white_sheet: order.glassWhiteSheet,
        spiral_color: isSpiral ? order.spiralColor : null,
        page_color: isSpiral ? order.pageColor : null,
        full_name: order.fullName,
        phone: order.phone,
        email: order.email,
        delivery_address: order.deliveryAddress,
        preferred_timing: order.preferredTiming || null,
        subtotal: prices.subtotal,
        binding_charges: prices.bindingCharges,
        special_charges: prices.specialCharges,
        total_amount: prices.total,
        status: "pending",
      });

      if (error) throw error;
      sessionStorage.removeItem(ORDER_DRAFT_KEY);
      setOrderNumber(num);
      setStep(totalSteps);
      toast({ title: "Order placed successfully!" });
    } catch (err: any) {
      toast({ title: "Error placing order", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const renderFileUpload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-foreground mb-1">Upload Your File</h3>
        <p className="text-muted-foreground text-sm">PDF or Image files (max 50MB)</p>
      </div>
      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          {order.file ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <FileText className="w-5 h-5" />
              <span className="font-medium">{order.fileName}</span>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-2">Click to browse or drag & drop</p>
              <p className="text-xs text-muted-foreground">PDF, PNG, JPG, WEBP</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );

  const renderPrintOptions = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <Settings className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-foreground">Print Options</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox checked={order.printAllPages} onCheckedChange={(c) => update({ printAllPages: !!c })} />
          <label className="text-sm font-medium text-foreground">Print All Pages</label>
        </div>
        {!order.printAllPages && (
          <Input placeholder="Page range (e.g., 1-10, 15, 20-30)" value={order.pageRange} onChange={(e) => update({ pageRange: e.target.value })} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Number of Pages</label>
            <Input type="number" min={1} value={order.numPages} onChange={(e) => update({ numPages: parseInt(e.target.value) || 1 })} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Number of Copies</label>
            <Input type="number" min={1} value={order.numCopies} onChange={(e) => update({ numCopies: parseInt(e.target.value) || 1 })} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Color Mode</label>
          <Select value={order.colorMode} onValueChange={(v) => update({ colorMode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bw">Black & White</SelectItem>
              <SelectItem value="color">Color</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox checked={order.firstPageColor} onCheckedChange={(c) => update({ firstPageColor: !!c })} />
            <label className="text-sm text-foreground">First page in color</label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox checked={order.firstPagePhotoSheet} onCheckedChange={(c) => update({ firstPagePhotoSheet: !!c })} />
            <label className="text-sm text-foreground">First page photo sheet</label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox checked={order.glassWhiteSheet} onCheckedChange={(c) => update({ glassWhiteSheet: !!c })} />
            <label className="text-sm text-foreground">One page glass white sheet</label>
          </div>
        </div>
      </div>

      {pricing && (
        <div className="bg-accent/50 rounded-lg p-4 text-sm">
          <p className="font-medium text-foreground">Live Estimate: <span className="text-primary">₹{prices.total.toFixed(2)}</span></p>
        </div>
      )}
    </div>
  );

  const renderSpiralOptions = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <Settings className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-foreground">Spiral Binding Options</h3>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Spiral Color</label>
        <Select value={order.spiralColor} onValueChange={(v) => update({ spiralColor: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {spiralColors.map((c) => (
              <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Page Color</label>
        <Select value={order.pageColor} onValueChange={(v) => update({ pageColor: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {pageColors.map((c) => (
              <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-accent/50 rounded-lg p-4 text-sm">
        <p className="text-foreground">Copies: <strong>{order.numCopies}</strong></p>
      </div>
    </div>
  );

  const renderUserDetails = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <User className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-foreground">Your Details</h3>
      </div>

      <div className="space-y-4">
        <Input placeholder="Full Name" value={order.fullName} onChange={(e) => update({ fullName: e.target.value })} maxLength={100} />
        <Input placeholder="Phone Number" value={order.phone} onChange={(e) => update({ phone: e.target.value })} maxLength={15} />
        <Input type="email" placeholder="Email ID" value={order.email} onChange={(e) => update({ email: e.target.value })} maxLength={255} />
        <Textarea placeholder="Delivery Address" value={order.deliveryAddress} onChange={(e) => update({ deliveryAddress: e.target.value })} maxLength={500} rows={3} />
        <Input placeholder="Preferred Timing (optional)" value={order.preferredTiming} onChange={(e) => update({ preferredTiming: e.target.value })} maxLength={100} />
      </div>
    </div>
  );

  const renderBillSummary = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <Receipt className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-foreground">Order Summary</h3>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Service</span><span className="font-medium text-foreground">{serviceName}</span></div>
        <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">File</span><span className="font-medium text-foreground">{order.fileName}</span></div>
        <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Pages</span><span className="font-medium text-foreground">{order.numPages}</span></div>
        <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Copies</span><span className="font-medium text-foreground">{order.numCopies}</span></div>
        <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Color Mode</span><span className="font-medium text-foreground">{order.colorMode === "color" ? "Color" : "B/W"}</span></div>
        {order.firstPageColor && <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">First Page Color</span><span className="text-foreground">✓</span></div>}
        {order.firstPagePhotoSheet && <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Photo Sheet</span><span className="text-foreground">✓</span></div>}
        {order.glassWhiteSheet && <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Glass White Sheet</span><span className="text-foreground">✓</span></div>}
        {isSpiral && <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Spiral Color</span><span className="font-medium text-foreground capitalize">{order.spiralColor}</span></div>}

        <div className="pt-3 space-y-2">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">₹{prices.subtotal.toFixed(2)}</span></div>
          {prices.bindingCharges > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Binding</span><span className="text-foreground">₹{prices.bindingCharges.toFixed(2)}</span></div>}
          {prices.specialCharges > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Special Options</span><span className="text-foreground">₹{prices.specialCharges.toFixed(2)}</span></div>}
          <div className="flex justify-between pt-2 border-t text-lg font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-primary">₹{prices.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button onClick={nextStep} className="w-full min-h-[48px] touch-manipulation" size="lg">
        Continue to sign in
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Sign in is required only to confirm and place your order.
      </p>
    </div>
  );

  const renderLoginToPlaceOrder = () => (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <LogIn className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-foreground">Sign in to place order</h3>
        <p className="text-sm text-muted-foreground mt-2">Use Google or your account to confirm.</p>
      </div>

      {user ? (
        <div className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <Button
            onClick={handleConfirmOrder}
            className="w-full min-h-[48px] touch-manipulation"
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing order...
              </>
            ) : (
              "Place order"
            )}
          </Button>
        </div>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[48px] touch-manipulation gap-2 border-primary/30"
            onClick={handleGoogleContinue}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or email</span>
            </div>
          </div>

          <form onSubmit={handleInlineLogin} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              autoComplete="email"
              maxLength={255}
            />
            <Input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full min-h-[48px]" disabled={loginLoading}>
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <button
              type="button"
              onClick={async () => {
                await persistOrderDraft();
                navigate(`/auth?next=${encodeURIComponent(`/order/${slug ?? ""}`)}&mode=signup`);
              }}
              className="text-primary font-medium hover:underline"
            >
              Create an account
            </button>
          </p>
        </>
      )}
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h3>
        <p className="text-muted-foreground">Thank you. We will contact you soon.</p>
      </div>
      {orderNumber && (
        <div className="bg-accent rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Your Order ID</p>
          <p className="text-xl font-bold text-primary">{orderNumber}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={`https://wa.me/919363926173?text=${encodeURIComponent(`Hi, I just placed an order. Order ID: ${orderNumber}. Please confirm.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block sm:inline-block"
        >
          <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto min-h-[48px] touch-manipulation">
            Confirm on WhatsApp
          </Button>
        </a>
        <Button variant="outline" onClick={() => navigate("/")} className="min-h-[48px] touch-manipulation w-full sm:w-auto">
          Back to Home
        </Button>
      </div>
    </div>
  );

  const stepLabels = isSpiral
    ? ["Upload", "Print", "Spiral", "Details", "Summary", "Sign in", "Done"]
    : ["Upload", "Print", "Details", "Summary", "Sign in", "Done"];

  if (pricingLoading || serviceLoadState === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (serviceLoadState === "missing") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <Card className="max-w-md w-full border-primary/15 shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-lg font-semibold text-foreground">Service not available</p>
              <p className="text-sm text-muted-foreground">
                This service is inactive or does not exist. Try another option from our homepage.
              </p>
              <Button onClick={() => navigate("/")} className="min-h-[48px]">
                Back to home
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 w-full min-w-0">
          {/* Service title */}
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl sm:text-2xl font-bold text-foreground text-center mb-6 sm:mb-8">
            {serviceName || "Order"}
          </motion.h2>

          {/* Step indicator - scrollable on small screens */}
          <div className="overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 mb-6 sm:mb-8" style={{ WebkitOverflowScrolling: "touch" }}>
            <div className="flex items-center justify-center gap-2 min-w-max sm:min-w-0">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors shrink-0 ${
                    i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-primary/20 to-primary/5 text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block whitespace-nowrap">{label}</span>
                  {i < stepLabels.length - 1 && <div className={`w-4 sm:w-6 h-0.5 shrink-0 ${i + 1 < step ? "bg-primary" : "bg-primary/30"}`} />}
                </div>
              ))}
            </div>
          </div>

          <Card className="shadow-xl border-primary/10 bg-gradient-to-br from-white/95 to-primary/5">
            <CardContent className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {getStepContent()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              {!isSuccessStep && (
                <div className="flex justify-between gap-3 mt-6 sm:mt-8 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                    className="min-h-[44px] touch-manipulation shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  {!isBillSummaryStep && !isLoginStep && (
                    <Button onClick={nextStep} className="min-h-[44px] touch-manipulation shrink-0">
                      Next <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderPage;
