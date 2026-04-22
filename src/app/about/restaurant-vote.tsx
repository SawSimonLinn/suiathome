"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MAIN_LOCATIONS = ["Los Angeles", "Washington DC", "Texas"] as const;

type VoteCounts = Record<string, number>;

const LOCATION_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  "Los Angeles":   { bar: "var(--sage)",  bg: "var(--sage-light)",  text: "#1f3b1c" },
  "Washington DC": { bar: "var(--blush)", bg: "var(--blush-light)", text: "#5c2d3a" },
  "Texas":         { bar: "var(--brass)", bg: "#fef3d0",            text: "#2d1a00" },
};

export function RestaurantVote() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [counts, setCounts] = useState<VoteCounts>({ "Los Angeles": 0, "Washington DC": 0, "Texas": 0, "Other": 0 });
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/restaurant-votes")
      .then((r) => r.json())
      .then((d) => {
        setCounts(d.counts);
        setTotal(d.total);
        setVoted(d.userVote ?? null);
        setIsLoggedIn(d.isLoggedIn ?? false);
      })
      .finally(() => setFetching(false));
  }, []);

  async function handleVote() {
    if (!selected || loading || voted) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/restaurant-votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: selected, suggestion: selected === "Other" ? suggestion : undefined }),
      });

      if (res.status === 401) {
        setError("You need to be logged in to vote.");
        return;
      }
      if (res.status === 409) {
        // Already voted on another device - refresh to show their vote
        const r = await fetch("/api/restaurant-votes");
        const d = await r.json();
        setCounts(d.counts);
        setTotal(d.total);
        setVoted(d.userVote);
        return;
      }
      if (!res.ok) {
        setError("Couldn't save your vote - please try again.");
        return;
      }

      setVoted(selected);
      const r = await fetch("/api/restaurant-votes");
      const d = await r.json();
      setCounts(d.counts);
      setTotal(d.total);
    } catch {
      setError("Network error - please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const mainTotal = MAIN_LOCATIONS.reduce((s, l) => s + (counts[l] ?? 0), 0);

  return (
    <div className="flex flex-col gap-10">

      {/* ── VOTE PANEL ── */}
      <div className="border-2 border-foreground paper-shadow" style={{ backgroundColor: "var(--cream-warm)" }}>
        <div className="border-b-2 border-foreground px-5 py-3 flex items-center gap-2" style={{ backgroundColor: "var(--sage)" }}>
          <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "#1f3b1c" }}>
            🗳️ Cast Your Vote
          </span>
        </div>

        <div className="p-5 sm:p-8 flex flex-col gap-5">
          {fetching ? (
            <p className="text-sm italic" style={{ color: "#6a9165" }}>Loading...</p>

          ) : !isLoggedIn ? (
            /* Not logged in */
            <div className="flex flex-col gap-4">
              <p className="text-base" style={{ color: "#4a5e47" }}>
                Sign in to cast your vote - each account gets one vote.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="w-full sm:w-auto border-2 border-foreground paper-btn font-bold" style={{ backgroundColor: "var(--brass)", color: "#2d1a00" }}>
                  <Link href="/login">🔑 Log In to Vote</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-2 border-foreground paper-btn font-semibold" style={{ backgroundColor: "var(--blush-light)", color: "#5c2d3a" }}>
                  <Link href="/signup">✨ Sign Up</Link>
                </Button>
              </div>
            </div>

          ) : voted ? (
            /* Already voted */
            <div className="flex flex-col gap-3">
              <div className="border-2 border-foreground px-6 py-4 paper-shadow-sm text-sm font-semibold" style={{ backgroundColor: "var(--sage-light)", color: "#2d4a2a" }}>
                ✅ You voted for <strong>{voted}</strong> - thanks for supporting Sui&apos;s dream!
              </div>
              <p className="text-xs italic" style={{ color: "#6a9165" }}>
                One vote per account. Results update live below.
              </p>
            </div>

          ) : (
            /* Logged in, hasn't voted */
            <>
              <p className="text-sm" style={{ color: "#4a5e47" }}>
                Pick your city - this helps Sui plan where to open first. <strong>One vote per account.</strong>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MAIN_LOCATIONS.map((loc) => {
                  const active = selected === loc;
                  const colors = LOCATION_COLORS[loc];
                  return (
                    <button
                      key={loc}
                      onClick={() => setSelected(loc)}
                      className={["border-2 border-foreground py-4 px-3 font-bold text-base transition-all", active ? "paper-btn-dark" : "paper-btn"].join(" ")}
                      style={{
                        backgroundColor: active ? colors.bar : "var(--cream-warm)",
                        color: active ? colors.text : "#284525",
                      }}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setSelected("Other")}
                  className={["border-2 border-foreground py-3 px-4 text-sm font-semibold text-left transition-all", selected === "Other" ? "paper-btn-dark" : "paper-btn"].join(" ")}
                  style={{
                    backgroundColor: selected === "Other" ? "var(--blush)" : "var(--blush-light)",
                    color: "#5c2d3a",
                  }}
                >
                  🗺️ Somewhere else...
                </button>
                {selected === "Other" && (
                  <input
                    type="text"
                    placeholder="Tell Sui your city! (optional)"
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    maxLength={80}
                    className="w-full border-2 border-foreground px-4 py-2 text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--cream-warm)", color: "#284525" }}
                  />
                )}
              </div>

              <Button
                onClick={handleVote}
                disabled={!selected || loading}
                size="lg"
                className="border-2 border-foreground paper-btn font-bold text-base self-start px-8"
                style={{ backgroundColor: "var(--brass)", color: "#2d1a00" }}
              >
                {loading ? "Saving..." : "🍽️ Count Me In!"}
              </Button>

              {error && (
                <p className="text-sm font-semibold border-2 border-foreground px-4 py-2 paper-shadow-sm" style={{ backgroundColor: "#fee2e2", color: "#7f1d1d" }}>
                  ⚠️ {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── RESULTS PANEL ── */}
      <div className="border-2 border-foreground paper-shadow" style={{ backgroundColor: "var(--cream-warm)" }}>
        <div className="border-b-2 border-foreground px-5 py-3 flex items-center justify-between" style={{ backgroundColor: "var(--blush)" }}>
          <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "#5c2d3a" }}>
            📊 Live Results
          </span>
          <span className="text-xs font-semibold" style={{ color: "#5c2d3a" }}>updates in real time</span>
        </div>

        {/* Giant total */}
        <div className="border-b-2 border-foreground px-5 py-8 text-center" style={{ backgroundColor: "var(--sage-light)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: "#6a9165" }}>
            Total counting in
          </p>
          <p className="font-headline leading-none" style={{ fontSize: "clamp(4rem, 12vw, 7rem)", color: "#2d4a2a" }}>
            {fetching ? "-" : total.toLocaleString()}
          </p>
          <p className="text-sm mt-2 font-medium" style={{ color: "#4a5e47" }}>
            people want Sui to open her restaurant 🍽️
          </p>
        </div>

        {/* Per-city results */}
        <div className="p-5 sm:p-8 flex flex-col gap-8">
          {MAIN_LOCATIONS.map((loc) => {
            const count = counts[loc] ?? 0;
            const pct = mainTotal > 0 ? Math.round((count / mainTotal) * 100) : 0;
            const isVoted = voted === loc;
            const colors = LOCATION_COLORS[loc];
            return (
              <div key={loc} className="flex flex-col gap-2">
                <div className="flex items-end justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isVoted && <span className="text-base">⭐</span>}
                    <span className="text-base font-bold" style={{ color: "#284525" }}>{loc}</span>
                    {isVoted && (
                      <span className="text-xs font-semibold border border-foreground px-2 py-0.5" style={{ backgroundColor: colors.bg, color: colors.text }}>
                        your vote
                      </span>
                    )}
                  </div>
                  <span className="font-headline leading-none tabular-nums" style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", color: colors.text === "#2d1a00" ? "#8a5200" : colors.text }}>
                    {fetching ? "-" : count.toLocaleString()}
                  </span>
                </div>

                <div className="w-full h-6 border-2 border-foreground overflow-hidden" style={{ backgroundColor: "#f5efe0" }}>
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: colors.bar, minWidth: pct > 0 ? "2px" : "0" }}
                  />
                </div>

                <div className="flex justify-between text-xs font-semibold" style={{ color: "#6a9165" }}>
                  <span>{count === 1 ? "1 vote" : `${count.toLocaleString()} votes`}</span>
                  <span>{pct}% of top 3</span>
                </div>
              </div>
            );
          })}

          {(counts["Other"] ?? 0) > 0 && (
            <div className="border-2 border-foreground px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "var(--blush-light)" }}>
              <span className="text-sm font-semibold" style={{ color: "#5c2d3a" }}>🌍 Other cities</span>
              <span className="font-headline" style={{ fontSize: "1.75rem", color: "#5c2d3a" }}>
                {counts["Other"].toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
