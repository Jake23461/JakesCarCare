import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  type Firestore,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  type FirebaseStorage,
} from "firebase/storage";

export type GalleryCategory =
  | "interiors"
  | "exteriors"
  | "beforeAfter"
  | "videos";
export type GalleryItemType = "single" | "beforeAfter" | "video";

export interface GalleryItem {
  id: string;
  url: string;
  /** For beforeAfter pairs, the "before" image URL */
  beforeUrl?: string;
  type: GalleryItemType;
  category: GalleryCategory;
  label?: string;
  created: Timestamp;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getBeforeAfterItems(
  db: Firestore,
  max = 4
): Promise<GalleryItem[]> {
  const ref = collection(db, "gallery");
  const q = query(
    ref,
    where("type", "==", "beforeAfter"),
    orderBy("created", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem));
}

export async function getAllGalleryItems(db: Firestore): Promise<GalleryItem[]> {
  const ref = collection(db, "gallery");
  const q = query(ref, orderBy("created", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem));
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadGalleryFile(
  storage: FirebaseStorage,
  db: Firestore,
  file: File,
  meta: Omit<GalleryItem, "id" | "url" | "created">
): Promise<GalleryItem> {
  const filename = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `gallery/${filename}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const docData = { ...meta, url, storagePath: `gallery/${filename}`, created: Timestamp.now() };
  const docRef = await addDoc(collection(db, "gallery"), docData);
  return { id: docRef.id, ...docData } as GalleryItem;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteGalleryItem(
  storage: FirebaseStorage,
  db: Firestore,
  item: GalleryItem & { storagePath?: string }
): Promise<void> {
  // Delete from Storage if path known
  if (item.storagePath) {
    try {
      await deleteObject(ref(storage, item.storagePath));
    } catch {
      // File may already be gone — continue
    }
  }
  await deleteDoc(doc(db, "gallery", item.id));
}
