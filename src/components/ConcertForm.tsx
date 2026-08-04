"use client";

import {
  createEmptyLineItem,
  formatCurrency,
  sumLineItemAmounts,
  toNumber,
  type LineItemDraft,
} from "@/lib/calculations";
import { createClient } from "@/lib/supabase/client";
import type { Concert, CostCategory } from "@/lib/types";
import { COST_CATEGORIES } from "@/lib/types";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type FormState = {
  concert_name: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  concert_date: string;
  distance_from_home: string;
  hours_at_event: string;
  fun_rating: string;
  notes: string;
};

const emptyDetails: FormState = {
  concert_name: "",
  artist: "",
  venue: "",
  city: "",
  state: "",
  concert_date: "",
  distance_from_home: "",
  hours_at_event: "",
  fun_rating: "7",
  notes: "",
};

function FieldRow({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] sm:grid-cols-[10rem_1fr] items-start gap-x-3 gap-y-1">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium pt-3 text-right leading-snug"
      >
        {label}
      </label>
      <div className="min-w-0">
        {children}
        {hint ? <p className="text-xs opacity-60 mt-1">{hint}</p> : null}
      </div>
    </div>
  );
}

function concertToForm(concert: Concert): {
  details: FormState;
  lineItems: LineItemDraft[];
} {
  const items =
    concert.cost_items && concert.cost_items.length > 0
      ? [...concert.cost_items]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((item) => ({
            key: item.id,
            category: item.category,
            amount: String(toNumber(item.amount) || ""),
          }))
      : [createEmptyLineItem("Ticket")];

  return {
    details: {
      concert_name: concert.concert_name,
      artist: concert.artist,
      venue: concert.venue,
      city: concert.city,
      state: concert.state,
      concert_date: concert.concert_date,
      distance_from_home: String(concert.distance_from_home ?? ""),
      hours_at_event: String(concert.hours_at_event ?? ""),
      fun_rating: String(concert.fun_rating ?? 7),
      notes: concert.notes ?? "",
    },
    lineItems: items,
  };
}

