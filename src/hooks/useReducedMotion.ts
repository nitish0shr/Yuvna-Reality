import { useState, useEffect } from 'react';

/**
 * Hook to detect user's reduced motion preference
 * Respects the prefers-reduced-motion media query
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return false;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Legacy browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Returns animation props based on reduced motion preference
 * Use this to conditionally disable animations
 */
export function useMotionSafe() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    // Safe animation duration (0 if reduced motion)
    duration: prefersReducedMotion ? 0 : undefined,
    // Safe transition props
    transition: prefersReducedMotion
      ? { duration: 0 }
      : undefined,
    // Helper to wrap animation values
    animate: <T,>(value: T, fallback: T): T =>
      prefersReducedMotion ? fallback : value,
  };
}
