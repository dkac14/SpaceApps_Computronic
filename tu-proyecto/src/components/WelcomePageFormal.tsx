import React, { useState, useRef, useMemo } from "react";
import { apiSearch, apiSummarize, APISearchResult } from "../api/client";

interface UserData {
  email: string;
  userType: string;
  interests: string[];
  experience: string;
  name: string;
}

interface WelcomePageFormalProps {
  onSearch?: (query: string) => void;
  userData: UserData;
  onBack: () => void;
  onShowSummary: (summaryData: { title: string; source: string; summary: string }) => void;
}

export default function WelcomePageFormal({
  onSearch,
  userData,
  onBack,
  onShowSummary,
}: WelcomePageFormalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<APISearchResult[]>([]);
  const [summaryLoading, setSummaryLoading] = useState<string | null>(null);

  const baseSuggestions = [
    "microgravity",
    "space biology",
    "radiation and cells",
    "plant cultivation",
    "microbiome in orbit",
  ];

  const interestSuggestions: { [key: string]: string[] } = {
    "Microgravity and Cells": ["microgravity effects", "cells in zero gravity"],
    "Space Plant Biology": ["space agriculture", "ISS plants"],
    "Microbiome in Space": ["space bacteria", "astronaut microbiota"],
    "Radiation and DNA": ["cosmic radiation", "DNA damage in space"],
    "Space Medicine": ["astronaut health", "orbital medicine"],
    "Astrobiology": ["extraterrestrial life", "extremophiles"],
  };

  const getPersonalizedSuggestions = () => {
    let personalized = [...baseSuggestions];
    userData.interests.forEach((i) => {
      if (interestSuggestions[i]) personalized.push(...interestSuggestions[i]);
    });
    return [...new Set(personalized)].slice(0, 6);
  };

  const [suggestions] = useState(getPersonalizedSuggestions());

  const terms = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6),
    [query]
  );

  function highlight(text: string) {
    if (!terms.length) return text;
    const pattern = new RegExp(`(${terms.map(t => escapeRegExp(t)).join("|")})`, "ig");
    const parts = text.split(pattern);
    return (
      <>
        {parts.map((p, i) =>
          pattern.test(p) ? (
            <mark key={i} className="bg-emerald-200 rounded px-1">{p}</mark>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
      </>
    );
  }

  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);

    try {
      const data = await apiSearch(q);
      setResults(data);
      onSearch?.(q);
    } catch (err: any) {
      setError(err?.message || "An error occurred while searching.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionClick(s: string) {
    setQuery(s);
    inputRef.current?.focus();
  }

  const getUserTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      scientist: "Scientist/Researcher",
      student: "Student",
      educator: "Educator",
      enthusiast: "Enthusiast",
      journalist: "Journalist",
      other: "User",
    };
    return labels[type] || "User";
  };

  // --- NEW FUNCTION: Navigate to summary page ---
  async function handleResultClick(r: APISearchResult) {
    setSummaryLoading(r.url);

    try {
      const data = await apiSummarize(r.url);

      if (data.summary && typeof data.summary === 'string') {
        // Navigate to summary page with data
        onShowSummary({
          title: r.title,
          source: r.source || new URL(r.url).hostname,
          summary: data.summary
        });
      } else {
        // Fallback if no summary is returned
        onShowSummary({
          title: r.title,
          source: r.source || new URL(r.url).hostname,
          summary: "The article summary could not be generated."
        });
      }
    } catch (err: any) {
      // In case of error, show summary page with error message
      onShowSummary({
        title: r.title,
        source: r.source || new URL(r.url).hostname,
        summary: `Error fetching summary: ${err?.message || "Unknown error"}`
      });
    } finally {
      setSummaryLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-white text-gray-900">
      <header className="w-full bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-black text-white flex items-center justify-center font-semibold">
              N
            </div>
            <div>
              <div className="text-lg font-bold text-black leading-tight">NASA BioSpace</div>
              <div className="text-xs text-gray-600">Space Biology Portal</div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-emerald-800 transition"
          >
            ← Back
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black leading-tight">
            Biological research in extreme environments
          </h1>
          <p className="text-lg text-gray-600 max-w-xl">
            Explore studies, mission data, and publications on how terrestrial life
            adapts to space. Tools, data, and community for researchers and students.
          </p>

          <div className="w-full sm:w-[92%]">
            <form onSubmit={handleSubmit} className="flex gap-3 items-center">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by topic, mission, or researcher (e.g., microgravity)"
                className="flex-1 p-3 rounded-md border border-black/10 bg-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-300 outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-black text-white font-medium hover:bg-emerald-700 transition"
              >
                Search
              </button>
            </form>

            {suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    className="px-3 py-1 text-sm bg-emerald-100 text-black rounded-full hover:bg-emerald-200 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4">
              {loading && <div className="text-sm text-gray-600">Searching for results…</div>}
              {error && <div className="text-sm text-red-600">⚠ {error}</div>}
              {!loading && !error && results.length > 0 && (
                <div className="mt-2 border border-black/10 rounded-lg bg-white">
                  <div className="px-4 py-3 border-b border-black/10 text-sm text-gray-600">
                    {results.length} result{results.length === 1 ? "" : "s"}
                  </div>
                  <ul className="divide-y divide-black/10">
                    {results.map((r, idx) => (
                      <li 
                        key={r.id ?? idx} 
                        className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => handleResultClick(r)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-[15px] font-semibold text-black hover:text-emerald-700">
                              {highlight(r.title)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {r.source ? r.source : new URL(r.url).hostname}
                            </div>
                          </div>
                          {summaryLoading === r.url && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 ml-2"></div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {!loading && !error && results.length === 0 && query.trim().length > 0 && (
              <div className="text-sm text-gray-600 mt-2">
                No results found for "{query}".
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <strong>{getUserTypeLabel(userData.userType)}</strong>{" "}
            • {userData.interests.length > 0
              ? `Interests: ${userData.interests.slice(0, 2).join(", ")}`
              : "Biological space explorer"}
          </div>
        </div>

<div className="order-first md:order-last">
  <div className="w-full h-64 md:h-80 rounded-xl border border-black/10 bg-white shadow-sm flex items-center justify-center">
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <iframe
        className="absolute inset-0 w-full h-full"
        src="https://www.youtube.com/embed/uZQcQdk-nmI?autoplay=1&mute=1&loop=1&playlist=uZQcQdk-nmI&controls=0&modestbranding=1&rel=0&playsinline=1"
        title="YouTube embed"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  </div>
</div>
              
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: "🌱", title: "Space Agriculture", text: "Studies and experiments on crops in microgravity and life-support systems." },
            { icon: "🧬", title: "Cell Biology", text: "Research on radiation, DNA damage, and cellular responses." },
            { icon: "🦠", title: "Microbiome", text: "Behavior of microbial communities in orbit and their impact." }
          ].map((c, i) => (
            <article key={i} className="bg-white rounded-xl border border-black/10 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-md bg-emerald-50 flex items-center justify-center text-2xl">{c.icon}</div>
                <h3 className="text-lg font-semibold text-black">{c.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{c.text}</p>
            </article>
          ))}
        </div>
      </section>


 
      <footer className="mt-auto bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white text-black rounded-md flex items-center justify-center font-semibold">N</div>
            <div>NASA BioSpace — Space Biology Portal</div>
          </div>
          <div className="text-gray-200 mt-4 md:mt-0">© 2025 — Science with purpose and clarity</div>
        </div>
      </footer>
    </div>
  );
}
