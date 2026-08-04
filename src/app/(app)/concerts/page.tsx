import { ConcertList } from "@/components/ConcertList";
import { createClient } from "@/lib/supabase/server";
import type { Concert } from "@/lib/types";

export default async function ConcertsPage() {
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
        <h2 className="text-2xl font-bold">My Concerts</h2>
        <p className="text-sm opacity-70">
          Every show you&apos;ve logged - only visible to you.
        </p>
      </div>
      <ConcertList concerts={(data ?? []) as Concert[]} />
    </div>
  );
}
