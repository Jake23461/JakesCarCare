"use client";

/**
 * BookingForm
 *
 * Lets the customer pick a service, date preference, vehicle type, and
 * location, then opens a pre-filled WhatsApp message to Jake's number.
 * No backend or third-party booking tool needed — just a direct line.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Droplets,
  Sparkles,
  Shield,
  CalendarDays,
  MapPin,
  User,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const WHATSAPP_NUMBER = "353877665058"; // +353 87 766 5058

const SERVICE_OPTIONS = [
  {
    id: "exterior",
    icon: Droplets,
    label: "Exterior Wash",
    price: "From €40",
    desc: "Full exterior foam wash, rinse, hand dry",
  },
  {
    id: "interior",
    icon: Sparkles,
    label: "Interior Valet",
    price: "From €60",
    desc: "Deep vacuum, trim clean, glass, steam",
  },
  {
    id: "full",
    icon: Car,
    label: "Full Valet",
    price: "From €100",
    desc: "Complete inside-and-out transformation",
  },
  {
    id: "detailing",
    icon: Shield,
    label: "Paint-Safe Detailing",
    price: "From €80",
    desc: "Decontamination, clay bar, protection",
  },
] as const;

type ServiceId = (typeof SERVICE_OPTIONS)[number]["id"];

const TIME_OPTIONS = [
  { id: "morning", label: "Morning", sub: "9 am – 12 pm" },
  { id: "afternoon", label: "Afternoon", sub: "12 pm – 4 pm" },
  { id: "flexible", label: "Flexible", sub: "Any time that suits" },
] as const;

type TimeId = (typeof TIME_OPTIONS)[number]["id"];

interface FormState {
  service: ServiceId | "";
  date: string;
  time: TimeId | "";
  vehicle: string;
  location: string;
  name: string;
  phone: string;
  notes: string;
}

const EMPTY: FormState = {
  service: "",
  date: "",
  time: "",
  vehicle: "",
  location: "",
  name: "",
  phone: "",
  notes: "",
};

function buildWhatsAppMessage(f: FormState): string {
  const svc = SERVICE_OPTIONS.find((s) => s.id === f.service);
  const time = TIME_OPTIONS.find((t) => t.id === f.time);

  const lines = [
    `Hi Jake, I'd like to book a valet.`,
    ``,
    `📋 *Service:* ${svc?.label ?? "—"} (${svc?.price ?? ""})`,
    `🚗 *Vehicle:* ${f.vehicle || "—"}`,
    `📅 *Date:* ${f.date || "—"}`,
    `🕐 *Time preference:* ${time?.label ?? "—"} (${time?.sub ?? ""})`,
    `📍 *Location:* ${f.location || "—"}`,
    `👤 *Name:* ${f.name || "—"}`,
    f.phone ? `📞 *Phone:* ${f.phone}` : null,
    f.notes ? `\n💬 *Notes:* ${f.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return lines;
}

function isComplete(f: FormState): boolean {
  return !!(f.service && f.date && f.time && f.vehicle && f.location && f.name);
}

export function BookingForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [sent, setSent] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete(form)) return;
    const msg = buildWhatsAppMessage(form);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  // Min date = today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-3xl">
      <AnimatePresence mode="wait">
        {sent ? (
          // ── Success state ────────────────────────────────────────────────
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-accent/30 bg-accent/5 px-8 py-14 text-center"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-2xl font-black text-foreground">
              WhatsApp opened
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-sm text-foreground-muted">
              Your booking details are pre-filled. Just hit send and Jake will
              confirm a time.
            </p>
            <button
              onClick={() => {
                setForm(EMPTY);
                setSent(false);
              }}
              className="mt-6 text-sm font-semibold text-accent transition hover:text-accent-dark"
            >
              Book another
            </button>
          </motion.div>
        ) : (
          // ── Form ─────────────────────────────────────────────────────────
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Step 1 — Service */}
            <fieldset>
              <legend className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
                  1
                </span>
                Choose a service
              </legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SERVICE_OPTIONS.map(({ id, icon: Icon, label, price, desc }) => {
                  const active = form.service === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => set("service", id)}
                      className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-accent bg-accent/10 shadow-sm shadow-accent/10"
                          : "border-border bg-surface hover:border-accent/40 hover:bg-surface-raised"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${active ? "text-accent" : "text-foreground-muted"}`}
                      />
                      <p
                        className={`text-sm font-bold leading-tight ${active ? "text-foreground" : "text-foreground"}`}
                      >
                        {label}
                      </p>
                      <p className="text-[11px] leading-tight text-foreground-muted">
                        {desc}
                      </p>
                      <span
                        className={`mt-auto text-xs font-semibold ${active ? "text-accent" : "text-foreground-muted"}`}
                      >
                        {price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Step 2 — Date & time */}
            <fieldset>
              <legend className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
                  2
                </span>
                Preferred date &amp; time
              </legend>
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Date */}
                <div className="relative flex-1">
                  <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                  <input
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {/* Time preference */}
                <div className="flex gap-2">
                  {TIME_OPTIONS.map(({ id, label, sub }) => {
                    const active = form.time === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => set("time", id)}
                        className={`flex flex-1 flex-col items-center justify-center rounded-xl border px-3 py-2.5 text-center transition ${
                          active
                            ? "border-accent bg-accent/10"
                            : "border-border bg-surface hover:border-accent/40"
                        }`}
                      >
                        <span
                          className={`text-xs font-bold ${active ? "text-foreground" : "text-foreground-muted"}`}
                        >
                          {label}
                        </span>
                        <span className="text-[11px] text-foreground-muted">
                          {sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </fieldset>

            {/* Step 3 — Vehicle & location */}
            <fieldset>
              <legend className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
                  3
                </span>
                Your vehicle &amp; location
              </legend>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Car className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                  <input
                    type="text"
                    placeholder="Vehicle make, model &amp; reg — e.g. Toyota Corolla 211-RN-1234"
                    value={form.vehicle}
                    onChange={(e) => set("vehicle", e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                  <input
                    type="text"
                    placeholder="Your address or town — e.g. 12 Main St, Roscommon"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </fieldset>

            {/* Step 4 — Contact */}
            <fieldset>
              <legend className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
                  4
                </span>
                Your details
              </legend>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="relative">
                  <MessageCircle className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                  <input
                    type="tel"
                    placeholder="Your phone number (optional — Jake will reply on WhatsApp)"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <textarea
                  placeholder="Anything else Jake should know — heavily soiled, pet hair, specific area to focus on..."
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </fieldset>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={!isComplete(form)}
                className={`inline-flex w-full min-h-[56px] items-center justify-center gap-3 rounded-full text-base font-black text-white shadow-lg transition ${
                  isComplete(form)
                    ? "bg-accent shadow-accent/20 hover:bg-accent-dark cursor-pointer"
                    : "bg-border cursor-not-allowed opacity-50"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.535 5.845L.057 23.428a.5.5 0 0 0 .609.61l5.717-1.494A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.929 0-3.73-.513-5.276-1.408l-.378-.221-3.393.887.902-3.306-.244-.389A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Send booking request on WhatsApp
                <ChevronRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-xs text-foreground-muted">
                Opens WhatsApp with your details pre-filled. Jake will confirm
                by message.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
