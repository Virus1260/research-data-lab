"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import type { AudioManifest, AudioCue } from "@/lib/types";
import {
  VOICE_PERSONAS,
  type VoicePersona,
  type SpeechChunk,
  chunkTextForHumanSpeech,
  findHumanizedSyncChunkIndex,
  matchBrowserVoice,
} from "@/lib/voice-engine";
import { getPersonaPitchHz } from "./RealtimeVoiceGraph";

export type PacingMode = "academic" | "conversational" | "brisk";

interface NarratorContextType {
  isPlaying: boolean;
  currentTrack: {
    slug: string;
    title: string;
    audioUrl: string;
    isTTS?: boolean;
  } | null;
  currentTime: number;
  duration: number;
  playbackRate: number;
  syncScroll: boolean;
  isMinimized: boolean;
  activeCue: AudioCue | null;
  manifest: AudioManifest | null;
  transcriptOpen: boolean;
  voiceStudioOpen: boolean;
  selectedPersona: VoicePersona;
  pacingMode: PacingMode;
  audioLevel: number; // 0 - 100 for live audio visualizer
  frequencyBands: number[]; // 14 live formant spectral frequency bands
  livePitchHz: number;
  activeSpokenPhrase: string;
  availableVoices: SpeechSynthesisVoice[];
  hasActiveSelection: boolean;
  selectedSnippet: string;
  loadTrack: (
    slug: string,
    title: string,
    audioUrl: string,
    manifest?: AudioManifest | null,
    fallbackText?: string
  ) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  setRate: (rate: number) => void;
  setSyncScroll: (sync: boolean) => void;
  setIsMinimized: (min: boolean) => void;
  setTranscriptOpen: (open: boolean) => void;
  setVoiceStudioOpen: (open: boolean) => void;
  setSelectedPersona: (p: VoicePersona) => void;
  setPacingMode: (mode: PacingMode) => void;
  previewPersona: (p: VoicePersona) => void;
  syncToSelection: (overrideText?: string) => boolean;
}

const NarratorContext = createContext<NarratorContextType | null>(null);

