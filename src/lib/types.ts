export type CostCategory =
  | "Ticket"
  | "Parking"
  | "Merch"
  | "Food & Drink"
  | "Fees"
  | "Travel"
  | "Lodging"
  | "Other"
  | "Uncategorized";

export const COST_CATEGORIES: CostCategory[] = [
  "Ticket",
  "Parking",
  "Merch",
  "Food & Drink",
  "Fees",
  "Travel",
  "Lodging",
  "Other",
];

export type ConcertCostItem = {
  id: string;
  concert_id: string;
  category: CostCategory | string;
  amount: number;
  sort_order: number;
  created_at?: string;
};

export type Concert = {
  id: string;
  user_id: string;
  concert_name: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  concert_date: string;
  distance_from_home: number;
  hours_at_event: number;
  /** Legacy fixed columns — kept for backward compatibility. */
  ticket_cost?: number;
  ticket_fees?: number;
  parking_cost?: number;
  food_drink_cost?: number;
  merchandise_cost?: number;
  lodging_cost?: number;
  travel_cost?: number;
  other_cost?: number;
  fun_rating: number;
  notes: string | null;
  created_at: string;
  /** Preferred source of truth when present. */
  cost_items?: ConcertCostItem[];
};

export type ConcertInsert = Omit<
  Concert,
  "id" | "created_at" | "cost_items" | keyof LegacyCostFields
> &
  Partial<LegacyCostFields>;

type LegacyCostFields = {
  ticket_cost: number;
  ticket_fees: number;
  parking_cost: number;
  food_drink_cost: number;
  merchandise_cost: number;
  lodging_cost: number;
  travel_cost: number;
  other_cost: number;
};

export const LEGACY_COST_FIELDS: {
  key: keyof LegacyCostFields;
  category: CostCategory;
}[] = [
  { key: "ticket_cost", category: "Ticket" },
  { key: "ticket_fees", category: "Fees" },
  { key: "parking_cost", category: "Parking" },
  { key: "food_drink_cost", category: "Food & Drink" },
  { key: "merchandise_cost", category: "Merch" },
  { key: "lodging_cost", category: "Lodging" },
  { key: "travel_cost", category: "Travel" },
  { key: "other_cost", category: "Other" },
];

export const THEMES = [
  "cupcake",
  "light",
  "dark",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "aqua",
  "lofi",
  "lemonade",
  "night",
  "coffee",
] as const;

export type ThemeName = (typeof THEMES)[number];

export const COST_CHART_COLORS = [
  "#65c3c8",
  "#ef9fbc",
  "#eeaf3a",
  "#291334",
  "#36d399",
  "#3abff8",
  "#f87272",
  "#7480ff",
  "#a3e635",
];
