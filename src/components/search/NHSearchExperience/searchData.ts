/**
 * ═════════════════════════════════════════════════════════════════════════════════
 * NARAYANA HEALTH SEARCH DATA & PREDICTIVE INTELLIGENCE CONFIG
 * ═════════════════════════════════════════════════════════════════════════════════
 *
 * DEVELOPER HANDOFF INSTRUCTIONS:
 * 
 * 1. DEMO SEARCH SCENARIOS:
 *    - Scenario 1 (Cardiology):
 *      User types: 'c' → 'ch' → 'chest' → 'chest pain'
 *      Predictive completion: "I have chest pain and need a doctor"
 *      Results: Cardiologists in Bangalore + cardiac procedures & articles
 *
 *    - Scenario 2 (Orthopaedics):
 *      User types: 'k' → 'kn' → 'knee' → 'knee pain'
 *      Predictive completion: "I have knee pain and need an orthopaedic doctor"
 *      Results: Recommended Orthopaedic Doctors in Bangalore + joint care
 *
 * 2. API INTEGRATION POINT:
 *    - For live predictive completion: Replace `getPredictiveCompletion()` with a call
 *      to your autocomplete / query suggestion service.
 *    - For search results: Replace `getSearchResults()` with a call to your live
 *      healthcare search backend (OpenSearch / Elasticsearch / Pulse AI API).
 */

export interface DoctorCardData {
  id: string;
  name: string;
  speciality: string;
  hospital: string;
  experience: string;
  image: string;
  city: string;
  availableToday?: boolean;
}

export interface TreatmentItemData {
  id: string;
  title: string;
  subtitle: string;
  iconType: "heart" | "activity" | "angiography" | "stethoscope" | "joint" | "xray";
}

export interface ArticleItemData {
  id: string;
  title: string;
  readTime: string;
  category: string;
  iconType: "document" | "emergency" | "article";
}

export interface SearchResultsData {
  categoryTitle: string;
  matchCountText: string;
  pulseRecommendationText: string;
  doctors: DoctorCardData[];
  relatedSpecialties: string[];
  treatments: TreatmentItemData[];
  articles: ArticleItemData[];
}

export interface PredictiveState {
  /** The full suggested completion sentence */
  fullText: string;
  /** Suffix remaining after the user's typed text (for inline ghost styling) */
  suffix: string;
  /** List of alternative sentence / query predictions */
  suggestions: string[];
  /** Inferred healthcare intent */
  intent: "cardiology" | "orthopaedics" | "general";
  intentLabel: string;
}

export const NH_LOCATIONS = [
  "Bangalore",
  "Delhi NCR",
  "Kolkata",
  "Mumbai",
  "Jaipur",
  "Ahmedabad",
  "Mysore",
  "Guwahati",
  "Shimoga",
];

/**
 * Live predictive sentence completion logic.
 * Returns both the inline completion suffix and a list of secondary query predictions.
 */
