export default {
    theme: {
        extend: {
            colors: {
                app: '#030712', // Deepest Navy/Black
                surface: 'rgba(17, 24, 39, 0.4)', // Glass
                lotus: {
                    cyan: '#22D3EE',   // Primary Action
                    purple: '#A855F7', // Unicorn/High Score
                    emerald: '#10B981', // Success
                    amber: '#F59E0B',   // Warning
                    red: '#EF4444',     // Danger
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'aurora': 'radial-gradient(ellipse at top, rgba(34, 211, 238, 0.15), transparent 70%)',
            }
        }
    }
}
