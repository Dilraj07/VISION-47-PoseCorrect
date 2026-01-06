import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Center, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// --- GEOMETRY CONSTANTS ---
const GLOW_COLOR = '#39ff14';
const INACTIVE_COLOR = '#444444';

// Custom Geometric Body Component
const GeometricBody = ({ muscles }) => {
  const group = useRef();

  // Helper to get material props based on intensity
  const getMaterialProps = (intensity = 0.1) => {
    const active = intensity > 0.3;
    return {
      color: active ? GLOW_COLOR : INACTIVE_COLOR,
      emissive: active ? GLOW_COLOR : '#000',
      emissiveIntensity: active ? intensity * 2.5 : 0,
      metalness: 0.6,
      roughness: 0.3,
    };
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Subtle breathing animation
    group.current.scale.setScalar(1 + Math.sin(t * 1) * 0.005);
    group.current.position.y = Math.sin(t * 1) * 0.05;
    // Slow rotation
    group.current.rotation.y = Math.sin(t * 0.5) * 0.1;
  });

  const Joint = ({ position }) => (
    <mesh position={position}>
      <sphereGeometry args={[0.09, 16, 16]} />
      <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
    </mesh>
  );

  return (
    <group ref={group} dispose={null}>
      {/* --- HEAD --- */}
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#444" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
        <meshStandardMaterial color="#444" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* --- TORSO --- */}
      {/* Upper Chest (Pecs) */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[0.55, 0.35, 0.25]} />
        <meshStandardMaterial {...getMaterialProps(muscles.chest)} />
      </mesh>
      {/* Mid Section (Abs) */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.18, 0.16, 0.4, 16]} />
        <meshStandardMaterial {...getMaterialProps(muscles.abs)} />
      </mesh>
      {/* Hips/Pelvis */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.25, 16]} />
        <meshStandardMaterial color="#444" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* --- ARMS --- */}
      <group>
        {/* SHOULDERS */}
        <mesh position={[-0.35, 1.45, 0]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial {...getMaterialProps(muscles.shoulders)} />
        </mesh>
        <mesh position={[0.35, 1.45, 0]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial {...getMaterialProps(muscles.shoulders)} />
        </mesh>

        {/* Left Arm */}
        <group position={[-0.42, 1.35, 0]} rotation={[0, 0, 0.2]}>
          {/* Bicep/Tricep */}
          <mesh position={[0, -0.25, 0]}>
            <capsuleGeometry args={[0.09, 0.4, 8, 16]} />
            <meshStandardMaterial {...getMaterialProps(muscles.arms)} />
          </mesh>
          <Joint position={[0, -0.55, 0]} />
          {/* Forearm */}
          <mesh position={[0, -0.85, 0]}>
            <capsuleGeometry args={[0.07, 0.4, 8, 16]} />
            <meshStandardMaterial {...getMaterialProps(muscles.arms)} />
          </mesh>
          {/* Hand */}
          <group position={[0, -1.15, 0]}>
            <boxGeometry args={[0.1, 0.12, 0.05]} />
            <meshStandardMaterial color="#333" />
            {/* Thumb */}
            <mesh position={[0.08, 0.02, 0]} rotation={[0, 0, -0.5]}>
              <boxGeometry args={[0.04, 0.08, 0.04]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          </group>
        </group>

        {/* Right Arm */}
        <group position={[0.42, 1.35, 0]} rotation={[0, 0, -0.2]}>
          {/* Bicep/Tricep */}
          <mesh position={[0, -0.25, 0]}>
            <capsuleGeometry args={[0.09, 0.4, 8, 16]} />
            <meshStandardMaterial {...getMaterialProps(muscles.arms)} />
          </mesh>
          <Joint position={[0, -0.55, 0]} />
          {/* Forearm */}
          <mesh position={[0, -0.85, 0]}>
            <capsuleGeometry args={[0.07, 0.4, 8, 16]} />
            <meshStandardMaterial {...getMaterialProps(muscles.arms)} />
          </mesh>
          {/* Hand */}
          <group position={[0, -1.15, 0]}>
            <boxGeometry args={[0.1, 0.12, 0.05]} />
            <meshStandardMaterial color="#333" />
            {/* Thumb */}
            <mesh position={[-0.08, 0.02, 0]} rotation={[0, 0, 0.5]}>
              <boxGeometry args={[0.04, 0.08, 0.04]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          </group>
        </group>
      </group>


      {/* --- LEGS --- */}
      <group>
        {/* Left Leg */}
        <group position={[-0.15, 0.6, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.4, 0]}>
            <capsuleGeometry args={[0.12, 0.6, 8, 16]} />
            <meshStandardMaterial {...getMaterialProps(muscles.legs)} />
          </mesh>
          <Joint position={[0, -0.85, 0]} />
          {/* Calf */}
          <mesh position={[0, -1.25, 0]}>
            <capsuleGeometry args={[0.09, 0.6, 8, 16]} />
            <meshStandardMaterial {...getMaterialProps(muscles.legs)} />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -1.65, 0.05]}>
            <boxGeometry args={[0.12, 0.1, 0.25]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>

        {/* Right Leg */}
        <group position={[0.15, 0.6, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.4, 0]}>
            <capsuleGeometry args={[0.12, 0.6, 8, 16]} />
            <meshStandardMaterial {...getMaterialProps(muscles.legs)} />
          </mesh>
          <Joint position={[0, -0.85, 0]} />
          {/* Calf */}
          <mesh position={[0, -1.25, 0]}>
            <capsuleGeometry args={[0.09, 0.6, 8, 16]} />
            <meshStandardMaterial {...getMaterialProps(muscles.legs)} />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -1.65, 0.05]}>
            <boxGeometry args={[0.12, 0.1, 0.25]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const MuscleHeatmap3D = ({ muscles = {} }) => {
  // Calculate activation percentage
  const activation = Math.round((Object.values(muscles).reduce((a, b) => a + b, 0) / 5) * 100);

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      {/* Stats Overlay */}
      <div style={{ position: 'absolute', right: '5%', top: '10%', textAlign: 'right', zIndex: 10, pointerEvents: 'none' }}>
        <div style={{ color: '#666', fontSize: '0.8rem', letterSpacing: '2px', fontFamily: 'Orbitron, sans-serif' }}>SYSTEM STATUS</div>
        <div style={{ color: GLOW_COLOR, fontSize: '2.5rem', fontWeight: '900', textShadow: `0 0 10px ${GLOW_COLOR}` }}>
          {activation}%
        </div>
        <div style={{ color: '#444', fontSize: '0.7rem' }}>CORE TEMP. NORMAL</div>
      </div>

      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0.5, 3.8]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.5} />

        {/* Lighting */}
        <ambientLight intensity={1.5} />
        <spotLight position={[0, 5, 5]} intensity={3} angle={0.5} penumbra={1} color="#ffffff" />
        <pointLight position={[5, 2, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-5, 2, 5]} intensity={2} color="#ffffff" />

        {/* Backlights for rim effect */}
        <pointLight position={[0, 2, -5]} intensity={2} color="#39ff14" distance={10} />

        {/* Environment */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.1}>
          <Center>
            <GeometricBody muscles={muscles} />
          </Center>
        </Float>

        {/* Post Processing */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={2.0} />
        </EffectComposer>

        <gridHelper args={[20, 20, 0x222222, 0x111111]} position={[0, -2, 0]} />
      </Canvas>
    </div>
  );
};

export default MuscleHeatmap3D;
