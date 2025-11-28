import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

/**
 * Particle Field - Creates an ambient floating particle effect
 * that adds depth and movement to the background.
 */
export function ParticleField({ count = 50 }: { count?: number }) {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();

  const colors = isDark
    ? ['#22D3EE', '#F472B6', '#4ADE80', '#3B82F6', '#F59E0B']
    : ['#3B82F6', '#F97316', '#10B981', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    // Initialize particles
    const initialParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.02,
      speedY: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(initialParticles);

    // Animation loop
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16; // Normalize to ~60fps
      lastTime = currentTime;

      setParticles((prev) =>
        prev.map((p) => {
          let newX = p.x + p.speedX * deltaTime;
          let newY = p.y + p.speedY * deltaTime;

          // Wrap around edges
          if (newX < 0) newX = 100;
          if (newX > 100) newX = 0;
          if (newY < 0) newY = 100;
          if (newY > 100) newY = 0;

          return { ...p, x: newX, y: newY };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [count, isDark]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: particle.id * 0.01 }}
        />
      ))}
    </div>
  );
}

/**
 * Floating Orbs - Larger, more prominent floating elements
 */
export function FloatingOrbs() {
  const { isDark } = useTheme();

  const orbs = [
    { size: 300, x: '10%', y: '20%', color: isDark ? '#22D3EE' : '#3B82F6', delay: 0 },
    { size: 200, x: '80%', y: '60%', color: isDark ? '#F472B6' : '#F97316', delay: 2 },
    { size: 150, x: '60%', y: '10%', color: isDark ? '#4ADE80' : '#10B981', delay: 4 },
    { size: 100, x: '20%', y: '70%', color: isDark ? '#8B5CF6' : '#8B5CF6', delay: 6 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color}15 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}
