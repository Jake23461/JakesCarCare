"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Plus, Trash2, Edit2, X, Check, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { submitBooking, SERVICES, AVAILABLE_TIMES, isWeekend, getTomorrowDateString, getBlockedTimesForDate, type Booking, type BookingData } from "@/lib/bookings";

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatMonthYear(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getBaseServicePrice(service: string) {
  switch (service) {
    case "Full Valet": return 110;
    case "Exterior Only": return 50;
    case "Interior Only": return 80;
    default: return 0;
  }
}

function parsePriceValue(booking: Booking) {
  if (booking.price) {
    const matches = booking.price.match(/\d+(?:\.\d+)?/g);
    if (matches?.length) {
      const nums = matches.map(Number).filter((value) => !Number.isNaN(value));
      if (nums.length) return nums.reduce((sum, value) => sum + value, 0) / nums.length;
    }
  }
  let value = getBaseServicePrice(booking.service);
  if (booking.ironFalloutAddon) value += 20;
  if (booking.protectorWaxAddon) value += 25;
  return value;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function sortBookings(bookings: Booking[]) {
  return [...bookings].sort((a, b) => {
    if (a.date === b.date) return (a.time || "").localeCompare(b.time || "");
    return a.date.localeCompare(b.date);
  });
}

function sortBookingsNewestFirst(bookings: Booking[]) {
  return [...bookings].sort((a, b) => {
    const createdA = a.created?.toDate ? a.created.toDate().getTime() : 0;
    const createdB = b.created?.toDate ? b.created.toDate().getTime() : 0;
    return createdB - createdA;
  });
}

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

type DaySummary = {
  dateKey: string;
  date: Date;
  bookings: Booking[];
  names: string[];
  revenue: number;
  slotCount: number;
  openSlots: number;
  isFull: boolean;
};

export function BookingsTab() {
  const DEFAULT_VISIBLE_BOOKINGS = 6;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<BookingData>(EMPTY_FORM);
  const [blockedTimes, setBlockedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "bookings"), orderBy("created", "desc"));
      const snap = await getDocs(q);
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking)));
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const sortedBookings = useMemo(() => sortBookings(bookings), [bookings]);
  const recentFirstBookings = useMemo(() => sortBookingsNewestFirst(bookings), [bookings]);
  const bookingsByDate = useMemo(() => sortedBookings.reduce<Record<string, Booking[]>>((acc, booking) => {
    if (!acc[booking.date]) acc[booking.date] = [];
    acc[booking.date].push(booking);
    return acc;
  }, {}), [sortedBookings]);

  const allTimeRevenue = useMemo(() => sortedBookings.reduce((sum, booking) => sum + parsePriceValue(booking), 0), [sortedBookings]);
  const completedBookings = useMemo(() => sortedBookings.filter((booking) => booking.completed), [sortedBookings]);
  const earnedRevenue = useMemo(() => completedBookings.reduce((sum, booking) => sum + parsePriceValue(booking), 0), [completedBookings]);
  const averageBookingValue = sortedBookings.length ? allTimeRevenue / sortedBookings.length : 0;
  const customPriceCount = sortedBookings.filter((booking) => !!booking.price).length;

  const getDaySummary = useCallback((date: Date): DaySummary => {
    const dateKey = toDateKey(date);
    const dayBookings = bookingsByDate[dateKey] ?? [];
    const bookedSlots = new Set(dayBookings.map((booking) => booking.time).filter(Boolean));
    return {
      dateKey,
      date,
      bookings: dayBookings,
      names: dayBookings.map((booking) => booking.name),
      revenue: dayBookings.reduce((sum, booking) => sum + parsePriceValue(booking), 0),
      slotCount: bookedSlots.size,
      openSlots: Math.max(AVAILABLE_TIMES.length - bookedSlots.size, 0),
      isFull: bookedSlots.size >= AVAILABLE_TIMES.length,
    };
  }, [bookingsByDate]);

  const selectedMonthDays = useMemo(() => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => getDaySummary(new Date(calYear, calMonth, index + 1)));
  }, [calMonth, calYear, getDaySummary]);

  const selectedMonthBookings = useMemo(() => sortedBookings.filter((booking) => {
    const date = new Date(`${booking.date}T00:00:00`);
    return date.getFullYear() === calYear && date.getMonth() === calMonth;
  }), [calMonth, calYear, sortedBookings]);

  const selectedMonthRevenue = selectedMonthBookings.reduce((sum, booking) => sum + parsePriceValue(booking), 0);
  const selectedMonthEarned = selectedMonthBookings.filter((booking) => booking.completed).reduce((sum, booking) => sum + parsePriceValue(booking), 0);
  const selectedMonthFullDays = selectedMonthDays.filter((day) => day.isFull).length;
  const todaysSummary = getDaySummary(new Date());
  const daysInMonth = selectedMonthDays.length;
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const startOffset = (firstDayOfWeek + 6) % 7;
  const tomorrow = getTomorrowDateString();
  const visibleBookings = showAllBookings ? recentFirstBookings : recentFirstBookings.slice(0, DEFAULT_VISIBLE_BOOKINGS);

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalYear((year) => year - 1);
      setCalMonth(11);
      return;
    }
    setCalMonth((month) => month - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear((year) => year + 1);
      setCalMonth(0);
      return;
    }
    setCalMonth((month) => month + 1);
  };

  const goToToday = () => {
    const today = new Date();
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth());
  };

  const handleDateChange = async (value: string) => {
    setCreateError("");
    if (!value) {
      setCreateForm((form) => ({ ...form, date: "", time: "" }));
      return;
    }
    const date = new Date(`${value}T00:00:00`);
    if (!isWeekend(date)) {
      setCreateError("Weekends only.");
      setCreateForm((form) => ({ ...form, date: "", time: "" }));
      return;
    }
    setCreateForm((form) => ({ ...form, date: value, time: "" }));
    setLoadingTimes(true);
    try {
      const blocked = await getBlockedTimesForDate(db, value);
      setBlockedTimes(blocked);
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
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

  const startEdit = (booking: Booking) => {
    setEditingId(booking.id);
    setEditDate(booking.date);
    setEditTime(booking.time);
    setEditPrice(booking.price ?? "");
  };

  const saveEdit = async (id: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { date: editDate, time: editTime, price: editPrice || null });
      setEditingId(null);
      await fetchBookings();
    } catch {
      setError("Failed to update booking.");
    }
  };

  const toggleCompleted = async (booking: Booking) => {
    try {
      await updateDoc(doc(db, "bookings", booking.id), { completed: !booking.completed });
      await fetchBookings();
    } catch {
      setError("Failed to update booking status.");
    }
  };

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

  return (
    <div className="max-w-full space-y-6 overflow-x-hidden sm:space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-foreground">Bookings</h2>
          <p className="text-sm text-foreground-muted">
            Keep the old admin overview feel, now inside the new site.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-dark"
        >
          <Plus className="h-4 w-4" />
          New booking
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "All booked", value: formatCurrency(allTimeRevenue), meta: `${sortedBookings.length} bookings total`, tone: "text-green-300" },
          { label: "All earned", value: formatCurrency(earnedRevenue), meta: `${completedBookings.length} completed jobs`, tone: "text-sky-300" },
          { label: "Outstanding", value: formatCurrency(allTimeRevenue - earnedRevenue), meta: "Still waiting to complete", tone: "text-amber-300" },
          { label: "Average booking", value: formatCurrency(averageBookingValue), meta: `${customPriceCount} custom-priced jobs`, tone: "text-foreground" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-surface p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted">{card.label}</p>
            <p className={`mt-3 text-3xl font-black ${card.tone}`}>{card.value}</p>
            <p className="mt-2 text-sm text-foreground-muted">{card.meta}</p>
          </div>
        ))}
      </div>

      <div className="grid max-w-full gap-4 sm:gap-5 xl:grid-cols-[1.72fr_0.56fr]">
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-foreground">Monthly calendar</h3>
              <p className="text-sm text-foreground-muted">Full days are greyed out when both slots are taken.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="rounded-lg border border-border p-2 text-foreground-muted transition hover:border-accent/40 hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={goToToday} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground-muted transition hover:border-accent/40 hover:text-foreground">
                Today
              </button>
              <button onClick={nextMonth} className="rounded-lg border border-border p-2 text-foreground-muted transition hover:border-accent/40 hover:text-foreground">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-lg font-black text-foreground">{formatMonthYear(calYear, calMonth)}</p>
              <p className="text-sm text-foreground-muted">{selectedMonthBookings.length} bookings, {formatCurrency(selectedMonthRevenue)} booked</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="rounded-full bg-white/5 px-3 py-1.5 text-foreground-muted">Earned {formatCurrency(selectedMonthEarned)}</span>
              <span className="rounded-full bg-white/5 px-3 py-1.5 text-foreground-muted">{selectedMonthFullDays} full days</span>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto pb-2">
            <div className="grid min-w-[700px] grid-cols-7 gap-3 text-center">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground-muted">{day}</div>
              ))}
              {Array.from({ length: startOffset }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
              {selectedMonthDays.map((day) => {
                const isToday = day.dateKey === toDateKey(new Date());
                return (
                  <div
                    key={day.dateKey}
                    className={`min-h-[108px] rounded-2xl border p-3 text-left transition ${day.isFull ? "border-white/10 bg-white/6 opacity-65" : "border-border bg-background/40"} ${isToday ? "ring-1 ring-accent/40" : ""}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-black text-foreground">{day.date.getDate()}</p>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-foreground-muted">
                          {day.date.toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${day.isFull ? "bg-red-500/15 text-red-200" : "bg-emerald-500/15 text-emerald-200"}`}>
                        {day.isFull ? "Full" : `${day.openSlots} open`}
                      </span>
                    </div>
                    {day.bookings.length === 0 ? (
                      <p className="pt-3 text-xs text-foreground-muted">No bookings</p>
                    ) : (
                      <div className="space-y-1.5">
                        {day.bookings.map((booking) => (
                          <div key={booking.id} className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-1.5">
                            <p className="truncate text-xs font-bold leading-tight text-foreground">{booking.name}</p>
                            <p className="mt-0.5 text-[11px] text-foreground-muted">{booking.time}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-surface p-4">
          <div className="mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Today&apos;s schedule</p>
            <h3 className="mt-1 text-base font-black text-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${todaysSummary.isFull ? "bg-red-500/15 text-red-200" : "bg-emerald-500/15 text-emerald-200"}`}>
              {todaysSummary.isFull ? "Fully booked" : `${todaysSummary.openSlots} slots open`}
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold text-foreground-muted">{formatCurrency(todaysSummary.revenue)}</span>
          </div>

          {todaysSummary.bookings.length === 0 ? (
            <p className="text-sm text-foreground-muted">No one is booked in today.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-foreground-muted">
                {todaysSummary.names.join(", ")} {todaysSummary.names.length === 1 ? "is" : "are"} on today.
              </p>
              {todaysSummary.bookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border border-border bg-background/50 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{booking.name}</p>
                      <p className="text-xs text-foreground-muted">{booking.time}</p>
                    </div>
                    <p className="text-xs font-bold text-accent">{booking.price ?? formatCurrency(parsePriceValue(booking))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : sortedBookings.length === 0 ? (
        <p className="py-12 text-center text-sm text-foreground-muted">No bookings yet.</p>
      ) : (
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <div className="mb-5">
            <h3 className="text-base font-black text-foreground">All bookings</h3>
            <p className="text-sm text-foreground-muted">The old totals-first table view, restyled to fit the new admin.</p>
          </div>

          {recentFirstBookings.length > DEFAULT_VISIBLE_BOOKINGS && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-background/35 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                Showing {visibleBookings.length} of {recentFirstBookings.length} bookings
              </p>
              <button
                onClick={() => setShowAllBookings((value) => !value)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground-muted transition hover:border-accent/40 hover:text-foreground"
              >
                {showAllBookings ? "Show less" : "Show more"}
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-white/8 bg-background/45">
            <table className="min-w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-accent/8 text-left">
                  {["Date", "Time", "Name", "Phone", "Eircode", "Service", "Price", "Status", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      className={`px-3 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground sm:px-4 sm:text-[11px] sm:tracking-[0.16em] ${
                        heading === "Phone" || heading === "Eircode" ? "hidden md:table-cell" : ""
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-white/6 align-top">
                    <td className="px-3 py-3 text-foreground sm:px-4">
                      {editingId === booking.id ? (
                        <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
                      ) : (
                        formatDate(booking.date)
                      )}
                    </td>
                    <td className="px-3 py-3 text-foreground sm:px-4">
                      {editingId === booking.id ? (
                        <select value={editTime} onChange={(e) => setEditTime(e.target.value)} className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none">
                          {AVAILABLE_TIMES.map((time) => <option key={time} value={time}>{time}</option>)}
                        </select>
                      ) : booking.time}
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <div>
                        <p className="font-bold text-foreground">{booking.name}</p>
                        {booking.adminCreated && <span className="mt-1 inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">Admin</span>}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-foreground-muted md:table-cell">{booking.phone || "—"}</td>
                    <td className="hidden px-4 py-3 text-foreground-muted md:table-cell">{booking.eircode || "—"}</td>
                    <td className="px-3 py-3 sm:px-4">
                      <div className="text-foreground">
                        <p>{booking.service}</p>
                        <p className="text-xs text-foreground-muted">
                          {booking.ironFalloutAddon ? " +IF" : ""}
                          {booking.protectorWaxAddon ? " +PW" : ""}
                          {!booking.ironFalloutAddon && !booking.protectorWaxAddon ? "Standard" : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      {editingId === booking.id ? (
                        <input type="text" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="€110" className="h-9 w-24 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
                      ) : (
                        <span className="font-bold text-accent">{booking.price ?? formatCurrency(parsePriceValue(booking))}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted">
                        <input type="checkbox" checked={!!booking.completed} onChange={() => toggleCompleted(booking)} className="h-4 w-4 rounded border-border bg-background accent-[#dc2626]" />
                        {booking.completed ? "Completed" : "Pending"}
                      </label>
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      {editingId === booking.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(booking.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-bold text-white">
                            <Check className="h-3.5 w-3.5" /> Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-foreground-muted">
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(booking)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground-muted transition hover:border-accent hover:text-accent">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(booking.id)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground-muted transition hover:border-red-400 hover:text-red-400">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-white/3">
                  <td colSpan={6} className="px-3 py-3 text-right text-xs font-bold uppercase tracking-[0.12em] text-foreground-muted sm:px-4 sm:tracking-[0.16em]">Totals</td>
                  <td className="px-4 py-3 font-black text-green-300">{formatCurrency(allTimeRevenue)}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-sky-300">{completedBookings.length} complete</td>
                  <td className="px-4 py-3 text-xs font-semibold text-amber-300">{formatCurrency(allTimeRevenue - earnedRevenue)} left</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-black text-foreground">New booking</h3>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-foreground-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Name *" value={createForm.name} onChange={(e) => setCreateForm((form) => ({ ...form, name: e.target.value }))} required className="col-span-2 h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none" />
                <input type="tel" placeholder="Phone" value={createForm.phone} onChange={(e) => setCreateForm((form) => ({ ...form, phone: e.target.value }))} className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none" />
                <input type="email" placeholder="Email" value={createForm.email} onChange={(e) => setCreateForm((form) => ({ ...form, email: e.target.value }))} className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none" />
                <input type="text" placeholder="Eircode" value={createForm.eircode} onChange={(e) => setCreateForm((form) => ({ ...form, eircode: e.target.value }))} className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none" />
                <select value={createForm.service} onChange={(e) => setCreateForm((form) => ({ ...form, service: e.target.value, time: "" }))} required className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none">
                  <option value="">Service *</option>
                  {SERVICES.map((service) => <option key={service} value={service}>{service}</option>)}
                </select>
              </div>
              <input type="date" min={tomorrow} value={createForm.date} onChange={(e) => handleDateChange(e.target.value)} required className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
              <div className="flex gap-2">
                {AVAILABLE_TIMES.map((slot) => {
                  const blocked = blockedTimes.includes(slot);
                  const active = createForm.time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={blocked || loadingTimes || !createForm.date}
                      onClick={() => setCreateForm((form) => ({ ...form, time: slot }))}
                      className={`flex flex-1 items-center justify-center rounded-xl border px-3 py-2 text-sm font-bold transition ${blocked || !createForm.date ? "cursor-not-allowed border-border text-foreground-muted opacity-40" : active ? "border-accent bg-accent/10 text-foreground" : "border-border bg-background text-foreground-muted hover:border-accent/40"}`}
                    >
                      {loadingTimes ? <Loader2 className="h-4 w-4 animate-spin" /> : slot}
                    </button>
                  );
                })}
              </div>
              <textarea placeholder="Notes" value={createForm.message} onChange={(e) => setCreateForm((form) => ({ ...form, message: e.target.value }))} rows={2} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none" />
              {createError && <p className="text-xs text-red-400">{createError}</p>}
              <button type="submit" disabled={creating} className="w-full rounded-full bg-accent py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-50">
                {creating ? "Creating..." : "Create booking"}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-2xl">
            <p className="text-base font-bold text-foreground">Delete this booking?</p>
            <p className="mt-2 text-sm text-foreground-muted">This cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold text-foreground-muted transition hover:border-foreground-muted">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
