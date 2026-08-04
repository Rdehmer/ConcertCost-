import { ConcertList } from "@/components/ConcertList";
import {
  CONCERT_WITH_COSTS_SELECT,
  normalizeConcerts,
} from "@/lib/concerts";
import { createClient } from "@/lib/supabase/server";

export default async function ConcertsPage() {
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
        <h2 className="text-2xl font-bold">My Concerts</h2>
        <p className="text-sm opacity-70">
          Every show you&apos;ve logged - only visible to you.
        </p>
      </div>
      <ConcertList
        concerts={normalizeConcerts(data as Record<string, unknown>[] | null)}
      />
    </div>
  );
}
