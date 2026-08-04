import { InsightsView } from "@/components/InsightsView";
import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select("*")
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
        <h2 className="text-2xl font-bold">Insights</h2>
        <p className="text-sm opacity-70">
          See which shows gave you the most bang for your buck.
        </p>
      </div>
      <InsightsView concerts={(data ?? []) as Concert[]} />
    </div>
  );
}
