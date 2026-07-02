import { useEffect, useRef, useState } from "react";
import { isValidNip, normalizeNip } from "@/lib/invoice";
import type { InvoiceCompanyData } from "@/lib/types";

export type NipLookupStatus = "idle" | "loading" | "found" | "not_found" | "error";

type Options = {
  enabled: boolean;
  nip: string;
  onCompanyUpdate: (patch: Partial<InvoiceCompanyData>) => void;
  onFieldsClearErrors: (keys: Array<keyof InvoiceCompanyData>) => void;
};

export function useNipLookup({
  enabled,
  nip,
  onCompanyUpdate,
  onFieldsClearErrors,
}: Options) {
  const [status, setStatus] = useState<NipLookupStatus>("idle");
  const [hint, setHint] = useState<string | null>(null);
  const [source, setSource] = useState<"regon" | "vat" | "ceidg" | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastAttemptRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      setHint(null);
      setSource(null);
      return;
    }

    const normalized = normalizeNip(nip);
    if (!isValidNip(normalized)) {
      setStatus("idle");
      setHint(null);
      setSource(null);
      lastAttemptRef.current = null;
      return;
    }

    if (lastAttemptRef.current === normalized) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        lastAttemptRef.current = normalized;
        setStatus("loading");
        setHint(null);

        try {
          const response = await fetch(`/api/nip-lookup?nip=${encodeURIComponent(normalized)}`);
          const data = (await response.json()) as {
            companyName?: string;
            address?: string;
            postalCode?: string;
            city?: string;
            source?: "regon" | "vat" | "ceidg";
            hint?: string;
          };

          if (cancelled) return;

          if (!response.ok) {
            setStatus(response.status === 404 ? "not_found" : "error");
            setHint(data.hint ?? null);
            setSource(null);
            return;
          }

          onCompanyUpdate({
            companyName: data.companyName,
            address: data.address,
            postalCode: data.postalCode,
            city: data.city,
          });
          onFieldsClearErrors(["companyName", "address", "postalCode", "city"]);
          setStatus("found");
          setSource(data.source ?? "vat");
          setHint(null);
        } catch {
          if (!cancelled) {
            setStatus("error");
            setHint(null);
            setSource(null);
          }
        }
      })();
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled, nip, retryCount, onCompanyUpdate, onFieldsClearErrors]);

  function resetLookup() {
    lastAttemptRef.current = null;
    setStatus("idle");
    setHint(null);
    setSource(null);
  }

  function retry() {
    lastAttemptRef.current = null;
    setRetryCount((count) => count + 1);
  }

  return { status, hint, source, resetLookup, retry };
}
