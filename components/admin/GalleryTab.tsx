"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2, AlertCircle, Plus } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import {
  getAllGalleryItems,
  uploadGalleryFile,
  deleteGalleryItem,
  type GalleryItem,
  type GalleryCategory,
  type GalleryItemType,
} from "@/lib/gallery";

const CATEGORIES: GalleryCategory[] = ["interiors", "exteriors", "beforeAfter", "videos"];

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  interiors: "Interiors",
  exteriors: "Exteriors",
  beforeAfter: "Before & After",
  videos: "Videos",
};

export function GalleryTab() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("exteriors");

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState<GalleryCategory>("exteriors");
  const [uploadType, setUploadType] = useState<GalleryItemType>("single");
  const [uploadLabel, setUploadLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Before file for beforeAfter pairs
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllGalleryItems(db);
      setItems(data);
    } catch {
      setError("Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = items.filter((i) => i.category === activeCategory);

  // ── Upload ─────────────────────────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      if (uploadType === "beforeAfter" && beforeFile) {
        // Upload "before" image first, store its URL in beforeUrl
        const beforeItem = await uploadGalleryFile(storage, db, beforeFile, {
          type: "single",
          category: uploadCategory,
          label: uploadLabel || undefined,
        });
        // Upload "after" image with beforeUrl pointing to "before"
        await uploadGalleryFile(storage, db, file, {
          type: "beforeAfter",
          category: uploadCategory,
          label: uploadLabel || undefined,
          beforeUrl: beforeItem.url,
        });
        setBeforeFile(null);
        if (beforeInputRef.current) beforeInputRef.current.value = "";
      } else {
        await uploadGalleryFile(storage, db, file, {
          type: uploadType,
          category: uploadCategory,
          label: uploadLabel || undefined,
        });
      }

      setUploadLabel("");
      e.target.value = "";
      await fetchItems();
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (item: GalleryItem) => {
    setDeletingId(item.id);
    try {
      await deleteGalleryItem(storage, db, item as GalleryItem & { storagePath?: string });
      await fetchItems();
    } catch {
      setError("Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-foreground">Gallery</h2>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Upload panel */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-bold text-foreground">Upload new</h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as GalleryCategory)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value as GalleryItemType)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="single">Single image</option>
            <option value="beforeAfter">Before & After pair</option>
            <option value="video">Video</option>
          </select>
          <input
            type="text"
            placeholder="Label (optional)"
            value={uploadLabel}
            onChange={(e) => setUploadLabel(e.target.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
          />
        </div>

        {uploadType === "beforeAfter" && (
          <div className="mt-3">
            <label className="mb-1 block text-xs font-semibold text-foreground-muted">
              Before image
            </label>
            <input
              ref={beforeInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setBeforeFile(e.target.files?.[0] ?? null)}
              className="text-sm text-foreground-muted"
            />
            {beforeFile && (
              <p className="mt-1 text-xs text-accent">{beforeFile.name} selected</p>
            )}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || (uploadType === "beforeAfter" && !beforeFile)}
            className="inline-flex items-center gap-2 rounded-full border border-accent px-5 py-2.5 text-sm font-bold text-accent transition hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="h-4 w-4" />
              {uploadType === "beforeAfter" ? "Upload after image" : "Choose file"}</>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={uploadType === "video" ? "video/*" : "image/*"}
            onChange={handleUpload}
            className="hidden"
          />
        </div>
        {uploadError && (
          <p className="mt-2 text-xs text-red-400">{uploadError}</p>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeCategory === c
                ? "bg-accent text-white"
                : "text-foreground-muted hover:bg-surface-raised hover:text-foreground"
            }`}
          >
            {CATEGORY_LABELS[c]}
            <span className="ml-1.5 text-xs opacity-60">
              ({items.filter((i) => i.category === c).length})
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Plus className="mb-3 h-8 w-8 text-foreground-muted/40" />
          <p className="text-sm text-foreground-muted">
            No {CATEGORY_LABELS[activeCategory].toLowerCase()} yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface"
            >
              {item.type === "video" ? (
                <video
                  src={item.url}
                  className="aspect-square w-full object-cover"
                  muted
                  playsInline
                />
              ) : item.type === "beforeAfter" && item.beforeUrl ? (
                <div className="grid grid-cols-2">
                  <div className="relative aspect-square">
                    <Image src={item.beforeUrl} alt="Before" fill className="object-cover" />
                    <span className="absolute left-1 top-1 rounded-sm bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white/70">
                      Before
                    </span>
                  </div>
                  <div className="relative aspect-square">
                    <Image src={item.url} alt="After" fill className="object-cover" />
                    <span className="absolute right-1 top-1 rounded-sm bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                      After
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-square">
                  <Image src={item.url} alt={item.label ?? "Gallery"} fill className="object-cover" />
                </div>
              )}

              {item.label && (
                <p className="truncate border-t border-border px-3 py-2 text-xs font-medium text-foreground">
                  {item.label}
                </p>
              )}

              {/* Delete overlay */}
              <button
                onClick={() => handleDelete(item)}
                disabled={deletingId === item.id}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-red-500 group-hover:opacity-100 disabled:opacity-50"
              >
                {deletingId === item.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
