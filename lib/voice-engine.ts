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
      "india",
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
      "isha",
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
      "india",
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

  // Clean markdown links, images, code
  t = t.replace(/!\[.*?\]\(.*?\)/g, "");
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  t = t.replace(/```[\s\S]*?```/g, "");

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

    // Convert isolated leading zeroes in whole integers without distorting decimals (e.g., Chapter 03 -> 3, but 0.04 remains 0.04)
    [/(?<!\.)\b0([1-9])\b(?!\.\d)/g, "$1"],

    // Standard abbreviations expanded into spoken language
    [/\bvs\.?(?=[,\s]|$)/gi, " versus "],
    [/\bapprox\.(?=[,\s]|$)/gi, " approximately "],
    [/\bi\.e\.(?=[,\s]|$)/gi, " that is to say, "],
    [/\be\.g\.(?=[,\s]|$)/gi, " for example, "],

    // Industry & Engineering Acronyms
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

    // Scientific Units & Measurement
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
    [/−(\d+(?:\.\d+)?)\s*°C/g, "minus $1 degrees Celsius"],
    [/-(\d+(?:\.\d+)?)\s*°C/g, "minus $1 degrees Celsius"],
    [/(\d+(?:\.\d+)?)\s*°C/g, "$1 degrees Celsius"],
    [/(\d+(?:\.\d+)?)\s*K\b/g, "$1 Kelvin"],

    // Math Formulas & Relational Symbols
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
 * Cleans individual table cell contents for conversational speech synthesis.
 */
