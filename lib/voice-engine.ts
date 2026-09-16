// ─────────────────────────────────────────────────────────────────────────────
// HUMANIZED VOICE ENGINE & NEURAL SPEECH CONDUCTOR
// Implements the Four Laws of Human Speech:
// 1. The Pacing Rule (Deliberate 0.90x-0.95x cadence)
// 2. The Structural Pause Rule (Breaths, 1.2-1.5s heading pauses, 800ms paragraph pauses)
// 3. Pitch & Emphasis Modulation (Calm intensity over volume)
// 4. Phonetic Abbreviation & Engineering Unit Expansion
// ─────────────────────────────────────────────────────────────────────────────

export interface VoicePersona {
  id: string;
  name: string;
  role: string;
  gender: "female" | "male";
  accent: "Indian English (IN)" | "British" | "American" | "Studio Master";
  description: string;
  avatar: string;
  pitch: number;
  rate: number;
  pauseScale: number;
  voiceKeywords: string[];
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: "ananya",
    name: "Dr. Ananya Sharma",
    role: "Lead Lyophilization Scientist",
    gender: "female",
    accent: "Indian English (IN)",
    description: "Fluent, articulate Indian English woman with warm academic poise and natural conversational rhythm.",
    avatar: "👩🏽‍🔬",
    pitch: 1.0,
    rate: 0.90,
    pauseScale: 1.15,
    voiceKeywords: [
      "en-in",
      "neerja",
      "heera",
      "veena",
      "ananya",
      "kavya",
      "priya",
      "swara",
      "english (india)",
      "english india",
      "google english (india)",
      "lekha",
      "sangeeta",
    ],
  },
  {
    id: "rajesh",
    name: "Prof. Rajesh Ramanathan",
    role: "Thermal & Process Systems Chair",
    gender: "male",
    accent: "Indian English (IN)",
    description: "Deep, methodical Indian English adult male cadence with crystal-clear engineering precision.",
    avatar: "👨🏽‍🏫",
    pitch: 0.90,
    rate: 0.92,
    pauseScale: 1.2,
    voiceKeywords: [
      "en-in",
      "prabhat",
      "rishi",
      "english (india)",
      "english india",
      "google english (india) male",
      "heera",
    ],
  },
  {
    id: "elena",
    name: "Dr. Elena Vance",
    role: "Senior Process Fellow",
    gender: "female",
    accent: "British",
    description: "Calm, deliberate, European academic cadence with gentle landings.",
    avatar: "👩‍🔬",
    pitch: 0.96,
    rate: 0.90,
    pauseScale: 1.2,
    voiceKeywords: [
      "libby",
      "sonia",
      "hazel",
      "george",
      "en-gb",
      "united kingdom",
      "british",
      "google uk english female",
      "serena",
    ],
  },
  {
    id: "marcus",
    name: "Marcus Aurel",
    role: "Chief Process Architect",
    gender: "male",
    accent: "American",
    description: "Deep, warm baritone. Authoritative and grounded in engineering first principles.",
    avatar: "👨‍💼",
    pitch: 0.86,
    rate: 0.92,
    pauseScale: 1.1,
    voiceKeywords: [
      "guy",
      "christopher",
      "ryan",
      "david",
      "mark",
      "google us english male",
      "en-us",
      "english united states",
      "daniel",
    ],
  },
  {
    id: "seraphina",
    name: "Seraphina Lin",
    role: "Pharma GMP Compliance Director",
    gender: "female",
    accent: "American",
    description: "Warm, soothing, crystal-clear tone. Ideal for deep focus and study.",
    avatar: "👩‍🏫",
    pitch: 1.02,
    rate: 0.89,
    pauseScale: 1.25,
    voiceKeywords: [
      "aria",
      "jenny",
      "samantha",
      "victoria",
      "en-us",
      "google us english female",
      "natural",
      "female",
    ],
  },
];

export const DEFAULT_PERSONA = VOICE_PERSONAS[0];

export interface SpeechChunk {
  rawText: string;
  text: string;
  pauseAfterMs: number;
  type: "heading" | "paragraph" | "sentence" | "formula" | "bullet";
  emphasis?: boolean;
}

/**
 * Phonetically expands engineering acronyms, abbreviations, and formulas
 * so TTS doesn't stumble or speak robotic alphabet soup.
 */
