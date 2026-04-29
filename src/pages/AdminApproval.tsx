import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "granted" | "denied" | "error";

export default function AdminApproval() {
  const [params] = useSearchParams();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("Verifying request…");

  useEffect(() => {
    document.title = "Ruvtier Security";
    const action = params.get("action");
    const token = params.get("token");

    if (!token || (action !== "approve" && action !== "deny")) {
      setState("error");
      setMessage("Invalid request.");
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("admin-auth", {
          body: { action: "resolve_request", token, decision: action },
        });
        if (error) throw error;
        if (data?.status === "approved") {
          setState("granted");
          setMessage("Access Granted — The operator may now proceed.");
        } else if (data?.status === "denied") {
          setState("denied");
          setMessage("Access Denied — The login attempt has been blocked.");
        } else {
          setState("error");
          setMessage(data?.error || "Request expired or already processed.");
        }
      } catch (e: any) {
        setState("error");
        setMessage(e?.message || "Something went wrong.");
      }
    })();
  }, [params]);

  const accent =
    state === "granted"
      ? "hsl(140,30%,55%)"
      : state === "denied" || state === "error"
        ? "hsl(0,50%,55%)"
        : "hsl(220,10%,55%)";

  const heading =
    state === "granted"
      ? "✓ GRANTED"
      : state === "denied"
        ? "✕ DENIED"
        : state === "error"
          ? "✕ ERROR"
          : "VERIFYING…";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(220,15%,6%)",
        color: "hsl(220,10%,75%)",
        fontFamily: "'Jost','Helvetica Neue',Arial,sans-serif",
        padding: 40,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div
          style={{
            fontSize: 14,
            letterSpacing: "0.3em",
            color: "hsl(220,10%,40%)",
            marginBottom: 40,
            textTransform: "uppercase",
          }}
        >
          R U V T I E R
        </div>
        <div
          style={{
            fontSize: 16,
            letterSpacing: "0.12em",
            color: accent,
            marginBottom: 16,
          }}
        >
          {heading}
        </div>
        <p style={{ fontSize: 13, color: "hsl(220,10%,45%)", lineHeight: 1.6 }}>
          {message}
        </p>
      </div>
    </div>
  );
}
