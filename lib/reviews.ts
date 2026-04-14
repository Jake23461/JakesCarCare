import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  type Firestore,
  type Timestamp,
} from "firebase/firestore";

export interface FirestoreReview {
  id: string;
  name: string;
  text: string;
  stars: number;
  approved: boolean;
  created: Timestamp;
}

export async function getApprovedReviews(
  db: Firestore,
  maxReviews = 6
): Promise<FirestoreReview[]> {
  const ref = collection(db, "reviews");
  const q = query(
    ref,
    where("approved", "==", true),
    orderBy("created", "desc"),
    limit(maxReviews)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreReview));
}