export function getPredictiveCompletion(typedText: string): PredictiveState | null {
  const clean = typedText.trim().toLowerCase();
  if (!clean) return null;

  // ── DEMO SEARCH 1: Cardiology Progression ('c' / 'ch' / 'chest') ──
  if (clean === "c") {
    return {
      fullText: "can I help you find a cardiologist?",
      suffix: "an I help you find a cardiologist?",
      suggestions: [
        "I have chest pain and need a doctor",
        "can I help you find a cardiologist?",
        "chest pain causes and emergency signs",
        "cardiology consultation in Bangalore",
      ],
      intent: "cardiology",
      intentLabel: "Cardiology & Chest Care",
    };
  }

  if (clean === "ch") {
    return {
      fullText: "chest pain — find the right specialist",
      suffix: "est pain — find the right specialist",
      suggestions: [
        "I have chest pain and need a doctor",
        "chest pain — find the right specialist",
        "chest pain doctor near me",
        "chest tightness and breathing difficulty",
      ],
      intent: "cardiology",
      intentLabel: "Cardiac Care",
    };
  }

  if (clean.startsWith("chest p") || clean === "chest pain") {
    return {
      fullText: "I have chest pain and need a doctor",
      suffix: clean === "chest pain" ? " and need a doctor" : "ain and need a doctor",
      suggestions: [
        "I have chest pain and need a doctor",
        "chest pain doctor near me",
        "chest pain causes and diagnosis",
        "chest pain clinic in Bangalore",
      ],
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean.startsWith("chest")) {
    return {
      fullText: "chest pain — find a cardiologist near you",
      suffix: " pain — find a cardiologist near you",
      suggestions: [
        "I have chest pain and need a doctor",
        "chest pain — find a cardiologist near you",
        "chest pain causes and diagnosis",
        "chest pain doctor near me",
      ],
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  if (clean.startsWith("cardio") || clean.startsWith("heart")) {
    return {
      fullText: "cardiology consultation with top heart specialists",
      suffix: clean.startsWith("cardio") ? "logy consultation with top heart specialists" : " specialist in Bangalore",
      suggestions: [
        "I have chest pain and need a doctor",
        "cardiology consultation in Bangalore",
        "heart specialist near me",
        "preventive cardiac checkup package",
      ],
      intent: "cardiology",
      intentLabel: "Cardiology",
    };
  }

  // ── DEMO SEARCH 2: Orthopaedics Progression ('k' / 'kn' / 'knee') ──
  if (clean === "k") {
    return {
      fullText: "knee pain — find the right specialist",
      suffix: "nee pain — find the right specialist",
      suggestions: [
        "I have knee pain and need an orthopaedic doctor",
        "knee pain — find the right specialist",
        "knee replacement surgeon in Bangalore",
        "knee pain causes and home exercises",
      ],
      intent: "orthopaedics",
      intentLabel: "Orthopaedic Care",
    };
  }

  if (clean === "kn") {
    return {
      fullText: "knee pain — find an orthopaedic doctor",
      suffix: "ee pain — find an orthopaedic doctor",
      suggestions: [
        "I have knee pain and need an orthopaedic doctor",
        "knee pain — find an orthopaedic doctor",
        "knee arthroscopy specialist",
        "knee joint swelling and pain relief",
      ],
      intent: "orthopaedics",
      intentLabel: "Orthopaedics",
    };
  }

  if (clean.startsWith("knee p") || clean === "knee pain") {
    return {
      fullText: "I have knee pain and need an orthopaedic doctor",
      suffix: clean === "knee pain" ? " and need an orthopaedic doctor" : "ain and need an orthopaedic doctor",
      suggestions: [
        "I have knee pain and need an orthopaedic doctor",
        "knee pain doctor near me",
        "knee pain assessment and MRI",
        "knee replacement consultation",
      ],
      intent: "orthopaedics",
      intentLabel: "Orthopaedics & Joint Care",
    };
  }

  if (clean.startsWith("knee")) {
    return {
      fullText: "knee pain — find an orthopaedic specialist near you",
      suffix: " pain — find an orthopaedic specialist near you",
      suggestions: [
        "I have knee pain and need an orthopaedic doctor",
        "knee pain — find an orthopaedic specialist near you",
        "knee replacement surgery options",
        "knee doctor near me in Bangalore",
      ],
      intent: "orthopaedics",
      intentLabel: "Orthopaedics",
    };
  }

  if (clean.startsWith("ortho") || clean.startsWith("joint") || clean.startsWith("bone")) {
    return {
      fullText: "orthopaedic doctor for joint and bone consultation",
      suffix: clean.startsWith("ortho") ? "paedic doctor for joint and bone consultation" : " specialist near me",
      suggestions: [
        "I have knee pain and need an orthopaedic doctor",
        "orthopaedic consultation in Bangalore",
        "joint replacement surgeon near me",
        "bone and joint injury clinic",
      ],
      intent: "orthopaedics",
      intentLabel: "Orthopaedics",
    };
  }

  // ── GENERAL FALLBACK PREDICTION ──
  return {
    fullText: `${typedText} specialist consultation near you`,
    suffix: " specialist consultation near you",
    suggestions: [
      `${typedText} specialist in Bangalore`,
      `${typedText} symptoms and diagnosis`,
      `${typedText} doctor appointment today`,
    ],
    intent: "general",
    intentLabel: "Clinical Care",
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS DATASETS FOR BOTH DEMO SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════════

export const CARDIOLOGY_RESULTS: SearchResultsData = {
  categoryTitle: "Cardiologists in Bangalore",
  matchCountText: "24 doctors match your search",
  pulseRecommendationText: "Get customise recommendation with Pulse ai",
  doctors: [
    {
      id: "doc-ananya",
      name: "Dr. Ananya Rao",
      speciality: "Senior Consultant - Cardiology",
      hospital: "Narayana Health City",
      experience: "12 years ·",
      image: "/assets/doctor_avatar_female.png",
      city: "Bangalore",
      availableToday: true,
    },
    {
      id: "doc-ananya-2",
      name: "Dr. Ananya Rao",
      speciality: "Consultant - Cardiology",
      hospital: "Narayana Health City",
      experience: "12 years ·",
      image: "/assets/doctor_avatar_female.png",
      city: "Bangalore",
      availableToday: true,
    },
    {
      id: "doc-vivek",
      name: "Dr. Vivek Menon",
      speciality: "Director - Interventional Cardiology",
      hospital: "Narayana Multispeciality",
      experience: "15 years ·",
      image: "/assets/doctor_avatar_male.png",
      city: "Bangalore",
      availableToday: true,
    },
    {
      id: "doc-vivek-2",
      name: "Dr. Vivek Menon",
      speciality: "Director - Interventional Cardiology",
      hospital: "Narayana Multispeciality",
      experience: "15 years ·",
      image: "/assets/doctor_avatar_male.png",
      city: "Bangalore",
      availableToday: true,
    },
  ],
  relatedSpecialties: [
    "Cardiology",
    "Cardiac consultation",
    "ECG",
    "Chest pain clinic",
    "Preventive heart check",
  ],
  treatments: [
    {
      id: "t-1",
      title: "Cardiac consultation",
      subtitle: "Specialist assessment",
      iconType: "heart",
    },
    {
      id: "t-2",
      title: "ECG · Electrocardiogram",
      subtitle: "Heart rhythm test",
      iconType: "activity",
    },
    {
      id: "t-3",
      title: "Coronary angiography",
      subtitle: "Diagnostic procedure",
      iconType: "angiography",
    },
  ],
  articles: [
    {
      id: "a-1",
      title: "Understanding Chest Pain",
      readTime: "7 min read",
      category: "Cardiac health",
      iconType: "document",
    },
    {
      id: "a-2",
      title: "When is chest pain an emergency?",
      readTime: "5 min read",
      category: "Emergency care",
      iconType: "emergency",
    },
    {
      id: "a-3",
      title: "Chest pain: causes and diagnosis",
      readTime: "6 min read",
      category: "Cardiology",
      iconType: "article",
    },
  ],
};

export const ORTHOPAEDICS_RESULTS: SearchResultsData = {
  categoryTitle: "Recommended Orthopaedic Doctors in Bangalore",
  matchCountText: "16 doctors match your search",
  pulseRecommendationText: "Get customise recommendation with Pulse ai",
  doctors: [
    {
      id: "doc-prakash",
      name: "Dr. Prakash Gupta",
      speciality: "Senior Consultant - Orthopaedics & Joint Replacement",
      hospital: "Narayana Multispeciality, Bangalore",
      experience: "16 years ·",
      image: "/assets/doctor_2.png",
      city: "Bangalore",
      availableToday: true,
    },
    {
      id: "doc-rohan",
      name: "Dr. Rohan Varma",
      speciality: "Consultant - Arthroscopy & Sports Medicine",
      hospital: "Narayana Health City, Bangalore",
      experience: "13 years ·",
      image: "/assets/doctor_avatar_male.png",
      city: "Bangalore",
      availableToday: true,
    },
    {
      id: "doc-sanjay",
      name: "Dr. Sanjay Rao",
      speciality: "Director - Robotic Joint Replacement Surgery",
      hospital: "Narayana Institute of Orthopaedics",
      experience: "22+ years ·",
      image: "/assets/doctor_3.png",
      city: "Bangalore",
      availableToday: true,
    },
    {
      id: "doc-meera",
      name: "Dr. Meera Nambiar",
      speciality: "Consultant - Pediatric & Adult Orthopaedics",
      hospital: "Narayana Multispeciality",
      experience: "11 years ·",
      image: "/assets/doctor_avatar_female.png",
      city: "Bangalore",
      availableToday: true,
    },
  ],
  relatedSpecialties: [
    "Orthopaedics",
    "Joint Replacement",
    "Knee Arthroscopy",
    "Knee Clinic",
    "Sports Medicine",
    "Physiotherapy & Rehab",
  ],
  treatments: [
    {
      id: "t-ortho-1",
      title: "Orthopaedic consultation",
      subtitle: "Specialist joint & bone assessment",
      iconType: "joint",
    },
    {
      id: "t-ortho-2",
      title: "Knee pain assessment",
      subtitle: "Comprehensive clinical evaluation",
      iconType: "stethoscope",
    },
    {
      id: "t-ortho-3",
      title: "Knee replacement surgery",
      subtitle: "Advanced robotic-assisted procedure",
      iconType: "joint",
    },
    {
      id: "t-ortho-4",
      title: "Digital X-ray & Knee MRI",
      subtitle: "High resolution joint imaging",
      iconType: "xray",
    },
  ],
  articles: [
    {
      id: "a-ortho-1",
      title: "Understanding knee pain: causes & home care",
      readTime: "6 min read",
      category: "Joint health",
      iconType: "document",
    },
    {
      id: "a-ortho-2",
      title: "When to see an orthopaedic doctor for knee pain",
      readTime: "5 min read",
      category: "Orthopaedics",
      iconType: "emergency",
    },
    {
      id: "a-ortho-3",
      title: "Robotic knee replacement: modern surgical recovery",
      readTime: "8 min read",
      category: "Joint Care",
      iconType: "article",
    },
  ],
};

/**
 * Returns structured search results based on query & location.
 */
export async function getSearchResults(
  query: string,
  location: string = "Bangalore"
): Promise<SearchResultsData> {
  const clean = query.toLowerCase();

  // If query is related to knee / orthopaedics / bone / joint
  if (
    clean.includes("knee") ||
    clean.includes("ortho") ||
    clean.includes("joint") ||
    clean.includes("bone") ||
    clean.startsWith("k")
  ) {
    return {
      ...ORTHOPAEDICS_RESULTS,
      categoryTitle: `Recommended Orthopaedic Doctors in ${location}`,
    };
  }

  // Default to cardiology results
  return {
    ...CARDIOLOGY_RESULTS,
    categoryTitle: `Cardiologists in ${location}`,
  };
}
