"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Search, X, MapPin, ChevronDown, ArrowRight, 
  Heart, Activity, Stethoscope, FileText, AlertCircle, BookOpen,
  Bone, Scan 
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { 
  SearchResultsData, NH_LOCATIONS, TreatmentItemData, ArticleItemData 
} from "./searchData";

interface SearchResultsCanvasProps {
  query: string;
  results: SearchResultsData;
  onEditSearch: () => void;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  onSelectSpecialtyTag?: (tag: string) => void;
  onAskPulse?: () => void;
}

export default function SearchResultsCanvas({
  query,
  results,
  onEditSearch,
  onClose,
  selectedLocation,
  onSelectLocation,
  onSelectSpecialtyTag,
  onAskPulse,
}: SearchResultsCanvasProps) {
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

  // Icon renderer for treatments
  const renderTreatmentIcon = (type: TreatmentItemData["iconType"]) => {
    switch (type) {
      case "heart":
        return <Heart size={18} />;
      case "activity":
        return <Activity size={18} />;
      case "angiography":
        return <Heart size={18} color="#FF6B6B" />;
      case "joint":
        return <Bone size={18} color="#38BDF8" />;
      case "xray":
        return <Scan size={18} color="#38BDF8" />;
      case "stethoscope":
      default:
        return <Stethoscope size={18} />;
    }
  };

  // Icon renderer for articles
  const renderArticleIcon = (type: ArticleItemData["iconType"]) => {
    switch (type) {
      case "emergency":
        return <AlertCircle size={18} color="#FF6B6B" />;
      case "article":
        return <BookOpen size={18} />;
      case "document":
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div className={styles.resultsContainer}>
      {/* Top Header Row: Location Pill + Pulse AI Badge + Close Button */}
      <div className={styles.topHeaderRow}>
        <div className={styles.headerLeftGroup}>
          <div ref={locationRef} style={{ position: "relative" }}>
            <button
              type="button"
              className={styles.locationPill}
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              aria-expanded={isLocationOpen}
              aria-label={`Location: ${selectedLocation}`}
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
          aria-label="Close results"
        >
          <X size={18} />
        </button>
      </div>

      {/* Query Display Bar: Search Icon + Query + EDIT SEARCH button */}
      <div className={styles.resultsQueryBar}>
        <div className={styles.resultsQueryLeft}>
          <Search size={22} className={styles.resultsQuerySearchIcon} />
          <span className={styles.resultsQueryText}>{query}</span>
        </div>

        <button
          type="button"
          className={styles.editSearchBtn}
          onClick={onEditSearch}
        >
          EDIT SEARCH
        </button>
      </div>

      {/* Red Horizon Divider */}
      <div className={styles.redDivider} />

      {/* 2-Column Split Layout */}
      <div className={styles.resultsSplitLayout}>
        {/* ── LEFT COLUMN: Doctors & Specialties (Primary) ── */}
        <div className={styles.resultsLeftCol}>
          {/* Header Row: Category Title & Pulse AI card */}
          <div className={styles.resultsCategoryHeader}>
            <div>
              <h2 className={styles.resultsCategoryTitle}>{results.categoryTitle}</h2>
              <div className={styles.resultsCategorySub}>{results.matchCountText}</div>
            </div>

            {/* Pulse AI Recommendation badge card */}
            <div className={styles.pulseAiCard}>
              <span className={styles.pulseAiCardText}>{results.pulseRecommendationText}</span>
              <button
                type="button"
                className={styles.askPulseBtn}
                onClick={onAskPulse}
              >
                Ask Pulse
              </button>
            </div>
          </div>

          {/* 2-Column Doctor Cards Grid */}
          <div className={styles.doctorsGrid}>
            {results.doctors.map((doc) => (
              <Link
                key={doc.id}
                href={`/doctors?speciality=Cardiology&city=${encodeURIComponent(selectedLocation)}`}
                className={styles.doctorCard}
              >
                <div className={styles.doctorCardLeft}>
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className={styles.doctorAvatar}
                  />
                  <div className={styles.doctorMeta}>
                    <div className={styles.doctorName}>{doc.name}</div>
                    <div className={styles.doctorHospital}>{doc.hospital}</div>
                    <div className={styles.doctorExp}>{doc.experience}</div>
                  </div>
                </div>

                <div className={styles.doctorArrowCircle} aria-hidden>
                  <ArrowRight size={15} />
                </div>
              </Link>
            ))}
          </div>

          {/* View All Doctors */}
          <div style={{ marginTop: "12px" }}>
            <Link
              href={`/doctors?q=${encodeURIComponent(query)}&city=${encodeURIComponent(selectedLocation)}`}
              className={styles.viewAllDoctorsLink}
            >
              <span>View all doctors</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Related Specialties & Care */}
          <div className={styles.relatedSpecialtiesSection}>
            <div className={styles.relatedSectionTitle}>Related specialties & care</div>
            <div className={styles.relatedTagsGroup}>
              {results.relatedSpecialties.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  className={styles.specPillTag}
                  onClick={() => onSelectSpecialtyTag?.(spec)}
                >
                  {spec}
                </button>
              ))}
              <Link
                href="/specialities"
                className={styles.viewAllSpecLink}
              >
                View all →
              </Link>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Treatments & Articles (Secondary) ── */}
        <div className={styles.resultsRightCol}>
          {/* Treatments & Procedures Section */}
          <div>
            <div className={styles.sectionHeadingRow}>
              <h3 className={styles.sectionTitle}>Treatments & procedures</h3>
            </div>

            <div className={styles.secondaryCardsList}>
              {results.treatments.map((t) => (
                <Link
                  key={t.id}
                  href={`/search?q=${encodeURIComponent(t.title)}`}
                  className={styles.secondaryItemCard}
                >
                  <div className={styles.secondaryItemLeft}>
                    <div className={styles.itemIconBox}>
                      {renderTreatmentIcon(t.iconType)}
                    </div>
                    <div className={styles.itemMeta}>
                      <div className={styles.itemTitle}>{t.title}</div>
                      <div className={styles.itemSubtitle}>{t.subtitle}</div>
                    </div>
                  </div>
                  <ArrowRight size={15} className={styles.itemArrow} />
                </Link>
              ))}
            </div>
          </div>

          {/* Related Articles Section */}
          <div>
            <div className={styles.sectionHeadingRow}>
              <h3 className={styles.sectionTitle}>Related articles</h3>
              <Link href="/search?tab=articles" className={styles.viewAllSmallLink}>
                View all →
              </Link>
            </div>

            <div className={styles.secondaryCardsList}>
              {results.articles.map((art) => (
                <Link
                  key={art.id}
                  href={`/search?q=${encodeURIComponent(art.title)}`}
                  className={styles.secondaryItemCard}
                >
                  <div className={styles.secondaryItemLeft}>
                    <div className={styles.itemIconBox}>
                      {renderArticleIcon(art.iconType)}
                    </div>
                    <div className={styles.itemMeta}>
                      <div className={styles.itemTitle}>{art.title}</div>
                      <div className={styles.itemSubtitle}>
                        {art.readTime} · {art.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={15} className={styles.itemArrow} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
