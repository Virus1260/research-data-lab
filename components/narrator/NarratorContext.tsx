"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import type { AudioManifest, AudioCue } from "@/lib/types";
import {
  VOICE_PERSONAS,
  type VoicePersona,
  type SpeechChunk,
  chunkTextForHumanSpeech,
  matchBrowserVoice,
} from "@/lib/voice-engine";

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
  activeSpokenPhrase: string;
  availableVoices: SpeechSynthesisVoice[];
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
  const [playbackRate, setPlaybackRate] = useState(0.92); // Default to soothing human pacing (0.92x)
  const [syncScroll, setSyncScroll] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeCue, setActiveCue] = useState<AudioCue | null>(null);
  const [manifest, setManifest] = useState<AudioManifest | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [voiceStudioOpen, setVoiceStudioOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(VOICE_PERSONAS[0]); // Default to Dr. Ananya Sharma (Indian English)
  const [pacingMode, setPacingMode] = useState<PacingMode>("academic");
  const [audioLevel, setAudioLevel] = useState(0);
  const [activeSpokenPhrase, setActiveSpokenPhrase] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<SpeechChunk[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const visualizerTimerRef = useRef<any>(null);

  // Keep isPlayingRef synced
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Load browser voices
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
      if (visualizerTimerRef.current) clearInterval(visualizerTimerRef.current);
    };
  }, [manifest, syncScroll]);

  // Animated visualizer simulator when playing
  useEffect(() => {
    if (isPlaying) {
      visualizerTimerRef.current = setInterval(() => {
        // Dynamic realistic level simulation
        const randomLevel = Math.floor(Math.random() * 55) + 35;
        setAudioLevel(randomLevel);
      }, 120);
    } else {
      setAudioLevel(0);
      if (visualizerTimerRef.current) clearInterval(visualizerTimerRef.current);
    }

    return () => {
      if (visualizerTimerRef.current) clearInterval(visualizerTimerRef.current);
    };
  }, [isPlaying]);

  // Human Speech Conductor: speaks chunks with cadence and breath intervals
  const speakNextChunk = useCallback(async () => {
    if (!isPlayingRef.current || isPausedRef.current) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const chunks = chunksRef.current;
    const idx = currentChunkIndexRef.current;

    if (idx >= chunks.length) {
      setIsPlaying(false);
      currentChunkIndexRef.current = 0;
      setActiveSpokenPhrase("");
      return;
    }

    const chunk = chunks[idx];
    setActiveSpokenPhrase(chunk.rawText || chunk.text);
    setCurrentTime(idx * 3); // Approximate progress

    const utterance = new SpeechSynthesisUtterance(chunk.text);

    // Set voice persona parameters
    const matchedVoice = matchBrowserVoice(availableVoices, selectedPersona);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    // Apply pacing rule
    const pacingScale = pacingMode === "academic" ? 0.92 : pacingMode === "conversational" ? 0.96 : 1.1;
    utterance.rate = playbackRate * pacingScale;
    utterance.pitch = selectedPersona.pitch;

    utterance.onend = () => {
      if (!isPlayingRef.current || isPausedRef.current) return;

      currentChunkIndexRef.current++;
      // Apply structural pause rule
      const pauseDuration = chunk.pauseAfterMs * (pacingMode === "academic" ? 1.2 : 1.0);

      setTimeout(() => {
        if (isPlayingRef.current && !isPausedRef.current) {
          speakNextChunk();
        }
      }, pauseDuration);
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error, advancing chunk", e);
      currentChunkIndexRef.current++;
      speakNextChunk();
    };

    window.speechSynthesis.speak(utterance);
  }, [availableVoices, selectedPersona, pacingMode, playbackRate]);

  // Load and play track
  const loadTrack = (
    slug: string,
    title: string,
    audioUrl: string,
    trackManifest?: AudioManifest | null,
    fallbackText?: string
  ) => {
    // If studio audio exists and user has NOT explicitly chosen a synthetic voice
    const hasStudioAudio = !!audioUrl;

    if (hasStudioAudio && !currentTrack?.isTTS) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((err) => {
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

  const startTTS = (slug: string, title: string, text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const chunks = chunkTextForHumanSpeech(text, selectedPersona.pauseScale);
    chunksRef.current = chunks;
    currentChunkIndexRef.current = 0;
    setDuration(chunks.length * 4); // Approximate total duration
    setCurrentTrack({ slug, title, audioUrl: "", isTTS: true });
    setIsPlaying(true);
    isPlayingRef.current = true;
    isPausedRef.current = false;

    // Start speaking with human rhythm
    speakNextChunk();
  };

  const togglePlay = () => {
    if (!currentTrack) return;

    if (currentTrack.isTTS) {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      if (isPlaying) {
        window.speechSynthesis.pause();
        isPausedRef.current = true;
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          isPausedRef.current = false;
          setIsPlaying(true);
        } else {
          isPausedRef.current = false;
          setIsPlaying(true);
          isPlayingRef.current = true;
          speakNextChunk();
        }
      }
      return;
    }

    // HTML5 studio audio
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.warn(e));
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current || currentTrack?.isTTS) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (delta: number) => {
    if (!audioRef.current || currentTrack?.isTTS) return;
    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + delta, duration));
    seek(newTime);
  };

  const setRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Preview a voice persona with a brief 2-second intro phrase
  const previewPersona = (persona: VoicePersona) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const sample = `Hello, I am ${persona.name}. Ready to explore the freeze dryer research data with you.`;
    const utterance = new SpeechSynthesisUtterance(sample);
    const matchedVoice = matchBrowserVoice(availableVoices, persona);
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.pitch = persona.pitch;
    utterance.rate = persona.rate;

    window.speechSynthesis.speak(utterance);
  };

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
        activeSpokenPhrase,
        availableVoices,
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
