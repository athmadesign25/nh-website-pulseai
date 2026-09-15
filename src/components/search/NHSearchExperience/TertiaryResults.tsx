"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, Heart, Activity, Stethoscope, FileText, AlertCircle, BookOpen,
  Bone, Scan 
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { TreatmentItemData, ArticleItemData } from "./searchData";

interface TertiaryResultsProps {
  treatments: TreatmentItemData[];
  articles: ArticleItemData[];
}

export default function TertiaryResults({
  treatments,
  articles,
}: TertiaryResultsProps) {
  // Icon renderer for treatments
  const renderTreatmentIcon = (type: TreatmentItemData["iconType"]) => {
    switch (type) {
      case "heart":
        return <Heart size={16} />;
      case "activity":
        return <Activity size={16} />;
      case "angiography":
        return <Heart size={16} color="#FF6B6B" />;
      case "joint":
        return <Bone size={16} color="#38BDF8" />;
      case "xray":
        return <Scan size={16} color="#38BDF8" />;
      case "stethoscope":
      default:
        return <Stethoscope size={16} />;
    }
  };

  // Icon renderer for articles
  const renderArticleIcon = (type: ArticleItemData["iconType"]) => {
    switch (type) {
      case "emergency":
        return <AlertCircle size={16} color="#FF6B6B" />;
      case "article":
        return <BookOpen size={16} />;
      case "document":
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className={styles.resultsRightCol} aria-label="Tertiary supporting results">
      {/* Treatments & Procedures Section */}
      <div>
        <div className={styles.sectionHeadingRow}>
          <h3 className={styles.sectionTitle}>Treatments & procedures</h3>
        </div>

        <div className={styles.secondaryCardsList}>
          {treatments.map((t) => (
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
              <ArrowRight size={14} className={styles.itemArrow} />
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
          {articles.map((art) => (
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
              <ArrowRight size={14} className={styles.itemArrow} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
