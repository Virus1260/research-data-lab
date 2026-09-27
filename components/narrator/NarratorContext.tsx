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

export function cleanSpokenPhrase(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[*\-•]\s+/, "")
    .trim();
}

export type PacingMode = "academic" | "conversational" | "brisk";
export type SpeechEngine = "neural" | "webspeech";

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
  speechEngine: SpeechEngine;
  vocalWarmth: number; // in dB (-6 to +6)
  vocalClarity: number; // in dB (-6 to +6)
  audioLevel: number; // 0 - 100 for live audio visualizer
  frequencyBands: number[]; // 16 live formant spectral frequency bands
  livePitchHz: number;
  activeSpokenPhrase: string;
  availableVoices: SpeechSynthesisVoice[];
  hasActiveSelection: boolean;
  selectedSnippet: string;
  speechChunks: SpeechChunk[];
  currentChunkIndex: number;
  currentChunk: SpeechChunk | null;
  readerPanelOpen: boolean;
  setReaderPanelOpen: (open: boolean) => void;
  seekToChunk: (index: number) => void;
  prepareChapterText: (text: string, slug?: string, title?: string) => void;
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
  setSpeechEngine: (engine: SpeechEngine) => void;
  setVocalWarmth: (db: number) => void;
  setVocalClarity: (db: number) => void;
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
  const [playbackRate, setPlaybackRate] = useState(0.975); // Default to human pacing (0.975x)
  const [syncScroll, setSyncScroll] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeCue, setActiveCue] = useState<AudioCue | null>(null);
  const [manifest, setManifest] = useState<AudioManifest | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [voiceStudioOpen, setVoiceStudioOpen] = useState(false);
  const [readerPanelOpen, setReaderPanelOpen] = useState<boolean>(false);
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(VOICE_PERSONAS[0]); // Default to Dr. Ananya Sharma
  const [pacingMode, setPacingMode] = useState<PacingMode>("academic");
  const [speechEngine, setSpeechEngineState] = useState<SpeechEngine>("neural"); // Default to Ultra HD Edge Neural
  const [vocalWarmth, setVocalWarmthState] = useState<number>(1.5); // +1.5 dB Low-shelf warmth (Umbriel baritone profile)
  const [vocalClarity, setVocalClarityState] = useState<number>(2.0); // +2.0 dB High-shelf clarity
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyBands, setFrequencyBands] = useState<number[]>(new Array(16).fill(6));
  const [activeSpokenPhrase, setActiveSpokenPhrase] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasActiveSelection, setHasActiveSelection] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState("");
  const [speechChunks, setSpeechChunks] = useState<SpeechChunk[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const neuralAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const warmthFilterRef = useRef<BiquadFilterNode | null>(null);
  const clarityFilterRef = useRef<BiquadFilterNode | null>(null);
  const mediaSourceConnectedRef = useRef<boolean>(false);

  const chunksRef = useRef<SpeechChunk[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const playbackRateRef = useRef<number>(0.975);
  const pacingModeRef = useRef<PacingMode>("academic");
  const selectedPersonaRef = useRef<VoicePersona>(selectedPersona);
  const speechEngineRef = useRef<SpeechEngine>("neural");
  const vocalWarmthRef = useRef<number>(1.5);
  const vocalClarityRef = useRef<number>(2.0);
  const pauseTimeoutRef = useRef<any>(null);
  const visualizerRafRef = useRef<number | null>(null);
  const lastSelectedTextRef = useRef<string>("");
  const fallbackFullTextRef = useRef<string>("");
  const isSpeakingSoundRef = useRef<boolean>(false);

  // Sync refs with latest state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
    if (neuralAudioRef.current) {
      neuralAudioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    pacingModeRef.current = pacingMode;
  }, [pacingMode]);

  useEffect(() => {
    selectedPersonaRef.current = selectedPersona;
  }, [selectedPersona]);

  useEffect(() => {
    speechEngineRef.current = speechEngine;
  }, [speechEngine]);

  useEffect(() => {
    vocalWarmthRef.current = vocalWarmth;
    if (warmthFilterRef.current) {
      warmthFilterRef.current.gain.value = vocalWarmth;
    }
  }, [vocalWarmth]);

  useEffect(() => {
    vocalClarityRef.current = vocalClarity;
    if (clarityFilterRef.current) {
      clarityFilterRef.current.gain.value = vocalClarity;
    }
  }, [vocalClarity]);

  // Load browser speech voices for local fallback
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

  // Selection change listener for intelligent sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : "";
      if (text.length > 3) {
        lastSelectedTextRef.current = text;
        setSelectedSnippet(text.slice(0, 45));
        setHasActiveSelection(true);
      } else {
        setHasActiveSelection(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  // Setup Web Audio API DSP Equalizer & Analyser Pipeline for Neural Audio
  const initWebAudioPipeline = useCallback((audioEl: HTMLAudioElement) => {
    if (typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) return;
        audioCtxRef.current = new AudioCtxClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      if (!mediaSourceConnectedRef.current) {
        const source = ctx.createMediaElementSource(audioEl);

        // Warmth Biquad Filter (Low-shelf at 250 Hz for rich vocal body)
        const warmth = ctx.createBiquadFilter();
        warmth.type = "lowshelf";
        warmth.frequency.value = 250;
        warmth.gain.value = vocalWarmthRef.current;
        warmthFilterRef.current = warmth;

        // Clarity Biquad Filter (High-shelf at 5000 Hz for airy vocal presence)
        const clarity = ctx.createBiquadFilter();
        clarity.type = "highshelf";
        clarity.frequency.value = 5000;
        clarity.gain.value = vocalClarityRef.current;
        clarityFilterRef.current = clarity;

        // Analyser Node for 100% genuine real-time FFT spectrum data
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        source.connect(warmth);
        warmth.connect(clarity);
        clarity.connect(analyser);
        analyser.connect(ctx.destination);

        mediaSourceConnectedRef.current = true;
      }
    } catch (e) {
      // Audio element may already have a source node attached
    }
  }, []);

  // Setup Neural Audio Element
  useEffect(() => {
    const neuralAudio = new Audio();
    neuralAudio.crossOrigin = "anonymous";
    neuralAudioRef.current = neuralAudio;

    return () => {
      neuralAudio.pause();
      neuralAudio.src = "";
    };
  }, []);

  // Studio MP3 Audio Element setup
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
          setActiveSpokenPhrase(cleanSpokenPhrase(found.text));
          if (syncScroll) {
            const el = document.getElementById(`narrator-cue-${found.id}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }
      }
    };

    const onPlay = () => {
      isSpeakingSoundRef.current = true;
    };
    const onPlaying = () => {
      isSpeakingSoundRef.current = true;
    };
    const onPause = () => {
      isSpeakingSoundRef.current = false;
      setAudioLevel(0);
      setFrequencyBands(new Array(16).fill(0));
    };
    const onWaiting = () => {
      isSpeakingSoundRef.current = false;
    };
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      isSpeakingSoundRef.current = false;
      setIsPlaying(false);
      isPlayingRef.current = false;
      setAudioLevel(0);
      setFrequencyBands(new Array(16).fill(0));
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [manifest, syncScroll]);

  // Real-time Multilayer Acoustic Spectrum Analyzer (Combines Web Audio FFT + Studio Quiescent Baseline)
  useEffect(() => {
    let lastTime = performance.now();

    const updateVisualizer = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Are we actively playing and NOT paused or waiting inside a natural speech pause?
      const isActivelyPlaying = isPlayingRef.current && !isPausedRef.current && pauseTimeoutRef.current === null;

      if (!isActivelyPlaying) {
        // True studio resting baseline: strictly 0.0 dB (flat calm)
        setAudioLevel((prev) => (prev !== 0 ? 0 : prev));
        setFrequencyBands((prev) => (prev.some((v) => v !== 0) ? new Array(16).fill(0) : prev));
        visualizerRafRef.current = requestAnimationFrame(updateVisualizer);
        return;
      }

      // Check if real AnalyserNode is connected and active (Edge Neural or Studio Master audio)
      if (analyserRef.current && isSpeakingSoundRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const bands: number[] = [];
        const step = Math.max(1, Math.floor(bufferLength / 16));
        for (let i = 0; i < 16; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j] || 0;
          }
          const normalized = Math.round((sum / step) * (100 / 255));
          bands.push(normalized);
        }

        const overallLevel = Math.round(bands.reduce((acc, v) => acc + v, 0) / bands.length);

        if (overallLevel > 2) {
          setAudioLevel(overallLevel);
          setFrequencyBands(bands);
        } else {
          // In-audio breathing pause or brief silent consonant closure:
          setAudioLevel(0);
          setFrequencyBands(new Array(16).fill(0));
        }
        visualizerRafRef.current = requestAnimationFrame(updateVisualizer);
        return;
      }

      // If WebSpeech is actively speaking (no Web Audio analyser available)
      if (speechEngineRef.current === "webspeech" && isSpeakingSoundRef.current) {
        const persona = selectedPersonaRef.current;
        const pitch = getPersonaPitchHz(persona);
        const pitchFactor = pitch / 180;

        const bands = new Array(16).fill(0).map((_, i) => {
          const centerFreq = i < 4 ? 0.95 : i < 10 ? 1.25 : 0.75;
          const harmonicOsc = Math.sin(now * 0.007 * (i + 1) * pitchFactor);
          const noise = (Math.sin(now * 0.02 + i * 1.5) + 1) * 0.5;
          const level = Math.max(12, Math.min(95, (harmonicOsc * 35 + noise * 40 + 25) * centerFreq));
          return Math.round(level);
        });

        const overallLevel = Math.round(bands.reduce((acc, v) => acc + v, 0) / bands.length);
        setAudioLevel(overallLevel);
        setFrequencyBands(bands);
        visualizerRafRef.current = requestAnimationFrame(updateVisualizer);
        return;
      }

      // Default state while waiting for network audio chunk to buffer: 0 dB resting
      setAudioLevel((prev) => (prev !== 0 ? 0 : prev));
      setFrequencyBands((prev) => (prev.some((v) => v !== 0) ? new Array(16).fill(0) : prev));
      visualizerRafRef.current = requestAnimationFrame(updateVisualizer);
    };

    visualizerRafRef.current = requestAnimationFrame(updateVisualizer);
    return () => {
      if (visualizerRafRef.current) cancelAnimationFrame(visualizerRafRef.current);
    };
  }, []);

  // Smooth live timer ticker during TTS playback
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

  // Fallback Local WebSpeech Conductor with Chrome watchdog
  const speakWithWebSpeech = useCallback(
    (chunk: SpeechChunk, index: number, effectiveRate: number, pacing: PacingMode) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(chunk.text);

      const matchedVoice = matchBrowserVoice(availableVoices, selectedPersonaRef.current);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.rate = Math.max(0.5, Math.min(2.0, effectiveRate));
      utterance.pitch = selectedPersonaRef.current.pitch;

      utterance.onstart = () => {
        isSpeakingSoundRef.current = true;
      };

      utterance.onpause = () => {
        isSpeakingSoundRef.current = false;
        setAudioLevel(0);
        setFrequencyBands(new Array(16).fill(0));
      };

      utterance.onresume = () => {
        isSpeakingSoundRef.current = true;
      };

      utterance.onboundary = () => {
        if (isSpeakingSoundRef.current) {
          setAudioLevel(Math.min(95, Math.floor(Math.random() * 30) + 65));
        }
      };

      utterance.onend = () => {
        isSpeakingSoundRef.current = false;
        setAudioLevel(0);
        setFrequencyBands(new Array(16).fill(0));
        if (!isPlayingRef.current || isPausedRef.current) return;
        const nextIndex = index + 1;
        currentChunkIndexRef.current = nextIndex;
        setCurrentChunkIndex(nextIndex);
        const pauseScale = pacing === "academic" ? 1.2 : 1.0;
        const pauseMs = (chunk.pauseAfterMs * pauseScale) / playbackRateRef.current;

        pauseTimeoutRef.current = setTimeout(() => {
          pauseTimeoutRef.current = null;
          if (isPlayingRef.current && !isPausedRef.current) {
            speakChunk(nextIndex);
          }
        }, pauseMs);
      };

      utterance.onerror = (e) => {
        isSpeakingSoundRef.current = false;
        setAudioLevel(0);
        setFrequencyBands(new Array(16).fill(0));
        if (e.error === "interrupted" || e.error === "canceled") return;
        console.warn("Local SpeechSynthesis error, advancing chunk:", e.error);
        if (isPlayingRef.current && !isPausedRef.current) {
          currentChunkIndexRef.current = index + 1;
          setCurrentChunkIndex(index + 1);
          speakChunk(index + 1);
        }
      };

      // Chrome requires a brief tick between cancel() and speak() or it silently drops the utterance
      setTimeout(() => {
        if (!isPlayingRef.current || isPausedRef.current || typeof window === "undefined") return;
        window.speechSynthesis.speak(utterance);
      }, 35);

      // Chrome SpeechSynthesis stuck-silent watchdog:
      // Chrome freezes speechSynthesis after ~15s of speaking. Poll every 300ms
      // and forcibly resume if it reports 'speaking' but is paused/silent.
      const watchdogStart = Date.now();
      const watchdog = setInterval(() => {
        if (!isPlayingRef.current || isPausedRef.current) {
          clearInterval(watchdog);
          return;
        }
        if (Date.now() - watchdogStart > 30000) {
          clearInterval(watchdog);
          return;
        }
        if (typeof window !== "undefined" && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 300);
    },
    [availableVoices]
  );

  // Core Speech Conductor: Streams Edge Neural Voice with DSP Mastering, falling back to WebSpeech
  const speakChunk = useCallback(
    (index: number, overrideRate?: number) => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }

      // Ensure chunks are available
      if (!chunksRef.current || chunksRef.current.length === 0) {
        if (fallbackFullTextRef.current) {
          chunksRef.current = chunkTextForHumanSpeech(fallbackFullTextRef.current, selectedPersonaRef.current.pauseScale);
          setSpeechChunks(chunksRef.current);
        }
      }

      const chunks = chunksRef.current;
      if (!chunks || chunks.length === 0) return;

      // Reached end of text
      if (index >= chunks.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        isPausedRef.current = false;
        currentChunkIndexRef.current = 0;
        setCurrentChunkIndex(0);
        setActiveSpokenPhrase("");
        return;
      }

      const chunk = chunks[index];
      currentChunkIndexRef.current = index;
      setCurrentChunkIndex(index);
      const cleanPhrase = cleanSpokenPhrase(chunk.text || chunk.rawText);
      setActiveSpokenPhrase(cleanPhrase);

      // Approximate time based on chunks count
      const approxChunkDuration = Math.max(2, chunk.text.length * 0.065);
      const cumulativeTime = index * approxChunkDuration;
      setCurrentTime(+cumulativeTime.toFixed(1));

      // Calculate effective rate & pacing
      const pacing = pacingModeRef.current;
      const pacingScale = pacing === "academic" ? 0.92 : pacing === "conversational" ? 0.96 : 1.1;
      const effectiveRate = (overrideRate ?? playbackRateRef.current) * pacingScale;

      // ─── ENGINE 1: ULTRA HD MICROSOFT EDGE NEURAL (Human Studio Voice) ───
      if (speechEngineRef.current === "neural") {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }

        const audio = neuralAudioRef.current || new Audio();
        neuralAudioRef.current = audio;
        audio.volume = 1.0;
        initWebAudioPipeline(audio);

        const personaId = selectedPersonaRef.current.id;
        const encodedText = encodeURIComponent(chunk.text);
        const ttsUrl = `/api/tts?text=${encodedText}&persona=${personaId}&rate=${effectiveRate}&pitch=${selectedPersonaRef.current.pitch}`;

        isSpeakingSoundRef.current = false;
        audio.src = ttsUrl;
        audio.playbackRate = playbackRateRef.current;
        audio.load();

        let hasFallenBack = false;
        const fallbackToWeb = (reason: string) => {
          isSpeakingSoundRef.current = false;
          if (!hasFallenBack && isPlayingRef.current && !isPausedRef.current) {
            hasFallenBack = true;
            console.warn(`Falling back to WebSpeech (${reason})`);
            speakWithWebSpeech(chunk, index, effectiveRate, pacing);
          }
        };

        // Adaptive safety timeout based on chunk text length (minimum 12s, up to 25s for long complex engineering sentences)
        // Prevents premature fallback to WebSpeech while Edge Neural synthesizes high-fidelity audio over the network
        const timeoutMs = Math.max(12000, Math.min(25000, chunk.text.length * 75));
        const loadTimeout = setTimeout(() => {
          if (audio.readyState < 2 && !hasFallenBack) {
            audio.pause();
            fallbackToWeb(`Stream timeout >${timeoutMs}ms`);
          }
        }, timeoutMs);

        audio.onplaying = () => {
          isSpeakingSoundRef.current = true;
          clearTimeout(loadTimeout);

          // Intelligent Lookahead Prefetch: warm up Edge Neural cache for the upcoming chunk while the current chunk is speaking
          const nextIdx = index + 1;
          if (nextIdx < chunksRef.current.length && speechEngineRef.current === "neural") {
            const nextChunk = chunksRef.current[nextIdx];
            if (nextChunk && nextChunk.text) {
              const nextEncodedText = encodeURIComponent(nextChunk.text);
              const nextTtsUrl = `/api/tts?text=${nextEncodedText}&persona=${personaId}&rate=${effectiveRate}&pitch=${selectedPersonaRef.current.pitch}`;
              fetch(nextTtsUrl, { priority: "low" } as any).catch(() => {});
            }
          }
        };

        audio.onpause = () => {
          isSpeakingSoundRef.current = false;
        };

        audio.onwaiting = () => {
          isSpeakingSoundRef.current = false;
        };

        audio.onended = () => {
          isSpeakingSoundRef.current = false;
          setAudioLevel(0);
          setFrequencyBands(new Array(16).fill(0));
          clearTimeout(loadTimeout);
          if (!isPlayingRef.current || isPausedRef.current) return;
          const nextIndex = index + 1;
          currentChunkIndexRef.current = nextIndex;
          setCurrentChunkIndex(nextIndex);
          const pauseScale = pacing === "academic" ? 1.2 : 1.0;
          const pauseMs = (chunk.pauseAfterMs * pauseScale) / playbackRateRef.current;

          pauseTimeoutRef.current = setTimeout(() => {
            pauseTimeoutRef.current = null;
            if (isPlayingRef.current && !isPausedRef.current) {
              speakChunk(nextIndex);
            }
          }, pauseMs);
        };

        audio.onerror = () => {
          isSpeakingSoundRef.current = false;
          setAudioLevel(0);
          setFrequencyBands(new Array(16).fill(0));
          clearTimeout(loadTimeout);
          fallbackToWeb("Audio element error");
        };

        const playPromise = audio.play();
        if (playPromise) {
          playPromise.catch((err) => {
            clearTimeout(loadTimeout);
            if (err.name === "AbortError") return;
            fallbackToWeb("play() promise rejected: " + err.message);
          });
        }
        return;
      }

      // ─── ENGINE 2: NATIVE WEBSPEECH API (Offline) ───
      speakWithWebSpeech(chunk, index, effectiveRate, pacing);
    },
    [availableVoices, initWebAudioPipeline, speakWithWebSpeech]
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
      const chunks = chunkTextForHumanSpeech(fallbackText, selectedPersonaRef.current.pauseScale);
      chunksRef.current = chunks;
      setSpeechChunks(chunks);
    }

    // Synchronously resume audio hardware on user gesture
    if (typeof window !== "undefined") {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }

    const hasStudioAudio = !!audioUrl;

    if (hasStudioAudio && !currentTrack?.isTTS) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (neuralAudioRef.current) {
        neuralAudioRef.current.pause();
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
    // Synchronously resume audio hardware on user gesture
    if (typeof window !== "undefined") {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (neuralAudioRef.current) {
      neuralAudioRef.current.pause();
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
    setSpeechChunks(chunks);
    currentChunkIndexRef.current = startIndex;
    setCurrentChunkIndex(startIndex);

    // Approximate total duration based on reading rate
    const totalWords = text.split(/\s+/).length;
    const estimatedSeconds = Math.round((totalWords / 130) * 60);
    setDuration(Math.max(30, estimatedSeconds));

    setCurrentTrack({ slug, title, audioUrl: "", isTTS: true });
    setIsPlaying(true);
    isPlayingRef.current = true;
    isPausedRef.current = false;

    // Start speaking with human cadence from specified start index
    speakChunk(startIndex);

    // Eagerly prefetch chunk startIndex + 1 into server cache in background
    if (startIndex + 1 < chunks.length && speechEngineRef.current === "neural") {
      const nextChunk = chunks[startIndex + 1];
      if (nextChunk && nextChunk.text) {
        const nextEncodedText = encodeURIComponent(nextChunk.text);
        const personaId = selectedPersonaRef.current.id;
        const pacing = pacingModeRef.current;
        const pacingScale = pacing === "academic" ? 0.92 : pacing === "conversational" ? 0.96 : 1.1;
        const effectiveRate = playbackRateRef.current * pacingScale;
        const nextTtsUrl = `/api/tts?text=${nextEncodedText}&persona=${personaId}&rate=${effectiveRate}&pitch=${selectedPersonaRef.current.pitch}`;
        fetch(nextTtsUrl, { priority: "low" } as any).catch(() => {});
      }
    }
  };

  const togglePlay = () => {
    // Synchronously resume audio hardware on user gesture
    if (typeof window !== "undefined") {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }

    if (!currentTrack) {
      if (fallbackFullTextRef.current) {
        startTTS("chapter", "Narration", fallbackFullTextRef.current);
      }
      return;
    }

    if (currentTrack.isTTS) {
      if (isPlaying) {
        // Clean Pause
        isSpeakingSoundRef.current = false;
        setAudioLevel(0);
        setFrequencyBands(new Array(16).fill(0));
        if (pauseTimeoutRef.current) {
          clearTimeout(pauseTimeoutRef.current);
          pauseTimeoutRef.current = null;
        }
        if (neuralAudioRef.current) {
          neuralAudioRef.current.pause();
        }
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        isPausedRef.current = true;
        isPlayingRef.current = false;
        setIsPlaying(false);
      } else {
        // Clean Resume / Replay
        if (chunksRef.current.length === 0 && fallbackFullTextRef.current) {
          chunksRef.current = chunkTextForHumanSpeech(fallbackFullTextRef.current, selectedPersonaRef.current.pauseScale);
        }
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
      isSpeakingSoundRef.current = false;
      setAudioLevel(0);
      setFrequencyBands(new Array(16).fill(0));
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      if (!audioRef.current.src || audioRef.current.src.endsWith("/") || audioRef.current.error) {
        startTTS(currentTrack.slug, currentTrack.title, fallbackFullTextRef.current || currentTrack.title);
        return;
      }
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
        })
        .catch((e) => {
          if (e.name !== "AbortError") {
            console.warn("Studio audio play failed, falling back to TTS:", e);
            startTTS(currentTrack.slug, currentTrack.title, fallbackFullTextRef.current || currentTrack.title);
          }
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
      setCurrentChunkIndex(targetIdx);
      setCurrentTime(time);
      if (isPlayingRef.current && !isPausedRef.current) {
        speakChunk(targetIdx);
      } else {
        setActiveSpokenPhrase(cleanSpokenPhrase(chunks[targetIdx]?.rawText || chunks[targetIdx]?.text || ""));
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
      setCurrentChunkIndex(targetIdx);
      if (isPlayingRef.current && !isPausedRef.current) {
        speakChunk(targetIdx);
      } else {
        setActiveSpokenPhrase(cleanSpokenPhrase(chunks[targetIdx]?.rawText || chunks[targetIdx]?.text || ""));
        const approxChunkDuration = Math.max(2, (chunks[targetIdx]?.text.length || 20) * 0.065);
        setCurrentTime(+(targetIdx * approxChunkDuration).toFixed(1));
      }
      return;
    }

    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + delta));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const setRate = (rate: number) => {
    setPlaybackRate(rate);
    playbackRateRef.current = rate;

    if (currentTrack?.isTTS) {
      if (neuralAudioRef.current) {
        neuralAudioRef.current.playbackRate = rate;
      }
      // Instantly recalibrate ongoing chunk with new rate without restarting sentence
      if (isPlayingRef.current && !isPausedRef.current) {
        speakChunk(currentChunkIndexRef.current, rate);
      }
    } else if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const setSpeechEngine = (engine: SpeechEngine) => {
    setSpeechEngineState(engine);
    speechEngineRef.current = engine;
    if (isPlayingRef.current && currentTrack?.isTTS) {
      speakChunk(currentChunkIndexRef.current);
    }
  };

  const setVocalWarmth = (db: number) => {
    setVocalWarmthState(db);
    vocalWarmthRef.current = db;
    if (warmthFilterRef.current) {
      warmthFilterRef.current.gain.value = db;
    }
  };

  const setVocalClarity = (db: number) => {
    setVocalClarityState(db);
    vocalClarityRef.current = db;
    if (clarityFilterRef.current) {
      clarityFilterRef.current.gain.value = db;
    }
  };

  const previewPersona = (persona: VoicePersona) => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    if (neuralAudioRef.current) neuralAudioRef.current.pause();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setSelectedPersona(persona);
    selectedPersonaRef.current = persona;

    const sampleText = `Hello. I am ${persona.name}. Ready to walk you through our lyophilization engineering dossiers.`;

    if (speechEngineRef.current === "neural") {
      const audio = neuralAudioRef.current || new Audio();
      neuralAudioRef.current = audio;
      initWebAudioPipeline(audio);
      audio.src = `/api/tts?text=${encodeURIComponent(sampleText)}&persona=${persona.id}&rate=1.0&pitch=${persona.pitch}`;
      audio.play().catch(() => {});
      return;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(sampleText);
      const voice = matchBrowserVoice(availableVoices, persona);
      if (voice) utterance.voice = voice;
      utterance.rate = persona.rate;
      utterance.pitch = persona.pitch;
      window.speechSynthesis.speak(utterance);
    }
  };

  const syncToSelection = (overrideText?: string): boolean => {
    const textToSync = overrideText || lastSelectedTextRef.current;
    if (!textToSync || textToSync.trim().length === 0) return false;

    const cleanText = textToSync.trim();

    if (!chunksRef.current || chunksRef.current.length === 0) {
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

    setCurrentTrack((prev) =>
      prev
        ? { ...prev, isTTS: true }
        : { slug: "selection-sync", title: "Document Narration", audioUrl: "", isTTS: true }
    );

    setIsPlaying(true);
    isPlayingRef.current = true;
    isPausedRef.current = false;
    currentChunkIndexRef.current = targetIdx;
    setCurrentChunkIndex(targetIdx);
    setSpeechChunks(chunksRef.current);

    speakChunk(targetIdx);
    return true;
  };

  const currentChunk = speechChunks[currentChunkIndex] || null;

  const prepareChapterText = useCallback((text: string, slug?: string, title?: string) => {
    if (!text) return;
    fallbackFullTextRef.current = text;
    const chunks = chunkTextForHumanSpeech(text, selectedPersonaRef.current.pauseScale);
    chunksRef.current = chunks;
    setSpeechChunks(chunks);
    if (slug || title) {
      setCurrentTrack((prev) => {
        if (prev?.slug === slug) return prev;
        return { slug: slug || "chapter", title: title || "Chapter Narration", audioUrl: "", isTTS: true };
      });
    }
  }, []);

  const seekToChunk = useCallback(
    (index: number) => {
      // Synchronously resume audio hardware on user gesture
      if (typeof window !== "undefined") {
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume().catch(() => {});
        }
        if (window.speechSynthesis && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }

      if (!chunksRef.current || chunksRef.current.length === 0) {
        if (fallbackFullTextRef.current) {
          chunksRef.current = chunkTextForHumanSpeech(
            fallbackFullTextRef.current,
            selectedPersonaRef.current.pauseScale
          );
          setSpeechChunks(chunksRef.current);
        }
      }
      const chunks = chunksRef.current;
      if (!chunks || chunks.length === 0) return;
      const targetIdx = Math.max(0, Math.min(chunks.length - 1, index));
      currentChunkIndexRef.current = targetIdx;
      setCurrentChunkIndex(targetIdx);

      setCurrentTrack((prev) =>
        prev
          ? { ...prev, isTTS: true }
          : { slug: "chapter-speech", title: "Document Narration", audioUrl: "", isTTS: true }
      );

      setIsPlaying(true);
      isPlayingRef.current = true;
      isPausedRef.current = false;
      speakChunk(targetIdx);
    },
    [speakChunk]
  );

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
        readerPanelOpen,
        selectedPersona,
        pacingMode,
        speechEngine,
        vocalWarmth,
        vocalClarity,
        audioLevel,
        frequencyBands,
        livePitchHz,
        activeSpokenPhrase,
        availableVoices,
        hasActiveSelection,
        selectedSnippet,
        speechChunks,
        currentChunkIndex,
        currentChunk,
        setReaderPanelOpen,
        seekToChunk,
        prepareChapterText,
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
        setSpeechEngine,
        setVocalWarmth,
        setVocalClarity,
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
