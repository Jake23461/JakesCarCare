"use client";

import { useState, useEffect, useCallback, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Droplets,
  Sparkles,
  CalendarDays,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  AVAILABLE_TIMES,
  isWeekend,
  toLocalDateString,
  getTomorrowDateString,
  getBlockedTimesForDate,
  getFlowpointConfiguredSlots,
  getFlowpointOpenSlots,
  getFlowpointConfig,
  submitBooking,
  submitToFlowpoint,
  logTravelEvent,
  getNearbyDays,
  type BookingData,
  type FlowpointConfig,
} from "@/lib/bookings";
import dynamic from "next/dynamic";
import { isValidEircode, getTravelQuote, type TravelQuote } from "@/lib/travel";

// Leaflet touches `window` at import time — load the map client-side only.
const TravelMap = dynamic(() => import("@/components/travel-map"), { ssr: false });

const WHATSAPP_NUMBER = "353877665058";

type TravelStatus = "idle" | "checking" | "done" | "error";

// Backend toggle. Set NEXT_PUBLIC_BOOKING_PROVIDER to "legacy" | "flowpoint".
// The visible form UI is identical for both — only the submission target changes.
//   flowpoint -> POSTs to Flowpoint hub (default)
//   legacy    -> writes to Firestore + triggers existing Cloud Function
const BOOKING_PROVIDER: "legacy" | "flowpoint" =
  (process.env.NEXT_PUBLIC_BOOKING_PROVIDER as "legacy" | "flowpoint" | undefined) ??
  "flowpoint";

// ─── DatePicker custom trigger ───────────────────────────────────────────────

const DateTrigger = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void }
>(({ value, onClick }, ref) => (
  <button
    type="button"
    ref={ref}
    onClick={onClick}
    className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-left text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
  >
    {value ? value : <span className="text-foreground-muted">Select a weekend date</span>}
  </button>
));
DateTrigger.displayName = "DateTrigger";

// ─── Presentation (site-owned look), keyed by canonical Hub name ───────────────
// The Hub decides WHICH services/add-ons/fields exist; the site decides how they
// LOOK. Items not listed here fall back to a default icon + the Hub's own values.

const SERVICE_PRESENTATION: Record<string, { icon: LucideIcon; desc: string; price: string }> = {
  "Full Valet": { icon: Car, desc: "Complete inside-and-out transformation", price: "€100–€120" },
  "Exterior Only": { icon: Droplets, desc: "Full exterior foam wash, rinse, hand dry", price: "€50" },
  "Interior Only": { icon: Sparkles, desc: "Deep vacuum, trim clean, glass, steam", price: "€70–€90" },
};

const ADDON_PRESENTATION: Record<string, string> = {
  "Iron Fallout & Tar Remover": "Decontaminates paintwork before wash",
  "Protector Wax": "Long-lasting paint protection applied after wash",
};

const FIELD_ICONS: Record<string, LucideIcon> = { eircode: MapPin };

// Used until the Hub responds (or if it's unreachable) so the form always renders.
const FALLBACK_CONFIG: FlowpointConfig = {
  services: [
    { id: "Full Valet", name: "Full Valet", description: "", durationMinutes: 240, priceCents: 0, priceLabel: "€100–€120" },
    { id: "Exterior Only", name: "Exterior Only", description: "", durationMinutes: 120, priceCents: 0, priceLabel: "€50" },
    { id: "Interior Only", name: "Interior Only", description: "", durationMinutes: 180, priceCents: 0, priceLabel: "€70–€90" },
  ],
  addons: [],
  customFields: [
    { id: "eircode", fieldKey: "eircode", label: "Eircode", fieldType: "text", required: true, options: [] },
  ],
};

function durationTag(minutes: number): string {
  if (!minutes) return "";
  return minutes % 60 === 0 ? `${minutes / 60}hrs` : `${minutes}min`;
}