export function ConcertForm({
  mode = "create",
  initialConcert,
}: {
  mode?: "create" | "edit";
  initialConcert?: Concert;
}) {
  const router = useRouter();
  const seeded =
    mode === "edit" && initialConcert
      ? concertToForm(initialConcert)
      : { details: emptyDetails, lineItems: [createEmptyLineItem("Ticket")] };

  const [form, setForm] = useState<FormState>(seeded.details);
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(seeded.lineItems);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const liveTotal = useMemo(
    () => sumLineItemAmounts(lineItems),
    [lineItems]
  );

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  function updateLineItem(
    key: string,
    field: "category" | "amount",
    value: string
  ) {
    setLineItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
    setSuccess(false);
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, createEmptyLineItem("Other")]);
    setSuccess(false);
  }

  function removeLineItem(key: string) {
    setLineItems((prev) => {
      if (prev.length <= 1) {
        return [{ ...prev[0], amount: "", category: "Ticket" }];
      }
      return prev.filter((item) => item.key !== key);
    });
    setSuccess(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be logged in to save a concert.");
      setLoading(false);
      return;
    }

    const cleanedItems = lineItems
      .map((item, index) => ({
        category: (item.category || "Other") as CostCategory,
        amount: toNumber(item.amount),
        sort_order: index,
      }))
      .filter((item) => item.amount > 0);

    const concertPayload = {
      concert_name: form.concert_name.trim(),
      artist: form.artist.trim(),
      venue: form.venue.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      concert_date: form.concert_date,
      distance_from_home: toNumber(form.distance_from_home),
      hours_at_event: toNumber(form.hours_at_event),
      fun_rating: Math.min(
        10,
        Math.max(1, Math.round(toNumber(form.fun_rating)))
      ),
      notes: form.notes.trim() || null,
      // Keep legacy columns at 0 so totals come from line items
      ticket_cost: 0,
      ticket_fees: 0,
      parking_cost: 0,
      food_drink_cost: 0,
      merchandise_cost: 0,
      lodging_cost: 0,
      travel_cost: 0,
      other_cost: 0,
    };

    let concertId = initialConcert?.id;

    if (mode === "edit" && concertId) {
      const { error: updateError } = await supabase
        .from("concerts")
        .update(concertPayload)
        .eq("id", concertId);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      const { error: deleteError } = await supabase
        .from("concert_cost_items")
        .delete()
        .eq("concert_id", concertId);

      if (deleteError) {
        setError(deleteError.message);
        setLoading(false);
        return;
      }
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("concerts")
        .insert({ ...concertPayload, user_id: user.id })
        .select("id")
        .single();

      if (insertError || !inserted) {
        setError(insertError?.message ?? "Could not save concert.");
        setLoading(false);
        return;
      }
      concertId = inserted.id;
    }

    if (cleanedItems.length > 0 && concertId) {
      const { error: itemsError } = await supabase
        .from("concert_cost_items")
        .insert(
          cleanedItems.map((item) => ({
            concert_id: concertId,
            category: item.category,
            amount: item.amount,
            sort_order: item.sort_order,
          }))
        );

      if (itemsError) {
        setError(itemsError.message);
        setLoading(false);
        return;
      }
    }

    if (mode === "edit") {
      router.push("/concerts");
      router.refresh();
      return;
    }

    setForm(emptyDetails);
    setLineItems([createEmptyLineItem("Ticket")]);
    setSuccess(true);
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {success && (
        <div className="alert alert-success shadow-sm">
          <CheckCircle2 className="h-5 w-5" />
          <span>Concert saved! Add another whenever you&apos;re ready.</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error shadow-sm">
          <span>{error}</span>
        </div>
      )}

      <section className="card bg-base-100 shadow-md border border-base-300/40">
        <div className="card-body gap-4">
          <h2 className="card-title text-lg">Concert details</h2>
          <p className="text-sm opacity-70 -mt-2">
            Who played, where you were, and how long you stayed.
          </p>

          <FieldRow label="Concert name" htmlFor="concert_name">
            <input
              id="concert_name"
              required
              className="input input-bordered w-full"
              value={form.concert_name}
              onChange={(e) => update("concert_name", e.target.value)}
              placeholder="Summer Stadium Tour"
            />
          </FieldRow>
          <FieldRow label="Artist / band" htmlFor="artist">
            <input
              id="artist"
              required
              className="input input-bordered w-full"
              value={form.artist}
              onChange={(e) => update("artist", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Venue" htmlFor="venue">
            <input
              id="venue"
              required
              className="input input-bordered w-full"
              value={form.venue}
              onChange={(e) => update("venue", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="City" htmlFor="city">
            <input
              id="city"
              required
              className="input input-bordered w-full"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="State" htmlFor="state">
            <input
              id="state"
              required
              className="input input-bordered w-full"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              placeholder="TX"
            />
          </FieldRow>
          <FieldRow label="Concert date" htmlFor="concert_date">
            <input
              id="concert_date"
              type="date"
              required
              className="input input-bordered w-full"
              value={form.concert_date}
              onChange={(e) => update("concert_date", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            label="Distance (mi)"
            htmlFor="distance_from_home"
            hint="Approximate miles from home to the venue."
          >
            <input
              id="distance_from_home"
              type="number"
              min="0"
              step="0.1"
              className="input input-bordered w-full"
              value={form.distance_from_home}
              onChange={(e) => update("distance_from_home", e.target.value)}
              placeholder="0"
            />
          </FieldRow>
          <FieldRow
            label="Hours at event"
            htmlFor="hours_at_event"
            hint="Used for cost-per-hour on your dashboard."
          >
            <input
              id="hours_at_event"
              type="number"
              min="0"
              step="0.25"
              className="input input-bordered w-full"
              value={form.hours_at_event}
              onChange={(e) => update("hours_at_event", e.target.value)}
              placeholder="3"
            />
          </FieldRow>
          <FieldRow label="Notes" htmlFor="notes">
            <textarea
              id="notes"
              className="textarea textarea-bordered w-full min-h-24"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Opening act, seats, weather, highlights..."
            />
          </FieldRow>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md border border-base-300/40">
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="card-title text-lg">Cost line items</h2>
              <p className="text-sm opacity-70">
                Add as many categories as you need. Total updates as you type.
              </p>
            </div>
            <div className="stat bg-primary/10 rounded-box px-4 py-2">
              <div className="stat-title text-xs">Total cost</div>
              <div className="stat-value text-2xl text-primary">
                {formatCurrency(liveTotal)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div
                key={item.key}
                className="grid grid-cols-1 sm:grid-cols-[1fr_8rem_auto] gap-2 items-end"
              >
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs">Category</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={item.category}
                    onChange={(e) =>
                      updateLineItem(item.key, "category", e.target.value)
                    }
                    aria-label={`Cost category ${index + 1}`}
                  >
                    {COST_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {item.category === "Uncategorized" ? (
                      <option value="Uncategorized">Uncategorized</option>
                    ) : null}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs">Amount</span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2">
                    <span className="opacity-60">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="grow"
                      value={item.amount}
                      onChange={(e) =>
                        updateLineItem(item.key, "amount", e.target.value)
                      }
                      placeholder="0.00"
                      aria-label={`Cost amount ${index + 1}`}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-square text-error"
                  onClick={() => removeLineItem(item.key)}
                  aria-label={`Remove cost line ${index + 1}`}
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm gap-1 self-start"
            onClick={addLineItem}
          >
            <Plus className="h-4 w-4" />
            Add cost line
          </button>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md border border-base-300/40">
        <div className="card-body gap-4">
          <h2 className="card-title text-lg">Fun rating</h2>
          <p className="text-sm opacity-70 -mt-2">
            How much fun was it? 1 = Terrible Time, 10 = Best Time Ever.
          </p>

          <div className="px-1">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              className="range range-primary"
              value={form.fun_rating}
              onChange={(e) => update("fun_rating", e.target.value)}
            />
            <div className="flex justify-between text-xs mt-2 opacity-70">
              <span>1 · Terrible Time</span>
              <span className="font-bold text-primary text-base">
                {form.fun_rating}/10
              </span>
              <span>10 · Best Time Ever</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2">
        {mode === "edit" ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => router.push("/concerts")}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : mode === "edit"
              ? "Save changes"
              : "Save concert"}
        </button>
      </div>
    </form>
  );
}
