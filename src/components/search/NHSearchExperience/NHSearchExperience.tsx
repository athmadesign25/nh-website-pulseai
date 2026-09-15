"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "./NHSearchExperience.module.css";
import DefaultSearchPrompt from "./DefaultSearchPrompt";
import ActiveSearchCanvas from "./ActiveSearchCanvas";
import SearchResultsCanvas from "./SearchResultsCanvas";
import { 
  getLiveSuggestions, 
  getSearchResults, 
  SearchResultsData, 
  CARDIOLOGY_SEARCH_RESULTS 
} from "./searchData";

export type SearchState = "landing" | "active" | "results";

export interface NHSearchExperienceProps {
  /** Optional callback to notify parent hero (e.g. to dim video or slide headlines) */
  onOpenChange?: (isOpen: boolean) => void;
  /** Optional initial state */
  initialState?: SearchState;
  /** Optional initial location */
  initialLocation?: string;
  /** Optional trigger when user requests deep Pulse AI assistance */
  onOpenPulseAI?: (query: string) => void;
}

/**
 * ═════════════════════════════════════════════════════════════════════════════════
 * Narayana Health Unified Search Experience
 * ═════════════════════════════════════════════════════════════════════════════════
 *
 * A single continuous interactive surface transitioning smoothly across 3 states:
 *
 *   STATE 01: 'landing'  → Neutral default floating dark glass prompt
 *   STATE 02: 'active'   → Expanded canvas with live query autocomplete & intelligence
 *   STATE 03: 'results'  → Full results canvas (Doctors, Treatments, Articles, Tags)
 *
 * DEVELOPER HANDOFF INSTRUCTIONS:
 * 1. State transitions are controlled via the `searchState` variable ('landing' | 'active' | 'results').
 * 2. Autocomplete suggestions are fetched in `handleQueryChange()` via `getLiveSuggestions()`.
 * 3. Final search results are loaded in `handleSubmit()` via `getSearchResults(query, location)`.
 * 4. To connect your production backend, replace `getLiveSuggestions` and `getSearchResults`
 *    in `searchData.ts` with your live API client.
 */
export default function NHSearchExperience({
  onOpenChange,
  initialState = "landing",
  initialLocation = "Bangalore",
  onOpenPulseAI,
}: NHSearchExperienceProps) {
  const prefersReducedMotion = useReducedMotion();

  // Primary search state
  const [searchState, setSearchState] = useState<SearchState>(initialState);
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [activePill, setActivePill] = useState<"doctor" | "symptoms" | null>(null);

  // Suggestions & Results
  const [suggestions, setSuggestions] = useState<string[]>(() => getLiveSuggestions(""));
  const [resultsData, setResultsData] = useState<SearchResultsData>(CARDIOLOGY_SEARCH_RESULTS);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state change with parent (e.g. to dim background video / hide hero title)
  useEffect(() => {
    const isExpanded = searchState !== "landing";
    onOpenChange?.(isExpanded);
  }, [searchState, onOpenChange]);

  // Handle global keyboard Escape to return to landing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchState !== "landing") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchState]);

  // Handle Query typing & live suggestions update
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    const newSuggestions = getLiveSuggestions(newQuery);
    setSuggestions(newSuggestions);
  }, []);

  // Activate search (Landing → Active)
  const handleActivate = () => {
    setSearchState("active");
    if (!query) {
      setSuggestions(getLiveSuggestions(""));
    }
  };

  // Submit query (Active → Results)
  const handleSubmit = async (searchQuery: string) => {
    const targetQuery = searchQuery.trim() || "I have chest pain and need a doctor";
    setQuery(targetQuery);
    
    // Resolve search results
    const results = await getSearchResults(targetQuery, selectedLocation);
    setResultsData(results);
    setSearchState("results");
  };

  // Edit search (Results → Active)
  const handleEditSearch = () => {
    setSearchState("active");
  };

  // Close search (Active/Results → Landing)
  const handleClose = () => {
    setSearchState("landing");
    setActivePill(null);
  };

  // Handle quick action pill clicks
  const handleSelectActionPill = (pill: "doctor" | "symptoms") => {
    setActivePill(pill);
    setSearchState("active");
    if (pill === "doctor") {
      setQuery("Find a doctor in Bangalore");
      setSuggestions(getLiveSuggestions("doctor"));
    } else {
      setQuery("I have chest pain");
      setSuggestions(getLiveSuggestions("chest"));
    }
  };

  // Handle specialty tag click in Results
  const handleSelectSpecialtyTag = (tag: string) => {
    handleSubmit(`${tag} specialist in ${selectedLocation}`);
  };

  // Handle Ask Pulse CTA
  const handleAskPulse = () => {
    if (onOpenPulseAI) {
      onOpenPulseAI(query || "I have chest pain and need clinical guidance");
    } else {
      // Fallback: update query to deep Pulse AI intent
      handleSubmit(`Pulse AI guidance for ${query || "chest pain"}`);
    }
  };

  // Class mapping based on state
  const stateClass = 
    searchState === "landing"
      ? styles.stateLanding
      : searchState === "active"
      ? styles.stateActive
      : styles.stateResults;

  return (
    <div className={styles.searchExperienceWrapper} ref={containerRef}>
      {/* Dimmer Backdrop overlay when active or displaying results */}
      <AnimatePresence>
        {searchState !== "landing" && (
          <motion.div
            className={styles.canvasBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Unified expanding search container */}
      <motion.div
        layout
        className={`${styles.searchShell} ${stateClass}`}
        transition={{
          duration: prefersReducedMotion ? 0.1 : 0.38,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {searchState === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DefaultSearchPrompt
                onActivate={handleActivate}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                onSelectActionPill={handleSelectActionPill}
              />
            </motion.div>
          )}

          {searchState === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ActiveSearchCanvas
                query={query}
                onQueryChange={handleQueryChange}
                suggestions={suggestions}
                onSelectSuggestion={handleSubmit}
                onSubmit={handleSubmit}
                onClose={handleClose}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                activePill={activePill}
                onSelectActionPill={handleSelectActionPill}
              />
            </motion.div>
          )}

          {searchState === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <SearchResultsCanvas
                query={query || "I have chest pain and need a doctor"}
                results={resultsData}
                onEditSearch={handleEditSearch}
                onClose={handleClose}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                onSelectSpecialtyTag={handleSelectSpecialtyTag}
                onAskPulse={handleAskPulse}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
