"use client";

import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Music } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      setMessage(
        "Account created! If email confirmation is on, check your inbox. Otherwise you can log in now."
      );
      setMode("login");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute top-4 right-4 z-10">
        <ThemeSelector />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 text-primary mb-4">
              <Music className="h-8 w-8" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-primary leading-tight">
              Concert Cost Tracker
            </h1>
            <p className="mt-3 text-base opacity-80 max-w-sm mx-auto">
              Log the shows you love, see what they really cost, and find your
              best-value nights out.
            </p>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-300/50">
            <div className="card-body gap-5">
              <div className="tabs tabs-box bg-base-200 p-1 self-center">
                <button
                  type="button"
                  className={`tab ${mode === "login" ? "tab-active" : ""}`}
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={`tab ${mode === "signup" ? "tab-active" : ""}`}
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Sign up
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
                  <label htmlFor="email" className="text-sm font-medium text-right">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-right"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    className="input input-bordered w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>

                {error && (
                  <div className="alert alert-error text-sm py-2">
                    <span>{error}</span>
                  </div>
                )}
                {message && (
                  <div className="alert alert-success text-sm py-2">
                    <span>{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait…"
                    : mode === "login"
                      ? "Log in"
                      : "Create account"}
                </button>
              </form>

              <p className="text-xs text-center opacity-60">
                Your concerts stay private - only you can see them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
