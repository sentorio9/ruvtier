/**
 * Private Appointments — refined booking request page.
 *
 * Submits to the `appointment_requests` table. Not a confirmed booking:
 * a steward of the house replies to confirm availability. Supports a
 * `?type=...` query parameter to preselect the appointment type from
 * upstream CTAs (e.g. Made-to-Measure).
 */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  honeypotInputProps,
  checkFormGuard,
  isValidEmail,
  FORM_ERRORS,
} from "@/lib/formProtection";
import { cn } from "@/lib/utils";

type AppointmentType =
  | "private_consultation"
  | "made_to_measure"
  | "collection_viewing"
  | "client_services";

const TYPE_OPTIONS: { value: AppointmentType; label: string }[] = [
  { value: "private_consultation", label: "Private consultation" },
  { value: "made_to_measure", label: "Made-to-measure consultation" },
  { value: "collection_viewing", label: "Collection viewing" },
  { value: "client_services", label: "Client services call" },
];

const TIME_SLOTS = ["10:00", "12:00", "14:00", "16:00", "18:00"];

const inputClass =
  "w-full h-11 px-4 bg-transparent border border-border text-foreground text-sm tracking-wide placeholder:text-muted-foreground/70 focus:outline-none focus:border-foreground transition-colors duration-300";
const labelClass =
  "block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3";

const AppointmentsPage = () => {
  const [params] = useSearchParams();
  const initialType = (params.get("type") as AppointmentType) || "private_consultation";
  const isValidInitialType = TYPE_OPTIONS.some((o) => o.value === initialType);

  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    appointment_type: isValidInitialType ? initialType : "private_consultation",
    preferred_time: "",
    message: "",
  });
  const [preferredDate, setPreferredDate] = useState<Date | undefined>(undefined);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  usePageMeta({
    title: "Private Appointments",
    description: "Reserve a moment with the house of RUVTIER. Each appointment is personal, unhurried, and arranged directly with a steward of the house.",
  });

  useEffect(() => { startedAtRef.current = Date.now(); }, []);

  const handleChange = (k: string, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const guard = checkFormGuard({ honeypot, startedAt: startedAtRef.current });
    if (!guard.ok) { setSubmitted(true); return; }

    const name = form.full_name.trim();
    const message = form.message.trim();
    if (!name || !form.email.trim()) { setError(FORM_ERRORS.required); return; }
    if (!isValidEmail(form.email)) { setError(FORM_ERRORS.invalidEmail); return; }
    if (name.length > 100 || message.length > 1500) { setError(FORM_ERRORS.tooLong); return; }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error: dbError } = await supabase.from("appointment_requests" as any).insert({
      full_name: name,
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      appointment_type: form.appointment_type,
      preferred_date: preferredDate ? format(preferredDate, "yyyy-MM-dd") : null,
      preferred_time: form.preferred_time || null,
      message: message || null,
      user_id: user?.id || null,
    } as any);

    setSubmitting(false);
    if (dbError) { setError(FORM_ERRORS.generic); return; }
    setSubmitted(true);
  };

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-32 md:pt-40 pb-20 md:pb-28 min-h-[85vh]">
        <div className="luxury-container max-w-[720px] mx-auto">
          <ScrollFadeIn>
            <div className="text-center mb-14 md:mb-16">
              <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
                By Appointment Only
              </p>
              <h1 className="luxury-heading mb-6">Private Appointments</h1>
              <p className="luxury-body mx-auto max-w-[520px]">
                Reserve a moment with the house. Each appointment is personal and unhurried — a steward of the house will confirm your preferred time in correspondence.
              </p>
            </div>
          </ScrollFadeIn>

          {submitted ? (
            <ScrollFadeIn>
              <div className="text-center py-16 border-t border-border">
                <p className="font-serif font-light text-2xl text-foreground mb-4">
                  Your request has been received.
                </p>
                <p className="luxury-body mx-auto max-w-[420px]">
                  A steward of the house will write to you shortly to confirm the details of your appointment.
                </p>
              </div>
            </ScrollFadeIn>
          ) : (
            <ScrollFadeIn delay={0.1}>
              <form onSubmit={handleSubmit} className="space-y-8">
                <input {...honeypotInputProps} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Full name</label>
                    <input type="text" value={form.full_name} required maxLength={100}
                      onChange={(e) => handleChange("full_name", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" value={form.email} required maxLength={255}
                      onChange={(e) => handleChange("email", e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>
                      Phone{" "}
                      <span className="normal-case tracking-normal text-muted-foreground/40">(optional)</span>
                    </label>
                    <input type="tel" value={form.phone} maxLength={30}
                      onChange={(e) => handleChange("phone", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Appointment type</label>
                    <select value={form.appointment_type}
                      onChange={(e) => handleChange("appointment_type", e.target.value)}
                      className={`${inputClass} appearance-none`}>
                      {TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Preferred date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button"
                          className={cn(inputClass, "text-left", !preferredDate && "text-muted-foreground/70")}>
                          {preferredDate ? format(preferredDate, "PPP") : "Select a date"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={preferredDate} onSelect={setPreferredDate}
                          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className={labelClass}>Preferred time</label>
                    <select value={form.preferred_time}
                      onChange={(e) => handleChange("preferred_time", e.target.value)}
                      className={`${inputClass} appearance-none`}>
                      <option value="">Select a time</option>
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Message{" "}
                    <span className="normal-case tracking-normal text-muted-foreground/40">(optional)</span>
                  </label>
                  <textarea value={form.message} maxLength={1500} rows={5}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className={`${inputClass} h-auto py-3 resize-none`} />
                </div>

                {error && <p role="alert" className="text-[12px] text-red-400 tracking-wide">{error}</p>}

                <div className="flex flex-col items-center pt-4">
                  <button type="submit" disabled={submitting}
                    className="px-10 py-4 bg-foreground text-background text-xs tracking-[0.25em] uppercase transition-opacity duration-300 hover:opacity-80 disabled:opacity-40">
                    {submitting ? "Submitting…" : "Request Appointment"}
                  </button>
                  <p className="text-xs text-muted-foreground tracking-wide text-center mt-6 max-w-[420px]">
                    Requests are reviewed personally. A steward of the house will reply to confirm your appointment.
                  </p>
                </div>
              </form>
            </ScrollFadeIn>
          )}
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default AppointmentsPage;