function cleanTableCell(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, ", ")
    .replace(/•\s*/g, "")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/[`*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Algorithmic generator transforming grid cells into relational speech scripts
 * following the Dynamic Relational Audio Translation (DRAT) pattern.
 */
function convertTableRowsToSpeechScript(rows: string[][]): string {
  if (!rows || rows.length < 2) return "";
  const headers = rows[0].map(cleanTableCell);
  const dataRows = rows.slice(1);

  if (headers.length < 2 || dataRows.length === 0) return "";

  const paramColumnName = headers[0];
  const dataColumns = headers.slice(1);

  // Introductory anchoring script construction
  let script = `Reviewing the comparative data for ${paramColumnName} across `;
  if (dataColumns.length === 1) {
    script += `${dataColumns[0]}: \n`;
  } else if (dataColumns.length === 2) {
    script += `${dataColumns[0]} and ${dataColumns[1]}: \n`;
  } else {
    script += `${dataColumns.slice(0, -1).join(", ")}, and ${dataColumns[dataColumns.length - 1]}: \n`;
  }

  // Row by row relational iteration
  dataRows.forEach((rawRow, index) => {
    const row = rawRow.map(cleanTableCell);
    if (row.length < headers.length) return; // Skip malformed rows

    const parameter = row[0];
    const values = row.slice(1);

    // Choose appropriate conversational index transitions
    const transition =
      index === 0
        ? "For "
        : index === dataRows.length - 1
        ? "Finally, for "
        : "Next, looking at ";

    script += transition + `**${parameter}**: `;

    if (dataColumns.length === 1) {
      script += `${dataColumns[0]} is ${values[0]}. \n`;
    } else if (dataColumns.length === 2) {
      // Clean relational two-column framework
      script += `${dataColumns[0]} is ${values[0]}, while ${dataColumns[1]} is ${values[1]}. \n`;
    } else {
      // Sequenced scale framework for multi-column structures
      const details = dataColumns.map((col, vIdx) => `${col} is ${values[vIdx]}`);
      script += `${details.slice(0, -1).join("; ")}; and ${details[details.length - 1]}. \n`;
    }
  });

  return script;
}

/**
 * Parses raw markdown table blocks into highly descriptive, comparative sentences
 * using the Dynamic Relational Audio Translation (DRAT) pattern.
 */
export function preProcessTablesToConversationalText(markdownText: string): string {
  const lines = markdownText.split("\n");
  const processedLines: string[] = [];

  let inTable = false;
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect markdown table rows
    if (line.startsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }

      // Parse cells and filter out empty edge tokens from split
      const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      // Skip markdown separator lines (e.g., | :--- | :--- | or |---|---|)
      const isSeparator = cells.every((cell) => /^:?-+:?$/.test(cell));
      if (!isSeparator && cells.length > 0) {
        tableRows.push(cells);
      }
      continue;
    }

    // If we were inside a table block and it just ended
    if (inTable && !line.startsWith("|")) {
      inTable = false;
      if (tableRows.length > 1) {
        processedLines.push(convertTableRowsToSpeechScript(tableRows));
      }
      tableRows = [];
    }

    // Keep non-table lines as they are
    if (!inTable) {
      processedLines.push(lines[i]);
    }
  }

  // Handle case where table ends at the very last line of the string
  if (inTable && tableRows.length > 1) {
    processedLines.push(convertTableRowsToSpeechScript(tableRows));
  }

  return processedLines.join("\n");
}

/**
 * Splits text into human cadence chunks with breathing pauses,
 * utilizing lookahead regex to preserve decimal numbers without mid-digit truncation.
 */
export function chunkTextForHumanSpeech(
  markdownText: string,
  pauseScale: number = 1.0
): SpeechChunk[] {
  // Pre-process and translate tables into relational conversational text before chunking
  const preProcessedText = preProcessTablesToConversationalText(markdownText);
  const lines = preProcessedText.split("\n");
  const chunks: SpeechChunk[] = [];

  // Lookahead Regex Pattern to preserve decimal numbers and multi-period sequences
  const sentenceRegex = /(?:[^.!?]|\.(?=\d)|\.{2,})+(?:[.!?]+(?:\s+|$)|$)/g;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Skip code blocks, raw image tags, and JSX components
    if (line.startsWith("```") || line.startsWith("![") || line.startsWith("<")) {
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

    // Regular paragraphs -> split into individual sentences using decimal-safe lookahead
    const rawSentences = line.match(sentenceRegex) || [line];
    const cleanedParagraph = humanizeEngineeringText(line);
    const sentences = cleanedParagraph.match(sentenceRegex) || [cleanedParagraph];

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
 * INTELLIGENT SELECTION BOUNDARY SYNC UTILITY
 * Locates the index of the SpeechChunk that naturally starts the sentence containing the user's selected text.
 * Ensures narrator resumes cleanly from the beginning of the sentence rather than mid-word.
 */
export function findHumanizedSyncChunkIndex(
  chunks: SpeechChunk[],
  selectedText: string,
  fullTextContext?: string
): number {
  const cleanSelection = selectedText.trim();
  if (!cleanSelection || chunks.length === 0) return 0;

  // 1. Precise Match Strategy: Check if selection maps directly inside an active chunk string
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].rawText.includes(cleanSelection) || chunks[i].text.includes(cleanSelection)) {
      return i;
    }
  }

  // 2. Fuzzy Context Boundary Strategy: Walk back to the natural beginning of the sentence string
  let bestMatchIndex = 0;
  let highestFuzzyScore = 0;
  const selectionWords = cleanSelection.toLowerCase().split(/\s+/).filter(Boolean);

  for (let i = 0; i < chunks.length; i++) {
    const chunkWords = chunks[i].text.toLowerCase().split(/\s+/);
    // Count overlapping word signatures
    const intersection = chunkWords.filter((word) => selectionWords.includes(word));
    if (intersection.length > highestFuzzyScore) {
      highestFuzzyScore = intersection.length;
      bestMatchIndex = i;
    }
  }

  return bestMatchIndex;
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
      (lang.startsWith("en") || name.includes("english") || name.includes("india")) &&
      !lang.startsWith("hi") &&
      !name.includes("hindi") &&
      !name.includes("हिन्दी")
    );
  });

  const candidates = englishVoices.length > 0 ? englishVoices : voices;

  // 1. TOP PRIORITY: Natural / Neural / Online voice matching persona keywords
  for (const kw of persona.voiceKeywords) {
    const match = candidates.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      const isNatural = name.includes("natural") || name.includes("online") || name.includes("neural") || name.includes("google");
      return (name.includes(kw) || lang.includes(kw)) && isNatural;
    });
    if (match) return match;
  }

  // 2. HIGH PRIORITY: Any Natural / Neural / Online English voice matching gender
  const naturalGenderMatch = candidates.find((v) => {
    const name = v.name.toLowerCase();
    const isNatural = name.includes("natural") || name.includes("online") || name.includes("neural") || name.includes("google");
    if (!isNatural) return false;

    if (persona.gender === "female") {
      return (
        name.includes("female") ||
        name.includes("woman") ||
        name.includes("neerja") ||
        name.includes("aria") ||
        name.includes("jenny") ||
        name.includes("sonia") ||
        name.includes("libby") ||
        name.includes("veena") ||
        name.includes("heera")
      );
    } else {
      return (
        name.includes("male") ||
        name.includes("man") ||
        name.includes("prabhat") ||
        name.includes("guy") ||
        name.includes("andrew") ||
        name.includes("george") ||
        name.includes("rishi")
      );
    }
  });
  if (naturalGenderMatch) return naturalGenderMatch;

  // 3. MEDIUM PRIORITY: Any Natural / Neural voice available in candidates
  const anyNatural = candidates.find((v) => {
    const name = v.name.toLowerCase();
    return name.includes("natural") || name.includes("online") || name.includes("neural") || name.includes("google");
  });
  if (anyNatural) return anyNatural;

  // 4. LOWER PRIORITY: Keyword match across non-desktop voices
  for (const kw of persona.voiceKeywords) {
    const match = candidates.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      const isDesktop = name.includes("desktop");
      return (name.includes(kw) || lang.includes(kw)) && !isDesktop;
    });
    if (match) return match;
  }

  // 5. Fallback candidate matching gender (deprioritizing desktop SAPI voices)
  const nonDesktopGender = candidates.find((v) => {
    const name = v.name.toLowerCase();
    if (name.includes("desktop")) return false;
    return persona.gender === "female" ? name.includes("female") : name.includes("male");
  });
  if (nonDesktopGender) return nonDesktopGender;

  // 6. Final fallback: avoid desktop if possible
  const nonDesktopAny = candidates.find((v) => !v.name.toLowerCase().includes("desktop"));
  return nonDesktopAny || candidates[0] || null;
}