function inputType(fieldType: string): string {
  return fieldType === "tel" || fieldType === "email" || fieldType === "number" ? fieldType : "text";
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY: BookingData = {
  name: "",
  phone: "",
  email: "",
  eircode: "",
  service: "",
  date: "",
  time: "",
  message: "",
  ironFalloutAddon: false,
  protectorWaxAddon: false,
  addonIds: [],
  customFields: {},
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BookingSection() {
  const [form, setForm] = useState<BookingData>(EMPTY);
  // Hub catalogue (services / add-ons / custom fields). Starts with the fallback
  // so the form renders instantly, then reconciles with the live Hub config.
  const [config, setConfig] = useState<FlowpointConfig>(FALLBACK_CONFIG);
  // Slot buttons to show — Hub-configured (falls back to the built-in two slots).
  const [configuredSlots, setConfiguredSlots] = useState<string[]>([...AVAILABLE_TIMES]);
  // Which of those are still open for the chosen date/service (from the Hub).
  const [openSlots, setOpenSlots] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [travel, setTravel] = useState<TravelQuote | null>(null);
  const [travelStatus, setTravelStatus] = useState<TravelStatus>("idle");
  const [travelError, setTravelError] = useState("");
  // Route-day suggestion: a date Jake is already booked near this customer,
  // offered with a discounted call-out fee to stack jobs into one trip.
  const [routeDay, setRouteDay] = useState<{ date: string; discountedFee: number } | null>(null);

  const set = <K extends keyof BookingData>(k: K, v: BookingData[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // ── Live travel quote from the Eircode custom field ────────────────────────
  // Once the Eircode looks valid, wait for a pause in typing then ask the
  // calculateTravel function for driving distance + call-out fee.
  const eircodeInput = form.customFields?.eircode ?? "";
  useEffect(() => {
    const eircode = eircodeInput.trim();
    setTravel(null);
    setTravelError("");
    setRouteDay(null);

    if (!isValidEircode(eircode)) {
      setTravelStatus("idle");
      return;
    }

    let cancelled = false;
    setTravelStatus("checking");
    const id = setTimeout(async () => {
      try {
        const quote = await getTravelQuote(eircode);
        if (cancelled) return;
        setTravel(quote);
        setTravelStatus("done");

        // Demand signal for the Hub — logged whether or not they book.
        logTravelEvent("travel_quote", {
          routingKey: quote.eircode.slice(0, 3),
          distanceKm: quote.distanceKm,
          durationMin: quote.durationMin,
          calloutFee: quote.calloutFee,
          freeZone: quote.freeZone,
          tooFar: quote.tooFar,
          estimated: !!quote.estimated,
        });

        // Route-day suggestion: is Jake already booked near them soon?
        if (!quote.tooFar && quote.calloutFee > 0 && quote.dest) {
          const days = await getNearbyDays(quote.dest.lat, quote.dest.lng);
          if (cancelled) return;
          const tomorrow = getTomorrowDateString();
          // Only days with slot capacity left (two slots per day)
          const candidate = days.find((d) => d.date >= tomorrow && d.total < 2);
          if (candidate) {
            setRouteDay({
              date: candidate.date,
              discountedFee: Math.max(0, Math.floor(quote.calloutFee / 2 / 5) * 5),
            });
          }
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setTravelStatus("error");
        setTravelError(
          err instanceof Error && err.message && !/internal/i.test(err.message)
            ? err.message
            : "We couldn't check that Eircode right now."
        );
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [eircodeInput]);

  // ── Load the Hub's configured slot times once (e.g. 09:00 / 13:00) ─────────
  useEffect(() => {
    if (BOOKING_PROVIDER !== "flowpoint") return;
    let active = true;
    getFlowpointConfiguredSlots().then((times) => {
      if (active && times.length) setConfiguredSlots(times);
    });
    return () => { active = false; };
  }, []);

  // ── Load the Hub's services / add-ons / custom fields once ─────────────────
  useEffect(() => {
    if (BOOKING_PROVIDER !== "flowpoint") return;
    let active = true;
    getFlowpointConfig().then((c) => {
      if (active && c && c.services.length) setConfig(c);
    });
    return () => { active = false; };
  }, []);

  const setCustomField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, customFields: { ...(prev.customFields ?? {}), [key]: value } }));

  const toggleAddon = (id: string) =>
    setForm((prev) => {
      const current = prev.addonIds ?? [];
      return {
        ...prev,
        addonIds: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      };
    });

  // ── Fetch open slots whenever date/service changes ────────────────────────
  // Availability comes from the Hub (flowpoint) or Firestore (legacy).
  const refreshOpen = useCallback(async (dateStr: string, service: string, slots: string[]) => {
    if (!dateStr) {
      setOpenSlots([]);
      return;
    }
    setLoadingTimes(true);
    try {
      if (BOOKING_PROVIDER === "flowpoint") {
        setOpenSlots(await getFlowpointOpenSlots(dateStr, service));
      } else {
        const blocked = await getBlockedTimesForDate(db, dateStr);
        setOpenSlots(slots.filter((s) => !blocked.includes(s)));
      }
    } catch {
      setOpenSlots([]);
    } finally {
      setLoadingTimes(false);
    }
  }, []);

  // Initial load + 15-second refresh
  useEffect(() => {
    if (!form.date) return;
    refreshOpen(form.date, form.service, configuredSlots);
    const id = setInterval(() => refreshOpen(form.date, form.service, configuredSlots), 15_000);
    return () => clearInterval(id);
  }, [form.date, form.service, configuredSlots, refreshOpen]);

  // ── Date handling ─────────────────────────────────────────────────────────
  const handleDateSelect = (date: Date | null) => {
    setDateError("");
    setError("");
    if (!date) {
      set("date", "");
      set("time", "");
      return;
    }
    set("date", toLocalDateString(date));
    set("time", "");
  };

  // ── Hub-driven catalogue for the chosen service ───────────────────────────
  const selectedService = config.services.find((s) => s.name === form.service);
  const applicableAddons = config.addons.filter(
    (a) =>
      a.appliesToServiceIds.length === 0 ||
      (selectedService ? a.appliesToServiceIds.includes(selectedService.id) : false)
  );
  const showAddons = !!form.service && applicableAddons.length > 0;

  // ── Validation: core fields + every required Hub custom field ─────────────
  const requiredFieldsFilled = config.customFields.every(
    (f) => !f.required || !!(form.customFields?.[f.fieldKey] ?? "").trim()
  );
  const isComplete =
    !!form.service &&
    !!form.date &&
    !!form.time &&
    !!form.name &&
    !!form.phone &&
    !!form.email &&
    requiredFieldsFilled;

  // Outside the service area — booking is blocked entirely
  const outsideArea = travelStatus === "done" && !!travel?.tooFar;
  const canSubmit = isComplete && !outsideArea && travelStatus !== "checking";

  // Route-day discount applies only while the suggested date is selected
  const routeDayApplied = !!(
    routeDay &&
    form.date === routeDay.date &&
    travel &&
    !travel.tooFar &&
    travel.calloutFee > 0
  );
  const appliedCalloutFee = travel
    ? routeDayApplied
      ? routeDay.discountedFee
      : travel.calloutFee
    : 0;

  const formatSuggestedDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-IE", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // Re-validate date is weekend
    const d = new Date(form.date + "T00:00:00");
    if (!isWeekend(d)) {
      setError("Please select a weekend date.");
      return;
    }

    // Basic email check
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      // Travel summary rides along in the notes so it shows up in the Hub.
      const travelNote = travel
        ? appliedCalloutFee > 0 || travel.calloutFee > 0
          ? `Travel: ${travel.distanceKm} km (~${travel.durationMin} min) — call-out fee €${appliedCalloutFee}${routeDayApplied ? ` (route-day discount, was €${travel.calloutFee})` : ""}${travel.estimated ? " (estimated)" : ""}`
          : `Travel: ${travel.distanceKm} km (~${travel.durationMin} min) — free zone, no call-out fee${travel.estimated ? " (estimated)" : ""}`
        : "Travel: distance check unavailable — confirm call-out fee with customer";
      const payload: BookingData = {
        ...form,
        message: [form.message.trim(), travelNote].filter(Boolean).join("\n\n"),
        customFields: {
          ...(form.customFields ?? {}),
          ...(travel ? { eircode: travel.eircode } : {}),
        },
        travelFeeCents: travel ? Math.round(appliedCalloutFee * 100) : null,
        travelDistanceKm: travel?.distanceKm ?? null,
        travelMinutes: travel?.durationMin ?? null,
        travelLat: travel?.dest?.lat ?? null,
        travelLng: travel?.dest?.lng ?? null,
      };
      if (BOOKING_PROVIDER === "flowpoint") {
        await submitToFlowpoint(payload);
      } else {
        await submitBooking(db, payload);
      }
      if (travel) {
        logTravelEvent("travel_quote_booked", {
          routingKey: travel.eircode.slice(0, 3),
          distanceKm: travel.distanceKm,
          durationMin: travel.durationMin,
          calloutFee: appliedCalloutFee,
          routeDayDiscount: routeDayApplied,
          freeZone: travel.freeZone,
          estimated: !!travel.estimated,
        });
      }
      setSuccess(true);
      setForm(EMPTY);
      setOpenSlots([]);
      setTravel(null);
      setTravelStatus("idle");
      setRouteDay(null);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again or call us directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const tomorrow = getTomorrowDateString();

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl">
      <AnimatePresence mode="wait">
        {success ? (
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
              Booking received!
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-sm text-foreground-muted">
              We&apos;ll contact you shortly to confirm your appointment. If you
              need to make changes, call{" "}
              <a href="tel:0877665058" className="font-semibold text-accent">
                087 766 5058
              </a>
              .
            </p>
            <button
              onClick={() => setSuccess(false)}
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
            {/* ── Step 1: Service ────────────────────────────────────────── */}
            <fieldset>
              <legend className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
                  1
                </span>
                Choose a service
              </legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {config.services.map((svc) => {
                  const pres = SERVICE_PRESENTATION[svc.name];
                  const Icon = pres?.icon ?? Car;
                  const label = svc.name;
                  // Prefer the Hub description; fall back to the site's copy.
                  const desc = svc.description || pres?.desc || "";
                  const tag = durationTag(svc.durationMinutes);
                  // Prefer the Hub display price (range/label); fall back to site copy.
                  const price =
                    svc.priceLabel || pres?.price || (svc.priceCents ? `€${(svc.priceCents / 100).toFixed(0)}` : "");
                  const active = form.service === svc.name;
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => {
                        set("service", svc.name);
                        set("time", ""); // reset time when service changes
                        set("addonIds", []); // reset extras — they may differ per service
                      }}
                      className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-accent bg-accent/10 shadow-sm shadow-accent/10"
                          : "border-border bg-surface hover:border-accent/40 hover:bg-surface-raised"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${active ? "text-accent" : "text-foreground-muted"}`}
                      />
                      <p className="text-sm font-bold leading-tight text-foreground">
                        {label}
                      </p>
                      <p className="text-[11px] leading-tight text-foreground-muted">
                        {desc}
                      </p>
                      <div className="mt-auto flex w-full items-center justify-between">
                        <span
                          className={`text-xs font-semibold ${active ? "text-accent" : "text-foreground-muted"}`}
                        >
                          {price}
                        </span>
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                          {tag}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* ── Step 2: Add-ons (Full Valet / Exterior Only only) ─────── */}
            <AnimatePresence>
              {showAddons && (
                <motion.fieldset
                  key="addons"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <legend className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
                      2
                    </span>
                    Optional add-ons
                    <span className="text-[10px] normal-case text-foreground-muted">
                      (don&apos;t extend booking time)
                    </span>
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {applicableAddons.map((addon) => {
                      const label = addon.name;
                      const desc = ADDON_PRESENTATION[addon.name] ?? "";
                      const price = addon.priceCents ? `+€${(addon.priceCents / 100).toFixed(0)}` : "";
                      const active = (form.addonIds ?? []).includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => toggleAddon(addon.id)}
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                            active
                              ? "border-accent bg-accent/10"
                              : "border-border bg-surface hover:border-accent/40 hover:bg-surface-raised"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                              active
                                ? "border-accent bg-accent"
                                : "border-border bg-transparent"
                            }`}
                          >
                            {active && (
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground">
                              {label}
                            </p>
                            <p className="mt-0.5 text-[11px] text-foreground-muted">
                              {desc}
                            </p>
                          </div>
                          <span
                            className={`flex-shrink-0 text-xs font-semibold ${active ? "text-accent" : "text-foreground-muted"}`}
                          >
                            {price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.fieldset>
              )}
            </AnimatePresence>

            {/* ── Step 3: Date & time ───────────────────────────────────── */}
            <fieldset>
              <legend className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
                  {showAddons ? "3" : "2"}
                </span>
                Pick a date &amp; time
                <span className="text-[10px] normal-case text-foreground-muted">
                  (weekends only)
                </span>
              </legend>

              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Date picker */}
                <div className="flex-1">
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted z-10" />
                    <DatePicker
                      selected={form.date ? new Date(form.date + "T00:00:00") : null}
                      onChange={handleDateSelect}
                      filterDate={isWeekend}
                      minDate={new Date(tomorrow + "T00:00:00")}
                      dateFormat="dd/MM/yyyy"
                      customInput={<DateTrigger />}
                      calendarClassName="jcc-calendar"
                      popperPlacement="bottom-start"
                      showPopperArrow={false}
                      wrapperClassName="w-full"
                    />
                  </div>
                  {dateError && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {dateError}
                    </p>
                  )}
                </div>

                {/* Time slots */}
                <div className="flex gap-2">
                  {configuredSlots.map((slot) => {
                    const isBlocked = !!form.date && !openSlots.includes(slot);
                    const active = form.time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBlocked || loadingTimes || !form.date}
                        onClick={() => set("time", slot)}
                        className={`flex flex-1 flex-col items-center justify-center rounded-xl border px-4 py-3 text-center transition ${
                          isBlocked || !form.date
                            ? "cursor-not-allowed border-border bg-surface opacity-40"
                            : active
                              ? "border-accent bg-accent/10"
                              : "border-border bg-surface hover:border-accent/40 hover:bg-surface-raised"
                        }`}
                      >
                        {loadingTimes ? (
                          <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />
                        ) : (
                          <>
                            <span
                              className={`text-sm font-bold ${active ? "text-foreground" : "text-foreground-muted"}`}
                            >
                              {slot}
                            </span>
                            <span className="text-[11px] text-foreground-muted">
                              {isBlocked ? "Taken" : "Available"}
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </fieldset>

            {/* ── Step 4: Contact details ───────────────────────────────── */}
            <fieldset>
              <legend className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
                  {showAddons ? "4" : "3"}
                </span>
                Your details
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Name */}
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
                {/* Phone */}
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {/* Email */}
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                {/* Hub-configured custom fields (e.g. Eircode) */}
                {config.customFields.map((field) => {
                  const Icon = FIELD_ICONS[field.fieldKey] ?? MapPin;
                  const value = form.customFields?.[field.fieldKey] ?? "";
                  const placeholder =
                    field.fieldKey === "eircode" ? "Eircode (e.g. F42 VW32)" : field.label;
                  return (
                    <div key={field.id} className="relative">
                      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted z-10" />
                      {field.fieldType === "select" ? (
                        <select
                          value={value}
                          onChange={(e) => setCustomField(field.fieldKey, e.target.value)}
                          required={field.required}
                          className="h-12 w-full appearance-none rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          <option value="">{field.label}{field.required ? "" : " (optional)"}</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={inputType(field.fieldType)}
                          placeholder={placeholder + (field.required ? "" : " (optional)")}
                          value={value}
                          onChange={(e) => setCustomField(field.fieldKey, e.target.value)}
                          required={field.required}
                          className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Travel distance & call-out fee (live from Eircode) ────── */}
              <AnimatePresence>
                {travelStatus !== "idle" && (
                  <motion.div
                    key="travel-panel"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-3"
                  >
                    {travelStatus === "checking" && (
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                        <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-foreground-muted" />
                        <p className="text-sm text-foreground-muted">
                          Checking your travel distance...
                        </p>
                      </div>
                    )}

                    {/* Route map — free zone circle + driving route to the customer */}
                    {travelStatus === "done" && travel && travel.origin && travel.dest && (
                      <div className="mb-3">
                        <TravelMap quote={travel} />
                      </div>
                    )}

                    {travelStatus === "done" && travel && travel.tooFar && (
                      <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-400">
                              Sorry — you&apos;re about {travel.distanceKm} km away,
                              outside our {travel.maxKm} km service area.
                            </p>
                            <p className="mt-1 text-xs text-foreground-muted">
                              For bigger jobs Jake can sometimes make an exception —
                              send him a message and ask.
                            </p>
                            <a
                              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                                `Hi Jake, my Eircode is ${travel.eircode} (about ${travel.distanceKm} km away). I know I'm outside your usual area — any chance of a valet?`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex min-h-[40px] items-center gap-2 rounded-full bg-accent px-5 text-xs font-bold text-white transition hover:bg-accent-dark"
                            >
                              Message Jake on WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {travelStatus === "done" && travel && !travel.tooFar && travel.freeZone && (
                      <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <p className="text-sm text-foreground">
                          You&apos;re in our{" "}
                          <span className="font-bold">free call-out zone</span> —{" "}
                          <span className="font-bold text-green-500">no travel fee.</span>
                          {travel.estimated && (
                            <span className="text-xs text-foreground-muted"> (estimate)</span>
                          )}
                        </p>
                      </div>
                    )}

                    {travelStatus === "done" && travel && !travel.tooFar && !travel.freeZone && (
                      <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">
                              {travel.distanceKm} km · about {travel.durationMin} min
                              drive away
                              {travel.estimated && (
                                <span className="text-xs text-foreground-muted"> (estimate)</span>
                              )}
                            </p>
                            <p className="mt-0.5 text-sm font-bold text-accent">
                              +€{appliedCalloutFee} call-out fee
                              {routeDayApplied && (
                                <span className="ml-2 text-xs font-semibold text-green-500">
                                  route-day discount (was €{travel.calloutFee})
                                </span>
                              )}
                            </p>
                            <p className="mt-1 text-xs text-foreground-muted">
                              Added to your service price to cover travel to your
                              area.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Route-day suggestion — Jake is already booked nearby */}
                    {travelStatus === "done" &&
                      travel &&
                      !travel.tooFar &&
                      !travel.freeZone &&
                      routeDay &&
                      !routeDayApplied && (
                        <div className="mt-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3">
                          <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                            <div className="flex-1">
                              <p className="text-sm text-foreground">
                                Jake is already booked near you on{" "}
                                <span className="font-bold">
                                  {formatSuggestedDate(routeDay.date)}
                                </span>{" "}
                                — choose that date and your call-out fee drops to{" "}
                                <span className="font-bold text-green-500">
                                  {routeDay.discountedFee > 0
                                    ? `€${routeDay.discountedFee}`
                                    : "free"}
                                </span>
                                .
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDateSelect(new Date(routeDay.date + "T00:00:00"))
                                }
                                className="mt-2.5 inline-flex min-h-[40px] items-center gap-2 rounded-full bg-green-500 px-5 text-xs font-bold text-white transition hover:bg-green-600"
                              >
                                Book {formatSuggestedDate(routeDay.date)}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    {travelStatus === "error" && (
                      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground-muted" />
                        <p className="text-sm text-foreground-muted">
                          {travelError} You can still book — Jake will confirm any
                          call-out fee with you.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Message */}
              <div className="mt-3">
                <textarea
                  placeholder="Anything else Jake should know — pet hair, heavily soiled areas, specific requests..."
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </fieldset>

            {/* ── Error ────────────────────────────────────────────────── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Submit ───────────────────────────────────────────────── */}
            <div>
              {travel && !travel.tooFar && travel.calloutFee > 0 && (
                <p className="mb-3 text-center text-xs font-semibold text-foreground">
                  {appliedCalloutFee > 0 ? (
                    <>
                      Includes a{" "}
                      <span className="text-accent">
                        €{appliedCalloutFee} call-out fee
                      </span>{" "}
                      for your area, added to the service price.
                    </>
                  ) : (
                    <>
                      <span className="text-green-500">No call-out fee</span> —
                      route-day discount applied.
                    </>
                  )}
                  {routeDayApplied && appliedCalloutFee > 0 && (
                    <span className="text-green-500"> Route-day discount applied.</span>
                  )}
                </p>
              )}
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className={`inline-flex w-full min-h-[56px] items-center justify-center gap-3 rounded-full text-base font-black text-white shadow-lg transition ${
                  canSubmit && !submitting
                    ? "bg-accent shadow-accent/20 hover:bg-accent-dark cursor-pointer"
                    : "bg-border cursor-not-allowed opacity-50"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending booking...
                  </>
                ) : outsideArea ? (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    Outside service area
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Request booking
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-foreground-muted">
                We&apos;ll confirm by phone or email within 24 hours.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

