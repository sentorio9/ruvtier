import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  honeypotInputProps,
  checkFormGuard,
  isValidEmail,
  FORM_ERRORS,
} from "@/lib/formProtection";

interface Props {
  headline: string;
  subline: string;
  collectEmail: boolean;
}

export default function MaintenancePage({ headline, subline, collectEmail }: Props) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    document.title = "RUVTIER — In quiet preparation";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const guard = checkFormGuard({ honeypot, startedAt: startedAtRef.current });
    if (!guard.ok) {
      // Silent acceptance — don't reveal protection.
      setStatus("done");
      return;
    }

    if (!isValidEmail(email)) {
      setStatus("error");
      setErrorMsg(FORM_ERRORS.invalidEmail);
      return;
    }
    setStatus("submitting");
    setErrorMsg("");

    const { error } = await (supabase.from("maintenance_subscribers" as any) as any).insert({
      email: email.trim().toLowerCase(),
    });

    if (error && !error.message?.toLowerCase().includes("duplicate")) {
      setStatus("error");
      setErrorMsg(FORM_ERRORS.generic);
      return;
    }
    setStatus("done");
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{
        background: "linear-gradient(180deg, #F7F5F2 0%, #EFEAE3 100%)",
        color: "#3A3A3A",
      }}
    >
      <div className="text-center max-w-[560px] w-full">
        <h1
          className="text-[22px] md:text-[28px] tracking-[0.32em] mb-12 md:mb-16"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
        >
          RUVTIER
        </h1>

        <p
          className="text-[26px] md:text-[34px] leading-[1.35] mb-6"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 300, fontStyle: "italic" }}
        >
          {headline}
        </p>

        <p
          className="text-[13px] md:text-[14px] leading-[1.85] text-[#5A5A5A] max-w-[440px] mx-auto mb-12"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
        >
          {subline}
        </p>

        {collectEmail && (
          <>
            {status === "done" ? (
              <p
                className="text-[12px] tracking-[0.16em] uppercase text-[#3A3A3A]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Thank you. We will write to you soon.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
                <div className="flex items-center w-full max-w-[380px] border-b border-[#3A3A3A]/30 focus-within:border-[#3A3A3A] transition-colors">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="your email"
                    disabled={status === "submitting"}
                    className="flex-1 bg-transparent border-none outline-none px-1 py-3 text-[13px] tracking-[0.04em] placeholder:text-[#3A3A3A]/40"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="text-[10px] tracking-[0.22em] uppercase pl-4 py-3 hover:opacity-60 transition-opacity disabled:opacity-30"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {status === "submitting" ? "…" : "Notify me"}
                  </button>
                </div>
                {status === "error" && (
                  <p
                    className="text-[11px] text-[#8a4a4a] mt-1"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {errorMsg}
                  </p>
                )}
              </form>
            )}
          </>
        )}
      </div>

      <p
        className="absolute bottom-8 text-[10px] tracking-[0.22em] uppercase text-[#3A3A3A]/40"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        © RUVTIER
      </p>
    </main>
  );
}
