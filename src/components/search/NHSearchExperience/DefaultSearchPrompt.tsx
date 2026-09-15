"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Mic, ArrowUp, MapPin, ChevronDown, User, Stethoscope } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { NH_LOCATIONS } from "./searchData";

interface DefaultSearchPromptProps {
  onActivate: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  onSelectActionPill: (action: "doctor" | "symptoms") => void;
}

export default function DefaultSearchPrompt({
  onActivate,
  selectedLocation,
  onSelectLocation,
  onSelectActionPill,
}: DefaultSearchPromptProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  // Close location menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.landingContainer}>
      {/* Top row: Placeholder + Pulse AI badge */}
      <div className={styles.landingInputRow} onClick={onActivate} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onActivate(); }}>
        <span className={styles.landingPlaceholder}>How can we help you today?</span>

        <div className={styles.pulseBadge}>
          <div className={styles.pulseBars} aria-hidden>
            <span className={styles.pulseBar1} />
            <span className={styles.pulseBar2} />
            <span className={styles.pulseBar3} />
          </div>
          <span className={styles.pulseText}>Pulse AI</span>
        </div>
      </div>

      {/* Bottom row: Paperclip, Location, Quick Actions, Mic, Submit Arrow */}
      <div className={styles.landingBottomRow}>
        <div className={styles.bottomPillsGroup}>
          <button
            type="button"
            className={styles.iconControlBtn}
            aria-label="Attach medical records or file"
            onClick={(e) => {
              e.stopPropagation();
              onActivate();
            }}
          >
            <Paperclip size={18} />
          </button>

          {/* Location Selector Pill */}
          <div className={styles.locationPillWrapper} ref={locationRef} style={{ position: "relative" }}>
            <button
              type="button"
              className={styles.locationPill}
              onClick={(e) => {
                e.stopPropagation();
                setIsLocationOpen(!isLocationOpen);
              }}
              aria-expanded={isLocationOpen}
              aria-label={`Select city, current city is ${selectedLocation}`}
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
                    onClick={(e) => {
                      e.stopPropagation();
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

          {/* Quick Action Pills */}
          <button
            type="button"
            className={styles.actionPill}
            onClick={(e) => {
              e.stopPropagation();
              onSelectActionPill("doctor");
            }}
          >
            <User size={14} color="#38BDF8" />
            <span>Find a doctor</span>
          </button>

          <button
            type="button"
            className={styles.actionPill}
            onClick={(e) => {
              e.stopPropagation();
              onSelectActionPill("symptoms");
            }}
          >
            <Stethoscope size={14} color="#EC4899" />
            <span>Describe my symptoms</span>
          </button>
        </div>

        {/* Right side controls: Mic + Arrow Submit */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            className={styles.iconControlBtn}
            aria-label="Voice search"
            onClick={(e) => {
              e.stopPropagation();
              onActivate();
            }}
          >
            <Mic size={18} />
          </button>

          <button
            type="button"
            className={styles.submitArrowBtn}
            aria-label="Submit search"
            onClick={(e) => {
              e.stopPropagation();
              onActivate();
            }}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
