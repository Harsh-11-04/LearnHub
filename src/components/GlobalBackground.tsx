import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Stars } from "@react-three/drei";
import { Mesh } from "three";

// Floating Shape Component
const FloatingShape = ({
    position,
    color,
    geometryType,
    scale = 1,
    speed = 1
}: {
    position: [number, number, number];
    color: string;
    geometryType: 'torus' | 'sphere' | 'capsule';
    scale?: number;
    speed?: number;
}) => {
    const meshRef = useRef<Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2 * speed;
            meshRef.current.rotation.y += delta * 0.3 * speed;
        }
    });

    return (
        <Float speed={2 * speed} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={meshRef} position={position} scale={scale}>
                {geometryType === 'torus' && <torusGeometry args={[1, 0.4, 16, 32]} />}
                {geometryType === 'sphere' && <sphereGeometry args={[1, 32, 32]} />}
                {geometryType === 'capsule' && <capsuleGeometry args={[0.5, 1, 4, 8]} />}

                {/* Cosmic Material - Glossy and Vibrant */}
                <meshStandardMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.8}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
        </Float>
    );
};

const GlobalBackground = () => {
    return (
        <div className="fixed inset-0 -z-50 pointer-events-none bg-slate-50 dark:bg-[#020617] transition-colors duration-700">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 14]} />
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 10, 7]} intensity={1} color="#a5b4fc" />
                <pointLight position={[-10, -10, -10]} intensity={2} color="#6366f1" />
                <pointLight position={[10, 10, 10]} intensity={2} color="#ec4899" />

                <fog attach="fog" args={['#020617', 5, 35]} /> {/* Deep Cosmic Fog */}

                <Suspense fallback={null}>
                    {/* Cosmic Shapes - Distributed for Depth */}
                    {/* Primary Indigo Accent */}
                    <FloatingShape position={[-6, 4, -4]} color="#6366f1" geometryType="torus" scale={1.5} speed={0.8} />

                    {/* Cyan/Teal Tech Vibes */}
                    <FloatingShape position={[-5, -4, -2]} color="#14b8a6" geometryType="sphere" scale={1.2} speed={1.2} />

                    {/* Purple Creative Energy */}
                    <FloatingShape position={[7, -3, -4]} color="#a855f7" geometryType="torus" scale={1.6} speed={0.9} />

                    {/* Pink/Magenta Dynamic Accent */}
                    <FloatingShape position={[6, 5, -2]} color="#ec4899" geometryType="capsule" scale={1.3} speed={1.1} />

                    {/* Distant Blue Depth */}
                    <FloatingShape position={[0, 8, -8]} color="#3b82f6" geometryType="sphere" scale={2} speed={0.5} />

                    {/* Bottom Anchor */}
                    <FloatingShape position={[0, -9, -4]} color="#6366f1" geometryType="torus" scale={2} speed={0.5} />

                    {/* Starfield */}
                    <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.8} fade speed={0.5} />
                </Suspense>
            </Canvas>

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white/90 dark:via-[#020617]/40 dark:to-[#020617]/90" />
        </div>
    );
};

export default GlobalBackground;
