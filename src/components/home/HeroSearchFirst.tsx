"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
  useScroll,
  animate,
  useInView,
  useSpring,
} from "framer-motion";
import { MapPin, FlaskConical, Droplets, Shield, Search, ChevronRight , Activity, FileText, Video, Building2, Settings, Mic, MicOff, Phone, AlertTriangle, Calendar, Clock } from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import styles from "./HeroSearchFirst.module.css";
import Lottie from "lottie-react";
import pulseAnimation from "../../../public/assets/pulse animation.json";
import starAnimation from "../../../public/assets/AI Searching 2.json";
import PixelRipple from "./PixelRipple";
import PulseAIWorkspace from "../pulse-ai/PulseAIWorkspace";

const STAT_GROUPS = [
  [
    { value: 5000, suffix: "+", label: "Robotic Surgeries\nPerformed" },
    { value: 550000, suffix: "+", label: "Cardiac Consults\nAnnually" },
    { value: 33000, suffix: "+", label: "Image Guided\nProcedures" },
    { value: 8000, suffix: "+", label: "Solid Organ\nTransplants" }
  ],
  [
    { value: 80000, suffix: "+", label: "Chemotherapy Sessions\nAnnually" },
    { value: 15000, suffix: "+", label: "Joint Replacements\nPerformed" },
    { value: 2000, suffix: "+", label: "Bone Marrow\nTransplants" },
    { value: 120000, suffix: "+", label: "Dialysis Sessions\nAnnually" }
  ]
];

const popularTags = ["chest pain", "cancer", "surgery", "liver"];

// Emergency keywords — trigger urgency banner
const EMERGENCY_KEYWORDS = [
  "chest pain", "heart attack", "stroke", "can't breathe", "cannot breathe",
  "difficulty breathing", "unconscious", "seizure", "severe bleeding", "not breathing",
  "collapsed", "overdose", "poisoning", "severe chest", "crushing pain"
];

const isEmergencyQuery = (q: string) =>
  EMERGENCY_KEYWORDS.some(kw => q.toLowerCase().includes(kw.toLowerCase()));

// Intent detection helper
const detectIntent = (query: string, doctors: {name:string}[], specs: {name:string}[]) => {
  const q = query.toLowerCase().trim();
  if (q.startsWith("dr") || q.includes("doctor")) return "Doctor";
  if (doctors.some(d => d.name.toLowerCase().includes(q))) return "Doctor";
  if (specs.some(s => s.name.toLowerCase().includes(q))) return "Speciality";
  const symptomWords = ["pain", "fever", "cough", "ache", "swelling", "bleeding", "nausea", "dizzy", "weakness", "fatigue", "vomit", "feel", "have", "suffering"];
  if (symptomWords.some(w => q.includes(w))) return "Symptom";
  return "Treatment";
};

// Speciality lists for auto-suggest with semantic keywords (symptoms, organs, treatments)
const specialitiesData = [
  { 
    name: "Cardiology", 
    slug: "cardiology",
    image: "/Specialities icons/Cardiology.svg",
    keywords: ["heart", "chest pain", "valve", "cardiac", "bypass", "bp", "hypertension", "angioplasty", "artery", "cardio", "palpitation", "cardiologist", "cardiac surgeon", "cardio specialists"] 
  },
  { 
    name: "Neurology", 
    slug: "neurology",
    image: "/Specialities icons/Neurology.svg",
    keywords: ["brain", "nerve", "stroke", "migraine", "headache", "spine", "seizure", "epilepsy", "paralysis", "neuro", "back pain", "neurologist", "neuro surgeon", "neuro specialists"] 
  },
  { 
    name: "Oncology", 
    slug: "oncology",
    image: "/Specialities icons/Cancercare.svg",
    keywords: ["cancer", "tumor", "chemotherapy", "radiation", "biopsy", "leukemia", "lymphoma", "onco", "tumor", "lump", "oncologist", "cancer specialist"] 
  },
  { 
    name: "Orthopaedics", 
    slug: "orthopaedics",
    image: "/Specialities icons/Orthopaedics.svg",
    keywords: ["bone", "joint", "fracture", "knee", "hip", "arthritis", "ligament", "sprain", "ortho", "backbone", "orthopaedic surgeon", "ortho specialist"] 
  },
  { 
    name: "Paediatrics", 
    slug: "paediatrics",
    image: "/Specialities icons/Paedratic.svg",
    keywords: ["child", "baby", "kid", "newborn", "vaccination", "paediatrician", "infant", "pediatric"] 
  },
  { 
    name: "Gastroenterology", 
    slug: "gastroenterology",
    image: "/Specialities icons/Gastro.svg",
    keywords: ["stomach", "liver", "digestion", "acidity", "gastric", "endoscopy", "ulcer", "gastro", "diarrhea"] 
  },
  { 
    name: "Ophthalmology", 
    slug: "ophthalmology",
    image: "/Specialities icons/General Medicine.svg",
    keywords: ["eye", "vision", "blind", "cataract", "lasik", "glasses", "lens", "sight"] 
  },
  { 
    name: "ENT", 
    slug: "ent",
    image: "/Specialities icons/Lab test default icon.svg",
    keywords: ["ear", "nose", "throat", "sinus", "tonsils", "hearing", "voice", "throat pain", "cold"] 
  },
  {
    name: "Gynecology",
    slug: "gynecology",
    image: "/Specialities icons/Gynaecology.svg",
    keywords: ["women", "pregnancy", "female", "maternity", "obgyn", "delivery", "period", "uterus"]
  },
  {
    name: "Dermatology",
    slug: "dermatology",
    image: "/Specialities icons/Diabetology.svg",
    keywords: ["skin", "hair", "nails", "acne", "rash", "dandruff", "eczema", "allergy"]
  },
  {
    name: "Urology",
    slug: "urology",
    image: "/Specialities icons/Urology.svg",
    keywords: ["urine", "bladder", "prostate", "kidney stone", "urinary"]
  },
  {
    name: "Pulmonology",
    slug: "pulmonology",
    image: "/Specialities icons/Pulmonology.svg",
    keywords: ["lungs", "breathing", "asthma", "respiratory", "cough", "bronchitis", "pneumonia"]
  },
  {
    name: "Dental Care",
    slug: "dental-care",
    image: "/Specialities icons/Dental.svg",
    keywords: ["teeth", "toothache", "root canal", "dental", "oral", "gums", "braces"]
  },
  { 
    name: "General Medicine", 
    slug: "general-medicine",
    image: "/Specialities icons/General Medicine.svg",
    keywords: ["fever", "cough", "cold", "flu", "infection", "headache", "weakness", "vomiting", "general physician", "physician", "body pain", "viral"] 
  }
];



const AVAILABILITY_SLOTS = [
  "Today 2:00 PM", "Today 4:30 PM", "Today 6:00 PM",
  "Tomorrow 9:00 AM", "Tomorrow 11:30 AM", "Tomorrow 3:00 PM",
  "Thu 10:00 AM", "Thu 2:30 PM", "Fri 9:00 AM"
];

type DoctorData = {
  name: string;
  speciality: string;
  location: string;
  hospital: string;
  additionalHospitals?: number;
  photo: string;
  keywords: string[];
  consultationModes?: "hospital" | "video" | "both";
  nextAvailable?: string;
};

const doctorsData: DoctorData[] = [
  {
    name: "Dr. Ravi Prakash",
    speciality: "Cardiology",
    location: "Bengaluru",
    hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
    additionalHospitals: 1,
    photo: "/assets/doctor_1.png",
    keywords: ["cardiology", "heart", "ravi", "prakash", "doctor", "specialist", "cardiologist"],
    nextAvailable: "Today 4:30 PM"
  },
  {
    name: "Dr. Ravi Kumar",
    speciality: "Cardiology",
    location: "Guwahati",
    hospital: "Narayana Superspeciality Hospital, Guwahati",
    photo: "/assets/doctor_2.png",
    keywords: ["cardiology", "heart", "ravi", "kumar", "doctor", "specialist", "cardiologist"],
    nextAvailable: "Tomorrow 9:00 AM"
  },
  {
    name: "Dr. Ravi Shankar",
    speciality: "Neurology",
    location: "Mumbai",
    hospital: "NH Children's Hospital, Mumbai",
    additionalHospitals: 2,
    photo: "/assets/doctor_3.png",
    keywords: ["neurology", "brain", "ravi", "shankar", "doctor", "specialist", "neurologist"],
    nextAvailable: "Today 6:00 PM"
  },
  {
    name: "Dr. Prakash Sharma",
    speciality: "Cardiology",
    location: "Bengaluru",
    hospital: "Narayana Multispeciality Hospital, HSR Bangalore",
    photo: "/assets/doctor_1.png",
    keywords: ["cardiology", "heart", "prakash", "sharma", "doctor", "specialist", "cardiologist"],
    nextAvailable: "Thu 10:00 AM"
  },
  {
    name: "Dr. Prakash Gupta",
    speciality: "Orthopaedics",
    location: "Kolkata",
    hospital: "Narayana Superspeciality Hospital, Howrah, kolkata",
    photo: "/assets/doctor_2.png",
    keywords: ["orthopaedics", "bone", "prakash", "gupta", "doctor", "specialist", "orthopaedic"],
    nextAvailable: "Tomorrow 11:30 AM"
  },
  {
    name: "Dr. Rajiv Menon",
    speciality: "Cardiology",
    location: "Bengaluru",
    hospital: "Mazumdar Shaw Medical Centre, Bangalore",
    photo: "/assets/doctor_3.png",
    keywords: ["cardiology", "heart", "rajiv", "menon", "doctor", "specialist", "cardiologist"],
    nextAvailable: "Today 2:00 PM"
  },
  {
    name: "Dr. Priya Sharma",
    speciality: "Neurology",
    location: "Mumbai",
    hospital: "NH Children's Hospital, Mumbai",
    additionalHospitals: 1,
    photo: "/assets/doctor_1.png",
    keywords: ["neurology", "brain", "priya", "sharma", "doctor", "specialist", "neurologist"],
    nextAvailable: "Fri 9:00 AM"
  },
  {
    name: "Dr. Arun Krishnan",
    speciality: "Oncology",
    location: "Kolkata",
    hospital: "Narayana Multispeciality Hospital, Barasat, kolkata",
    photo: "/assets/doctor_2.png",
    keywords: ["oncology", "cancer", "arun", "krishnan", "doctor", "specialist", "oncologist"],
    nextAvailable: "Thu 2:30 PM"
  },
  {
    name: "Dr. Sunita Patel",
    speciality: "Orthopaedics",
    location: "Bengaluru",
    hospital: "Narayana Multispeciality Clinic, HSR Bangalore",
    photo: "/assets/doctor_3.png",
    keywords: ["orthopaedics", "bone", "joint", "sunita", "patel", "doctor", "specialist"],
    nextAvailable: "Today 6:00 PM"
  },
  {
    name: "Dr. Vikram Seth",
    speciality: "General Medicine",
    location: "Bengaluru",
    hospital: "Narayana Health City, Bangalore",
    photo: "/assets/doctor_avatar_male.png",
    keywords: ["general medicine", "fever", "cough", "cold", "flu", "vikram", "seth", "doctor", "physician"],
    nextAvailable: "Today 4:30 PM"
  },
  {
    name: "Dr. Shalini Singh",
    speciality: "General Medicine",
    location: "Mumbai",
    hospital: "NH Children's Hospital, Mumbai",
    photo: "/assets/doctor_avatar_female.png",
    keywords: ["general medicine", "fever", "cough", "cold", "flu", "shalini", "singh", "doctor", "physician"],
    nextAvailable: "Tomorrow 9:00 AM"
  }
];

