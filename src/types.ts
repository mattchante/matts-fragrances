export type FragranceStatus = "owned" | "wishlist" | "archived";
export const exitReasons = [
  "sold",
  "finished",
  "gifted",
  "disliked",
  "redundant",
  "other",
] as const;
export interface Fragrance {
  id: string;
  brand: string;
  name: string;
  concentration?: string;
  image: string;
  status: FragranceStatus;
  rating?: number;
  scentProfile?: string;
  notes?: string[];
  userCreated?: boolean;
  wishlist?: {
    priority?: number;
    targetPrice?: number;
    sampled?: boolean;
    reasonWanted?: string;
    nextBuy?: boolean;
  };
  archive?: { exitReason?: (typeof exitReasons)[number]; wouldRebuy?: boolean };
}
export const sections: Record<
  FragranceStatus,
  { title: string; unit: string; description: string }
> = {
  owned: {
    title: "Collection",
    unit: "owned",
    description: "The bottles that made it onto the shelf.",
  },
  wishlist: {
    title: "Wishlist",
    unit: "locked",
    description: "A little anticipation. The next chapter of the collection.",
  },
  archived: {
    title: "Archive",
    unit: "previously owned",
    description: "Bottles gone. Memories kept.",
  },
};
