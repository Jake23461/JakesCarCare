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
import { Star, Trash2, Check, Loader2, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";

interface Review {
  id: string;
  name: string;
  text: string;
  stars: number;
  approved: boolean;
  created: { toDate: () => Date };
}

export function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "reviews"), orderBy("created", "desc"));
      const snap = await getDocs(q);
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
    } catch {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const approve = async (id: string) => {
    setActionId(id);
    try {
      await updateDoc(doc(db, "reviews", id), { approved: true });
      await fetchReviews();
    } catch {
      setError("Failed to approve review.");
    } finally {
      setActionId(null);
    }
  };

  const remove = async (id: string) => {
    setActionId(id);
    try {
      await deleteDoc(doc(db, "reviews", id));
      await fetchReviews();
    } catch {
      setError("Failed to delete review.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-foreground">Reviews</h2>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-12 text-center text-sm text-foreground-muted">
          No reviews yet.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border p-5 ${
                r.approved
                  ? "border-border bg-surface"
                  : "border-amber-400/20 bg-amber-400/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{r.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        r.approved
                          ? "bg-accent/10 text-accent"
                          : "bg-amber-400/10 text-amber-400"
                      }`}
                    >
                      {r.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                    &ldquo;{r.text}&rdquo;
                  </p>
                  {r.created && (
                    <p className="mt-2 text-xs text-foreground-muted/60">
                      {r.created.toDate().toLocaleDateString("en-IE")}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {!r.approved && (
                    <button
                      onClick={() => approve(r.id)}
                      disabled={actionId === r.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 text-accent transition hover:bg-accent/10 disabled:opacity-50"
                      title="Approve"
                    >
                      {actionId === r.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => remove(r.id)}
                    disabled={actionId === r.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground-muted transition hover:border-red-400 hover:text-red-400 disabled:opacity-50"
                    title="Delete"
                  >
                    {actionId === r.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
