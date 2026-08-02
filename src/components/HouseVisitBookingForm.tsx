/**
 * House Visit Booking Form — invitation-led request to visit RUVTIER.
 *
 * Submits to the existing `appointment_requests` table with
 * `appointment_type = 'house_visit'`. Reused by The House / Stay page.
 */
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import {
  honeypotInputProps,
  checkFormGuard,
  isValidEmail,
  FORM_ERRORS,
} from "@/lib/formProtection";
import { cn } from "@/lib/utils";

const EXPERIENCES = [
  "Morning breakfast",
  "Private library",
  "Wine cellar",
  "Meet artisans",
  "Garden & mountain walks",
  "Made-to-measure fittings",
  "Styling consultation",
  "Showroom viewing",
];

const TIME_SLOTS = ["10:00", "12:00", "14:00", "16:00", "18:00"];

const inputClass =
  "w-full h-11 px-4 bg-transparent border border-border text-foreground text-sm tracking-wide placeholder:text-muted-foreground/70 focus:outline-none focus:border-foreground transition-colors duration-300";
const labelClass =
  "block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3";

const HouseVisitBookingForm = () => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    party_size: "2",
    preferred_time: "",
    message: "",
  });
  const [preferredDate, setPreferredDate] = useState<Date | undefined>(undefined);
  const [interests, setInterests] = useState<string[]>([]);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => { startedAtRef.current = Date.now(); }, []);

  const toggleInterest = (experience: string) => {
    setInterests((prev) =>
      prev.includes(experience) ? prev.filter((e) => e !== experience) : [...prev, experience]
    );
  };

  const handleChange = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

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

    const partySize = parseInt(form.party_size, 10);
    if (isNaN(partySize) || partySize < 1 || partySize > 12) {
      setError("Please enter a party size between 1 and 12.");
      return;
    }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error: dbError } = await supabase.from("appointment_requests" as any).insert({
      full_name: name,
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      appointment_type: "house_visit",
      preferred_date: preferredDate ? format(preferredDate, "yyyy-MM-dd") : null,
      preferred_time: form.preferred_time || null,
      message: [
        interests.length ? `Experiences of interest: ${interests.join(", ")}` : "",
        `Party size: ${partySize}`,
        message,
      ].filter(Boolean).join("\n\n") || null,
      user_id: user?.id || null,
    } as any);

    setSubmitting(false);
    if (dbError) { setError(FORM_ERRORS.generic); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-16 border-t border-border">
        <p className="font-serif font-light text-2xl text-foreground mb-4">
          Your interest has been received.
        </p>
        <p className="luxury-body mx-auto max-w-[420px]">
          A steward of the house will write to you shortly to discuss your visit and confirm availability.
        </p>
      </div>
    );
  }

  return (
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
            Phone <span className="normal-case tracking-normal text-muted-foreground/40">(optional)</span>
          </label>
          <input type="tel" value={form.phone} maxLength={30}
            onChange={(e) => handleChange("phone", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Party size</label>
          <input type="number" min={1} max={12} value={form.party_size}
            onChange={(e) => handleChange("party_size", e.target.value)} className={inputClass} />
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
            {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Experiences of interest <span className="normal-case tracking-normal text-muted-foreground/40">(optional)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXPERIENCES.map((exp) => (
            <label key={exp} className="flex items-center gap-3 cursor-pointer group">
              <span className={`w-4 h-4 border border-border flex items-center justify-center transition-colors ${interests.includes(exp) ? "bg-foreground border-foreground" : "bg-transparent"}`}>
                {interests.includes(exp) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="hsl(var(--background))" strokeWidth="1.2">
                    <path d="M1 4l2.5 2.5L9 1.5" />
                  </svg>
                )}
              </span>
              <input type="checkbox" className="sr-only" checked={interests.includes(exp)} onChange={() => toggleInterest(exp)} />
              <span className="text-sm tracking-wide text-foreground/90 group-hover:text-foreground transition-colors">{exp}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Message <span className="normal-case tracking-normal text-muted-foreground/40">(optional)</span>
        </label>
        <textarea value={form.message} maxLength={1500} rows={5}
          onChange={(e) => handleChange("message", e.target.value)}
          className={`${inputClass} h-auto py-3 resize-none`} />
      </div>

      {error && <p role="alert" className="text-[12px] text-red-400 tracking-wide">{error}</p>}

      <div className="flex flex-col items-center pt-4">
        <button type="submit" disabled={submitting}
          className="px-10 py-4 bg-foreground text-background text-xs tracking-[0.25em] uppercase transition-opacity duration-300 hover:opacity-80 disabled:opacity-40">
          {submitting ? "Submitting…" : "Request Invitation"}
        </button>
        <p className="text-xs text-muted-foreground tracking-wide text-center mt-6 max-w-[420px]">
          Visits are invitation-led and arranged personally. A steward of the house will reply to confirm details.
        </p>
      </div>
    </form>
  );
};

export default HouseVisitBookingForm;
