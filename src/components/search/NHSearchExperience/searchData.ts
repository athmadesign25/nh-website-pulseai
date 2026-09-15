/**
 * Narayana Health Unified Search Experience - Sample Dataset & Query Matcher
 *
 * DEVELOPER HANDOFF NOTE:
 * This file models the data structures for:
 * 1. Query autocomplete suggestions (State 02)
 * 2. Search result payloads (State 03) including doctors, treatments, articles, and related tags.
 *
 * TO CONNECT PRODUCTION APIS:
 * Replace or augment `getLiveSuggestions()` and `getSearchResults()` with live calls
 * to your backend search endpoint (e.g. `/api/search` or Elasticsearch/Algolia instance).
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
  iconType: "heart" | "activity" | "angiography" | "stethoscope";
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

// Sample Query Suggestion Bank
const SUGGESTION_BANK: string[] = [
  "I have chest pain",
  "chest pain causes",
  "chest pain doctor near me",
  "chest tightness and breathing difficulty",
  "cardiology consultation",
  "cardiologist near me",
  "cancer care specialist",
  "coronary artery disease",
  "cardiac health checkup",
  "neurology consultation",
  "orthopaedic surgeon near me",
  "pediatrician in Bangalore",
  "gastroenterologist appointment",
  "diabetic care clinic",
  "knee replacement surgery",
  "spine consultation",
];

/**
 * Returns dynamic query suggestions based on user input.
 * When query is empty or short, returns curated suggestions based on location.
 */
export function getLiveSuggestions(query: string): string[] {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return [
      "I have chest pain",
      "cardiologist near me",
      "cardiac consultation",
      "chest pain causes",
    ];
  }

  // Matches starting with or containing query
  const matches = SUGGESTION_BANK.filter((s) =>
    s.toLowerCase().includes(clean)
  );

  // If specific healthcare keywords typed, ensure top clinical queries appear
  if (clean.startsWith("c")) {
    const prioritized = [
      "I have chest pain",
      "chest pain causes",
      "chest pain doctor near me",
      "cardiology consultation",
      "cardiologist near me",
    ];
    return Array.from(new Set([...prioritized, ...matches])).slice(0, 5);
  }

  return matches.length > 0
    ? matches.slice(0, 5)
    : [
        `${query} specialists`,
        `${query} symptoms and treatment`,
        `${query} doctors near me`,
      ];
}

/**
 * Default search results data modelled after Reference 03 ("Active search result.png")
 */
export const CARDIOLOGY_SEARCH_RESULTS: SearchResultsData = {
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

/**
 * Resolves search results for a given query & location.
 * In a real production environment, this is replaced by your search API call.
 */
export async function getSearchResults(
  query: string,
  location: string = "Bangalore"
): Promise<SearchResultsData> {
  // Simulate rapid realistic response
  await new Promise((resolve) => setTimeout(resolve, 80));

  const clean = query.toLowerCase();

  // If query specifies neurology or brain
  if (clean.includes("neuro") || clean.includes("brain") || clean.includes("headache")) {
    return {
      categoryTitle: `Neurologists in ${location}`,
      matchCountText: "18 doctors match your search",
      pulseRecommendationText: "Get customise recommendation with Pulse ai",
      doctors: [
        {
          id: "doc-neuro-1",
          name: "Dr. Ravi Shankar",
          speciality: "Senior Consultant - Neurology",
          hospital: "Narayana Institute of Neurosciences",
          experience: "16 years ·",
          image: "/assets/doctor_3.png",
          city: location,
        },
        {
          id: "doc-neuro-2",
          name: "Dr. Priya Sharma",
          speciality: "Consultant - Pediatric Neurology",
          hospital: "Mazumdar Shaw Medical Centre",
          experience: "14 years ·",
          image: "/assets/doctor_avatar_female.png",
          city: location,
        },
        {
          id: "doc-neuro-3",
          name: "Dr. Arun Krishnan",
          speciality: "Director - Neurosurgery",
          hospital: "Narayana Multispeciality",
          experience: "20 years ·",
          image: "/assets/doctor_2.png",
          city: location,
        },
        {
          id: "doc-neuro-4",
          name: "Dr. Ananya Rao",
          speciality: "Consultant - Neurology",
          hospital: "Narayana Health City",
          experience: "12 years ·",
          image: "/assets/doctor_avatar_female.png",
          city: location,
        },
      ],
      relatedSpecialties: [
        "Neurology",
        "Neurosurgery",
        "Brain MRI",
        "Stroke Clinic",
        "Headache Management",
      ],
      treatments: [
        {
          id: "t-neuro-1",
          title: "Neurological Examination",
          subtitle: "Clinical specialist assessment",
          iconType: "activity",
        },
        {
          id: "t-neuro-2",
          title: "Brain MRI & EEG",
          subtitle: "Advanced neuro-imaging",
          iconType: "activity",
        },
        {
          id: "t-neuro-3",
          title: "Stroke Thrombolysis Protocol",
          subtitle: "Emergency neuro-intervention",
          iconType: "heart",
        },
      ],
      articles: [
        {
          id: "a-neuro-1",
          title: "Recognizing Early Signs of Stroke",
          readTime: "6 min read",
          category: "Neurology care",
          iconType: "emergency",
        },
        {
          id: "a-neuro-2",
          title: "Migraine vs Tension Headache: Key Differences",
          readTime: "5 min read",
          category: "Brain health",
          iconType: "article",
        },
      ],
    };
  }

  // Default to cardiology / chest pain results matching Reference 03
  return {
    ...CARDIOLOGY_SEARCH_RESULTS,
    categoryTitle: `Cardiologists in ${location}`,
  };
}
