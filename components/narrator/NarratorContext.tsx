"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import type { AudioManifest, AudioCue } from "@/lib/types";

interface NarratorContextType {
  isPlaying: boolean;
  currentTrack: {
    slug: string;
    title: string;
    audioUrl: string;
  } | null;
  currentTime: number;
  duration: number;
  playbackRate: number;
  syncScroll: boolean;
  activeCue: AudioCue | null;
  manifest: AudioManifest | null;
  transcriptOpen: boolean;
  loadTrack: (slug: string, title: string, audioUrl: string, manifest?: AudioManifest | null) => void;
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
  const [currentTrack, setCurrentTrack] = useState<{ slug: string; title: string; audioUrl: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [syncScroll, setSyncScroll] = useState(false);
  const [activeCue, setActiveCue] = useState<AudioCue | null>(null);
  const [manifest, setManifest] = useState<AudioManifest | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);

      // Find active cue in manifest
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

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [manifest, syncScroll]);

  const loadTrack = (slug: string, title: string, audioUrl: string, trackManifest?: AudioManifest | null) => {
    if (!audioRef.current) return;
    if (currentTrack?.audioUrl === audioUrl) {
      // Same track, just toggle play
      togglePlay();
      return;
    }

    audioRef.current.src = audioUrl;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => console.log("Audio autoplay prevented", err));

    setCurrentTrack({ slug, title, audioUrl });
    if (trackManifest) {
      setManifest(trackManifest);
      setDuration(trackManifest.totalDuration);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (delta: number) => {
    if (!audioRef.current) return;
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
