"use client";

import { useState } from "react";
import { Calendar, Star, Image as ImageIcon } from "lucide-react";
import { BookingsTab } from "./BookingsTab";
import { ReviewsTab } from "./ReviewsTab";
import { GalleryTab } from "./GalleryTab";

type Tab = "bookings" | "reviews" | "gallery";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("bookings");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-surface px-6 py-5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-foreground">
              Jake&apos;s Car Care
            </h1>
            <p className="text-xs text-foreground-muted">Admin Dashboard</p>
          </div>
          <a
            href="/"
            className="text-xs font-semibold text-foreground-muted transition hover:text-accent"
          >
            ← View site
          </a>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex gap-1 py-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  activeTab === id
                    ? "bg-accent text-white"
                    : "text-foreground-muted hover:bg-surface-raised hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "reviews" && <ReviewsTab />}
        {activeTab === "gallery" && <GalleryTab />}
      </main>
    </div>
  );
}
