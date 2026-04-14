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
import { db } from "@/lib/firebase";
import {
  SERVICES,
  SERVICE_DURATIONS,
  AVAILABLE_TIMES,
  isWeekend,
  toLocalDateString,
  getTomorrowDateString,
  getBlockedTimesForDate,
  submitBooking,
  type BookingData,
} from "@/lib/bookings";

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

// ─── Service card config ──────────────────────────────────────────────────────

const SERVICE_CONFIG = [
  {
    id: "Full Valet",
    icon: Car,
    label: "Full Valet",
    desc: "Complete inside-and-out transformation",
    tag: `${SERVICE_DURATIONS["Full Valet"]}hrs`,
    price: "€100–€120",
  },
  {
    id: "Exterior Only",
    icon: Droplets,
    label: "Exterior Only",
    desc: "Full exterior foam wash, rinse, hand dry",
    tag: `${SERVICE_DURATIONS["Exterior Only"]}hrs`,
    price: "€50",
  },
  {
    id: "Interior Only",
    icon: Sparkles,
    label: "Interior Only",
    desc: "Deep vacuum, trim clean, glass, steam",
    tag: `${SERVICE_DURATIONS["Interior Only"]}hrs`,
    price: "€70–€90",
  },
] as const;

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
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BookingSection() {
  const [form, setForm] = useState<BookingData>(EMPTY);
  const [blockedTimes, setBlockedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");

  const set = <K extends keyof BookingData>(k: K, v: BookingData[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // ── Fetch blocked slots whenever date changes ─────────────────────────────
  const refreshBlocked = useCallback(async (dateStr: string) => {
    if (!dateStr) {
      setBlockedTimes([]);
      return;
    }
    setLoadingTimes(true);
    try {
      const blocked = await getBlockedTimesForDate(db, dateStr);
      setBlockedTimes(blocked);
    } catch {
      setBlockedTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  }, []);

  // Initial load + 15-second refresh
  useEffect(() => {
    if (!form.date) return;
    refreshBlocked(form.date);
    const id = setInterval(() => refreshBlocked(form.date), 15_000);
    return () => clearInterval(id);
  }, [form.date, refreshBlocked]);

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

  // ── Add-on visibility ─────────────────────────────────────────────────────
  const showAddons =
    form.service === "Full Valet" || form.service === "Exterior Only";

  // ── Validation ────────────────────────────────────────────────────────────
  const isComplete =
    !!form.service &&
    !!form.date &&
    !!form.time &&
    !!form.name &&
    !!form.phone &&
    !!form.email &&
    !!form.eircode;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;

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
      await submitBooking(db, form);
      setSuccess(true);
      setForm(EMPTY);
      setBlockedTimes([]);
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
                {SERVICE_CONFIG.map(({ id, icon: Icon, label, desc, tag, price }) => {
                  const active = form.service === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        set("service", id);
                        set("time", ""); // reset time when service changes
                        // clear add-ons if service doesn't support them
                        if (id === "Interior Only") {
                          set("ironFalloutAddon", false);
                          set("protectorWaxAddon", false);
                        }
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
                    {[
                      {
                        key: "ironFalloutAddon" as const,
                        label: "Iron Fallout & Tar Remover",
                        desc: "Decontaminates paintwork before wash",
                        price: "+€20",
                      },
                      {
                        key: "protectorWaxAddon" as const,
                        label: "Protector Wax",
                        desc: "Long-lasting paint protection applied after wash",
                        price: "+€25",
                      },
                    ].map(({ key, label, desc, price }) => {
                      const active = form[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => set(key, !active)}
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
                  {AVAILABLE_TIMES.map((slot) => {
                    const isBlocked = blockedTimes.includes(slot);
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
                {/* Eircode */}
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                  <input
                    type="text"
                    placeholder="Eircode (e.g. F42 AB12)"
                    value={form.eircode}
                    onChange={(e) => set("eircode", e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
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
              <button
                type="submit"
                disabled={!isComplete || submitting}
                className={`inline-flex w-full min-h-[56px] items-center justify-center gap-3 rounded-full text-base font-black text-white shadow-lg transition ${
                  isComplete && !submitting
                    ? "bg-accent shadow-accent/20 hover:bg-accent-dark cursor-pointer"
                    : "bg-border cursor-not-allowed opacity-50"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending booking...
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
