"use client";

import React, { useRef, useEffect, useState } from "react";
import { 
  Paperclip, Mic, ArrowRight, X, MapPin, ChevronDown, 
  User, Stethoscope, Sparkles 
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { NH_LOCATIONS } from "./searchData";

interface ActiveSearchCanvasProps {
  query: string;
  onQueryChange: (val: string) => void;
  suggestions: string[];
  onSelectSuggestion: (query: string) => void;
  onSubmit: (query: string) => void;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  activePill: string | null;
  onSelectActionPill: (pill: "doctor" | "symptoms") => void;
}

export default function ActiveSearchCanvas({
  query,
  onQueryChange,
  suggestions,
  onSelectSuggestion,
  onSubmit,
  onClose,
  selectedLocation,
  onSelectLocation,
  activePill,
  onSelectActionPill,
}: ActiveSearchCanvasProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const locationRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when entering active search
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close location dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        onSubmit(suggestions[selectedIndex]);
      } else if (query.trim()) {
        onSubmit(query.trim());
      } else if (suggestions.length > 0) {
        onSubmit(suggestions[0]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  /**
   * Render suggestion text with match highlighting
   */
  const renderHighlightedText = (suggestion: string, currentQuery: string) => {
    const cleanQuery = currentQuery.trim().toLowerCase();
    if (!cleanQuery) return suggestion;

    const lowerSug = suggestion.toLowerCase();
    const matchIndex = lowerSug.indexOf(cleanQuery);
    if (matchIndex === -1) {
      return (
        <span>
          <strong>{suggestion}</strong>
        </span>
      );
    }

    const before = suggestion.slice(0, matchIndex);
    const match = suggestion.slice(matchIndex, matchIndex + cleanQuery.length);
    const after = suggestion.slice(matchIndex + cleanQuery.length);

    return (
      <span>
        {before}
        <span className={styles.highlightMatch}>{match}</span>
        {after}
      </span>
    );
  };

  return (
    <div className={styles.activeContainer}>
      {/* Top Header Row: Location Pill + Pulse AI Badge + Close button */}
      <div className={styles.topHeaderRow}>
        <div className={styles.headerLeftGroup}>
          {/* Location Selector Pill */}
          <div ref={locationRef} style={{ position: "relative" }}>
            <button
              type="button"
              className={styles.locationPill}
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              aria-expanded={isLocationOpen}
              aria-label={`Current location: ${selectedLocation}`}
            >
              <MapPin size={14} color="#FF6B6B" />
              <span>{selectedLocation}</span>
              <ChevronDown size={13} style={{ transform: isLocationOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {isLocationOpen && (
              <div className={styles.locationMenu}>
                {NH_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={`${styles.locationMenuItem} ${loc === selectedLocation ? styles.locationMenuItemSelected : ""}`}
                    onClick={() => {
                      onSelectLocation(loc);
                      setIsLocationOpen(false);
                    }}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pulse AI Badge */}
          <div className={styles.pulseBadge}>
            <div className={styles.pulseBars} aria-hidden>
              <span className={styles.pulseBar1} />
              <span className={styles.pulseBar2} />
              <span className={styles.pulseBar3} />
            </div>
            <span className={styles.pulseText}>Pulse AI</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close search"
        >
          <X size={18} />
        </button>
      </div>

      {/* Input Row: Paperclip, Active Input, Mic, Submit Arrow */}
      <div className={styles.activeInputRow}>
        <button type="button" className={styles.iconControlBtn} aria-label="Attach medical records or file">
          <Paperclip size={20} />
        </button>

        <input
          ref={inputRef}
          type="text"
          className={styles.activeTextInput}
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="I have chest pain"
          aria-label="Search healthcare conditions, symptoms or doctors"
        />

        <button type="button" className={styles.iconControlBtn} aria-label="Voice search">
          <Mic size={20} />
        </button>

        <button
          type="button"
          className={styles.submitArrowBtn}
          aria-label="Submit search"
          onClick={() => {
            if (query.trim()) onSubmit(query.trim());
            else if (suggestions.length > 0) onSubmit(suggestions[0]);
          }}
        >
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Red Horizon Divider Line */}
      <div className={styles.redDivider} />

      {/* Quick Action Filter Pills */}
      <div className={styles.activePillsRow}>
        <button
          type="button"
          className={`${styles.actionPill} ${activePill === "doctor" ? styles.actionPillActive : ""}`}
          onClick={() => onSelectActionPill("doctor")}
        >
          <User size={14} color="#38BDF8" />
          <span>Find a doctor</span>
        </button>

        <button
          type="button"
          className={`${styles.actionPill} ${activePill === "symptoms" ? styles.actionPillActive : ""}`}
          onClick={() => onSelectActionPill("symptoms")}
        >
          <Stethoscope size={14} color="#EC4899" />
          <span>Describe my symptoms</span>
        </button>
      </div>

      {/* SUGGESTED QUERIES Section */}
      <div className={styles.suggestionsSection}>
        <div className={styles.suggestionsHeader}>SUGGESTED QUERIES</div>

        <div className={styles.suggestionsList} role="listbox">
          {suggestions.map((sug, idx) => (
            <button
              key={sug}
              type="button"
              className={`${styles.suggestionItem} ${selectedIndex === idx ? styles.suggestionItemActive : ""}`}
              onClick={() => onSelectSuggestion(sug)}
              onMouseEnter={() => setSelectedIndex(idx)}
              role="option"
              aria-selected={selectedIndex === idx}
            >
              <ArrowRight size={15} className={styles.suggestionArrow} />
              <span className={styles.suggestionText}>
                {renderHighlightedText(sug, query)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Subtle Pulse AI Intelligence Status */}
      <div className={styles.pulseStatusRow}>
        <Sparkles size={16} className={styles.sparkleIcon} />
        <span>Intelligently preparing matches…</span>
      </div>
    </div>
  );
}
