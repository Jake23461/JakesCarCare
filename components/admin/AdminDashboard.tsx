"use client";

import { useEffect, useState } from "react";
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { Calendar, Star, Image as ImageIcon, LogOut, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import { BookingsTab } from "./BookingsTab";
import { ReviewsTab } from "./ReviewsTab";
import { GalleryTab } from "./GalleryTab";

type Tab = "bookings" | "reviews" | "gallery";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
];

const ADMIN_EMAIL = "jakehanrahan13@gmail.com";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser?.email?.toLowerCase() === ADMIN_EMAIL) {
        setUser(nextUser);
        setAuthError(null);
      } else {
        if (nextUser) {
          await signOut(auth).catch(() => undefined);
          setAuthError("That Google account is not approved for admin access.");
        }
        setUser(null);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleGoogleSignIn() {
    setIsSigningIn(true);
    setAuthError(null);

    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);

      if (result.user.email?.toLowerCase() !== ADMIN_EMAIL) {
        await signOut(auth);
        setAuthError("That Google account is not approved for admin access.");
      }
    } catch (error) {
      setAuthError("Google sign-in could not be completed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth).catch(() => undefined);
    setUser(null);
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-2xl shadow-black/20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <ShieldCheck className="h-7 w-7 text-accent" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-foreground">Checking access</h1>
          <p className="mt-3 text-sm text-foreground-muted">
            Confirming your admin session for Jake&apos;s Car Care.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-2xl shadow-black/20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <ShieldCheck className="h-7 w-7 text-accent" />
          </div>
          <h1 className="mt-5 text-center text-2xl font-black text-foreground">
            Admin Sign In
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-foreground-muted">
            Sign in with Google to access the admin dashboard. Only the approved
            account for this site can get in.
          </p>
          <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {ADMIN_EMAIL}
          </p>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSigningIn ? "Signing in..." : "Continue with Google"}
          </button>
          {authError && (
            <p className="mt-4 text-center text-sm text-red-400">{authError}</p>
          )}
          <a
            href="/"
            className="mt-5 block text-center text-xs font-semibold text-foreground-muted transition hover:text-accent"
          >
            Back to site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-black text-foreground sm:text-xl">
              Jake&apos;s Car Care
            </h1>
            <p className="text-xs text-foreground-muted">
              Admin Dashboard · {user.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              className="w-fit text-xs font-semibold text-foreground-muted transition hover:text-accent"
            >
              Back to site
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-2 text-xs font-semibold text-foreground-muted transition hover:border-accent/40 hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "reviews" && <ReviewsTab />}
        {activeTab === "gallery" && <GalleryTab />}
      </main>
    </div>
  );
}
