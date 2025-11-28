import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

export type SoundKey =
  | 'jd_upload_success'    // Job description uploaded successfully
  | 'modal_open'           // Modal/dialog opened (sponsorship, etc.)
  | 'settings_saved'       // Settings/step saved
  | 'resume_drop'          // Resume dropped onto upload area
  | 'all_candidates_ready' // All candidates finished evaluating
  | 'parse_error'          // Parse/upload error
  | 'candidate_select'     // Candidate selected in staircase
  | 'unicorn_found'        // 95+ score candidate found
  | 'action_positive'      // Star, shortlist, positive action
  | 'action_negative'      // Reject, pass action
  | 'email_ready'          // Email generation complete
  | 'copy_success';        // Copied to clipboard

interface SoundContextValue {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  play: (key: SoundKey) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

// Web Audio API based sound generator for placeholder sounds
function createOscillatorSound(
  audioContext: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Sound configurations for Web Audio synthesis
const SOUND_CONFIGS: Record<SoundKey, { freq: number; duration: number; type: OscillatorType }> = {
  jd_upload_success: { freq: 880, duration: 0.3, type: 'sine' },
  modal_open: { freq: 440, duration: 0.1, type: 'sine' },
  settings_saved: { freq: 660, duration: 0.15, type: 'sine' },
  resume_drop: { freq: 220, duration: 0.2, type: 'sine' },
  all_candidates_ready: { freq: 1046, duration: 0.4, type: 'sine' },
  parse_error: { freq: 180, duration: 0.25, type: 'triangle' },
  candidate_select: { freq: 520, duration: 0.08, type: 'sine' },
  unicorn_found: { freq: 1318, duration: 0.5, type: 'sine' },
  action_positive: { freq: 784, duration: 0.15, type: 'sine' },
  action_negative: { freq: 294, duration: 0.2, type: 'triangle' },
  email_ready: { freq: 698, duration: 0.35, type: 'sine' },
  copy_success: { freq: 600, duration: 0.1, type: 'sine' },
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lotus-sound-enabled') !== 'false';
    }
    return true;
  });

  const [volume, setVolumeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lotus-sound-volume');
      return saved ? parseFloat(saved) : 0.35;
    }
    return 0.35;
  });

  const [reducedMotion, setReducedMotionState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lotus-reduced-motion');
      if (saved !== null) return saved === 'true';
      // Respect OS preference
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Audio context (lazy initialized)
  const audioContextRef = useMemo(() => {
    if (typeof window !== 'undefined') {
      return { current: null as AudioContext | null };
    }
    return { current: null };
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, [audioContextRef]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('lotus-sound-enabled', enabled ? 'true' : 'false');
  }, [enabled]);

  useEffect(() => {
    localStorage.setItem('lotus-sound-volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('lotus-reduced-motion', reducedMotion ? 'true' : 'false');
  }, [reducedMotion]);

  // Listen for OS reduced motion changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('lotus-reduced-motion');
      if (saved === null) {
        setReducedMotionState(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const play = useCallback((key: SoundKey) => {
    if (!enabled) return;

    const config = SOUND_CONFIGS[key];
    if (!config) return;

    try {
      const ctx = getAudioContext();
      if (ctx) {
        // Resume context if suspended (autoplay policy)
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        createOscillatorSound(ctx, config.freq, config.duration, config.type, volume);
      }
    } catch {
      // Silently fail - sound is non-critical
    }
  }, [enabled, volume, getAudioContext]);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(1, v)));
  }, []);

  const setReducedMotion = useCallback((v: boolean) => {
    setReducedMotionState(v);
  }, []);

  const value: SoundContextValue = useMemo(() => ({
    enabled,
    setEnabled,
    volume,
    setVolume,
    reducedMotion,
    setReducedMotion,
    play,
  }), [enabled, setEnabled, volume, setVolume, reducedMotion, setReducedMotion, play]);

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error('useSound must be used inside SoundProvider');
  }
  return ctx;
}

// Hook for accessing just the reduced motion preference
export function useReducedMotion() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    // Fallback if used outside provider
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }
  return ctx.reducedMotion;
}
