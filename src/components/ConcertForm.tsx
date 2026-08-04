"use client";

import {
  formatCurrency,
  getTotalCost,
  toNumber,
} from "@/lib/calculations";
import { createClient } from "@/lib/supabase/client";
import { COST_FIELDS } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

const emptyForm = {
  concert_name: "",
  artist: "",
  venue: "",
  city: "",
  state: "",
  concert_date: "",
  distance_from_home: "",
  hours_at_event: "",
  ticket_cost: "",
  ticket_fees: "",
  parking_cost: "",
  food_drink_cost: "",
  merchandise_cost: "",
  lodging_cost: "",
  travel_cost: "",
  other_cost: "",
  fun_rating: "7",
  notes: "",
};

type FormState = typeof emptyForm;

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

export function ConcertForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const liveTotal = useMemo(() => {
    const costs = Object.fromEntries(
      COST_FIELDS.map((f) => [f.key, toNumber(form[f.key])])
    ) as Record<(typeof COST_FIELDS)[number]["key"], number>;
    return getTotalCost(costs);
  }, [form]);

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
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

    const payload = {
      user_id: user.id,
      concert_name: form.concert_name.trim(),
      artist: form.artist.trim(),
      venue: form.venue.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      concert_date: form.concert_date,
      distance_from_home: toNumber(form.distance_from_home),
      hours_at_event: toNumber(form.hours_at_event),
      ticket_cost: toNumber(form.ticket_cost),
      ticket_fees: toNumber(form.ticket_fees),
      parking_cost: toNumber(form.parking_cost),
      food_drink_cost: toNumber(form.food_drink_cost),
      merchandise_cost: toNumber(form.merchandise_cost),
      lodging_cost: toNumber(form.lodging_cost),
      travel_cost: toNumber(form.travel_cost),
      other_cost: toNumber(form.other_cost),
      fun_rating: Math.min(10, Math.max(1, Math.round(toNumber(form.fun_rating)))),
      notes: form.notes.trim() || null,
    };

    const { error: insertError } = await supabase
      .from("concerts")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setForm(emptyForm);
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
              placeholder="Opening act, seats, weather, highlights…"
            />
          </FieldRow>
        </div>
      </section>

      <section className="card bg-base-100 shadow-md border border-base-300/40">
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="card-title text-lg">Costs</h2>
              <p className="text-sm opacity-70">
                Leave blank for $0. Total updates as you type.
              </p>
            </div>
            <div className="stat bg-primary/10 rounded-box px-4 py-2">
              <div className="stat-title text-xs">Total cost</div>
              <div className="stat-value text-2xl text-primary">
                {formatCurrency(liveTotal)}
              </div>
            </div>
          </div>

          {COST_FIELDS.map((field) => (
            <FieldRow key={field.key} label={field.label} htmlFor={field.key}>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <span className="opacity-60">$</span>
                <input
                  id={field.key}
                  type="number"
                  min="0"
                  step="0.01"
                  className="grow"
                  value={form[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder="0.00"
                />
              </label>
            </FieldRow>
          ))}
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

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? "Saving…" : "Save concert"}
        </button>
      </div>
    </form>
  );
}
