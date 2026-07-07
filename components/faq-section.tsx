import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/faq";

/**
 * FAQ accordion built on native <details>/<summary> — every answer is in the
 * static HTML for crawlers and AI engines, works without JavaScript, and
 * stays keyboard-accessible for free.
 */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {faqs.map((faq) => (
        <details key={faq.q} className="group">
          <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-left [&::-webkit-details-marker]:hidden">
            <h3 className="text-sm font-bold text-foreground">{faq.q}</h3>
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-foreground-muted transition-transform group-open:rotate-180" />
          </summary>
          <p className="px-6 pb-5 text-sm leading-relaxed text-foreground-muted">
            {faq.a}
          </p>
        </details>
      ))}
    </div>
  );
}
