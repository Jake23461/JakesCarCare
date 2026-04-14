"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  submitBooking,
  SERVICES,
  AVAILABLE_TIMES,
  isWeekend,
  toLocalDateString,
  getTomorrowDateString,
  getBlockedTimesForDate,
  type Booking,
  type BookingData,
} from "@/lib/bookings";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Empty form ───────────────────────────────────────────────────────────────

const EMPTY_FORM: BookingData = {
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
  adminCreated: true,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Calendar
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<BookingData>(EMPTY_FORM);
  const [blockedTimes, setBlockedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit state (inline)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "bookings"), orderBy("created", "desc"));
      const snap = await getDocs(q);
      setBookings(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking))
      );
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ── Calendar helpers ───────────────────────────────────────────────────────
  const bookedDates = new Set(bookings.map((b) => b.date));

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  // Shift so Monday=0
  const startOffset = (firstDayOfWeek + 6) % 7;

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  // ── Create booking ─────────────────────────────────────────────────────────
  const handleDateChange = async (value: string) => {
    setCreateError("");
    if (!value) { setCreateForm(f => ({ ...f, date: "", time: "" })); return; }
    const d = new Date(value + "T00:00:00");
    if (!isWeekend(d)) {
      setCreateError("Weekends only.");
      setCreateForm(f => ({ ...f, date: "", time: "" }));
      return;
    }
    setCreateForm(f => ({ ...f, date: value, time: "" }));
    setLoadingTimes(true);
    try {
      const blocked = await getBlockedTimesForDate(db, value);
      setBlockedTimes(blocked);
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.service || !createForm.date || !createForm.time || !createForm.name) {
      setCreateError("Name, service, date and time are required.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      await submitBooking(db, { ...createForm, adminCreated: true });
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      setBlockedTimes([]);
      await fetchBookings();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create booking.");
    } finally {
      setCreating(false);
    }
  };

  // ── Edit booking ───────────────────────────────────────────────────────────
  const startEdit = (b: Booking) => {
    setEditingId(b.id);
    setEditDate(b.date);
    setEditPrice(b.price ?? "");
  };

  const saveEdit = async (id: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), {
        date: editDate,
        ...(editPrice ? { price: editPrice } : {}),
      });
      setEditingId(null);
      await fetchBookings();
    } catch {
      setError("Failed to update booking.");
    }
  };

  // ── Delete booking ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "bookings", id));
      setDeleteId(null);
      await fetchBookings();
    } catch {
      setError("Failed to delete booking.");
    } finally {
      setDeleting(false);
    }
  };

  const tomorrow = getTomorrowDateString();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-foreground">Bookings</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-dark"
        >
          <Plus className="h-4 w-4" />
          New booking
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={prevMonth} className="rounded-lg p-1.5 hover:bg-surface-raised">
            <ChevronLeft className="h-4 w-4 text-foreground-muted" />
          </button>
          <span className="text-sm font-bold text-foreground">
            {MONTH_NAMES[calMonth]} {calYear}
          </span>
          <button onClick={nextMonth} className="rounded-lg p-1.5 hover:bg-surface-raised">
            <ChevronRight className="h-4 w-4 text-foreground-muted" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} className="pb-1 text-[10px] font-bold uppercase text-foreground-muted">
              {d}
            </div>
          ))}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasBooking = bookedDates.has(dateStr);
            return (
              <div
                key={day}
                className={`flex h-8 w-8 mx-auto items-center justify-center rounded-full text-xs font-medium transition ${
                  hasBooking
                    ? "bg-accent text-white font-bold"
                    : "text-foreground-muted hover:bg-surface-raised"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : bookings.length === 0 ? (
        <p className="py-12 text-center text-sm text-foreground-muted">
          No bookings yet.
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{b.name}</span>
                    {b.adminCreated && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        Admin created
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {b.service}
                    {b.ironFalloutAddon && " + Iron Fallout"}
                    {b.protectorWaxAddon && " + Protector Wax"}
                  </p>
                  {editingId === b.id ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Price (e.g. €120)"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="h-9 w-36 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none"
                      />
                      <button
                        onClick={() => saveEdit(b.id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-bold text-white"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-foreground-muted"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs font-semibold text-foreground">
                      {formatDate(b.date)} at {b.time}
                      {b.price && <span className="ml-2 text-accent">{b.price}</span>}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-foreground-muted">
                    {b.phone} · {b.email} · {b.eircode}
                  </p>
                  {b.message && (
                    <p className="mt-1 text-xs text-foreground-muted italic">
                      &ldquo;{b.message}&rdquo;
                    </p>
                  )}
                </div>

                {editingId !== b.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(b)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground-muted transition hover:border-accent hover:text-accent"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(b.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground-muted transition hover:border-red-400 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-black text-foreground">New booking</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-1 text-foreground-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Name *"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="col-span-2 h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Eircode"
                  value={createForm.eircode}
                  onChange={(e) => setCreateForm(f => ({ ...f, eircode: e.target.value }))}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                />
                <select
                  value={createForm.service}
                  onChange={(e) => setCreateForm(f => ({ ...f, service: e.target.value, time: "" }))}
                  required
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="">Service *</option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {/* Date */}
              <input
                type="date"
                min={tomorrow}
                value={createForm.date}
                onChange={(e) => handleDateChange(e.target.value)}
                required
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none"
              />
              {/* Time slots */}
              <div className="flex gap-2">
                {AVAILABLE_TIMES.map((slot) => {
                  const blocked = blockedTimes.includes(slot);
                  const active = createForm.time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={blocked || loadingTimes || !createForm.date}
                      onClick={() => setCreateForm(f => ({ ...f, time: slot }))}
                      className={`flex flex-1 items-center justify-center rounded-xl border px-3 py-2 text-sm font-bold transition ${
                        blocked || !createForm.date
                          ? "cursor-not-allowed border-border opacity-40 text-foreground-muted"
                          : active
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border bg-background text-foreground-muted hover:border-accent/40"
                      }`}
                    >
                      {loadingTimes ? <Loader2 className="h-4 w-4 animate-spin" /> : slot}
                    </button>
                  );
                })}
              </div>
              <textarea
                placeholder="Notes"
                value={createForm.message}
                onChange={(e) => setCreateForm(f => ({ ...f, message: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
              />
              {createError && (
                <p className="text-xs text-red-400">{createError}</p>
              )}
              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-full bg-accent py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create booking"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-2xl text-center max-w-sm w-full">
            <p className="text-base font-bold text-foreground">Delete this booking?</p>
            <p className="mt-2 text-sm text-foreground-muted">This cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold text-foreground-muted transition hover:border-foreground-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
