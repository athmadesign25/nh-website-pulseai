"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import calendarCheckAnimation from "../../../public/assets/calendar-check.json";
import nhAppIconAnimation from "../../../public/assets/nh-app-icon.json";
import styles from "./FloatingQuickActions.module.css";

const HOVER_REPLAY_DELAY_MS = 1500;

function useHoverLoop(ref: React.RefObject<LottieRefCurrentProps | null>) {
  const hoveringRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onMouseEnter = () => {
    hoveringRef.current = true;
    ref.current?.goToAndPlay(0, true);
  };

  const onMouseLeave = () => {
    hoveringRef.current = false;
    clearTimeout(timeoutRef.current);
  };

  const onComplete = () => {
    if (!hoveringRef.current) return;
    timeoutRef.current = setTimeout(() => {
      if (hoveringRef.current) ref.current?.goToAndPlay(0, true);
    }, HOVER_REPLAY_DELAY_MS);
  };

  return { onMouseEnter, onMouseLeave, onComplete };
}

export default function FloatingQuickActions() {
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);
  const [isSearchDocked, setIsSearchDocked] = useState(false);
  const [darkLinks, setDarkLinks] = useState<boolean[]>([false, false, false]);
  const [containerTop, setContainerTop] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const linkRef0 = useRef<HTMLAnchorElement>(null);
  const linkRef1 = useRef<HTMLAnchorElement>(null);
  const linkRef2 = useRef<HTMLButtonElement>(null);

  const calendarLottieRef = useRef<LottieRefCurrentProps>(null);
  const nhAppIconLottieRef = useRef<LottieRefCurrentProps>(null);
  const calendarHover = useHoverLoop(calendarLottieRef);
  const nhAppIconHover = useHoverLoop(nhAppIconLottieRef);

  useEffect(() => {
    const updatePosition = (e?: Event) => {
      const customDetail = (e as CustomEvent)?.detail;
      if (customDetail && typeof customDetail.fabTop === "number") {
        setContainerTop(customDetail.fabTop);
        return;
      }

      if (typeof window !== "undefined") {
        const cssVal = getComputedStyle(document.documentElement).getPropertyValue("--fab-target-top");
        if (cssVal && cssVal.trim()) {
          const parsed = parseFloat(cssVal);
          if (!isNaN(parsed) && parsed > 0) {
            setContainerTop(parsed);
            return;
          }
        }
        const winH = window.innerHeight;
        const defaultStartTop = Math.round(winH * 0.68 - 28);
        const defaultSquareTop = Math.round(defaultStartTop + (136 - 100) / 2);
        setContainerTop(defaultSquareTop - 202);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("nh:search-pos-update", updatePosition);

    const handleDock = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.isDocked === "boolean") {
        setIsSearchDocked(detail.isDocked);
      }
    };
    window.addEventListener("nh:search-docked", handleDock);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("nh:search-pos-update", updatePosition);
      window.removeEventListener("nh:search-docked", handleDock);
    };
  }, []);

  useEffect(() => {
    const handleScrollAndTheme = () => {
      // Quick Health Actions Bar appears as the user scrolls past hero (at ~35% scroll, showing 2 buttons)
      const showQuickActions = window.scrollY >= window.innerHeight * 0.35;
      setIsQuickActionsVisible(showQuickActions);

      if (!showQuickActions || !containerRef.current) return;

      // Temporarily disable pointer events on container to sample element underneath
      const prevPointerEvents = containerRef.current.style.pointerEvents;
      containerRef.current.style.pointerEvents = "none";

      const barRect = containerRef.current.getBoundingClientRect();
      const overlapsBar = (el: Element) => {
        const r = el.getBoundingClientRect();
        return (
          r.right > barRect.left &&
          r.left < barRect.right &&
          r.bottom > barRect.top &&
          r.top < barRect.bottom
        );
      };

      const hero = document.querySelector("#hero-section-search-first");
      const overHero = Boolean(hero && overlapsBar(hero));

      const grid = document.querySelector('[class*="gridSection"]');
      const overGrid = Boolean(grid && overlapsBar(grid));
      const overGridImage =
        overGrid && Array.from(grid!.querySelectorAll("img")).some(overlapsBar);

      const packages = document.querySelector("#health-packages");
      const overPackages = Boolean(packages && overlapsBar(packages));
      const packageCardAtBar =
        overPackages &&
        Array.from(packages!.querySelectorAll('a[class*="packageCard"]')).some(overlapsBar);

      const linkRefs = [linkRef0, linkRef1, linkRef2];
      const newDarkState = linkRefs.map((ref) => {
        if (!ref.current) return false;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const elements = document.elementsFromPoint(centerX, centerY);
        let detectedTheme = "light";
        for (const el of elements) {
          const themeEl = el.closest("[data-nav-theme]");
          if (themeEl) {
            detectedTheme = themeEl.getAttribute("data-nav-theme") || "light";
            break;
          }
        }

        let isDark = detectedTheme === "dark";
        if (overGrid) isDark = overGridImage;
        if (overPackages) isDark = !packageCardAtBar;
        if (overHero) isDark = false;
        return isDark;
      });

      containerRef.current.style.pointerEvents = prevPointerEvents;
      setDarkLinks(newDarkState);
    };

    window.addEventListener("scroll", handleScrollAndTheme, { passive: true });
    window.addEventListener("resize", handleScrollAndTheme, { passive: true });
    handleScrollAndTheme();

    return () => {
      window.removeEventListener("scroll", handleScrollAndTheme);
      window.removeEventListener("resize", handleScrollAndTheme);
    };
  }, []);

  const handleOpenSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nh:open-search", { detail: { scrollY: window.scrollY } }));
    }
  };

  const isContainerDark = darkLinks.some(Boolean);

  return (
    <>
      {/* Consistent Vertical Floating Utility Group on the Right Side */}
      <div
        ref={containerRef}
        role="region"
        aria-label="Quick actions and search"
        className={`${styles.container} global-floating-quick-actions ${
          isQuickActionsVisible ? styles.visible : styles.hidden
        } ${isSearchDocked ? styles.dockedThreeButtons : styles.dockedTwoButtons} ${
          isContainerDark ? styles.containerDark : ""
        }`}
        style={containerTop !== null ? { top: `${containerTop}px` } : undefined}
      >
        {/* Action 1: Book Appointment (Primary utility) */}
        <Link
          ref={linkRef0}
          className={`${styles.link} ${darkLinks[0] ? styles.linkOnDark : ""}`}
          href="/find-a-doctor"
          onMouseEnter={calendarHover.onMouseEnter}
          onMouseLeave={calendarHover.onMouseLeave}
        >
          <span className={styles.iconWrap}>
            <span className={styles.calendarIconClip}>
              <Lottie
                lottieRef={calendarLottieRef}
                animationData={calendarCheckAnimation}
                loop={false}
                autoplay
                onComplete={calendarHover.onComplete}
                style={{ width: 42, height: 42, flexShrink: 0 }}
                aria-hidden
              />
            </span>
          </span>
          <span className={styles.actionLabel}>Book<br />Appointment</span>
        </Link>

        {/* Action 2: Download NH App (Secondary utility) */}
        <Link
          ref={linkRef1}
          className={`${styles.link} ${darkLinks[1] ? styles.linkOnDark : ""}`}
          href="#app-download-banner"
          onMouseEnter={nhAppIconHover.onMouseEnter}
          onMouseLeave={nhAppIconHover.onMouseLeave}
        >
          <span className={styles.iconWrap}>
            <Lottie
              lottieRef={nhAppIconLottieRef}
              animationData={nhAppIconAnimation}
              loop={false}
              autoplay
              onComplete={nhAppIconHover.onComplete}
              style={{ width: 29, height: 29, flexShrink: 0 }}
              aria-hidden
            />
          </span>
          <span className={styles.actionLabel}>Download<br />NH App</span>
        </Link>

        {/* Action 3: Pulse AI Search (Merges into 3rd position as liquid droplet) */}
        <div 
          className={`${styles.thirdActionSlot} ${isSearchDocked ? styles.slotExpanded : styles.slotCollapsed}`}
          style={{
            display: isSearchDocked ? "flex" : "none",
          }}
        >
          <button
            id="floating-pulse-target"
            ref={linkRef2}
            type="button"
            className={`${styles.link} ${styles.pulseSearchAction} ${darkLinks[2] ? styles.linkOnDark : ""}`}
            onClick={handleOpenSearch}
            aria-label="Pulse AI Search"
          >
            <span className={`${styles.iconWrap} ${styles.pulseIconWrap}`}>
              <span className={styles.gradientLayer} aria-hidden="true" />
              <span className={`${styles.gradientLayer} ${styles.gradientLayerDodge}`} aria-hidden="true" />
              <span className={styles.pulseIconLight} aria-hidden="true" />
              <span className={styles.pulseBars} aria-hidden="true">
                <span className={styles.pulseBar1} />
                <span className={styles.pulseBar2} />
                <span className={styles.pulseBar3} />
              </span>
            </span>
            <span className={styles.actionLabel}>Pulse AI<br />Search</span>
          </button>
        </div>
      </div>
    </>
  );
}
