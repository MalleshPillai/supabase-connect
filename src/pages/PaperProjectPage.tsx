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
import { Loader2 } from "lucide-react";

type FormFieldRow = Tables<"landing_form_fields">;

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

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);

  const sortedFields = useMemo(() => fields ?? [], [fields]);

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    for (const f of sortedFields) {
      if (!f.required) continue;
      if (f.field_type === "file") {
        if (!files[f.field_key]) {
          toast({ title: `${f.label} is required`, variant: "destructive" });
          return;
        }
      } else if (!String(values[f.field_key] ?? "").trim()) {
        toast({ title: `${f.label} is required`, variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);
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

      toast({ title: "Submitted", description: "We will review your paper project details and get back to you." });
      setFullName("");
      setPhone("");
      setEmail("");
      setValues({});
      setFiles({});
    } catch (err) {
      toast({
        title: "Could not submit",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <Header />
      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Paper projects</h1>
          <p className="mt-3 text-muted-foreground">
            Tell us about your work — title, abstract, and any files. Fields below can be updated by your admin when needed.
          </p>

          <Card className="mt-8 border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle>Project details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="pp-name">Your name *</Label>
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
                      <Label htmlFor="pp-phone">Phone</Label>
                      <Input
                        id="pp-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={20}
                        inputMode="tel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pp-email">Email</Label>
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

                  {sortedFields.map((f) => (
                    <div key={f.id} className="space-y-2">
                      <Label htmlFor={`fld-${f.field_key}`}>
                        {f.label}
                        {f.required ? " *" : ""}
                      </Label>
                      {f.field_type === "text" && (
                        <Input
                          id={`fld-${f.field_key}`}
                          value={values[f.field_key] ?? ""}
                          onChange={(e) => setFieldValue(f.field_key, e.target.value)}
                          required={f.required}
                        />
                      )}
                      {f.field_type === "textarea" && (
                        <Textarea
                          id={`fld-${f.field_key}`}
                          value={values[f.field_key] ?? ""}
                          onChange={(e) => setFieldValue(f.field_key, e.target.value)}
                          rows={4}
                          required={f.required}
                        />
                      )}
                      {f.field_type === "select" && (
                        <select
                          id={`fld-${f.field_key}`}
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
                          id={`fld-${f.field_key}`}
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(e) =>
                            setFiles((p) => ({ ...p, [f.field_key]: e.target.files?.[0] ?? null }))
                          }
                          required={f.required}
                        />
                      )}
                    </div>
                  ))}

                  <Button type="submit" className="w-full sm:w-auto min-w-[160px]" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Submit project"
                    )}
                  </Button>
                </form>
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