export function humanizeEngineeringText(raw: string): string {
  let t = raw;

  // Clean markdown links, images, tables
  t = t.replace(/!\[.*?\]\(.*?\)/g, "");
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  t = t.replace(/```[\s\S]*?```/g, ""); // Code blocks handled separately
  t = t.replace(/^\|.*\|$/gm, ""); // Remove raw markdown tables

  // Phonetic expansions
  const substitutions: [RegExp, string][] = [
    // Chapter numbers to clear English words
    [/\bCh(?:apter)?\s*0?0\b/gi, "Chapter Zero"],
    [/\bCh(?:apter)?\s*0?1\b/gi, "Chapter One"],
    [/\bCh(?:apter)?\s*0?2\b/gi, "Chapter Two"],
    [/\bCh(?:apter)?\s*0?3\b/gi, "Chapter Three"],
    [/\bCh(?:apter)?\s*0?4\b/gi, "Chapter Four"],
    [/\bCh(?:apter)?\s*0?5\b/gi, "Chapter Five"],
    [/\bCh(?:apter)?\s*0?6\b/gi, "Chapter Six"],
    [/\bCh(?:apter)?\s*0?7\b/gi, "Chapter Seven"],
    [/\bCh(?:apter)?\s*0?8\b/gi, "Chapter Eight"],
    [/\bCh(?:apter)?\s*0?9\b/gi, "Chapter Nine"],
    [/\bCh(?:apter)?\s*10\b/gi, "Chapter Ten"],
    [/\bCh(?:apter)?\s*11\b/gi, "Chapter Eleven"],
    [/\bCh(?:apter)?\s*12\b/gi, "Chapter Twelve"],
    [/\bCh(?:apter)?\s*13\b/gi, "Chapter Thirteen"],
    [/\bCh(?:apter)?\s*14\b/gi, "Chapter Fourteen"],
    [/\bCh(?:apter)?\s*15\b/gi, "Chapter Fifteen"],
    [/\bCh(?:apter)?\s*16\b/gi, "Chapter Sixteen"],
    [/\bCh(?:apter)?\s*17\b/gi, "Chapter Seventeen"],
    [/\bCh(?:apter)?\s*18\b/gi, "Chapter Eighteen"],
    [/\bCh(?:apter)?\s*19\b/gi, "Chapter Nineteen"],
    [/\b0([1-9])\b/g, "$1"], // Convert isolated '03' to '3'

    [/\bAFD\b/g, "A-F-D"],
    [/\bTCU\b/g, "T-C-U"],
    [/\bCIP\/SIP\b/g, "C-I-P and S-I-P"],
    [/\bCIP\b/g, "C-I-P"],
    [/\bSIP\b/g, "S-I-P"],
    [/\bBOM\b/g, "Bill of Materials"],
    [/\bGMP\b/g, "G-M-P"],
    [/\bcGMP\b/g, "current G-M-P"],
    [/\b21 CFR Part 11\b/g, "21 C-F-R Part 11"],
    [/\bNFPA\b/g, "N-F-P-A"],
    [/\bATEX\b/g, "A-TEX"],
    [/\bFDA\b/g, "F-D-A"],
    [/\bISPE\b/g, "I-S-P-E"],
    [/\bGAMP 5\b/g, "GAMP five"],
    [/\bPLC\b/g, "P-L-C"],
    [/\bSCADA\b/g, "SCADA"],
    [/\bRTD\b/g, "R-T-D"],

    // Scientific Units
    [/(\d+(?:\.\d+)?)\s*mbar\b/gi, "$1 millibars"],
    [/\bmbar\b/gi, "millibars"],
    [/(\d+(?:\.\d+)?)\s*Torr\b/gi, "$1 Torr"],
    [/(\d+(?:\.\d+)?)\s*Pa\b/g, "$1 Pascals"],
    [/(\d+(?:\.\d+)?)\s*kPa\b/g, "$1 kilopascals"],
    [/(\d+(?:\.\d+)?)\s*kJ\/kg\b/g, "$1 kilojoules per kilogram"],
    [/(\d+(?:\.\d+)?)\s*W\/m²K\b/g, "$1 Watts per square meter Kelvin"],
    [/(\d+(?:\.\d+)?)\s*W\/m²·K\b/g, "$1 Watts per square meter Kelvin"],
    [/(\d+(?:\.\d+)?)\s*kg\/h\b/g, "$1 kilograms per hour"],
    [/(\d+(?:\.\d+)?)\s*kg\/s\b/g, "$1 kilograms per second"],
    [/−(\d+)\s*°C/g, "minus $1 degrees Celsius"],
    [/-(\d+)\s*°C/g, "minus $1 degrees Celsius"],
    [/(\d+)\s*°C/g, "$1 degrees Celsius"],
    [/(\d+)\s*K\b/g, "$1 Kelvin"],

    // Math Formulas
    [/dP\/dT = L \/ \(T·Δv\)/g, "d P by d T equals L divided by T times delta v"],
    [/Q = Kv · Av · \(Ts − Tb\)/g, "Q equals K v times A v times T s minus T b"],
    [/dm\/dt = Q \/ ΔHs/g, "d m by d t equals Q divided by delta H s"],
    [/dm\/dt/g, "d m by d t"],
    [/dP\/dT/g, "d P by d T"],
    [/ΔHs/g, "delta H s"],
    [/Δv/g, "delta v"],
    [/ΔT/g, "delta T"],
    [/ΔHf/g, "delta H f"],
    [/≈/g, "approximately "],
    [/~/g, "approximately "],
    [/→/g, " yielding "],
    [/≤/g, "less than or equal to "],
    [/≥/g, "greater than or equal to "],
    [/×/g, " times "],
  ];

  for (const [re, repl] of substitutions) {
    t = t.replace(re, repl);
  }

  // Clean residual bold/italic markers
  t = t.replace(/\*\*([^*]+)\*\*/g, "$1");
  t = t.replace(/\*([^*]+)\*/g, "$1");
  t = t.replace(/`([^`]+)`/g, "$1");

  return t;
}

/**
 * Splits text into human cadence chunks with breathing pauses
 */
export function chunkTextForHumanSpeech(
  markdownText: string,
  pauseScale: number = 1.0
): SpeechChunk[] {
  const lines = markdownText.split("\n");
  const chunks: SpeechChunk[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Skip tables and diagrams
    if (line.startsWith("|") || line.startsWith("```") || line.startsWith("![") || line.startsWith("<")) {
      continue;
    }

    // Heading 1
    if (line.startsWith("# ")) {
      const rawText = line.replace("# ", "").trim();
      const text = humanizeEngineeringText(rawText);
      chunks.push({
        rawText,
        text,
        pauseAfterMs: Math.round(1500 * pauseScale),
        type: "heading",
        emphasis: true,
      });
      continue;
    }

    // Heading 2
    if (line.startsWith("## ")) {
      const rawText = line.replace("## ", "").trim();
      const text = humanizeEngineeringText(rawText);
      chunks.push({
        rawText,
        text: `Section: ${text}`,
        pauseAfterMs: Math.round(1200 * pauseScale),
        type: "heading",
        emphasis: true,
      });
      continue;
    }

    // Heading 3
    if (line.startsWith("### ")) {
      const rawText = line.replace("### ", "").trim();
      const text = humanizeEngineeringText(rawText);
      chunks.push({
        rawText,
        text,
        pauseAfterMs: Math.round(900 * pauseScale),
        type: "heading",
      });
      continue;
    }

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const rawText = line.replace(/^[-*]\s+/, "").trim();
      const text = humanizeEngineeringText(rawText);
      chunks.push({
        rawText,
        text,
        pauseAfterMs: Math.round(750 * pauseScale),
        type: "bullet",
      });
      continue;
    }

    // Regular paragraphs -> split into individual sentences for natural cadence
    const rawSentences = line.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [line];
    const cleanedParagraph = humanizeEngineeringText(line);
    const sentences = cleanedParagraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleanedParagraph];

    for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
      const s = sentences[sIdx].trim();
      if (!s || s.length < 3) continue;

      const rawS = rawSentences[sIdx]?.trim() || s;
      const isLastSentence = sIdx === sentences.length - 1;
      const pause = isLastSentence
        ? Math.round(950 * pauseScale) // Paragraph end breath
        : Math.round(550 * pauseScale); // Sentence end pause

      chunks.push({
        rawText: rawS,
        text: s,
        pauseAfterMs: pause,
        type: "sentence",
      });
    }
  }

  return chunks;
}

