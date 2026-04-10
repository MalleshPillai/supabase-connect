import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LANDING_FORM_CATEGORY_PAPER } from "@/lib/serviceCategories";
import type { Tables } from "@/integrations/supabase/types";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type FormFieldRow = Tables<"landing_form_fields">;

const PROJECT_STEP_FIELD_KEYS = new Set([
  "graduate_level",
  "project_title",
  "department",
  "num_pages",
  "front_page_color",
  "abstract_text",
  "abstract_file",
  "notes",
]);

const STUDENT_STEP_FIELD_KEYS = new Set(["roll_number", "college"]);

function parseOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

const PaperProjectPage = () => {
  const { data: fields, isLoading } = useQuery({
    queryKey: ["landing-form-fields", LANDING_FORM_CATEGORY_PAPER],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_form_fields")
        .select("*")
        .eq("category", LANDING_FORM_CATEGORY_PAPER)
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FormFieldRow[];
    },
  });

  const [step, setStep] = useState(1);
  const stepLabels = ["Project", "Details", "Sign in", "Done"];
  const totalSteps = stepLabels.length;
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const navigate = useNavigate();
  const { user, loading: authLoading, signIn } = useAuth();

  const sortedFields = useMemo(() => fields ?? [], [fields]);

  const step1Fields = useMemo(
    () => sortedFields.filter((f) => PROJECT_STEP_FIELD_KEYS.has(f.field_key)),
    [sortedFields]
  );
  const step2Fields = useMemo(
    () => sortedFields.filter((f) => STUDENT_STEP_FIELD_KEYS.has(f.field_key)),
    [sortedFields]
  );

  const setFieldValue = (key: string, v: string) => {
    setValues((p) => ({ ...p, [key]: v }));
  };

  const uploadFile = async (fieldKey: string, file: File): Promise<string> => {
    const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${crypto.randomUUID()}-${safe}`;
    const { error } = await supabase.storage.from("paper-submissions").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("paper-submissions").getPublicUrl(path);
    return data.publicUrl;
  };

  const validateRequiredFields = (rows: FormFieldRow[]): boolean => {
    for (const f of rows) {
      if (!f.required) continue;
      if (f.field_type === "file") {
        if (!files[f.field_key]) {
          toast({ title: `${f.label} is required`, variant: "destructive" });
          return false;
        }
      } else if (!String(values[f.field_key] ?? "").trim()) {
        toast({ title: `${f.label} is required`, variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const validateNumPages = (): boolean => {
    const raw = values["num_pages"] ?? "";
    const n = Number(raw);
    if (!raw.toString().trim() || !Number.isFinite(n) || n < 1) {
      toast({ title: "Enter a valid number of pages", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    if (!validateRequiredFields(step1Fields)) return false;
    const hasNumPages = step1Fields.some((f) => f.field_key === "num_pages");
    if (hasNumPages) return validateNumPages();
    return true;
  };

  const validateStep2 = () => {
    if (!fullName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return false;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      toast({ title: "Enter a valid phone number", variant: "destructive" });
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Enter a valid email", variant: "destructive" });
      return false;
    }
    if (!validateRequiredFields(step2Fields)) return false;
    return true;
  };

  const handleSignInAndContinue = async () => {
    if (placed) return;
    if (user) {
      setStep(4);
      return;
    }
    const e = email.trim();
    if (!e || !e.includes("@")) {
      toast({ title: "Enter a valid email for sign in", variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: "Enter your password", variant: "destructive" });
      return;
    }

    setSigningIn(true);
    try {
      await signIn(e, password);
      toast({ title: "Signed in", description: "Place your order when you're ready." });
      setStep(4);
    } catch (err) {
      toast({
        title: "Sign in failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSigningIn(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (placed) return;
    if (!user) {
      toast({ title: "Please sign in to place your order", variant: "destructive" });
      setStep(3);
      return;
    }
    if (!validateStep1() || !validateStep2()) return;

    setPlacing(true);
    try {
      const responses: Record<string, string> = { ...values };
      for (const f of sortedFields) {
        if (f.field_type !== "file") continue;
        const file = files[f.field_key];
        if (file) {
          responses[f.field_key] = await uploadFile(f.field_key, file);
        } else if (!f.required) {
          responses[f.field_key] = "";
        }
      }

      const { error } = await supabase.from("paper_project_submissions").insert({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        responses: responses as unknown as Record<string, unknown>,
      });
      if (error) throw error;

      toast({
        title: "Order placed!",
        description: "We will review your paper project details and get back to you.",
      });
      setPlaced(true);
      // Keep values for the confirmation view; user can start a new request from below.
    } catch (err) {
      toast({
        title: "Could not submit",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPlacing(false);
    }
  };

  const renderDynamicField = (f: FormFieldRow) => {
    const id = `fld-${f.field_key}`;
    const labelSuffix = f.required ? " *" : "";

    return (
      <div key={f.id} className="space-y-2">
        {f.field_type === "select" && f.field_key === "graduate_level" ? (
          <Label>
            {f.label}
            {labelSuffix}
          </Label>
        ) : (
          <Label htmlFor={id}>
            {f.label}
            {labelSuffix}
          </Label>
        )}

        {f.field_type === "text" && (
          <Input
            id={id}
            value={values[f.field_key] ?? ""}
            onChange={(e) => setFieldValue(f.field_key, e.target.value)}
            required={f.required}
            type={f.field_key === "num_pages" ? "number" : "text"}
            min={f.field_key === "num_pages" ? 1 : undefined}
            inputMode={f.field_key === "num_pages" ? "numeric" : undefined}
            placeholder={f.field_key === "project_title" ? "Type your project title" : undefined}
            maxLength={200}
          />
        )}

        {f.field_type === "textarea" && (
          <Textarea
            id={id}
            value={values[f.field_key] ?? ""}
            onChange={(e) => setFieldValue(f.field_key, e.target.value)}
            rows={4}
            required={f.required}
          />
        )}

        {f.field_type === "select" && f.field_key === "graduate_level" && (
          <div className="space-y-2">
            {parseOptions(f.options).map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={f.field_key}
                  checked={values[f.field_key] === opt}
                  onChange={() => setFieldValue(f.field_key, opt)}
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {f.field_type === "select" && f.field_key !== "graduate_level" && (
          <select
            id={id}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={values[f.field_key] ?? ""}
            onChange={(e) => setFieldValue(f.field_key, e.target.value)}
            required={f.required}
          >
            <option value="">Select…</option>
            {parseOptions(f.options).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {f.field_type === "file" && (
          <Input
            id={id}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFiles((p) => ({ ...p, [f.field_key]: e.target.files?.[0] ?? null }))}
            required={f.required}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <Header />
      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Paper projects</h1>
          <p className="mt-3 text-muted-foreground">
            Tell us about your paper project — we will review your details and get back to you.
          </p>

          <div className="mt-8 overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
            <div className="flex items-center justify-center gap-2 min-w-max">
              {stepLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors shrink-0 ${
                      i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-primary/20 to-primary/5 text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block whitespace-nowrap">{label}</span>
                  {i < stepLabels.length - 1 && (
                    <div
                      className={`w-4 sm:w-6 h-0.5 shrink-0 ${
                        i + 1 < step ? "bg-primary" : "bg-primary/30"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="mt-8 border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle>
                {step === 1 ? "Project details" : step === 2 ? "Student details" : step === 3 ? "Sign in" : "Review & place order"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || authLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                {step === 1 && (
                  <div className="space-y-5">
                    {step1Fields.map((f) => renderDynamicField(f))}

                    <div className="text-sm text-muted-foreground pt-1">
                      Step 1/3: Project info (and any required abstract file).
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="pp-name">
                        Your name *
                      </Label>
                      <Input
                        id="pp-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        maxLength={200}
                        autoComplete="name"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pp-phone">Phone *</Label>
                        <Input
                          id="pp-phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          maxLength={20}
                          inputMode="tel"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pp-email">Email *</Label>
                        <Input
                          id="pp-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          maxLength={200}
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {step2Fields.map((f) => renderDynamicField(f))}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    {user ? (
                      <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 space-y-1">
                        <div className="flex items-center gap-2 text-primary">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Signed in</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          You can place your paper project request in the next step.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="pp-login-email">Email *</Label>
                          <Input
                            id="pp-login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            maxLength={200}
                            autoComplete="email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pp-password">Password *</Label>
                          <Input
                            id="pp-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-5">
                    {placed ? (
                      <div className="text-center space-y-4">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h3>
                          <p className="text-muted-foreground">
                            We will review your paper project details and get back to you.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground">
                          Confirm your details and place the order.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Student name</Label>
                            <div className="rounded-lg border border-primary/10 p-3 text-sm bg-primary/5">
                              {fullName || "—"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="rounded-lg border border-primary/10 p-3 text-sm bg-primary/5">
                              {email || "—"}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {step !== 4 && (
                  <div className="flex justify-between gap-3 mt-6 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep((s) => Math.max(1, s - 1))}
                      disabled={step === 1}
                      className="min-h-[44px] touch-manipulation shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    {step === 1 && (
                      <Button
                        type="button"
                        onClick={() => {
                          if (validateStep1()) setStep(2);
                        }}
                        className="min-h-[44px] touch-manipulation shrink-0"
                      >
                        Next <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                    {step === 2 && (
                      <Button
                        type="button"
                        onClick={() => {
                          if (validateStep2()) setStep(3);
                        }}
                        className="min-h-[44px] touch-manipulation shrink-0"
                      >
                        Next <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                    {step === 3 && (
                      <Button
                        type="button"
                        onClick={handleSignInAndContinue}
                        disabled={signingIn}
                        className="min-h-[44px] touch-manipulation shrink-0"
                      >
                        {signingIn ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in…
                          </>
                        ) : (
                          <>
                            {user ? "Continue" : "Sign in & Continue"} <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {step === 4 && !placed && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePlaceOrder();
                    }}
                    className="mt-6 pt-4 border-t space-y-4"
                  >
                    <Button type="submit" className="w-full sm:w-auto min-w-[180px]" disabled={placing}>
                      {placing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Placing…
                        </>
                      ) : (
                        "Place order"
                      )}
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(3)}
                        disabled={placing}
                        className="min-h-[44px] touch-manipulation shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate("/")}
                        disabled={placing}
                        className="min-h-[44px] touch-manipulation shrink-0"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {step === 4 && placed && (
                  <div className="mt-6 pt-4 border-t space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => navigate("/")}
                        className="w-full sm:w-auto min-h-[48px] touch-manipulation"
                      >
                        Back to home
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStep(1);
                          setPlaced(false);
                          setPassword("");
                          setFullName("");
                          setPhone("");
                          setEmail("");
                          setValues({});
                          setFiles({});
                        }}
                        className="w-full sm:w-auto min-h-[48px] touch-manipulation"
                      >
                        Submit another
                      </Button>
                    </div>
                  </div>
                )}
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaperProjectPage;
