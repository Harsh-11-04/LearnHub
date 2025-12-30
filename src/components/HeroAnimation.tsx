import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const generateNodes = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 5,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
    }));
};

const HeroAnimation = () => {
    const [nodes, setNodes] = useState<any[]>([]);

    useEffect(() => {
        setNodes(generateNodes(15));
    }, []);

    return (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Background Gradient Blurs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl mix-blend-multiply filter opacity-50 animate-blob" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl mix-blend-multiply filter opacity-50 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl mix-blend-multiply filter opacity-50 animate-blob animation-delay-4000" />

            {/* Neural Network SVG Overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
                <defs>
                    <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                        <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Dynamic Connections */}
                {nodes.map((node, i) => (
                    nodes.map((target, j) => {
                        // Only connect some nodes to avoid clutter
                        if (i < j && Math.abs(node.x - target.x) < 20 && Math.abs(node.y - target.y) < 20) {
                            return (
                                <motion.line
                                    key={`${i}-${j}`}
                                    x1={`${node.x}%`}
                                    y1={`${node.y}%`}
                                    x2={`${target.x}%`}
                                    y2={`${target.y}%`}
                                    stroke="url(#grid-grad)"
                                    strokeWidth="1"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{
                                        pathLength: [0, 1, 1],
                                        opacity: [0, 0.4, 0],
                                        x1: [`${node.x}%`, `${node.x + (Math.random() * 5 - 2.5)}%`],
                                        y1: [`${node.y}%`, `${node.y + (Math.random() * 5 - 2.5)}%`],
                                    }}
                                    transition={{
                                        duration: Math.random() * 5 + 5,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        ease: "easeInOut"
                                    }}
                                />
                            )
                        }
                        return null;
                    })
                ))}
            </svg>

            {/* Floating Nodes */}
            {nodes.map((node) => (
                <motion.div
                    key={node.id}
                    className="absolute rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50"
                    style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: node.size,
                        height: node.size,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 50 - 25, 0],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: node.duration,
                        repeat: Infinity,
                        delay: node.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />
        </div>
    );
};

export default HeroAnimation;
