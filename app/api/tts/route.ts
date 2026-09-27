import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Persona to Microsoft Edge Neural Voice mapping
const PERSONA_VOICE_MAP: Record<string, string> = {
  // Google Gemini AI Narrators (Featured)
  umbriel: "en-US-AndrewMultilingualNeural", // Warm, deep baritone: mirrors Google Umbriel
  gacrux: "en-US-AvaMultilingualNeural",     // Crisp, mature alto: mirrors Google Gacrux
  // Research Lab Personas
  ananya: "en-IN-NeerjaNeural",
  rajesh: "en-IN-PrabhatNeural",
  elena: "en-GB-SoniaNeural",
  marcus: "en-US-GuyNeural",
  seraphina: "en-US-JennyNeural",
};

// In-memory audio cache for instant zero-latency playback of visited sentences
const audioCache = new Map<string, Buffer>();
const MAX_CACHE_ITEMS = 300;

async function synthesizeText(voiceName: string, text: string, rateStr: string, pitchStr: string): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const readable = tts.toStream(text, {
    rate: rateStr,
    pitch: pitchStr,
  });

  const chunks: Buffer[] = [];
  let isDone = false;

  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          if (chunks.length > 0) {
            resolve();
          } else {
            reject(new Error("Edge TTS timeout after 25000ms"));
          }
        }
      }, 25000);

      const finish = () => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          resolve();
        }
      };

      readable.audioStream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      readable.audioStream.on("end", finish);
      readable.audioStream.on("close", finish);

      readable.audioStream.on("error", (err: Error) => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          // If we already received audio chunks before stream closed, treat as success
          if (chunks.length > 0) {
            resolve();
          } else {
            reject(err);
          }
        }
      });
    });
  } finally {
    try {
      tts.close();
    } catch {}
  }

  return Buffer.concat(chunks);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawText = searchParams.get("text")?.trim();
    const persona = searchParams.get("persona") || "ananya";
    const rateParam = parseFloat(searchParams.get("rate") || "1.0");
    const pitchParam = parseFloat(searchParams.get("pitch") || "1.0");

    if (!rawText) {
      return NextResponse.json({ error: "Text parameter is required" }, { status: 400 });
    }

    // Sanitize XML/SSML reserved characters so Edge TTS never encounters an invalid entity
    const text = rawText
      .replace(/&/g, " and ")
      .replace(/</g, " less than ")
      .replace(/>/g, " greater than ")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
      .trim();

    // Determine target voice
    const voiceName = PERSONA_VOICE_MAP[persona.toLowerCase()] || "en-US-AndrewMultilingualNeural";

    // Format rate and pitch adjustments
    const ratePercent = Math.round((rateParam - 1.0) * 100);
    const rateStr = `${ratePercent >= 0 ? "+" : ""}${ratePercent}%`;

    const pitchHz = Math.round((pitchParam - 1.0) * 40);
    const pitchStr = `${pitchHz >= 0 ? "+" : ""}${pitchHz}Hz`;

    // Cache key
    const cacheKey = `${voiceName}_${rateStr}_${pitchStr}_${text}`;
    if (audioCache.has(cacheKey)) {
      const cachedBuffer = audioCache.get(cacheKey)!;
      return new Response(new Uint8Array(cachedBuffer), {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": cachedBuffer.length.toString(),
          "Cache-Control": "public, max-age=86400, immutable",
          "Access-Control-Allow-Origin": "*",
          "X-Audio-Source": "edge-neural-cache",
        },
      });
    }

    // Synthesize audio with single retry on cold start
    let fullBuffer: Buffer;
    try {
      fullBuffer = await synthesizeText(voiceName, text, rateStr, pitchStr);
    } catch (initialErr) {
      console.warn("First TTS attempt encountered error, retrying once:", initialErr);
      fullBuffer = await synthesizeText(voiceName, text, rateStr, pitchStr);
    }

    if (!fullBuffer || fullBuffer.length === 0) {
      throw new Error("Zero audio bytes synthesized");
    }

    // Save to cache with LRU eviction
    if (audioCache.size >= MAX_CACHE_ITEMS) {
      const oldestKey = audioCache.keys().next().value;
      if (oldestKey) audioCache.delete(oldestKey);
    }
    audioCache.set(cacheKey, fullBuffer);

    return new Response(new Uint8Array(fullBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": fullBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
        "X-Audio-Source": "edge-neural-live",
      },
    });
  } catch (error: unknown) {
    console.error("Neural TTS Synthesis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Synthesis failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
