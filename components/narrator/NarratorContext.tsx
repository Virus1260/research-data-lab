"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import type { AudioManifest, AudioCue } from "@/lib/types";

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
  activeCue: AudioCue | null;
  manifest: AudioManifest | null;
  transcriptOpen: boolean;
  loadTrack: (slug: string, title: string, audioUrl: string, manifest?: AudioManifest | null, fallbackText?: string) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  setRate: (rate: number) => void;
  setSyncScroll: (sync: boolean) => void;
  setTranscriptOpen: (open: boolean) => void;
}

const NarratorContext = createContext<NarratorContextType | null>(null);

export function NarratorProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{ slug: string; title: string; audioUrl: string; isTTS?: boolean } | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [syncScroll, setSyncScroll] = useState(false);
  const [activeCue, setActiveCue] = useState<AudioCue | null>(null);
  const [manifest, setManifest] = useState<AudioManifest | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsTextRef = useRef<string>("");

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
    const onEnded = () => setIsPlaying(false);
    const onError = () => {
      console.warn("Audio element error, falling back to TTS if available");
      if (ttsTextRef.current) {
        playTTS(ttsTextRef.current);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [manifest, syncScroll]);

  const playTTS = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Clean markdown headings, links, code formatting for natural speech
    const cleanText = text
      .replace(/#+\s+/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\|/g, " ")
      .replace(/---+/g, "")
      .slice(0, 3000); // Read first chunk

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = playbackRate;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setDuration(Math.round(cleanText.length / 15));
  };

  const loadTrack = (
    slug: string,
    title: string,
    audioUrl: string,
    trackManifest?: AudioManifest | null,
    fallbackText?: string
  ) => {
    ttsTextRef.current = fallbackText || title;

    if (currentTrack?.slug === slug && (audioUrl ? currentTrack?.audioUrl === audioUrl : currentTrack?.isTTS)) {
      togglePlay();
      return;
    }

    // If audioUrl is provided, attempt HTML5 Audio
    if (audioUrl) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.warn("Audio file playback blocked or failed, falling back to TTS:", err);
              if (fallbackText) {
                setCurrentTrack({ slug, title, audioUrl, isTTS: true });
                playTTS(fallbackText);
              }
            });
        }
      }
      setCurrentTrack({ slug, title, audioUrl, isTTS: false });
      if (trackManifest) {
        setManifest(trackManifest);
        setDuration(trackManifest.totalDuration);
      }
    } else if (fallbackText) {
      // Fallback directly to SpeechSynthesis
      setCurrentTrack({ slug, title, audioUrl: "", isTTS: true });
      playTTS(fallbackText);
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;

    if (currentTrack.isTTS) {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else if (ttsTextRef.current) {
          playTTS(ttsTextRef.current);
        }
      }
      return;
    }

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


  return (
    <NarratorContext.Provider
      value={{
        isPlaying,
        currentTrack,
        currentTime,
        duration,
        playbackRate,
        syncScroll,
        activeCue,
        manifest,
        transcriptOpen,
        loadTrack,
        togglePlay,
        seek,
        skip,
        setRate,
        setSyncScroll,
        setTranscriptOpen,
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
