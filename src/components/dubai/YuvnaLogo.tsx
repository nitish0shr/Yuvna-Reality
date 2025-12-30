import { motion } from 'framer-motion';

interface YuvnaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

export function YuvnaLogo({ size = 'md', showText = true, className = '', animate = false }: YuvnaLogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg', subtitle: 'text-[8px]' },
    md: { icon: 48, text: 'text-2xl', subtitle: 'text-[10px]' },
    lg: { icon: 64, text: 'text-3xl', subtitle: 'text-xs' },
  };

  const { icon, text, subtitle } = sizes[size];

  const LogoIcon = () => (
    <svg 
      width={icon} 
      height={icon} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orange Sun/Circle */}
      <circle cx="50" cy="35" r="22" fill="#E07F26" />
      
      {/* Building Outlines */}
      <g stroke="#3D2D22" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Left building */}
        <path d="M20 95 L20 55 L35 45 L35 95" />
        
        {/* Center tall building */}
        <path d="M38 95 L38 35 L50 25 L62 35 L62 95" />
        
        {/* Right building */}
        <path d="M65 95 L65 45 L80 55 L80 95" />
      </g>
    </svg>
  );

  const Wrapper = animate ? motion.div : 'div';
  const wrapperProps = animate ? {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  } : {};

  return (
    <Wrapper className={`flex items-center gap-3 ${className}`} {...wrapperProps}>
      <LogoIcon />
      {showText && (
        <div className="flex flex-col">
          <span 
            className={`${text} font-bold text-[#3D2D22] tracking-[0.15em] uppercase`}
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            YUVNA
          </span>
          <span 
            className={`${subtitle} uppercase tracking-[0.3em] text-[#3D2D22] -mt-0.5`}
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            REALTY
          </span>
        </div>
      )}
    </Wrapper>
  );
}

// Compact version for headers
export function YuvnaLogoCompact({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        width={36} 
        height={36} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="35" r="22" fill="#E07F26" />
        <g stroke="#3D2D22" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 95 L20 55 L35 45 L35 95" />
          <path d="M38 95 L38 35 L50 25 L62 35 L62 95" />
          <path d="M65 95 L65 45 L80 55 L80 95" />
        </g>
      </svg>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-[#3D2D22] tracking-[0.12em] uppercase leading-tight">
          YUVNA
        </span>
        <span className="text-[9px] uppercase tracking-[0.25em] text-[#3D2D22] -mt-0.5">
          REALTY
        </span>
      </div>
    </div>
  );
}

// Agent portal version
export function YuvnaLogoAgent({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        width={36} 
        height={36} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="35" r="22" fill="#E07F26" />
        <g stroke="#3D2D22" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 95 L20 55 L35 45 L35 95" />
          <path d="M38 95 L38 35 L50 25 L62 35 L62 95" />
          <path d="M65 95 L65 45 L80 55 L80 95" />
        </g>
      </svg>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-[#3D2D22] tracking-[0.1em] uppercase leading-tight">
          YUVNA
        </span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-[#7a6a5f] -mt-0.5">
          Agent Portal
        </span>
      </div>
    </div>
  );
}

