"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Award } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { DoctorCardData } from "./searchData";

interface PrimaryResultsProps {
  categoryTitle: string;
  matchCountText: string;
  pulseRecommendationText: string;
  doctors: DoctorCardData[];
  selectedLocation: string;
  query: string;
  onAskPulse?: () => void;
}

export default function PrimaryResults({
  categoryTitle,
  matchCountText,
  pulseRecommendationText,
  doctors,
  selectedLocation,
  query,
  onAskPulse,
}: PrimaryResultsProps) {
  return (
    <div className={styles.primaryResultsSection}>
      {/* Category Header Row */}
      <div className={styles.resultsCategoryHeader}>
        <div>
          <h2 className={styles.resultsCategoryTitle}>{categoryTitle}</h2>
          <div className={styles.resultsCategorySub}>{matchCountText}</div>
        </div>

        {/* Pulse AI Recommendation Pill */}
        <div className={styles.pulseAiCard}>
          <span className={styles.pulseAiCardText}>{pulseRecommendationText}</span>
          <button
            type="button"
            className={styles.askPulseBtn}
            onClick={onAskPulse}
          >
            Ask Pulse
          </button>
        </div>
      </div>

      {/* Dominant Doctor Cards 2-Column Grid */}
      <div className={styles.doctorsGrid}>
        {doctors.slice(0, 4).map((doc) => (
          <div key={doc.id} className={styles.doctorCard}>
            <div className={styles.doctorCardTop}>
              <img
                src={doc.image}
                alt={doc.name}
                className={styles.doctorAvatar}
              />
              <div className={styles.doctorMeta}>
                <div className={styles.doctorName}>{doc.name}</div>
                <div className={styles.doctorSpecialty}>{doc.speciality}</div>
                {doc.expertise && (
                  <div className={styles.doctorExpertise}>{doc.expertise}</div>
                )}
                <div className={styles.doctorHospital}>{doc.hospital}</div>
              </div>
            </div>

            <div className={styles.doctorCardFooter}>
              <span className={styles.doctorExpBadge}>
                <Award size={13} />
                <span>{doc.experience}</span>
              </span>

              <Link
                href={`/doctors/${doc.id}/book?city=${encodeURIComponent(selectedLocation)}`}
                className={styles.bookApptBtn}
              >
                <Calendar size={13} />
                <span>Book Appointment</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* View All Doctors CTA */}
      <div className={styles.viewAllDoctorsRow}>
        <Link
          href={`/doctors?q=${encodeURIComponent(query)}&city=${encodeURIComponent(selectedLocation)}`}
          className={styles.viewAllDoctorsLink}
        >
          <span>View all doctors</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
