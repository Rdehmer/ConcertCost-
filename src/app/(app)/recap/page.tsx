import { YearRecapView } from "@/components/YearRecapView";
import {
  CONCERT_WITH_COSTS_SELECT,
  normalizeConcerts,
} from "@/lib/concerts";
import { createClient } from "@/lib/supabase/server";

export default async function RecapPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select(CONCERT_WITH_COSTS_SELECT)
    .order("concert_date", { ascending: false });

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Could not load concerts: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Year Recap</h2>
        <p className="text-sm opacity-70">
          A shareable wrap-up of your shows - only your data, ready to download.
        </p>
      </div>
      <YearRecapView
        concerts={normalizeConcerts(data as Record<string, unknown>[] | null)}
      />
    </div>
  );
}
