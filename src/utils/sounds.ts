// Sound Effects Utility
// Uses Web Audio API for lightweight, code-generated sounds

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Soft chime for role creation success
  playChime() {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Create a pleasant two-note chime
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)

      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);

        // Gentle attack and decay
        gainNode.gain.setValueAtTime(0, now + i * 0.08);
        gainNode.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(now + i * 0.08);
        oscillator.stop(now + i * 0.08 + 0.7);
      });
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Subtle success sound
  playSuccess() {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, now); // A4
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.35);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Soft click for interactions
  playClick() {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, now);

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.06);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Celebration sound for unicorn candidates (95+)
  playCelebration() {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Ascending arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(freq, now);

        const startTime = now + i * 0.1;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.45);
      });
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }
}

// Singleton instance
export const soundManager = new SoundManager();

// Convenience functions
export const playChime = () => soundManager.playChime();
export const playSuccess = () => soundManager.playSuccess();
export const playClick = () => soundManager.playClick();
export const playCelebration = () => soundManager.playCelebration();
export const setSoundEnabled = (enabled: boolean) => soundManager.setEnabled(enabled);
export const isSoundEnabled = () => soundManager.isEnabled();
