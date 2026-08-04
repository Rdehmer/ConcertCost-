import { ConcertForm } from "@/components/ConcertForm";
import {
  CONCERT_WITH_COSTS_SELECT,
  normalizeConcert,
} from "@/lib/concerts";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function EditConcertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select(CONCERT_WITH_COSTS_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Edit Concert</h2>
        <p className="text-sm opacity-70">
          Update details, cost line items, and fun rating.
        </p>
      </div>
      <ConcertForm
        mode="edit"
        initialConcert={normalizeConcert(data as Record<string, unknown>)}
      />
    </div>
  );
}
