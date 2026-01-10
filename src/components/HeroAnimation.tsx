import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface DataPoint {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
}

const generateDataPoints = (count: number): DataPoint[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 15 + 8,
        delay: Math.random() * 3,
    }));
};

const HeroAnimation = () => {
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);

    useEffect(() => {
        setDataPoints(generateDataPoints(20));
    }, []);

    return (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Subtle pink glow accents - NOT cosmic blobs */}
            <div className="absolute top-20 left-1/4 w-64 h-64 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-pink-400/8 dark:bg-pink-400/15 rounded-full blur-3xl" />

            {/* Circuit grid SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-40">
                <defs>
                    <linearGradient id="circuit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
                        <stop offset="50%" stopColor="#ec4899" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                    </linearGradient>
                    <pattern id="circuit-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                        <path
                            d="M 0 40 L 30 40 L 40 30 L 40 0 M 40 80 L 40 50 L 50 40 L 80 40"
                            stroke="currentColor"
                            strokeWidth="0.5"
                            fill="none"
                            opacity="0.3"
                        />
                        <circle cx="40" cy="40" r="2" fill="#ec4899" opacity="0.4" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#circuit-pattern)" />

                {/* Animated data flow lines */}
                {dataPoints.slice(0, 5).map((point, i) => (
                    <motion.line
                        key={`line-${i}`}
                        x1={`${point.x}%`}
                        y1={`${point.y}%`}
                        x2={`${(point.x + 20) % 100}%`}
                        y2={`${(point.y + 15) % 100}%`}
                        stroke="url(#circuit-grad)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: [0, 1, 1],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: point.duration / 2,
                            repeat: Infinity,
                            delay: point.delay,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </svg>

            {/* Floating data particles */}
            {dataPoints.map((point) => (
                <motion.div
                    key={point.id}
                    className="absolute rounded-full bg-pink-500 dark:bg-pink-400"
                    style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        width: point.size,
                        height: point.size,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0, 0.6, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: point.duration,
                        repeat: Infinity,
                        delay: point.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Subtle grid dots */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />
        </div>
    );
};

export default HeroAnimation;