const getRealtimePulseResponse = (query: string) => {
  return {
    suggestedSpec: "Cardiology",
    suggestedDoc: doctorsData[0],
    empathy: "I understand you are feeling unwell. Let's find a doctor for you.",
    slot: "Today, 4:00 PM",
    recommendedDocs: doctorsData.slice(0, 3)
  };
};

const doctorRoles = [
  {
    role: "Cardiologists",
    keywords: ["cardiology", "heart", "cardio", "bypass", "chest pain", "angioplasty", "clogged"]
  },
  {
    role: "Cardiac Surgeon",
    keywords: ["cardiology", "heart", "cardio", "bypass", "surgery", "angioplasty", "surgeon"]
  },
  {
    role: "Cardio Specialists",
    keywords: ["cardiology", "heart", "cardio", "specialist"]
  },
  {
    role: "Neurologists",
    keywords: ["neurology", "brain", "neuro", "stroke", "migraine", "headache"]
  },
  {
    role: "Neuro Surgeons",
    keywords: ["neurology", "brain", "neuro", "spine", "surgery", "surgeon"]
  },
  {
    role: "Oncologists",
    keywords: ["oncology", "cancer", "tumor", "chemotherapy"]
  },
  {
    role: "Cancer Specialists",
    keywords: ["oncology", "cancer", "onco", "tumor", "specialist"]
  },
  {
    role: "Orthopaedic Surgeons",
    keywords: ["orthopaedics", "bone", "joint", "ortho", "knee", "surgeon"]
  },
  {
    role: "Bone & Joint Specialists",
    keywords: ["orthopaedics", "bone", "joint", "ortho", "specialist"]
  },
  {
    role: "Paediatricians",
    keywords: ["paediatrics", "child", "kid", "baby", "pediatric"]
  },
  {
    role: "Gastroenterologists",
    keywords: ["gastroenterology", "stomach", "liver", "gastro"]
  }
];

const treatmentsData = [
  // Treatments
  {
    name: "Angioplasty & Bypass Surgery",
    type: "treatment",
    speciality: "Cardiology",
    description: "Restores blood flow to blocked heart arteries using state-of-the-art stents and surgical bypass techniques.",
    keywords: ["heart", "chest pain", "valve", "cardiac", "bypass", "angioplasty", "artery", "cardio", "clogged"],
    image: "/Specialities icons/Cardiology.svg"
  },
  {
    name: "Deep Brain Stimulation (DBS)",
    type: "treatment",
    speciality: "Neurology",
    description: "Advanced neurosurgical procedure delivering electrical stimulation to brain areas targeting movement disorders.",
    keywords: ["brain", "nerve", "stroke", "spine", "seizure", "epilepsy", "parkinson", "tremor"],
    image: "/Specialities icons/Neurology.svg"
  },
  {
    name: "Precision Radiotherapy & Chemotherapy",
    type: "treatment",
    speciality: "Oncology",
    description: "Targeted cancer treatment using precise radiation beams and chemotherapy regimens to eliminate cancer cells.",
    keywords: ["cancer", "tumor", "chemotherapy", "radiation", "biopsy", "leukemia", "lymphoma", "chemo"],
    image: "/Specialities icons/Cancercare.svg"
  },
  {
    name: "Knee & Hip Joint Replacements",
    type: "treatment",
    speciality: "Orthopaedics",
    description: "Minimally invasive surgeries to replace worn-out joint surfaces with artificial implants for pain-free mobility.",
    keywords: ["bone", "joint", "fracture", "knee", "hip", "arthritis", "ligament", "sprain", "replacement"],
    image: "/Specialities icons/Orthopaedics.svg"
  },
  {
    name: "Advanced Gastrointestinal Endoscopy",
    type: "treatment",
    speciality: "Gastroenterology",
    description: "Diagnostic and therapeutic visual scope evaluation of the upper and lower digestive tract organs.",
    keywords: ["stomach", "liver", "digestion", "acidity", "gastric", "endoscopy", "ulcer", "gastro"],
    image: "/Specialities icons/Gastro.svg"
  },
  
  // Health Checkups
  {
    name: "Executive Full Body Health Checkup",
    type: "health_checkup",
    testCount: "84 tests included",
    description: "A comprehensive health screening covering vital organs like liver, kidney, heart, and metabolic parameters.",
    keywords: ["health package", "checkup", "full body", "preventive", "blood test", "screening", "urine test", "ecg", "ultrasound", "package", "health"],
    image: "/Health Checkup/Basic health.png"
  },
  {
    name: "Comprehensive Cardiac Health Package",
    type: "health_checkup",
    testCount: "12 tests included",
    description: "Specialized diagnostics targeting cardiac health, including ECG, lipid profile, and cardiologist consult.",
    keywords: ["heart checkup", "cardiac", "blood test", "ecg", "cholesterol", "lipid profile", "health package", "package", "heart"],
    image: "/Health Checkup/Master health.png"
  },
  {
    name: "Advanced Diabetes Screening Package",
    type: "health_checkup",
    testCount: "15 tests included",
    description: "Monitors blood glucose levels, HbA1c, renal profile, and nerve function for diabetes management.",
    keywords: ["diabetes", "sugar check", "blood test", "hba1c", "glucose", "insulin", "health package", "package"],
    image: "/Health Checkup/Senior Citizen.png"
  },
  
  // Lab Tests
  {
    name: "CBC (Complete Blood Count) Lab Test",
    type: "lab_test",
    testCount: "24 parameters included",
    description: "Evaluates your overall health and detects a wide range of disorders, including anemia and leukemia.",
    keywords: ["cbc", "blood test", "lab test", "hemoglobin", "infection", "anemia", "test"],
    image: "/Health Checkup/Basic health.png"
  },
  {
    name: "Thyroid Profile (T3, T4, TSH) Lab Test",
    type: "lab_test",
    testCount: "3 parameters included",
    description: "Measures the level of thyroid hormones in your blood to diagnose hyperthyroidism or hypothyroidism.",
    keywords: ["thyroid", "tsh", "blood test", "lab test", "hormone", "hypothyroidism", "test"],
    image: "/Health Checkup/Master health.png"
  },
  {
    name: "Lipid Profile (Cholesterol) Lab Test",
    type: "lab_test",
    testCount: "8 parameters included",
    description: "Measures cholesterol and triglycerides to assess cardiovascular health and risk of stroke or heart disease.",
    keywords: ["lipid profile", "cholesterol", "blood test", "lab test", "heart", "triglycerides", "test"],
    image: "/Health Checkup/Senior Citizen.png"
  }
];

const articlesData = [
  {
    name: "Understanding Heart Health: 5 Tips to Keep Your Heart Strong",
    keywords: ["heart", "cardiac", "strong", "healthy", "lifestyle", "angioplasty"],
    image: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=150&h=150&fit=crop&q=80",
    description: "Discover essential lifestyle changes and habits that promote long-term cardiovascular wellness."
  },
  {
    name: "Living with Migraines: Identifying Triggers and Finding Relief",
    keywords: ["migraine", "headache", "brain", "nerve", "seizure", "triggers"],
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=150&h=150&fit=crop&q=80",
    description: "Learn how to track your triggers and explore effective treatments for severe migraine headaches."
  },
  {
    name: "Cancer Care: The Role of Early Screening & Detection",
    keywords: ["cancer", "tumor", "chemo", "screening", "detection"],
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&h=150&fit=crop&q=80",
    description: "Early detection is key. Understand the recommended screening guidelines for different types of cancer."
  },
  {
    name: "Keeping Joints and Bones Healthy in Your Golden Years",
    keywords: ["bone", "joint", "healthy", "aging", "arthritis"],
    image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=150&h=150&fit=crop&q=80",
    description: "Practical advice on nutrition, exercise, and supplements to maintain bone density as you age."
  }
];

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className={styles.highlight}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}


