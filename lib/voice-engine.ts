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
  accent: "Indian English (IN)" | "British" | "American" | "Studio Master" | "Google Gemini";
  isGemini?: boolean; // Google Gemini TTS voice badge
  description: string;
  avatar: string;
  pitch: number;
  rate: number;
  pauseScale: number;
  voiceKeywords: string[];
}

export const VOICE_PERSONAS: VoicePersona[] = [
  // ─── GOOGLE GEMINI TTS VOICES (Featured) ────────────────────────────────────
  // Umbriel: Google's warm, baritone lead narrator voice (modeled after Gemini Umbriel)
  // Edge Neural counterpart: en-US-AndrewMultilingualNeural - warm, smooth, relaxed
  {
    id: "umbriel",
    name: "Umbriel",
    role: "Google Gemini AI Narrator",
    gender: "male",
    accent: "Google Gemini",
    isGemini: true,
    description: "Google's signature warm baritone narrator. Smooth, grounded, conversational delivery with natural academic authority.",
    avatar: "✦",
    pitch: 0.935,   // -3Hz relative to 120 Hz male base → deep warm baritone
    rate: 0.95,     // Relaxed cadence, matching Google Umbriel's unhurried pacing
    pauseScale: 1.1,
    voiceKeywords: [
      "andrew",
      "andrewmultilingual",
      "brian",
      "christopher",
      "en-us",
      "google us english male",
      "natural",
    ],
  },
  // Gacrux: Google's crisp, articulate female research narrator (modeled after Gemini Gacrux)
  // Edge Neural counterpart: en-US-AvaMultilingualNeural - mature, sharp, high-clarity
  {
    id: "gacrux",
    name: "Gacrux",
    role: "Google Gemini AI Narrator",
    gender: "female",
    accent: "Google Gemini",
    isGemini: true,
    description: "Google's premier female narrator - mature, articulate, and precise. Crystal-clear academic delivery with natural research authority.",
    avatar: "✧",
    pitch: 1.005,   // +1Hz relative to 220 Hz female base → crisp, present alto
    rate: 1.0,      // Precise, measured cadence matching Google Gacrux's sharp delivery
    pauseScale: 1.05,
    voiceKeywords: [
      "ava",
      "avamultilingual",
      "emma",
      "emmamultilingual",
      "aria",
      "en-us",
      "google us english female",
      "natural",
      "female",
    ],
  },
  // ─── RESEARCH LAB PERSONAS ──────────────────────────────────────────────────
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

// Default to Umbriel: Google's warm lead narrator (first entry)
export const DEFAULT_PERSONA = VOICE_PERSONAS[0];
export const GEMINI_VOICES = VOICE_PERSONAS.filter((p) => p.isGemini === true);

export interface SpeechChunk {
  rawText: string;
  text: string;
  pauseAfterMs: number;
  type: "heading" | "paragraph" | "sentence" | "formula" | "bullet" | "table";
  emphasis?: boolean;
  tableData?: {
    parameter: string;
    values: { column: string; value: string }[];
    fullRow?: string[];
  };
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

  // Convert XML / SSML reserved characters to natural English words
  t = t.replace(/&/g, " and ");
  t = t.replace(/</g, " less than ");
  t = t.replace(/>/g, " greater than ");

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
 * Strips raw markdown artifacts (images, link syntax, raw HTML breaks) for speech chunking
 */
export function cleanMarkdownForChunking(text: string): string {
  let t = text;
  // Remove markdown images: ![alt](url)
  t = t.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
  // Replace markdown links with their visible label: [label](url)
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Replace HTML breaks with a natural comma pause
  t = t.replace(/<br\s*\/?>/gi, ", ");
  return t;
}

/**
 * Accurately segments a paragraph into sentences without mid-digit, abbreviation, or citation truncation.
 * Shields periods in common abbreviations (e.g., i.e., vs., approx., dr., fig., no., al., B.V.),
 * personal initials (Peter G. J. van der Wel), decimals, and URLs.
 */
export function splitParagraphIntoSentences(text: string): string[] {
  if (!text) return [];

  let s = text;
  // 0. Protect numbered lists / patent claim numbering: e.g. "27. The method", "1. A freeze dryer", "26. Werkwijze"
  s = s.replace(/(^|[\s*`_#])(\d+)\.(?=\s+[A-Za-z])/g, "$1$2\u200B");

  // 1. Protect decimal points: e.g. 0.05, 12.5, 1.6
  s = s.replace(/(?<=\d)\.(?=\d)/g, "\u200B");

  // 2. Protect file paths and URLs: e.g. file.pdf, site.com/page
  s = s.replace(/(?<=[/\w])\.(?=[/\w])/g, "\u200B");

  // 3. Protect multi-period acronyms and company suffixes (B.V., e.g., i.e., U.S.)
  s = s.replace(/\bB\.V\./gi, "B\u200BV\u200B");
  s = s.replace(/\be\.g\./gi, "e\u200Bg\u200B");
  s = s.replace(/\bi\.e\./gi, "i\u200Be\u200B");
  s = s.replace(/\bU\.S\./gi, "U\u200BS\u200B");

  // 4. Protect common abbreviations: approx., vs., vol., no., ref., fig., dr., prof., al., etc.
  s = s.replace(/\b(approx|vs|vol|no|ref|fig|dr|prof|al|et al|inc|corp|ltd|co|dept|ch)\./gi, "$1\u200B");

  // 5. Protect single-letter person initials (e.g. Peter G. J. van der Wel, Olukayode I. Imole)
  s = s.replace(/(^|[\s(])([A-Z])\./g, "$1$2\u200B");

  // 6. Protect ellipses (...)
  s = s.replace(/\.{2,}/g, (m) => "\u200B".repeat(m.length));

  // 7. Protect periods followed by closing markdown syntax and a lowercase word (e.g., "B.V.** on June")
  s = s.replace(/\.(?=[*_~`'"\u2019\u201d)\]]*\s+[a-z])/g, "\u200B");

  // 8. Protect periods directly followed by whitespace and a lowercase word (never a sentence end in formal English)
  s = s.replace(/\.(?=\s+[a-z])/g, "\u200B");

  const rawMatches: string[] = [];
  const sentenceTerminatorRegex = /([^.!?]+[.!?]+[*_~`'"\u2019\u201d)\]]*(?:\s+|$)|[^.!?]+$)/g;
  let m;
  while ((m = sentenceTerminatorRegex.exec(s)) !== null) {
    const segment = m[0].replace(/\u200B/g, ".").trim();
    if (segment) {
      rawMatches.push(segment);
    }
  }

  // Decompose long compound clauses (> 180 chars) with semicolons into human breathing cadence
  const matches: string[] = [];
  for (const seg of rawMatches) {
    if (seg.length > 180 && seg.includes(";")) {
      const clauses = seg.split(/;\s+/);
      clauses.forEach((c, idx) => {
        let clean = c.trim();
        if (!clean) return;
        if (idx < clauses.length - 1 && !/[.!?]$/.test(clean)) {
          clean += ";";
        }
        matches.push(clean);
      });
    } else {
      matches.push(seg);
    }
  }

  return matches.length > 0 ? matches : [text.trim()];
}

/**
 * Splits text into human cadence chunks with breathing pauses,
 * utilizing lookahead regex to preserve decimal numbers and abbreviations without mid-digit truncation.
 */
export function chunkTextForHumanSpeech(
  markdownText: string,
  pauseScale: number = 1.0
): SpeechChunk[] {
  // 1. Strip YAML frontmatter if present so it is never read aloud
  let textToProcess = markdownText;
  if (textToProcess.startsWith("---")) {
    const endFm = textToProcess.indexOf("\n---", 3);
    if (endFm !== -1) {
      textToProcess = textToProcess.slice(endFm + 4).trimStart();
    }
  }

  const rawLines = textToProcess.split("\n");
  const chunks: SpeechChunk[] = [];

  let i = 0;
  while (i < rawLines.length) {
    const rawLine = rawLines[i];
    const line = rawLine.replace(/\r$/, "").trim();

    if (!line) {
      i++;
      continue;
    }

    // Skip horizontal rules
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      i++;
      continue;
    }

    // Skip code blocks, raw image tags, and JSX components
    if (line.startsWith("```") || line.startsWith("![") || line.startsWith("<") || line.startsWith("::")) {
      i++;
      continue;
    }

    // Blockquote handling (> [!NOTE] or > text)
    if (line.startsWith(">")) {
      const bqLines: string[] = [];
      while (i < rawLines.length && rawLines[i].replace(/\r$/, "").trim().startsWith(">")) {
        const cleaned = cleanMarkdownForChunking(
          rawLines[i]
            .replace(/\r$/, "")
            .trim()
            .replace(/^>\s*/, "")
            .replace(/^\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, "")
            .trim()
        );
        if (cleaned) bqLines.push(cleaned);
        i++;
      }
      if (bqLines.length > 0) {
        const bqText = bqLines.join(" ");
        const sentences = splitParagraphIntoSentences(bqText);
        for (const rawS of sentences) {
          if (!rawS || rawS.length < 3) continue;
          chunks.push({
            rawText: rawS,
            text: humanizeEngineeringText(rawS),
            pauseAfterMs: Math.round(800 * pauseScale),
            type: "paragraph",
            emphasis: true,
          });
        }
      }
      continue;
    }

    // Check if line is start of markdown table
    if (line.startsWith("|")) {
      const tableRows: string[][] = [];
      while (i < rawLines.length && rawLines[i].replace(/\r$/, "").trim().startsWith("|")) {
        const tLine = rawLines[i].replace(/\r$/, "").trim();
        const cells = tLine
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const isSeparator = cells.every((cell) => /^:?-+:?$/.test(cell));
        if (!isSeparator && cells.length > 0) {
          tableRows.push(cells);
        }
        i++;
      }

      if (tableRows.length > 1) {
        const headers = tableRows[0].map(cleanTableCell);
        const dataRows = tableRows.slice(1);
        const paramColumnName = headers[0];
        const dataColumns = headers.slice(1);

        // Intro chunk for the table
        const introText = `Reviewing the comparative data for ${paramColumnName} across ${
          dataColumns.length === 1
            ? dataColumns[0]
            : dataColumns.length === 2
            ? `${dataColumns[0]} and ${dataColumns[1]}`
            : `${dataColumns.slice(0, -1).join(", ")}, and ${dataColumns[dataColumns.length - 1]}`
        }.`;

        chunks.push({
          rawText: `${paramColumnName}: ${dataColumns.join(", ")}`,
          text: introText,
          pauseAfterMs: Math.round(1100 * pauseScale),
          type: "table",
          emphasis: true,
          tableData: {
            parameter: paramColumnName,
            values: dataColumns.map((col) => ({ column: col, value: "" })),
            fullRow: headers,
          },
        });

        // Row by row relational chunks
        dataRows.forEach((rawRow, rIdx) => {
          const row = rawRow.map(cleanTableCell);
          if (row.length < headers.length) return;

          const parameter = row[0];
          const values = row.slice(1);

          const transition =
            rIdx === 0
              ? "For "
              : rIdx === dataRows.length - 1
              ? "Finally, for "
              : "Next, looking at ";

          let spokenRow = transition + `${parameter}: `;
          if (dataColumns.length === 1) {
            spokenRow += `${dataColumns[0]} is ${values[0]}.`;
          } else if (dataColumns.length === 2) {
            spokenRow += `${dataColumns[0]} is ${values[0]}, while ${dataColumns[1]} is ${values[1]}.`;
          } else {
            const details = dataColumns.map((col, vIdx) => `${col} is ${values[vIdx] || ""}`);
            spokenRow += `${details.slice(0, -1).join("; ")}; and ${details[details.length - 1]}.`;
          }

          const rawSummary = `${parameter}: ${dataColumns.map((col, vIdx) => `${col} = ${values[vIdx] || "-"}`).join(", ")}`;

          chunks.push({
            rawText: rawSummary,
            text: humanizeEngineeringText(spokenRow),
            pauseAfterMs: Math.round(1000 * pauseScale),
            type: "table",
            tableData: {
              parameter,
              values: dataColumns.map((col, vIdx) => ({
                column: col,
                value: values[vIdx] || "",
              })),
              fullRow: row,
            },
          });
        });
      }
      continue;
    }

    // Heading 1
    if (line.startsWith("# ")) {
      const rawText = cleanMarkdownForChunking(line.replace("# ", "").trim());
      const text = humanizeEngineeringText(rawText);
      chunks.push({
        rawText,
        text,
        pauseAfterMs: Math.round(1500 * pauseScale),
        type: "heading",
        emphasis: true,
      });
      i++;
      continue;
    }

    // Heading 2
    if (line.startsWith("## ")) {
      const rawText = cleanMarkdownForChunking(line.replace("## ", "").trim());
      const text = humanizeEngineeringText(rawText);
      chunks.push({
        rawText,
        text: `Section: ${text}`,
        pauseAfterMs: Math.round(1200 * pauseScale),
        type: "heading",
        emphasis: true,
      });
      i++;
      continue;
    }

    // Heading 3
    if (line.startsWith("### ")) {
      const rawText = cleanMarkdownForChunking(line.replace("### ", "").trim());
      const text = humanizeEngineeringText(rawText);
      chunks.push({
        rawText,
        text,
        pauseAfterMs: Math.round(900 * pauseScale),
        type: "heading",
      });
      i++;
      continue;
    }

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const rawText = cleanMarkdownForChunking(line.replace(/^[-*]\s+/, "").trim());
      // Split bullet into sentences so long multi-sentence patent translations don't become massive 1,300-char blocks
      const bulletSentences = splitParagraphIntoSentences(rawText);
      for (let sIdx = 0; sIdx < bulletSentences.length; sIdx++) {
        const rawS = bulletSentences[sIdx];
        if (!rawS || rawS.length < 3) continue;

        const spokenText = humanizeEngineeringText(rawS);
        const isLastSentence = sIdx === bulletSentences.length - 1;
        const pause = isLastSentence
          ? Math.round(850 * pauseScale)
          : Math.round(550 * pauseScale);

        chunks.push({
          rawText: rawS,
          text: spokenText,
          pauseAfterMs: pause,
          type: "bullet",
        });
      }
      i++;
      continue;
    }

    // Regular paragraphs -> clean markdown links/images, then split into individual sentences
    const cleanedLine = cleanMarkdownForChunking(line);
    const sentences = splitParagraphIntoSentences(cleanedLine);

    for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
      const rawS = sentences[sIdx];
      if (!rawS || rawS.length < 3) continue;

      const spokenText = humanizeEngineeringText(rawS);
      const isLastSentence = sIdx === sentences.length - 1;
      const pause = isLastSentence
        ? Math.round(950 * pauseScale)
        : Math.round(550 * pauseScale);

      chunks.push({
        rawText: rawS,
        text: spokenText,
        pauseAfterMs: pause,
        type: "paragraph",
      });
    }

    i++;
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
