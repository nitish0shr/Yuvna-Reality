import { ReactNode, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  perspective?: number;
  maxTilt?: number;
  scale?: number;
  glare?: boolean;
}

/**
 * Tilt3D - Interactive 3D tilt effect on hover
 */
export function Tilt3D({
  children,
  className = '',
  perspective = 1000,
  maxTilt = 15,
  scale = 1.05,
  glare = true,
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const glareX = useTransform(xSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(ySpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ perspective }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full"
      >
        {children}

        {/* Glare effect */}
        {glare && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden"
            style={{
              background: `radial-gradient(
                circle at ${glareX} ${glareY},
                rgba(255,255,255,0.15) 0%,
                transparent 60%
              )`,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

/**
 * FloatingElement - Continuous floating animation
 */
interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
}

export function FloatingElement({
  children,
  className = '',
  amplitude = 20,
  duration = 6,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-amplitude / 2, amplitude / 2, -amplitude / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ParallaxLayer - Creates parallax depth effect
 */
interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  speed?: number; // -1 to 1, negative moves opposite to scroll
  offset?: number;
}

export function ParallaxLayer({
  children,
  className = '',
  speed = 0.5,
  offset = 0,
}: ParallaxLayerProps) {
  const y = useMotionValue(0);

  // Simple parallax based on mouse position
  const handleMouseMove = (e: MouseEvent) => {
    const windowHeight = window.innerHeight;
    const mouseY = e.clientY;
    const normalizedY = (mouseY / windowHeight - 0.5) * 2; // -1 to 1
    y.set(normalizedY * speed * 100 + offset);
  };

  // Add event listener on mount
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', handleMouseMove);
  }

  return (
    <motion.div
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
}

/**
 * DepthCard - Card with 3D depth layers
 */
interface DepthCardProps {
  children: ReactNode;
  className?: string;
  layers?: number;
}

export function DepthCard({
  children,
  className = '',
  layers = 3,
}: DepthCardProps) {
  return (
    <Tilt3D className={className}>
      <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
        {/* Shadow layers */}
        {Array.from({ length: layers }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-[inherit] bg-black/10 blur-sm"
            style={{
              transform: `translateZ(${-(i + 1) * 10}px)`,
              opacity: 1 - (i + 1) * 0.2,
            }}
          />
        ))}

        {/* Main content */}
        <div style={{ transform: 'translateZ(20px)' }}>{children}</div>
      </div>
    </Tilt3D>
  );
}

/**
 * PerspectiveGrid - 3D grid background
 */
export function PerspectiveGrid() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'rotateX(60deg)',
          transformOrigin: 'center center',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '60px 60px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

/**
 * HoverCard3D - Card that reacts to hover with 3D transforms
 */
interface HoverCard3DProps {
  children: ReactNode;
  className?: string;
}

export function HoverCard3D({ children, className = '' }: HoverCard3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      className={`relative group ${className}`}
      whileHover="hover"
      initial="rest"
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="relative w-full h-full"
        variants={{
          rest: {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
          },
          hover: {
            rotateX: -5,
            rotateY: 5,
            scale: 1.02,
            transition: {
              duration: 0.4,
              ease: 'easeOut',
            },
          },
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Background shadow */}
        <motion.div
          className="absolute inset-0 rounded-[inherit] bg-black/20"
          variants={{
            rest: { transform: 'translateZ(-20px) scale(0.95)', opacity: 0 },
            hover: { transform: 'translateZ(-40px) scale(1.05)', opacity: 0.5 },
          }}
          style={{ filter: 'blur(20px)' }}
        />

        {/* Content layer */}
        <div style={{ transform: 'translateZ(0)' }}>{children}</div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 },
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
              transform: 'translateX(-100%)',
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * MorphingShape - Continuously morphing blob shape
 */
export function MorphingShape({
  size = 300,
  color = '#22D3EE',
  className = '',
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  const paths = [
    'M44.5,25.5 C51.7,8.4 71.4,-2.4 84.4,0.4 C97.4,3.3 93.9,29.6 96.7,46.8 C99.5,64 108.3,84.5 102.2,92.9 C96.2,101.3 75.3,97.6 57.9,98.4 C40.5,99.2 26.6,104.4 17.7,97.9 C8.9,91.4 5,73.1 4.5,56.4 C4.1,39.7 7.1,24.6 17.2,17.5 C27.3,10.4 44.5,11.3 44.5,25.5',
    'M57.3,12.5 C70.9,6.7 88.8,2.2 96.1,12.4 C103.5,22.7 100.3,47.6 101.3,65.8 C102.3,83.9 107.4,95.3 99.1,100.8 C90.8,106.3 69.1,106 53.2,101.6 C37.3,97.2 27.2,88.8 17.7,77.9 C8.2,67 -0.6,53.5 0.5,40.2 C1.6,26.9 12.5,13.8 26.1,8.5 C39.7,3.3 55.9,5.9 57.3,12.5',
    'M47.9,7.1 C62.1,0.4 82.2,-3.3 92.8,6.9 C103.4,17.1 104.5,41.1 103.2,60.1 C101.9,79.1 98.3,93.1 87.6,100.6 C77,108.2 59.3,109.3 44.2,105.7 C29.1,102.2 16.5,94 9.7,80.7 C2.9,67.4 1.9,49.1 5.2,34.2 C8.5,19.4 16.2,8 28.7,4.8 C41.2,1.6 58.6,6.6 47.9,7.1',
  ];

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="0 0 110 110"
        className="w-full h-full"
        style={{ filter: 'blur(40px)' }}
      >
        <motion.path
          fill={color}
          fillOpacity={0.15}
          animate={{
            d: paths,
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.svg>
    </motion.div>
  );
}
