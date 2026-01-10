import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera } from "@react-three/drei";
import { Mesh, Vector3, BoxGeometry } from "three";

// Circuit Node - Glowing connection point
const CircuitNode = ({
    position,
    scale = 1,
    speed = 1,
    color = "#ec4899"
}: {
    position: [number, number, number];
    scale?: number;
    speed?: number;
    color?: string;
}) => {
    const meshRef = useRef<Mesh>(null);


    useFrame((state) => {
        if (meshRef.current) {
            // Pulsing glow effect
            const pulse = Math.sin(state.clock.elapsedTime * speed * 2) * 0.3 + 0.7;
            meshRef.current.scale.setScalar(scale * pulse);
        }
    });

    return (
        <Float speed={1.5 * speed} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef} position={position}>
                <octahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.8}
                    roughness={0.2}
                    metalness={0.9}
                />
            </mesh>
            {/* Outer glow ring */}
            <mesh position={position}>
                <ringGeometry args={[0.5, 0.55, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
        </Float>
    );
};

// Data Stream - Flowing line of particles
const DataStream = ({
    start,
    end,
    color = "#ec4899"
}: {
    start: [number, number, number];
    end: [number, number, number];
    color?: string;
}) => {
    const meshRef = useRef<Mesh>(null);
    const startVec = useMemo(() => new Vector3(...start), [start]);
    const endVec = useMemo(() => new Vector3(...end), [end]);
    const direction = useMemo(() => endVec.clone().sub(startVec), [startVec, endVec]);
    const length = useMemo(() => direction.length(), [direction]);

    useFrame((state) => {
        if (meshRef.current) {
            // Animate along the path
            const t = (Math.sin(state.clock.elapsedTime * 1.5) + 1) / 2;
            const pos = startVec.clone().add(direction.clone().multiplyScalar(t));
            meshRef.current.position.copy(pos);
        }
    });

    return (
        <>
            {/* Static connection line */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([...start, ...end])}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color={color} transparent opacity={0.15} />
            </line>
            {/* Animated data packet */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </>
    );
};

// Floating Tech Cube - Represents computing/processing
const TechCube = ({
    position,
    scale = 1,
    speed = 1
}: {
    position: [number, number, number];
    scale?: number;
    speed?: number;
}) => {
    const meshRef = useRef<Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.3 * speed;
            meshRef.current.rotation.y += delta * 0.4 * speed;
        }
    });

    return (
        <Float speed={2 * speed} rotationIntensity={0.8} floatIntensity={1.5}>
            <mesh ref={meshRef} position={position} scale={scale}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.1}
                    metalness={0.95}
                    emissive="#ec4899"
                    emissiveIntensity={0.1}
                />
                {/* Edge wireframe */}
                <lineSegments>
                    <edgesGeometry args={[new BoxGeometry(1, 1, 1)]} />
                    <lineBasicMaterial color="#ec4899" opacity={0.6} transparent />
                </lineSegments>
            </mesh>
        </Float>
    );
};

const GlobalBackground = () => {
    return (
        <div className="fixed inset-0 -z-50 pointer-events-none bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
            {/* Circuit Grid Pattern - CSS based */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, currentColor 1px, transparent 1px),
                        linear-gradient(to bottom, currentColor 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Dot grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '30px 30px'
                }}
            />

            {/* 3D Scene */}
            <Canvas dpr={[1, 2]} className="opacity-60 dark:opacity-80">
                <PerspectiveCamera makeDefault position={[0, 0, 12]} />
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ec4899" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />

                <Suspense fallback={null}>
                    {/* Circuit Nodes - Key connection points */}
                    <CircuitNode position={[-5, 3, -2]} scale={1.2} speed={0.8} color="#ec4899" />
                    <CircuitNode position={[5, -3, -3]} scale={1} speed={1.1} color="#ec4899" />
                    <CircuitNode position={[0, 5, -4]} scale={0.8} speed={0.9} color="#f472b6" />
                    <CircuitNode position={[-3, -4, -2]} scale={1.1} speed={1} color="#ec4899" />
                    <CircuitNode position={[4, 2, -3]} scale={0.9} speed={1.2} color="#f472b6" />

                    {/* Data streams connecting nodes */}
                    <DataStream start={[-5, 3, -2]} end={[5, -3, -3]} color="#ec4899" />
                    <DataStream start={[0, 5, -4]} end={[-3, -4, -2]} color="#f472b6" />
                    <DataStream start={[4, 2, -3]} end={[-5, 3, -2]} color="#ec4899" />

                    {/* Tech cubes - processing units */}
                    <TechCube position={[-6, -2, -5]} scale={0.8} speed={0.6} />
                    <TechCube position={[6, 4, -6]} scale={1} speed={0.5} />
                    <TechCube position={[0, -6, -4]} scale={0.6} speed={0.7} />
                </Suspense>
            </Canvas>

            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/80 dark:via-[#0a0a0a]/30 dark:to-[#0a0a0a]/90" />

            {/* Pink glow accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400/5 dark:bg-pink-400/10 rounded-full blur-3xl" />
        </div>
    );
};

export default GlobalBackground;