/**
 * Finds the highest-fidelity natural voice in browser's SpeechSynthesis matching persona
 */
export function matchBrowserVoice(
  voices: SpeechSynthesisVoice[],
  persona: VoicePersona
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // Filter out any non-English voices (e.g. Hindi 'hi-IN', Devnagari engines) so numbers are never read as "shunya teen"
  const englishVoices = voices.filter((v) => {
    const lang = v.lang.toLowerCase();
    const name = v.name.toLowerCase();
    return (
      (lang.startsWith("en") ||
        name.includes("english") ||
        name.includes("india") ||
        name.includes("neerja") ||
        name.includes("heera") ||
        name.includes("veena") ||
        name.includes("prabhat") ||
        name.includes("rishi")) &&
      !lang.startsWith("hi") &&
      !name.includes("hindi") &&
      !name.includes("हिन्दी")
    );
  });

  const candidates = englishVoices.length > 0 ? englishVoices : voices;

  // 1. Try finding a natural neural online voice matching persona keywords
  for (const kw of persona.voiceKeywords) {
    const match = candidates.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return (
        (name.includes(kw) || lang.includes(kw)) &&
        (name.includes("natural") || name.includes("online") || name.includes("neural") || name.includes("google"))
      );
    });
    if (match) return match;
  }

  // 2. Try any candidate matching keyword
  for (const kw of persona.voiceKeywords) {
    const match = candidates.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return name.includes(kw) || lang.includes(kw);
    });
    if (match) return match;
  }

  // 3. Fallback to candidate matching gender preference
  const genderMatch = candidates.find((v) => {
    const name = v.name.toLowerCase();
    if (persona.gender === "female") {
      return (
        name.includes("female") ||
        name.includes("woman") ||
        name.includes("zira") ||
        name.includes("aria") ||
        name.includes("neerja") ||
        name.includes("heera") ||
        name.includes("veena")
      );
    } else {
      return (
        name.includes("male") ||
        name.includes("man") ||
        name.includes("david") ||
        name.includes("guy") ||
        name.includes("prabhat") ||
        name.includes("rishi")
      );
    }
  });
  if (genderMatch) return genderMatch;

  return candidates[0] || null;
}