export function NarratorProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{
    slug: string;
    title: string;
    audioUrl: string;
    isTTS?: boolean;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(0.92); // Default to human pacing (0.92x)
  const [syncScroll, setSyncScroll] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeCue, setActiveCue] = useState<AudioCue | null>(null);
  const [manifest, setManifest] = useState<AudioManifest | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [voiceStudioOpen, setVoiceStudioOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(VOICE_PERSONAS[0]); // Default to Dr. Ananya Sharma
  const [pacingMode, setPacingMode] = useState<PacingMode>("academic");
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyBands, setFrequencyBands] = useState<number[]>(new Array(14).fill(10));
  const [activeSpokenPhrase, setActiveSpokenPhrase] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasActiveSelection, setHasActiveSelection] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<SpeechChunk[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const playbackRateRef = useRef<number>(0.92);
  const pacingModeRef = useRef<PacingMode>("academic");
  const selectedPersonaRef = useRef<VoicePersona>(selectedPersona);
  const pauseTimeoutRef = useRef<any>(null);
  const visualizerRafRef = useRef<number | null>(null);
  const lastSelectedTextRef = useRef<string>("");
  const fallbackFullTextRef = useRef<string>("");

  // Sync refs with latest state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    pacingModeRef.current = pacingMode;
  }, [pacingMode]);

  useEffect(() => {
    selectedPersonaRef.current = selectedPersona;
  }, [selectedPersona]);

  // Load browser speech voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setAvailableVoices(v);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Track window selection across the article for Intelligent Selection Sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : "";
      if (text.length > 3) {
        lastSelectedTextRef.current = text;
        setSelectedSnippet(text.slice(0, 60));
        setHasActiveSelection(true);
      } else {
        // Keep lastSelectedTextRef active for 30 seconds so clicking deck SYNC still works
        setHasActiveSelection(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  // Audio element setup for studio MP3 tracks
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);

      if (manifest && manifest.cues) {
        const found = manifest.cues.find((c) => time >= c.start && time <= c.end);
        if (found) {
          setActiveCue(found);
          setActiveSpokenPhrase(found.text);
          if (syncScroll) {
            const el = document.getElementById(`narrator-cue-${found.id}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }
      }
    };

    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setAudioLevel(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [manifest, syncScroll]);

  // Live Multilayer Acoustic Formant Visualizer Simulator (reactive to speech energy and persona pitch)
  useEffect(() => {
    let lastTime = performance.now();

    const updateVisualizer = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlayingRef.current && !isPausedRef.current) {
        const persona = selectedPersonaRef.current;
        const pitch = getPersonaPitchHz(persona);
        const pitchFactor = pitch / 180;

        // Generate dynamic acoustic frequency bands around vocal formant centers (F1, F2, F3)
        const bands = new Array(14).fill(0).map((_, i) => {
          // Acoustic formant peaks: low fundamental (0-3), vowel resonance (4-8), sibilance (9-13)
          const centerFreq = i < 4 ? 0.9 : i < 9 ? 1.2 : 0.7;
          const harmonicOsc = Math.sin(now * 0.007 * (i + 1) * pitchFactor);
          const noise = (Math.sin(now * 0.02 + i * 1.5) + 1) * 0.5;
          const level = Math.max(15, Math.min(95, (harmonicOsc * 35 + noise * 40 + 25) * centerFreq));
          return Math.round(level);
        });

        const overallLevel = Math.round(
          bands.reduce((acc, v) => acc + v, 0) / bands.length
        );

        setAudioLevel(overallLevel);
        setFrequencyBands(bands);
      } else {
        setAudioLevel(0);
        setFrequencyBands(new Array(14).fill(6));
      }

      visualizerRafRef.current = requestAnimationFrame(updateVisualizer);
    };

    visualizerRafRef.current = requestAnimationFrame(updateVisualizer);
    return () => {
      if (visualizerRafRef.current) cancelAnimationFrame(visualizerRafRef.current);
    };
  }, []);

  // Smooth live timer ticker during TTS playback so timer progresses second by second
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && currentTrack?.isTTS) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.25 * playbackRateRef.current;
          return duration > 0 ? Math.min(duration, +next.toFixed(1)) : +next.toFixed(1);
        });
      }, 250);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentTrack?.isTTS, duration]);

  // Core Speech Synthesis Conductor: speaks a specific chunk cleanly
  const speakChunk = useCallback(
    (index: number, overrideRate?: number) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }

      const chunks = chunksRef.current;
      if (!chunks || chunks.length === 0) return;

      // When reached end of track
      if (index >= chunks.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        isPausedRef.current = false;
        currentChunkIndexRef.current = 0;
        setActiveSpokenPhrase("");
        return;
      }

      const chunk = chunks[index];
      currentChunkIndexRef.current = index;
      setActiveSpokenPhrase(chunk.rawText || chunk.text);

      // Approximate time based on chunks count
      const approxChunkDuration = Math.max(2, chunk.text.length * 0.065);
      const cumulativeTime = index * approxChunkDuration;
      setCurrentTime(+cumulativeTime.toFixed(1));

      // Cancel any ongoing utterance before queuing new one
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(chunk.text);

      // Assign persona voice
      const matchedVoice = matchBrowserVoice(availableVoices, selectedPersonaRef.current);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      // Apply pacing and playback rate rule
      const pacing = pacingModeRef.current;
      const pacingScale = pacing === "academic" ? 0.92 : pacing === "conversational" ? 0.96 : 1.1;
      const effectiveRate = (overrideRate ?? playbackRateRef.current) * pacingScale;
      utterance.rate = Math.max(0.5, Math.min(2.0, effectiveRate));
      utterance.pitch = selectedPersonaRef.current.pitch;

      // Word boundary listener for real-time acoustic impulse tracking
      utterance.onboundary = (e) => {
        // Trigger realistic vocal amplitude spike
        setAudioLevel(Math.min(95, Math.floor(Math.random() * 30) + 65));
      };

      utterance.onend = () => {
        if (!isPlayingRef.current || isPausedRef.current) return;

        const nextIndex = index + 1;
        currentChunkIndexRef.current = nextIndex;

        // Structural pause rule (breaths between sentences or headings)
        const pauseScale = pacing === "academic" ? 1.2 : 1.0;
        const pauseMs = (chunk.pauseAfterMs * pauseScale) / playbackRateRef.current;

        pauseTimeoutRef.current = setTimeout(() => {
          if (isPlayingRef.current && !isPausedRef.current) {
            speakChunk(nextIndex);
          }
        }, pauseMs);
      };

      utterance.onerror = (e) => {
        // Interrupted or canceled occurs during normal pause/seek/rate change actions; do NOT advance chunk
        if (e.error === "interrupted" || e.error === "canceled") {
          return;
        }

        console.warn("SpeechSynthesis error:", e.error);
        if (isPlayingRef.current && !isPausedRef.current) {
          currentChunkIndexRef.current = index + 1;
          speakChunk(index + 1);
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [availableVoices]
  );

  // Load and play track
  const loadTrack = (
    slug: string,
    title: string,
    audioUrl: string,
    trackManifest?: AudioManifest | null,
    fallbackText?: string
  ) => {
    if (fallbackText) {
      fallbackFullTextRef.current = fallbackText;
    }

    const hasStudioAudio = !!audioUrl;

    if (hasStudioAudio && !currentTrack?.isTTS) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = playbackRateRef.current;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              isPlayingRef.current = true;
              isPausedRef.current = false;
            })
            .catch((err) => {
              // AbortError is triggered when user immediately pauses; ignore it
              if (err.name === "AbortError") return;
              console.warn("Studio audio autoplay blocked, starting TTS conductor:", err);
              startTTS(slug, title, fallbackText || title);
            });
        }
      }
      setCurrentTrack({ slug, title, audioUrl, isTTS: false });
      if (trackManifest) {
        setManifest(trackManifest);
        setDuration(trackManifest.totalDuration);
      }
    } else {
      // Start Humanized Speech Conductor
      startTTS(slug, title, fallbackText || title);
    }
  };

  const startTTS = (slug: string, title: string, text: string, startIndex: number = 0) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    fallbackFullTextRef.current = text;
    const chunks = chunkTextForHumanSpeech(text, selectedPersona.pauseScale);
    chunksRef.current = chunks;
    currentChunkIndexRef.current = startIndex;

    // Approximate total duration based on reading rate
    const totalWords = text.split(/\s+/).length;
    const estimatedSeconds = Math.round((totalWords / 130) * 60);
    setDuration(Math.max(30, estimatedSeconds));

    setCurrentTrack({ slug, title, audioUrl: "", isTTS: true });
    setIsPlaying(true);
    isPlayingRef.current = true;
    isPausedRef.current = false;

    // Start speaking with human rhythm from specified start index
    speakChunk(startIndex);
  };

  const togglePlay = () => {
    if (!currentTrack) return;

    if (currentTrack.isTTS) {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      if (isPlaying) {
        // Clean Pause: cancel current utterance, preserve chunk index, set paused flags
        if (pauseTimeoutRef.current) {
          clearTimeout(pauseTimeoutRef.current);
          pauseTimeoutRef.current = null;
        }
        window.speechSynthesis.cancel();
        isPausedRef.current = true;
        isPlayingRef.current = false;
        setIsPlaying(false);
      } else {
        // Clean Resume / Replay: if at the end, replay from beginning; otherwise resume current chunk
        if (currentChunkIndexRef.current >= chunksRef.current.length) {
          currentChunkIndexRef.current = 0;
        }
        isPausedRef.current = false;
        isPlayingRef.current = true;
        setIsPlaying(true);
        speakChunk(currentChunkIndexRef.current);
      }
      return;
    }

    // HTML5 studio audio
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
        })
        .catch((e) => {
          if (e.name !== "AbortError") console.warn(e);
        });
    }
  };

  const seek = (time: number) => {
    if (currentTrack?.isTTS) {
      const chunks = chunksRef.current;
      if (chunks.length === 0 || duration <= 0) return;
      const targetIdx = Math.max(
        0,
        Math.min(chunks.length - 1, Math.floor((time / duration) * chunks.length))
      );
      currentChunkIndexRef.current = targetIdx;
      setCurrentTime(time);
      if (isPlayingRef.current && !isPausedRef.current) {
        speakChunk(targetIdx);
      } else {
        setActiveSpokenPhrase(chunks[targetIdx]?.rawText || chunks[targetIdx]?.text || "");
      }
      return;
    }

    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (delta: number) => {
    if (currentTrack?.isTTS) {
      const chunks = chunksRef.current;
      if (chunks.length === 0) return;
      // Skip forwards or backwards by sentence chunks
      const chunkDelta = delta > 0 ? 1 : -1;
      const targetIdx = Math.max(
        0,
        Math.min(chunks.length - 1, currentChunkIndexRef.current + chunkDelta)
      );
      currentChunkIndexRef.current = targetIdx;
      if (isPlayingRef.current && !isPausedRef.current) {
        speakChunk(targetIdx);
      } else {
        setActiveSpokenPhrase(chunks[targetIdx]?.rawText || chunks[targetIdx]?.text || "");
      }
      return;
    }

    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + delta, duration));
    seek(newTime);
  };

  // Immediate speed adjustment: instantly recalibrates current speech rate without lag
  const setRate = (rate: number) => {
    setPlaybackRate(rate);
    playbackRateRef.current = rate;

    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }

    // For TTS: if currently speaking, restart current chunk immediately with new rate
    if (currentTrack?.isTTS && isPlayingRef.current && !isPausedRef.current) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        window.speechSynthesis.cancel();
        setTimeout(() => {
          if (isPlayingRef.current && !isPausedRef.current) {
            speakChunk(currentChunkIndexRef.current, rate);
          }
        }, 35);
      }
    }
  };

  // Preview a voice persona with a brief greeting phrase
  const previewPersona = (persona: VoicePersona) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const sample = `Hello, I am ${persona.name}. Ready to explore the active freeze dryer research data with you.`;
    const utterance = new SpeechSynthesisUtterance(sample);
    const matchedVoice = matchBrowserVoice(availableVoices, persona);
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.pitch = persona.pitch;
    utterance.rate = persona.rate;

    window.speechSynthesis.speak(utterance);
  };

  /**
   * INTELLIGENT SELECTION SYNC
   * Locates the exact sentence boundary chunk containing the user's highlighted text
   * and starts reading cleanly from the natural beginning of that sentence forward.
   */
  const syncToSelection = (overrideText?: string): boolean => {
    const rawSelected =
      overrideText ||
      (typeof window !== "undefined" ? window.getSelection()?.toString() : "") ||
      lastSelectedTextRef.current ||
      "";

    const cleanText = rawSelected.trim();
    if (!cleanText) return false;

    const chunks = chunksRef.current;
    if (!chunks || chunks.length === 0) {
      // If chunks aren't initialized yet but we have text content
      if (fallbackFullTextRef.current) {
        const genChunks = chunkTextForHumanSpeech(
          fallbackFullTextRef.current,
          selectedPersona.pauseScale
        );
        chunksRef.current = genChunks;
      } else {
        return false;
      }
    }

    const targetIdx = findHumanizedSyncChunkIndex(
      chunksRef.current,
      cleanText,
      fallbackFullTextRef.current
    );

    // Switch to TTS mode if on studio audio or paused, and start speech from the natural sentence start
    setCurrentTrack((prev) =>
      prev
        ? { ...prev, isTTS: true }
        : { slug: "selection-sync", title: "Document Narration", audioUrl: "", isTTS: true }
    );

    setIsPlaying(true);
    isPlayingRef.current = true;
    isPausedRef.current = false;
    currentChunkIndexRef.current = targetIdx;

    speakChunk(targetIdx);
    return true;
  };

  const livePitchHz = getPersonaPitchHz(selectedPersona);

  return (
    <NarratorContext.Provider
      value={{
        isPlaying,
        currentTrack,
        currentTime,
        duration,
        playbackRate,
        syncScroll,
        isMinimized,
        activeCue,
        manifest,
        transcriptOpen,
        voiceStudioOpen,
        selectedPersona,
        pacingMode,
        audioLevel,
        frequencyBands,
        livePitchHz,
        activeSpokenPhrase,
        availableVoices,
        hasActiveSelection,
        selectedSnippet,
        loadTrack,
        togglePlay,
        seek,
        skip,
        setRate,
        setSyncScroll,
        setIsMinimized,
        setTranscriptOpen,
        setVoiceStudioOpen,
        setSelectedPersona,
        setPacingMode,
        previewPersona,
        syncToSelection,
      }}
    >
      {children}
    </NarratorContext.Provider>
  );
}

export function useNarrator() {
  const context = useContext(NarratorContext);
  if (!context) {
    throw new Error("useNarrator must be used within a NarratorProvider");
  }
  return context;
}
