"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "./NHSearchExperience.module.css";
import DefaultSearchPrompt from "./DefaultSearchPrompt";
import ActiveSearchCanvas from "./ActiveSearchCanvas";
import SearchResultsCanvas from "./SearchResultsCanvas";
import SkeletonResultsCanvas from "./SkeletonResultsCanvas";
import { 
  getSearchResults, 
  SearchResultsData, 
  CARDIOLOGY_RESULTS 
} from "./searchData";

/**
 * Formal Search Experience State Machine:
 * - 'landing': Neutral default floating prompt integrated in homepage hero
 * - 'active': Expanded canvas (State 2) — empty waiting to type OR live predictive sentence completion
 * - 'skeleton': Short 600-900ms AI inference loading simulation showing doctor/category skeletons
 * - 'results': Full search results canvas with doctors, treatments, articles, and tags
 */
export type SearchState = "landing" | "active" | "skeleton" | "results";

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
 * A single continuous interactive surface transitioning smoothly across states:
 *
 *   STATE 01: 'landing'   → Neutral default floating dark glass prompt
 *   STATE 02: 'active'    → Expanded canvas:
 *                           - Empty State: location, controls, subtle prompt (NO results/doctors)
 *                           - Typing State: Live predictive ghost sentence completion + suggestions
 *   STATE 03: 'skeleton'  → Pulse AI inference loading state (~750ms) with animated skeletons
 *   STATE 04: 'results'   → Full results canvas (Doctors, Treatments, Articles, Tags)
 *
 * DEVELOPER HANDOFF & API INTEGRATION POINT:
 * 1. State machine: 'landing' → 'active' → 'skeleton' → 'results'.
 * 2. Predictive logic: Managed in `searchData.ts` (`getPredictiveCompletion()`).
 *    Replace with your live Pulse AI sentence completion / NLP query parser endpoint.
 * 3. Results fetching: Handled in `handleSubmit()` via `getSearchResults()`.
 *    Replace `getSearchResults()` with your OpenSearch / Clinical Graph API.
 * 4. All UI components are native React/CSS Modules, following layout references 01, 02, 03.
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
  const [resultsData, setResultsData] = useState<SearchResultsData>(CARDIOLOGY_RESULTS);

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

  // Handle Query typing
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  // Activate search (Landing → Active)
  const handleActivate = () => {
    setSearchState("active");
  };

  // Submit query (Active → Skeleton Loading → Results)
  const handleSubmit = async (searchQuery: string) => {
    const targetQuery = searchQuery.trim() || "I have chest pain and need a doctor";
    setQuery(targetQuery);
    
    // Step 1: Immediately transition to realistic skeleton state
    setSearchState("skeleton");
    
    // Step 2: Realistic AI matching delay (750ms)
    const [results] = await Promise.all([
      getSearchResults(targetQuery, selectedLocation),
      new Promise((resolve) => setTimeout(resolve, 750)),
    ]);

    // Step 3: Smoothly reveal final results
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
      setQuery("Find a doctor");
    } else {
      setQuery("I have chest pain");
    }
  };

  // Handle specialty tag click in Results
  const handleSelectSpecialtyTag = (tag: string) => {
    handleSubmit(`${tag} specialist in ${selectedLocation}`);
  };

  // Handle click outside to close active/results state
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchState !== "landing" &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchState]);

  // Handle Ask Pulse CTA
  const handleAskPulse = () => {
    if (onOpenPulseAI) {
      onOpenPulseAI(query || "I have chest pain and need clinical guidance");
    } else {
      // Fallback: update query to deep Pulse AI intent
      handleSubmit(`Pulse AI guidance for ${query || "chest pain"}`);
    }
  };

  // Class mapping based on state:
  // Note: 'skeleton' and 'results' both use .stateResults so the canvas expands smoothly
  const stateClass = 
    searchState === "landing"
      ? styles.stateLanding
      : searchState === "active"
      ? styles.stateActive
      : styles.stateResults;

  return (
    <div className={styles.searchExperienceWrapper} ref={containerRef}>
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
                onSubmit={handleSubmit}
                onClose={handleClose}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                activePill={activePill}
                onSelectActionPill={handleSelectActionPill}
              />
            </motion.div>
          )}

          {searchState === "skeleton" && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SkeletonResultsCanvas query={query} />
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
