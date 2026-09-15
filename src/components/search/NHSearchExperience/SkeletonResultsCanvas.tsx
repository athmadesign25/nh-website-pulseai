"use client";

import React from "react";
import styles from "./NHSearchExperience.module.css";

interface SkeletonResultsCanvasProps {
  query: string;
}

export default function SkeletonResultsCanvas({ query }: SkeletonResultsCanvasProps) {
  return (
    <div className={styles.resultsContainer} aria-busy="true" aria-label="Loading search results">
      {/* Top Header Row Skeleton */}
      <div className={styles.topHeaderRow}>
        <div className={styles.headerLeftGroup}>
          <div className={`${styles.skeletonPill} ${styles.shimmer}`} />
          <div className={styles.pulseBadge}>
            <div className={styles.pulseBars} aria-hidden>
              <span className={styles.pulseBar1} />
              <span className={styles.pulseBar2} />
              <span className={styles.pulseBar3} />
            </div>
            <span className={styles.pulseText}>Pulse AI</span>
          </div>
        </div>
        <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 32, height: 32, borderRadius: 8 }} />
      </div>

      {/* Query Bar */}
      <div className={styles.resultsQueryBar}>
        <div className={styles.resultsQueryLeft}>
          <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 22, height: 22 }} />
          <span className={styles.resultsQueryText}>{query || "Searching Narayana Health..."}</span>
        </div>
        <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 80, height: 16 }} />
      </div>

      {/* Red Horizon Divider */}
      <div className={styles.redDivider} />

      {/* Two Column Skeleton Grid */}
      <div className={styles.resultsSplitLayout}>
        {/* Left Column Skeleton */}
        <div className={styles.resultsLeftCol}>
          <div className={styles.resultsCategoryHeader}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 220, height: 22 }} />
              <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 140, height: 14 }} />
            </div>
            <div className={`${styles.skeletonPill} ${styles.shimmer}`} style={{ width: 180, height: 32 }} />
          </div>

          {/* 4 Doctor Skeletons */}
          <div className={styles.doctorsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonDoctorCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 44, height: 44 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 120, height: 14 }} />
                    <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 150, height: 12 }} />
                    <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 60, height: 10 }} />
                  </div>
                </div>
                <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 28, height: 28 }} />
              </div>
            ))}
          </div>

          {/* Specialties Skeleton Tags */}
          <div className={styles.relatedSpecialtiesSection}>
            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 160, height: 16, marginBottom: 12 }} />
            <div className={styles.relatedTagsGroup}>
              {[80, 110, 60, 95, 120].map((w, idx) => (
                <div key={idx} className={`${styles.skeletonPill} ${styles.shimmer}`} style={{ width: w, height: 28 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className={styles.resultsRightCol}>
          <div>
            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 170, height: 16, marginBottom: 12 }} />
            <div className={styles.secondaryCardsList}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonSecondaryCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 36, height: 36, borderRadius: 10 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 140, height: 14 }} />
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 100, height: 11 }} />
                    </div>
                  </div>
                  <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 16, height: 16 }} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 130, height: 16, marginBottom: 12 }} />
            <div className={styles.secondaryCardsList}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonSecondaryCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 36, height: 36, borderRadius: 10 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 150, height: 14 }} />
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 90, height: 11 }} />
                    </div>
                  </div>
                  <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 16, height: 16 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