function CountingNumber({ value, suffix = "", duration = 2 }: { value: number, suffix?: string, duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const num = Math.round(latest);
    if (num >= 100000) {
      return (num / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 }) + 'L' + suffix;
    } else if (num >= 1000) {
      return (num / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 }) + 'K' + suffix;
    }
    return num.toLocaleString('en-IN') + suffix;
  });

  useEffect(() => {
    if (isInView) {
      const animation = animate(count, value, { duration, ease: "easeOut" });
      return animation.stop;
    }
  }, [isInView, value, count, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function HeroSearchFirst() {

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdownTab, setActiveDropdownTab] = useState<"doctors_specialities" | "treatments_tests" | "articles">("doctors_specialities");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [currentStatGroup, setCurrentStatGroup] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatGroup(prev => (prev + 1) % STAT_GROUPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const [hasOpened, setHasOpened] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false);
  const [isPulseAnalyzed, setIsPulseAnalyzed] = useState(false);
  const [hasSubmittedQuery, setHasSubmittedQuery] = useState(false);
  const [showGenericMatchesInPulse, setShowGenericMatchesInPulse] = useState(false);
  const [simulatedUserLocation, setSimulatedUserLocation] = useState<"same_city" | "nearby" | "far_away">("same_city");
  const [userCity, setUserCity] = useState("Pune"); // user's home city
  const [cityInputValue, setCityInputValue] = useState("");
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Cities where NH has facilities (nearby city for fallback = first in list closest to user)
  const NH_CITIES = ["Bengaluru", "Mumbai", "Kolkata", "Delhi", "Hyderabad", "Chennai", "Guwahati", "Jaipur", "Kochi"];
  const hasNHInCity = (city: string) => NH_CITIES.some(c => c.toLowerCase() === city.toLowerCase());
  const nearestNHCity = "Mumbai"; // in production this would be geo-calculated
  const [showPixelRipple, setShowPixelRipple] = useState(false);

  // Enhancement states
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [focusedResultIndex, setFocusedResultIndex] = useState(-1);

  const [pulseInitialAction, setPulseInitialAction] = useState<string | null>(null);
  const [pulseInitialActionData, setPulseInitialActionData] = useState<any>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load recent searches from sessionStorage
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("nh_recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
      sessionStorage.setItem("nh_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsOpen(true);
      setHasOpened(true);
    };
    recognition.start();
  };

  // Sync the locations filter dropdown with the selected scenario
  useEffect(() => {
    if (simulatedUserLocation === "nearby") {
      setSelectedLocation("Mumbai");
    } else {
      setSelectedLocation("All Locations");
    }
  }, [simulatedUserLocation]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("isLoggedIn");
      setIsUserLoggedIn(stored !== "false");
    }
    const handleLoginChange = () => {
      const stored = sessionStorage.getItem("isLoggedIn");
      setIsUserLoggedIn(stored !== "false");
    };
    window.addEventListener("login-state-changed", handleLoginChange);
    return () => window.removeEventListener("login-state-changed", handleLoginChange);
  }, []);

  useEffect(() => {
    const handleOpenPulse = () => {
      setHasOpened(true);
      setIsPulseActive(true);
      // Give time for layout to shift before animating content
      setTimeout(() => setIsPulseAnalyzed(true), 300);
      setSearchQuery("");
      setHasSubmittedQuery(false);
    };
    window.addEventListener("openPulseAI", handleOpenPulse);
    return () => window.removeEventListener("openPulseAI", handleOpenPulse);
  }, []);

  const handlePulseLaunchWithAction = (action: string, doctorData: any) => {
    setPulseInitialAction(action);
    setPulseInitialActionData(doctorData);
    setIsPulseActive(true);
  };

  const handleKnowYourHealthClick = (query: string) => {
    setSearchQuery(query);
    if (!isUserLoggedIn) {
      handlePulseLaunchWithAction("require_login_module", { moduleName: "Know your health", query });
    } else {
      setIsPulseActive(true);
    }
  };

  const [showDemoSettings, setShowDemoSettings] = useState(false);

  const isConversational = searchQuery.trim().split(" ").length > 3 || 
                          /have|fever|cough|tomorrow|symptom|feel|pain/i.test(searchQuery.trim());

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPulseActive) {
      document.body.style.overflow = "hidden";
      // Delay ripple slightly to sync with the chat expansion animation (0.4s)
      timer = setTimeout(() => setShowPixelRipple(true), 300);
    } else {
      document.body.style.overflow = "";
      setShowPixelRipple(false);
    }
    return () => {
      document.body.style.overflow = "";
      clearTimeout(timer);
    };
  }, [isPulseActive]);
  const [lastSearch, setLastSearch] = useState<string | null>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll Animation Logic
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "center start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    mass: 1,
    restDelta: 0.001
  });

  // Complete the animation over 100% of the wrapper's extra scroll distance
  const heroScale = useTransform(smoothProgress, [0, 1], [1, 0.85]);
  // Border radius from 0 to 8px
  const heroRadius = useTransform(smoothProgress, [0, 1], ["0px", "16px"]);

  const handleScrollDown = () => {
    const nextSection = document.getElementById("hero-section")?.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  // Load last search from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nh_last_search");
      if (saved) {
        setLastSearch(saved);
      }
    }
  }, []);

  // Reset dropdown tab to Doctors when typing/query changes
  useEffect(() => {
    setActiveDropdownTab("doctors_specialities");
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nh_last_search", query);
        setLastSearch(query);
      }
      saveRecentSearch(query);
      setHasSubmittedQuery(true);
      setIsOpen(true);
    }
  };

  const handleSelectSuggestion = (name: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nh_last_search", name);
      setLastSearch(name);
    }
    saveRecentSearch(name);
    setSearchQuery(name);
    setHasSubmittedQuery(true);
    setIsOpen(true);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { setIsOpen(false); setFocusedResultIndex(-1); }
  };

  // Filter lists based on input (semantic keyword search & exact name match)
  const showDefaults = !searchQuery.trim();
  
  const isDoctorQuery = searchQuery.toLowerCase().includes("dr") || searchQuery.toLowerCase().includes("doctor");

  const filteredDoctors = (showDefaults 
    ? doctorsData.map(doc => ({ ...doc, score: 1 }))
    : doctorsData.map((doc) => {
        const nameMatch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const specMatch = doc.speciality.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = doc.keywords.find((kw) => 
          searchQuery.toLowerCase().includes(kw.toLowerCase())
        );

        return {
          ...doc,
          nameMatch,
          specMatch,
          matchingKeyword,
          score: nameMatch ? 3 : specMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((doc) => doc.score > 0)
      .sort((a, b) => b.score - a.score)
  )
  .filter(doc => selectedLocation === "All Locations" || doc.location === selectedLocation)
  .slice(0, 6);

  const filteredSpecs = showDefaults 
    ? specialitiesData.slice(0, 6).map(spec => ({ ...spec, matchingKeyword: null }))
    : specialitiesData.map((spec) => {
        const nameMatch = spec.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = spec.keywords.find((kw) => 
          searchQuery.toLowerCase().includes(kw.toLowerCase())
        );

        return {
          ...spec,
          nameMatch,
          matchingKeyword,
          score: nameMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((spec) => spec.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

  const filteredTreatments = showDefaults 
    ? treatmentsData.map(t => ({ ...t, matchingKeyword: null }))
    : treatmentsData.map((t) => {
        const nameMatch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = t.keywords.find((kw) => 
          searchQuery.toLowerCase().includes(kw.toLowerCase())
        );

        return {
          ...t,
          nameMatch,
          matchingKeyword,
          score: nameMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((t) => t.score > 0)
      .sort((a, b) => b.score - a.score);

  const filteredOnlyTreatments = filteredTreatments.filter(t => t.type === "treatment").slice(0, 6);
  const filteredHealthCheckups = filteredTreatments.filter(t => t.type === "health_checkup").slice(0, 6);
  const filteredLabTests = filteredTreatments.filter(t => t.type === "lab_test").slice(0, 6);

  const filteredArticles = showDefaults 
    ? articlesData.slice(0, 6).map(a => ({ ...a, matchingKeyword: null }))
    : articlesData.map((a) => {
        const nameMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = a.keywords.find((kw) => 
          searchQuery.toLowerCase().includes(kw.toLowerCase())
        );

        return {
          ...a,
          nameMatch,
          matchingKeyword,
          score: nameMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((a) => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

  const hasSuggestions = filteredDoctors.length > 0 || filteredSpecs.length > 0 || filteredTreatments.length > 0 || filteredArticles.length > 0;

  // Close dropdown on click outside and reset search query
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
  
  return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Control video playback based on search state or Pulse AI state
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    
    if (videoRef.current) {
      if (isOpen || isPulseActive) {
        // Smoothly slow down the video
        let rate = videoRef.current.playbackRate;
        intervalId = setInterval(() => {
          if (videoRef.current && (isOpen || isPulseActive)) {
            rate -= 0.05; // Decrease rate gradually
            if (rate <= 0.1) {
              videoRef.current.pause();
              videoRef.current.playbackRate = 1.0; // reset for next play
              clearInterval(intervalId);
            } else {
              videoRef.current.playbackRate = rate;
            }
          } else {
            clearInterval(intervalId);
          }
        }, 30); // ~600ms total duration
      } else {
        clearInterval(intervalId);
        videoRef.current.playbackRate = 1.0;
        videoRef.current.play().catch((err) => {
          console.log("Playback prevented:", err);
        });
      }
    }
    return () => clearInterval(intervalId);
  }, [isOpen, isPulseActive]);

  return (
    <div ref={containerRef} style={{ height: "130vh", position: "relative", zIndex: isPulseActive ? 9999 : 1, background: "#ffffff" }}>
      <motion.section 
        className={styles.hero} 
        id="hero-section-search-first"
        style={{
          scale: heroScale,
          borderRadius: heroRadius,
        }}
      >
        <video
        ref={videoRef}
        src="/videos/Hero-Video-New.mp4"
        autoPlay
        muted
        loop
        playsInline
        className={styles.bgVideo}
      />
      <div className={`${styles.videoOverlay} ${isOpen && !isPulseActive ? styles.videoOverlayActive : ""}`} />

      <div className={styles.metricsSideWrap}>
        <motion.div 
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={isOpen ? { opacity: 0, y: 20, filter: "blur(8px)", pointerEvents: "none" } : { opacity: 1, y: 0, filter: "blur(0px)", pointerEvents: "auto" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={styles.metricsRow}
        >
          {STAT_GROUPS[currentStatGroup].map((stat, i) => (
            <div className={styles.metricItem} key={i}>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, delay: i * 0.05, ease: "easeOut" }}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <div className={styles.metricValue}>
                    <CountingNumber value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className={styles.metricLabel}>
                    {stat.label.split('\n').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        {idx !== stat.label.split('\n').length - 1 && <br/>}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>

      <div className={styles.centerWrap}>
        <div className={styles.heroStack}>
          <div className={`${styles.titleUnit} ${isOpen ? styles.titleHidden : ""}`}>
            <SplitText text="Trusted Care, Every Day" tag="h1" className={styles.headline} delay={0.08} />
            <motion.p 
              className={styles.subHeadline}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
            >
              Compassion Backed by Expertise
            </motion.p>
            
          </div>

<motion.form
                    ref={searchRef}
                    onSubmit={handleSearch}
                    className={`${styles.searchBarForm} ${isOpen ? styles.searchBarFormActive : ""}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ 
                      opacity: 1, 
                      y: isOpen ? -490 : 0 
                    }}
                    transition={isOpen 
                      ? { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
                      : hasOpened 
                        ? { duration: 0.2, ease: "easeOut" } 
                        : { delay: 0.4, duration: 0.6 }
                    }>
                    {!isPulseActive && (
                      <div className={`${styles.searchContainer} ${isOpen ? styles.searchContainerActive : ""}`}>
                      <div
                        className={`${styles.searchIconWrapper} ${styles.searchIconPulse}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isConversational) {
                            if (!isPulseAnalyzed) {
                              setIsPulseAnalyzed(true);
                            } else {
                              setIsPulseActive(true);
                              setIsOpen(false);
                            }
                          } else {
                            setIsPulseActive(true);
                          }
                        }}
                        title="Open Pulse AI"
                        style={{ cursor: "pointer" }}
                      >
                        <Search className={styles.searchIcon} size={18} />
                      </div>
                      <input
                        id="hero-search-input"
                        type="text"
                        placeholder="Search doctors, specialities, or treatments..."
                        value={searchQuery}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsOpen(true);
                          setHasOpened(true);
                        }}
                        onFocus={() => {
                          setIsOpen(true);
                          setHasOpened(true);
                        }}
                        onKeyDown={handleSearchKeyDown}
                        className={styles.searchInput}
                      />
                      
                      {/* Voice Speech Recognition input button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          startVoiceInput();
                        }}
                        className={`${styles.micButton} ${isListening ? styles.micListening : ""}`}
                        title="Voice Search"
                      >
                        {isListening ? <MicOff size={16} color="#ef4444" /> : <Mic size={16} color="#6b7280" />}
                      </button>

                    </div>
                    )}

                    {/* Intent Classifier Tag */}
                    {isOpen && searchQuery.trim().length >= 2 && (
                      <div className={styles.intentIndicator}>
                        🔍 Smart Search: matching <strong>{detectIntent(searchQuery, doctorsData, specialitiesData)}</strong>
                      </div>
                    )}

                    {/* Progressive Search Dropdown */}
                    <AnimatePresence mode="wait">
                      {isOpen ? (
                        <motion.div
                          key="dropdown"
                          className={styles.dropdown}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          data-lenis-prevent
                        >
                          {/* 🚨 Urgency Detection Banner */}
                          {searchQuery.trim() && isEmergencyQuery(searchQuery) && (
                            <div className={styles.urgencyBanner}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <AlertTriangle size={16} color="#ffffff" style={{ animation: "pulse 1s infinite" }} />
                                <span style={{ fontWeight: 700, fontSize: "12px" }}>
                                  Emergency Alert: If you are experiencing severe symptoms, please contact medical help immediately.
                                </span>
                              </div>
                              <a href="tel:1066" className={styles.urgencyPhone}>
                                <Phone size={11} fill="#ffffff" /> Call NH Emergency: 1066
                              </a>
                            </div>
                          )}

                          {/* Location scenario communication banner */}
                          {searchQuery.trim() && simulatedUserLocation !== "same_city" && (
                            <div style={{ marginBottom: "12px", flexShrink: 0 }}>
                              <div style={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderLeft: `3px solid ${simulatedUserLocation === "nearby" ? "#f97316" : "#6366f1"}`,
                                borderRadius: "8px",
                                padding: "10px 12px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}>
                                {/* Single row: icon + message + two balanced actions */}
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  {/* Icon */}
                                  <div style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: simulatedUserLocation === "nearby" ? "#fff7ed" : "#eef2ff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}>
                                    {simulatedUserLocation === "nearby"
                                      ? <MapPin size={13} color="#f97316" />
                                      : <Video size={13} color="#6366f1" />}
                                  </div>

                                  {/* Message */}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                                      {simulatedUserLocation === "nearby"
                                        ? <>No NH facility in <span style={{ color: "#f97316" }}>{userCity}</span> — showing doctors from <span style={{ color: "#059669" }}>{nearestNHCity}</span></>
                                        : <>Video consultation only — no NH in <span style={{ color: "#6366f1" }}>{userCity}</span></>}
                                    </div>
                                    {/* Inline change city link */}
                                    <button
                                      type="button"
                                      onClick={() => { setShowCityPicker(p => !p); setCityInputValue(""); }}
                                      style={{
                                        background: "none", border: "none", padding: 0,
                                        fontSize: "10px", color: "#6b7280", cursor: "pointer",
                                        textDecoration: "underline", textUnderlineOffset: "2px",
                                        marginTop: "2px", display: "block"
                                      }}
                                    >
                                      {showCityPicker ? "Cancel" : "Not your city? Change it"}
                                    </button>
                                  </div>

                                  {/* Balanced CTAs — ghost + solid */}
                                  <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "center" }}>
                                    {/* Secondary: switch mode */}
                                    <button
                                      type="button"
                                      onClick={() => setSimulatedUserLocation(simulatedUserLocation === "nearby" ? "far_away" : "nearby")}
                                      style={{
                                        background: "transparent",
                                        color: simulatedUserLocation === "nearby" ? "#6366f1" : "#f97316",
                                        border: `1px solid ${simulatedUserLocation === "nearby" ? "#c7d2fe" : "#fed7aa"}`,
                                        borderRadius: "6px",
                                        padding: "4px 10px",
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "3px",
                                      }}
                                    >
                                      {simulatedUserLocation === "nearby"
                                        ? <><Video size={9} /> Video only</>
                                        : <><MapPin size={9} /> See {nearestNHCity}</>}
                                    </button>
                                  </div>
                                </div>

                                {/* City picker — expands inline */}
                                {showCityPicker && (
                                  <div style={{
                                    borderTop: "1px solid #f3f4f6",
                                    paddingTop: "8px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px"
                                  }}>
                                    <input
                                      type="text"
                                      placeholder="Search city…"
                                      value={cityInputValue}
                                      onChange={e => setCityInputValue(e.target.value)}
                                      autoFocus
                                      style={{
                                        width: "100%",
                                        padding: "6px 10px",
                                        borderRadius: "6px",
                                        border: "1px solid #e5e7eb",
                                        fontSize: "11px",
                                        outline: "none",
                                        background: "#f9fafb",
                                        boxSizing: "border-box",
                                        color: "#111827",
                                      }}
                                    />
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                      {[...NH_CITIES, "Pune", "Ahmedabad", "Surat", "Nagpur"]
                                        .filter(c => !cityInputValue || c.toLowerCase().includes(cityInputValue.toLowerCase()))
                                        .map(city => {
                                          const hasNH = hasNHInCity(city);
                                          return (
                                            <button
                                              key={city}
                                              type="button"
                                              onClick={() => {
                                                setUserCity(city);
                                                setShowCityPicker(false);
                                                setSimulatedUserLocation(hasNH ? "same_city" : "nearby");
                                              }}
                                              style={{
                                                padding: "3px 9px",
                                                borderRadius: "20px",
                                                border: "1px solid #e5e7eb",
                                                background: hasNH ? "#f0fdf4" : "#fafafa",
                                                color: hasNH ? "#15803d" : "#374151",
                                                fontSize: "10.5px",
                                                fontWeight: 500,
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                              }}
                                            >
                                              {hasNH
                                                ? <span style={{ fontSize: "9px", color: "#16a34a" }}>●</span>
                                                : <span style={{ fontSize: "9px", color: "#d1d5db" }}>○</span>}
                                              {city}
                                            </button>
                                          );
                                        })}
                                    </div>
                                    <p style={{ fontSize: "9.5px", color: "#9ca3af", margin: 0 }}>
                                      <span style={{ color: "#16a34a" }}>●</span> NH facility available &nbsp;
                                      <span style={{ color: "#d1d5db" }}>○</span> No NH — will show nearest city
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {!searchQuery.trim() ? (
                    <div className={styles.popularSearchesContainer}>
                      {/* Merged Searches (Recent & Popular inline) */}
                      <div className={styles.popularSearches} style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", width: "100%" }}>
                          
                          {/* Recent Tags Section */}
                          {recentSearches.length > 0 && (
                            <>
                              <span className={styles.popularTitle} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                Recent:
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRecentSearches([]);
                                    sessionStorage.removeItem("nh_recent_searches");
                                  }}
                                  style={{
                                    background: "none", border: "none", padding: 0, fontSize: "9px",
                                    color: "#9ca3af", cursor: "pointer", textDecoration: "underline", fontWeight: 500, marginLeft: "4px"
                                  }}
                                >
                                  (clear)
                                </button>
                              </span>
                              <div className={styles.popularTags} style={{ display: "inline-flex", marginRight: "16px" }}>
                                {recentSearches.map((tag) => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => {
                                      setSearchQuery(tag);
                                      setHasSubmittedQuery(true);
                                    }}
                                    className={styles.popularTagBtn}
                                    style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px" }}
                                  >
                                    <Clock size={10} color="#9ca3af" />
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}

                          {/* Popular Tags Section */}
                          <span className={styles.popularTitle}>Trending:</span>
                          <div className={styles.popularTags} style={{ display: "inline-flex" }}>
                            {["chest pain", "cancer", "surgery", "liver"].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  setSearchQuery(tag);
                                  setHasSubmittedQuery(true);
                                }}
                                className={styles.popularTagBtn}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pulse AI Intent-Driven Entry Points */}
                      <div className={styles.dropdownPulseDivider}>
                        <span>Ask Pulse AI Workspace</span>
                      </div>

                      <div className={styles.entryCardsContainer}>
                        {/* Card 1: Find the right doctor */}
                        <div 
                          className={`${styles.entryCard} ${styles.blueThemeCard}`}
                          onClick={() => {
                            setSearchQuery("");
                            setIsPulseActive(true);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div className={styles.entryCardHeader}>
                            <div className={styles.entryCardBannerWrap}>
                              <img 
                                src="/images/pulse-ai/pulse_find_doctor_banner.png" 
                                alt="Find the right doctor" 
                                className={styles.entryCardBannerImg} 
                              />
                            </div>
                            <div className={styles.entryCardMeta}>
                              <h3 className={styles.entryCardTitle}>Find the right doctor</h3>
                              <p className={styles.entryCardSubtitle}>Book the consultation you need</p>
                            </div>
                            <div className={styles.entryCardChevronBtn}>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>

                        {/* Card 2: Know your health */}
                        <div 
                          className={`${styles.entryCard} ${styles.tealThemeCard}`}
                          onClick={() => {
                            handleKnowYourHealthClick("Know your health");
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div className={styles.entryCardHeader}>
                            <div className={styles.entryCardBannerWrap}>
                              <img 
                                src="/images/pulse-ai/pulse_health_insights_banner.png" 
                                alt="Know your health" 
                                className={styles.entryCardBannerImg} 
                              />
                            </div>
                            <div className={styles.entryCardMeta}>
                              <h3 className={styles.entryCardTitle}>Know your health</h3>
                              <p className={styles.entryCardSubtitle}>Get insights from medical history</p>
                            </div>
                            <div className={styles.entryCardChevronBtn}>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isConversational ? (
                        <div className={styles.pulsePreviewWrapper} data-lenis-prevent>
                          {/* 1. Top Section: General search results (Standard Matches) - Only shown before analysis */}
                          {!isPulseAnalyzed && (
                            <div className={styles.pulseGeneralMatches}>
                              <div className={styles.pulsePreviewTitle}>Standard Matches</div>
                              <div className={styles.dropdownTabContent} style={{ maxHeight: "200px" }}>
                                <div className={styles.dropdownSection}>
                                  {/* Speciality matched if any */}
                                  {filteredSpecs.length > 0 && (
                                    <div style={{ marginBottom: "12px" }}>
                                      <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px" }}>Specialities</div>
                                      <div className={styles.specGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                                        {filteredSpecs.map((spec) => (
                                          <div
                                            key={spec.name}
                                            onClick={() => handleSelectSuggestion(spec.name)}
                                            className={styles.specCard}
                                            style={{ padding: "6px 10px" }}
                                          >
                                            <img
                                              src={spec.image || "/Specialities icons/General Medicine.svg"}
                                              alt={spec.name}
                                              className={styles.specImage}
                                              style={{ width: "24px", height: "24px" }}
                                            />
                                            <div className={styles.specName} style={{ fontSize: "12.5px" }}>
                                              <HighlightMatch text={spec.name} query={searchQuery} />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                   {(() => {
                                     const hospitalDoctors = filteredDoctors.filter(doc => {
                                       if (simulatedUserLocation === "far_away") return false;
                                       return doc.consultationModes === "hospital" || doc.consultationModes === "both" || !doc.consultationModes;
                                     });

                                     const videoDoctors = filteredDoctors.filter(doc => {
                                       if (simulatedUserLocation === "far_away") {
                                         return doc.consultationModes === "video" || doc.consultationModes === "both" || !doc.consultationModes;
                                       }
                                       return doc.consultationModes === "video";
                                     });

                                     if (filteredDoctors.length === 0) {
                                       return filteredSpecs.length === 0 ? (
                                         <div className={styles.noResults} style={{ padding: "8px 0" }}>No direct general results found</div>
                                       ) : null;
                                     }

                                     return (
                                       <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "8px" }}>
                                         {hospitalDoctors.length > 0 && (
                                           <div>
                                             <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Building2 size={12} /> Hospital Visit (In-Person){simulatedUserLocation === "nearby" && <span style={{ color: "#f97316", fontWeight: 600, marginLeft: "4px" }}>· Nearest city</span>}
                              </div>
                                             <div className={styles.doctorGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px" }}>
                                               {hospitalDoctors.map((doc) => (
                                                 <div
                                                   key={doc.name}
                                                   onClick={() => handleSelectSuggestion(doc.name)}
                                                   className={styles.doctorCard}
                                                   style={{ padding: "8px 10px" }}
                                                 >
                                                   <img
                                                     src={doc.photo || "/images/misc/doctor_avatar_male.png"}
                                                     alt={doc.name}
                                                     className={styles.doctorPhoto}
                                                     style={{ width: "32px", height: "32px" }}
                                                   />
                                                   <div className={styles.doctorInfo} style={{ width: "100%" }}>
                                                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "8px" }}>
                                                       <div className={styles.doctorName} style={{ fontSize: "13px", fontWeight: 700 }}>
                                                         <HighlightMatch text={doc.name} query={searchQuery} />
                                                       </div>
                                                       {/* Compact Circular Icons */}
                                                       <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                                                         <span title="Hospital Visit Available" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                                                           <Building2 size={10} color="#16a34a" />
                                                         </span>
                                                         {(doc.consultationModes === "both" || !doc.consultationModes) && (
                                                           <span title="Video Consultation Available" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
                                                             <Video size={10} color="#7c3aed" />
                                                           </span>
                                                         )}
                                                       </div>
                                                     </div>
                                                     <div className={styles.doctorSpec} style={{ fontSize: "11px" }}>{doc.speciality}</div>
                                                   </div>
                                                 </div>
                                               ))}
                                             </div>
                                           </div>
                                         )}

                                         {videoDoctors.length > 0 && (
                                           <div>
                                             <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px", color: "#7c3aed", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Video size={12} /> Video Consultation (Online){simulatedUserLocation === "far_away" && <span style={{ color: "#7c3aed", fontWeight: 600, marginLeft: "4px" }}>· Available everywhere</span>}
                              </div>
                                             <div className={styles.doctorGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px" }}>
                                               {videoDoctors.map((doc) => (
                                                 <div
                                                   key={doc.name}
                                                   onClick={() => handleSelectSuggestion(doc.name)}
                                                   className={styles.doctorCard}
                                                   style={{ padding: "8px 10px" }}
                                                 >
                                                   <img
                                                     src={doc.photo || "/images/misc/doctor_avatar_male.png"}
                                                     alt={doc.name}
                                                     className={styles.doctorPhoto}
                                                     style={{ width: "32px", height: "32px" }}
                                                   />
                                                   <div className={styles.doctorInfo} style={{ width: "100%" }}>
                                                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "8px" }}>
                                                       <div className={styles.doctorName} style={{ fontSize: "13px", fontWeight: 700 }}>
                                                         <HighlightMatch text={doc.name} query={searchQuery} />
                                                       </div>
                                                       {/* Compact Circular Icons */}
                                                       <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                                                         {simulatedUserLocation === "far_away" && doc.consultationModes === "hospital" ? (
                                                           <span title="No Online Consultation" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: "#f1f5f9", border: "1px solid #cbd5e1" }}>
                                                             <span style={{ fontSize: "9px" }}>❌</span>
                                                           </span>
                                                         ) : (
                                                           <span title="Video Consultation Available" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
                                                             <Video size={10} color="#7c3aed" />
                                                           </span>
                                                         )}
                                                       </div>
                                                     </div>
                                                     <div className={styles.doctorSpec} style={{ fontSize: "11px" }}>{doc.speciality}</div>
                                                   </div>
                                                 </div>
                                               ))}
                                             </div>
                                           </div>
                                         )}
                                       </div>
                                     );
                                   })()}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. Bottom Section: Pulse AI Preview / Widget (Dynamic based on analysis status) */}
                          {(() => {
                            if (!isPulseAnalyzed) {
                              if (!hasSubmittedQuery) {
                                return null;
                              } else {
                                return (
                                  <div 
                                    className={styles.pulseAIWidgetBox}
                                    style={{ padding: "18px", background: "linear-gradient(135deg, #f5f3ff 0%, #fae8ff 100%)", border: "1px solid #ddd6fe", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", textAlign: "center", marginTop: "12px" }}
                                  >
                                    <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#6b21a8", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                      <Lottie animationData={starAnimation} style={{ width: "28px", height: "28px" }} loop={true} />
                                      <span>Personalize Results with Pulse AI</span>
                                      <Lottie animationData={pulseAnimation} style={{ width: "42px", height: "24px" }} loop={true} />
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#475569", maxWidth: "480px", lineHeight: "1.4" }}>
                                      Want a more customized, personalized diagnostic summary? Let our Pulse AI analyze your symptoms to find matching doctors and care pathways.
                                    </div>
                                    <button
                                      type="button"
                                      className={styles.askPulseAiSubmitBtn}
                                      onClick={() => setIsPulseAnalyzed(true)}
                                      style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", color: "white", border: "none", borderRadius: "9999px", padding: "8px 24px", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)", transition: "all 0.2s" }}
                                    >
                                      Ask Pulse AI
                                    </button>
                                  </div>
                                );
                              }
                            }

                            const response = getRealtimePulseResponse(searchQuery);

                            // IF showGenericMatchesInPulse is true, show MINIMIZED Pulse AI banner + full Standard Matches!
                            if (showGenericMatchesInPulse) {
                              return (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                  {/* Minimized Pulse AI Banner */}
                                  <div 
                                    className={styles.pulseAIPreviewBox}
                                    style={{ padding: "10px 14px", background: "linear-gradient(135deg, #f5f3ff 0%, #fae8ff 100%)", border: "1px solid #ddd6fe", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <Lottie animationData={starAnimation} style={{ width: "20px", height: "20px" }} loop={true} />
                                      <span style={{ fontSize: "12.5px", fontWeight: 750, color: "#6b21a8" }}>
                                        Pulse AI Curated Match: {response.suggestedSpec} Specialist Recommended ({response.suggestedDoc.name})
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowGenericMatchesInPulse(false);
                                      }}
                                      style={{ background: "white", border: "1px solid #7c3aed", borderRadius: "9999px", padding: "4px 12px", fontSize: "11px", fontWeight: 700, color: "#7c3aed", cursor: "pointer", boxShadow: "0 2px 6px rgba(124, 58, 237, 0.15)" }}
                                    >
                                      View Full Curated Match
                                    </button>
                                  </div>

                                  {/* Standard Matches Section */}
                                  <div className={styles.pulseGeneralMatches}>
                                    <div className={styles.pulsePreviewTitle}>Standard Matches</div>
                                    <div className={styles.dropdownTabContent} style={{ maxHeight: "200px" }}>
                                      <div className={styles.dropdownSection}>
                                        {/* Speciality matched if any */}
                                        {filteredSpecs.length > 0 && (
                                          <div style={{ marginBottom: "12px" }}>
                                            <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px" }}>Specialities</div>
                                            <div className={styles.specGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                                              {filteredSpecs.map((spec) => (
                                                <div
                                                  key={spec.name}
                                                  onClick={() => handleSelectSuggestion(spec.name)}
                                                  className={styles.specCard}
                                                  style={{ padding: "6px 10px" }}
                                                >
                                                  <img
                                                    src={spec.image || "/Specialities icons/General Medicine.svg"}
                                                    alt={spec.name}
                                                    className={styles.specImage}
                                                    style={{ width: "24px", height: "24px" }}
                                                  />
                                                  <div className={spec.name} style={{ fontSize: "12.5px" }}>
                                                    <HighlightMatch text={spec.name} query={searchQuery} />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Doctors matched if any */}
                                        {filteredDoctors.length > 0 ? (
                                          <div>
                                            <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px" }}>Doctors</div>
                                            <div className={styles.doctorGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                                              {filteredDoctors.map((doc) => (
                                                <div
                                                  key={doc.name}
                                                  onClick={() => handleSelectSuggestion(doc.name)}
                                                  className={styles.doctorCard}
                                                  style={{ padding: "8px 10px" }}
                                                >
                                                  <img
                                                    src={doc.photo || "/images/misc/doctor_avatar_male.png"}
                                                    alt={doc.name}
                                                    className={styles.doctorPhoto}
                                                    style={{ width: "32px", height: "32px" }}
                                                  />
                                                  <div className={styles.doctorInfo} style={{ width: "100%" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", gap: "8px" }}>
                                                      <div className={styles.doctorName} style={{ fontSize: "13px", fontWeight: 700 }}>
                                                        <HighlightMatch text={doc.name} query={searchQuery} />
                                                      </div>
                                                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 0 }}>
                                                        {(simulatedUserLocation === "same_city" || simulatedUserLocation === "nearby") && (doc.consultationModes === "hospital" || doc.consultationModes === "both" || !doc.consultationModes) && (
                                                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "9px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 5px", borderRadius: "4px", whiteSpace: "nowrap" }}>
                                                            <Building2 size={9} /> Hosp {simulatedUserLocation === "nearby" ? "(65km)" : ""}
                                                          </span>
                                                        )}
                                                        {(doc.consultationModes === "video" || doc.consultationModes === "both" || !doc.consultationModes) && (
                                                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "9px", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "1px 5px", borderRadius: "4px", whiteSpace: "nowrap" }}>
                                                            <Video size={9} /> Online
                                                          </span>
                                                        )}
                                                        {simulatedUserLocation === "far_away" && doc.consultationModes === "hospital" && (
                                                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "9px", fontWeight: 700, color: "#94a3b8", background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "1px 5px", borderRadius: "4px", whiteSpace: "nowrap" }}>
                                                            ❌ No Online
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div className={styles.doctorSpec} style={{ fontSize: "11px" }}>{doc.speciality}</div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ) : (
                                          filteredSpecs.length === 0 && (
                                            <div className={styles.noResults} style={{ padding: "8px 0" }}>No direct general results found</div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            // Full Pulse AI recommendations view
                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div 
                                  className={`${styles.pulseAIPreviewBox} ${styles.pulseAIPreviewBoxAnalyzed}`}
                                >
                                  <div className={styles.pulsePreviewHeaderRow}>
                                    <div className={styles.pulsePreviewBadge}>
                                      <Lottie animationData={starAnimation} className={styles.pulsePreviewLottie} loop={true} />
                                      {isUserLoggedIn ? (
                                        <span className={styles.pulseAnalyzedBadgeTitle}>🔥 PULSE AI CURATED MATCH</span>
                                      ) : (
                                        <span className={styles.pulseAnalyzedBadgeTitle} style={{ color: "#0891b2" }}>✨ PULSE AI SPECIALIST RECOMMENDATIONS</span>
                                      )}
                                    </div>
                                    {isUserLoggedIn ? (
                                      <div className={styles.pulsePreviewTag} style={{ color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe" }}>Curated Live</div>
                                    ) : (
                                      <div className={styles.pulsePreviewTag} style={{ color: "#0891b2", background: "#ecfeff", border: "1px solid #a5f3fc" }}>Specialists matched</div>
                                    )}
                                  </div>

                                  {simulatedUserLocation === "far_away" && (
                                    <div 
                                      style={{
                                        padding: "10px 14px",
                                        background: "#fff1f2",
                                        border: "1px solid #fecdd3",
                                        borderRadius: "8px",
                                        color: "#be123c",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        marginTop: "8px",
                                        marginBottom: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px"
                                      }}
                                    >
                                      ⚠️ No physical Narayana Health facilities within 100km of your area. Online Video Consultation mode is active.
                                    </div>
                                  )}

                                  {simulatedUserLocation === "nearby" && (
                                    <div 
                                      style={{
                                        padding: "10px 14px",
                                        background: "#fff7ed",
                                        border: "1px solid #ffedd5",
                                        borderRadius: "8px",
                                        color: "#c2410c",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        marginTop: "8px",
                                        marginBottom: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px"
                                      }}
                                    >
                                      📍 No direct hospitals in your city. Found matching specialists nearby (within 100km). Hospital Visit is available.
                                    </div>
                                  )}

                                  {isUserLoggedIn ? (
                                    <>
                                      <div className={styles.pulsePreviewEmpathy}>
                                        &ldquo;{response.empathy}&rdquo;
                                      </div>

                                      <div className={styles.pulsePreviewRecommendedDoc}>
                                        <img 
                                          src={response.suggestedDoc.photo} 
                                          alt={response.suggestedDoc.name} 
                                          className={styles.pulsePreviewDocPhoto} 
                                        />
                                        <div className={styles.pulsePreviewDocDetails}>
                                          <div className={styles.pulsePreviewBestMatchTag}>
                                            ✨ Best Match / Recommended Specialist
                                          </div>
                                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                                            <div className={styles.pulsePreviewDocName}>
                                              {response.suggestedDoc.name}
                                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                                {(simulatedUserLocation === "same_city" || simulatedUserLocation === "nearby") && 
                                                 (response.suggestedDoc.consultationModes === "hospital" || response.suggestedDoc.consultationModes === "both" || !response.suggestedDoc.consultationModes) && (
                                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "9px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 6px", borderRadius: "4px" }}>
                                                    <Building2 size={9} /> Hospital Visit {simulatedUserLocation === "nearby" ? "(65km)" : ""}
                                                  </span>
                                                )}
                                                {(response.suggestedDoc.consultationModes === "video" || response.suggestedDoc.consultationModes === "both" || !response.suggestedDoc.consultationModes) && (
                                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "9px", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "1px 6px", borderRadius: "4px" }}>
                                                    <Video size={9} /> Video Consult
                                                  </span>
                                                )}
                                                {simulatedUserLocation === "far_away" && response.suggestedDoc.consultationModes === "hospital" && (
                                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "9px", fontWeight: 700, color: "#94a3b8", background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "1px 6px", borderRadius: "4px" }}>
                                                    ❌ No Online
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className={styles.pulsePreviewDocSub}>
                                            {response.suggestedSpec} • {response.suggestedDoc.hospital}
                                          </div>
                                          <div className={styles.pulsePreviewDocSlot}>
                                            Next Slot: <strong>{response.slot}</strong>
                                          </div>
                                        </div>
                                        <div className={styles.pulsePreviewActions}>
                                          <button 
                                            className={styles.pulsePreviewBookBtn}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePulseLaunchWithAction("book_now", response.suggestedDoc);
                                            }}
                                          >
                                            Book Now
                                          </button>
                                          <button 
                                            className={styles.pulsePreviewModifyBtn}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePulseLaunchWithAction("book_now", response.suggestedDoc);
                                            }}
                                          >
                                            Modify &amp; Book
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className={styles.pulsePreviewEmpathy} style={{ color: "#475569", fontWeight: 500 }}>
                                        We found 3 highly qualified <strong>{response.suggestedSpec}</strong> specialists matching your symptoms. Select a doctor to review slots:
                                      </div>

                                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                                        {response.recommendedDocs.map((doc: any) => (
                                          <div 
                                            key={doc.id}
                                            className={styles.pulsePreviewRecommendedDoc} 
                                            style={{ border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: "10px", background: "#f8fafc", margin: 0 }}
                                          >
                                            <img 
                                              src={doc.photo} 
                                              alt={doc.name} 
                                              className={styles.pulsePreviewDocPhoto} 
                                              style={{ width: "42px", height: "42px" }}
                                            />
                                            <div className={styles.pulsePreviewDocDetails}>
                                              <div className={styles.pulsePreviewDocName} style={{ fontSize: "14px", fontWeight: 700 }}>
                                                {doc.name}
                                              </div>
                                              <div className={styles.pulsePreviewDocSub} style={{ fontSize: "12px", color: "#64748b" }}>
                                                {doc.qualification} • {doc.hospital}
                                              </div>
                                              <div className={styles.pulsePreviewDocSlot} style={{ fontSize: "12.5px" }}>
                                                Next Slot: <strong style={{ color: "#0891b2" }}>{doc.slot}</strong>
                                              </div>
                                            </div>
                                            <div className={styles.pulsePreviewActions}>
                                              <button 
                                                className={styles.pulsePreviewBookBtn}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handlePulseLaunchWithAction("book_now", doc);
                                                }}
                                                style={{ padding: "6px 14px", fontSize: "12px" }}
                                              >
                                                Book Now
                                              </button>
                                              <button 
                                                className={styles.pulsePreviewModifyBtn}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handlePulseLaunchWithAction("book_now", doc);
                                                }}
                                                style={{ padding: "6px 14px", fontSize: "12px" }}
                                              >
                                                View Slots
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  )}

                                  {/* Secondary alternate search options section */}
                                  <div className={styles.pulsePreviewSecondarySection}>
                                    <div className={styles.pulseSecondaryTitle}>
                                      <span>✨ If you are looking for something else</span>
                                    </div>
                                    <div className={styles.pulseSecondaryActionsRow}>
                                      <div className={styles.pulseSecondaryChips}>
                                        <button 
                                          className={styles.pulseSecondaryChip}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchQuery("I have been having ");
                                            setIsPulseActive(true);
                                            setIsOpen(false);
                                          }}
                                        >
                                          I have a symptom
                                        </button>
                                        <button 
                                          className={styles.pulseSecondaryChip}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchQuery("I am looking for a ");
                                            setIsPulseActive(true);
                                            setIsOpen(false);
                                          }}
                                        >
                                          I know the speciality
                                        </button>
                                        <button 
                                          className={styles.pulseSecondaryChip}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchQuery("I want to consult Dr. ");
                                            setIsPulseActive(true);
                                            setIsOpen(false);
                                          }}
                                        >
                                          I know the doctor
                                        </button>
                                      </div>
                                      <button 
                                        className={styles.pulseViewAllDocsBtn}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsPulseActive(true);
                                        }}
                                      >
                                        View all recommended doctors →
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Collapsible option to view generic Standard Matches */}
                                <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowGenericMatchesInPulse(true);
                                    }}
                                    style={{
                                      background: "transparent",
                                      border: "1px solid #cbd5e1",
                                      color: "#64748b",
                                      padding: "6px 14px",
                                      borderRadius: "9999px",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      transition: "all 0.15s ease"
                                    }}
                                  >
                                    Show Standard Matches ▾
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <>
                          {/* Tabs Selector at the top */}
                          <div className={styles.dropdownTabs}>
                            <div className={styles.dropdownTabButtons}>
                              <button
                                type="button"
                                onClick={() => setActiveDropdownTab("doctors_specialities")}
                                className={`${styles.dropdownTab} ${activeDropdownTab === "doctors_specialities" ? styles.activeTab : ""}`}
                              >
                                Appointments ({filteredDoctors.length + filteredSpecs.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveDropdownTab("treatments_tests")}
                                className={`${styles.dropdownTab} ${activeDropdownTab === "treatments_tests" ? styles.activeTab : ""}`}
                              >
                                Treatments & Tests ({filteredTreatments.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveDropdownTab("articles")}
                                className={`${styles.dropdownTab} ${activeDropdownTab === "articles" ? styles.activeTab : ""}`}
                              >
                                Articles ({filteredArticles.length})
                              </button>
                            </div>

                            {activeDropdownTab === "doctors_specialities" && simulatedUserLocation === "same_city" && (
                              <div className={styles.dropdownLocationFilter}>
                                <MapPin size={14} className={styles.locationPinIcon} />
                                <select
                                  value={selectedLocation}
                                  onChange={(e) => setSelectedLocation(e.target.value)}
                                  className={styles.locationDropdownSelect}
                                >
                                  <option value="All Locations">All Locations</option>
                                  {Array.from(new Set(doctorsData.map((d) => d.location))).map((loc) => (
                                    <option key={loc} value={loc}>
                                      {loc}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          <div className={styles.dropdownTabContent} data-lenis-prevent>
                            {activeDropdownTab === "doctors_specialities" && (
                              <div className={styles.dropdownSection} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {/* Doctors Section */}
                                {filteredDoctors.length > 0 && (
                                  (() => {
                                    const hospitalDoctors = filteredDoctors.filter(doc => {
                                      if (simulatedUserLocation === "far_away") return false;
                                      return doc.consultationModes === "hospital" || doc.consultationModes === "both" || !doc.consultationModes;
                                    });

                                    const videoDoctors = filteredDoctors.filter(doc => {
                                      if (simulatedUserLocation === "far_away") {
                                        return doc.consultationModes === "video" || doc.consultationModes === "both" || !doc.consultationModes;
                                      }
                                      return doc.consultationModes === "video";
                                    });

                                    return (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {hospitalDoctors.length > 0 && (
                                          <div>
                                            <div className={styles.sectionHeader} style={{ color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                                              <Building2 size={13} /> Hospital Visit (In-Person)
                                            </div>
                                            <div className={styles.doctorGrid}>
                                              {hospitalDoctors.map((doc) => (
                                                <div
                                                  key={doc.name}
                                                  onClick={() => handleSelectSuggestion(doc.name)}
                                                  className={styles.doctorCard}
                                                >
                                                  <img
                                                    src={doc.photo || "/images/misc/doctor_avatar_male.png"}
                                                    alt={doc.name}
                                                    className={styles.doctorPhoto}
                                                  />
                                                  <div className={styles.doctorInfo} style={{ width: "100%" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "8px" }}>
                                                      <div className={styles.doctorName}>
                                                        <HighlightMatch text={doc.name} query={searchQuery} />
                                                      </div>
                                                      <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                                                        <span title="Hospital Visit Available" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                                                          <Building2 size={10} color="#16a34a" />
                                                        </span>
                                                        {(doc.consultationModes === "both" || !doc.consultationModes) && (
                                                          <span title="Video Consultation Available" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
                                                            <Video size={10} color="#7c3aed" />
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div className={styles.doctorSpec}>{doc.speciality}</div>
                                                    <div className={styles.doctorLoc}>
                                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.locIcon}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                      <span>
                                                        {doc.hospital}
                                                        {doc.additionalHospitals && (
                                                          <span className={styles.plusMoreBadge}> +{doc.additionalHospitals}</span>
                                                        )}
                                                      </span>
                                                    </div>
                                                    {doc.nextAvailable && (
                                                      <div className={styles.availabilityChip}>
                                                        <Calendar size={10} /> Next slot: {doc.nextAvailable}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {videoDoctors.length > 0 && (
                                          <div>
                                            <div className={styles.sectionHeader} style={{ color: "#7c3aed", display: "flex", alignItems: "center", gap: "4px" }}>
                                              <Video size={13} /> Video Consultation (Online)
                                            </div>
                                            <div className={styles.doctorGrid}>
                                              {videoDoctors.map((doc) => (
                                                <div
                                                  key={doc.name}
                                                  onClick={() => handleSelectSuggestion(doc.name)}
                                                  className={styles.doctorCard}
                                                >
                                                  <img
                                                    src={doc.photo || "/images/misc/doctor_avatar_male.png"}
                                                    alt={doc.name}
                                                    className={styles.doctorPhoto}
                                                  />
                                                  <div className={styles.doctorInfo} style={{ width: "100%" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "8px" }}>
                                                      <div className={styles.doctorName}>
                                                        <HighlightMatch text={doc.name} query={searchQuery} />
                                                      </div>
                                                      <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                                                        {simulatedUserLocation === "far_away" && doc.consultationModes === "hospital" ? (
                                                          <span title="No Online Consultation" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: "#f1f5f9", border: "1px solid #cbd5e1" }}>
                                                            <span style={{ fontSize: "9px" }}>❌</span>
                                                          </span>
                                                        ) : (
                                                          <span title="Video Consultation Available" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
                                                            <Video size={10} color="#7c3aed" />
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div className={styles.doctorSpec}>{doc.speciality}</div>
                                                    <div className={styles.doctorLoc}>
                                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.locIcon}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                      <span>
                                                        {doc.hospital}
                                                        {doc.additionalHospitals && (
                                                          <span className={styles.plusMoreBadge}> +{doc.additionalHospitals}</span>
                                                        )}
                                                      </span>
                                                    </div>
                                                    {doc.nextAvailable && (
                                                      <div className={styles.availabilityChip} style={{ background: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" }}>
                                                        <Video size={10} /> Next slot: {doc.nextAvailable}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()
                                )}

                                {/* Specialities Section */}
                                {filteredSpecs.length > 0 && (
                                  <div>
                                    <div className={styles.sectionHeader}>Specialities</div>
                                    <div className={styles.specGrid}>
                                      {filteredSpecs.map((spec) => (
                                        <div
                                          key={spec.name}
                                          onClick={() => handleSelectSuggestion(spec.name)}
                                          className={styles.specCard}
                                        >
                                          <img
                                            src={spec.image || "/Specialities icons/General Medicine.svg"}
                                            alt={spec.name}
                                            className={styles.specImage}
                                          />
                                          <div className={styles.specInfo} style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                            <div className={styles.specName}>
                                              <HighlightMatch text={spec.name} query={searchQuery} />
                                            </div>
                                            {spec.matchingKeyword && (
                                              <div style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                Relates to: <HighlightMatch text={spec.matchingKeyword} query={searchQuery} />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {filteredDoctors.length === 0 && filteredSpecs.length === 0 && (
                                  <div className={styles.noResults}>No matching doctors or specialities found</div>
                                )}
                              </div>
                            )}

                            {activeDropdownTab === "treatments_tests" && (
                              <div className={styles.dropdownSection} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {/* Health Checkup Packages Section */}
                                {filteredHealthCheckups.length > 0 && (
                                  <div>
                                    <div className={styles.sectionHeader}>Health Checkup Packages</div>
                                    <div className={styles.treatmentGrid}>
                                      {filteredHealthCheckups.map((t) => (
                                        <div
                                          key={t.name}
                                          onClick={() => handleSelectSuggestion(t.name)}
                                          className={styles.treatmentCard}
                                        >
                                          {t.image && (
                                            <img
                                              src={t.image}
                                              alt={t.name}
                                              className={styles.treatmentImage}
                                            />
                                          )}
                                          <div className={styles.treatmentInfo}>
                                            <div className={styles.treatmentHeader}>
                                              <div className={styles.treatmentName}>
                                                <HighlightMatch text={t.name} query={searchQuery} />
                                              </div>
                                              <div style={{ fontSize: '10.5px', color: 'var(--color-primary, #034EA2)', fontWeight: 500 }}>
                                                {t.testCount}
                                              </div>
                                            </div>
                                            <div className={styles.treatmentDesc}>{t.description}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Lab Tests Section */}
                                {filteredLabTests.length > 0 && (
                                  <div>
                                    <div className={styles.sectionHeader}>Lab Tests</div>
                                    <div className={styles.treatmentGrid}>
                                      {filteredLabTests.map((t) => (
                                        <div
                                          key={t.name}
                                          onClick={() => handleSelectSuggestion(t.name)}
                                          className={styles.treatmentCard}
                                        >
                                          {t.name.includes("CBC") ? (
                                            <div className={styles.labIconWrap} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}>
                                              <Droplets size={20} />
                                            </div>
                                          ) : t.name.includes("Thyroid") ? (
                                            <div className={styles.labIconWrap} style={{ backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#A855F7" }}>
                                              <FlaskConical size={20} />
                                            </div>
                                          ) : (
                                            <div className={styles.labIconWrap} style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
                                              <Activity size={20} />
                                            </div>
                                          )}
                                          <div className={styles.treatmentInfo}>
                                            <div className={styles.treatmentHeader}>
                                              <div className={styles.treatmentName}>
                                                <HighlightMatch text={t.name} query={searchQuery} />
                                              </div>
                                              <div style={{ fontSize: '10.5px', color: 'var(--color-primary, #034EA2)', fontWeight: 500 }}>
                                                {t.testCount}
                                              </div>
                                            </div>
                                            <div className={styles.treatmentDesc}>{t.description}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Treatments Section */}
                                {filteredOnlyTreatments.length > 0 && (
                                  <div>
                                    <div className={styles.sectionHeader}>Treatments</div>
                                    <div className={styles.treatmentGrid}>
                                      {filteredOnlyTreatments.map((t) => (
                                        <div
                                          key={t.name}
                                          onClick={() => handleSelectSuggestion(t.name)}
                                          className={styles.treatmentCard}
                                        >
                                          {t.image && (
                                            <img
                                              src={t.image}
                                              alt={t.name}
                                              className={styles.treatmentImage}
                                            />
                                          )}
                                          <div className={styles.treatmentInfo}>
                                            <div className={styles.treatmentHeader}>
                                              <div className={styles.treatmentName}>
                                                <HighlightMatch text={t.name} query={searchQuery} />
                                              </div>
                                              <div style={{ fontSize: '10.5px', color: 'var(--color-primary, #034EA2)', fontWeight: 500 }}>
                                                Related to: <HighlightMatch text={t.speciality ?? ""} query={searchQuery} />
                                              </div>
                                            </div>
                                            <div className={styles.treatmentDesc}>{t.description}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {filteredTreatments.length === 0 && (
                                  <div className={styles.noResults}>No matching treatments, packages or tests found</div>
                                )}
                              </div>
                            )}

                            {activeDropdownTab === "articles" && (
                              <div className={styles.dropdownSection}>
                                {filteredArticles.length > 0 ? (
                                  filteredArticles.map((a) => (
                                    <div
                                      key={a.name}
                                      onClick={() => handleSelectSuggestion(a.name)}
                                      className={styles.treatmentCard}
                                    >
                                      {a.image ? (
                                        <img
                                          src={a.image}
                                          alt={a.name}
                                          className={styles.articleImage}
                                        />
                                      ) : (
                                        <div className={styles.itemIconWrap}>
                                          <FileText size={14} />
                                        </div>
                                      )}
                                      <div className={styles.treatmentInfo}>
                                        <div className={styles.treatmentHeader}>
                                          <div className={styles.treatmentName}>
                                            <HighlightMatch text={a.name} query={searchQuery} />
                                          </div>
                                          {a.matchingKeyword && (
                                            <div style={{ fontSize: "10.5px", color: "var(--color-primary, #034EA2)", fontWeight: 500 }}>
                                              Relates to: <HighlightMatch text={a.matchingKeyword} query={searchQuery} />
                                            </div>
                                          )}
                                        </div>
                                        {a.description && (
                                          <div className={styles.treatmentDesc}>
                                            {a.description}
                                          </div>
                                        )}
                                      </div>
                                      {lastSearch && lastSearch.toLowerCase() === a.name.toLowerCase() && (
                                        <span className={styles.itemTag}>Last Searched</span>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className={styles.noResults}>No matching articles found</div>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.form>



        </div>
      </div>

      <div className={styles.pulseShellAnchor}>
        <div className={styles.pulseShell}>
          <div className={styles.pulseInner}>
            <div className={styles.pulseCenterUnit}>
              <div
                className={`${styles.logoGlow} ${prefersReducedMotion ? styles.logoGlowStatic : ""}`}
                aria-hidden
              />
              <div className={styles.pulseLogoUnit}>
                <img src="/images/pulse-ai/pulse-ai.png" alt="Pulse AI" className={styles.pulseLogoImg} />
              </div>
              <div className={styles.pulseTextUnit}>
                <div className={styles.pulseTitle}>Ask Pulse AI</div>
                <p className={styles.pulseDescription}>Describe your symptoms, or ask a question..</p>
                <p className={styles.pulseVersion}>v1.0</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      <AnimatePresence>
        {mounted && isPulseActive && typeof document !== "undefined" && createPortal(
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "auto" }}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ position: "absolute", inset: 0, background: "rgba(11, 15, 25, 0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} 
            />
            <PixelRipple trigger={showPixelRipple} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
              <PulseAIWorkspace 
                initialQuery={pulseInitialAction ? "" : searchQuery}
                initialAction={pulseInitialAction}
                initialActionData={pulseInitialActionData}
                onClose={() => {
                  setIsPulseActive(false);
                  setPulseInitialAction(null);
                  setPulseInitialActionData(null);
                }}
              />
            </div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* Floating Gear Button & Panel */}
      {mounted && (
        <div style={{ position: "fixed", right: "24px", top: "50%", transform: "translateY(-50%)", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
          <button
            type="button"
            onClick={() => setShowDemoSettings(!showDemoSettings)}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255, 255, 255, 0.8)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Settings size={24} style={{ transform: showDemoSettings ? "rotate(90deg)" : "none", transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }} />
          </button>

          <AnimatePresence>
            {showDemoSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  background: "rgba(15, 23, 42, 0.95)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "16px",
                  width: "240px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  color: "#ffffff"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#94a3b8" }}>
                  Scenario Control
                </div>
                <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { id: "same_city", label: "Same City", desc: "Local clinics & visits", color: "#10b981" },
                    { id: "nearby", label: "Nearby (100km)", desc: "Simulate nearest city", color: "#f97316" },
                    { id: "far_away", label: "Far Away (Video)", desc: "Online video consults only", color: "#8b5cf6" }
                  ].map((scen) => {
                    const active = simulatedUserLocation === scen.id;
                    return (
                      <button
                        key={scen.id}
                        type="button"
                        onClick={() => setSimulatedUserLocation(scen.id as any)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          background: active ? "rgba(255, 255, 255, 0.12)" : "transparent",
                          border: active ? `1px solid ${scen.color}` : "1px solid transparent",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          outline: "none"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: scen.color }} />
                          <span style={{ fontSize: "12px", fontWeight: 700, color: active ? "#ffffff" : "#cbd5e1" }}>{scen.label}</span>
                        </div>
                        <div style={{ fontSize: "10px", color: "#64748b", marginLeft: "16px", marginTop: "2px" }}>{scen.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      </motion.section>
    </div>
  );
}
