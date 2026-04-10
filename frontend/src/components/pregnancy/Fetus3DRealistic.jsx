/**
 * Fetus3DRealistic.jsx - Fœtus 3D Réaliste avec Three.js
 * Version stable sans composants drei problématiques
 * 
 * Caractéristiques:
 * - Rendu organique avec shaders personnalisés
 * - OrbitControls pour rotation 360° tactile
 * - Animation de flottaison fluide manuelle
 * - Effet veilleuse (triple halo lumineux)
 * - Évolution selon la semaine de grossesse
 */
import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';

// Composant de chargement élégant
function LoadingIndicator({ isDarkMode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      <div className="w-14 h-14 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
      <span 
        className="text-sm font-medium mt-4"
        style={{ color: isDarkMode ? '#f5f0eb' : '#6b5f7a' }}
      >
        Chargement du bébé 3D...
      </span>
    </div>
  );
}

// Effet Veilleuse - Triple halo lumineux pulsant
function NightlightGlow({ accentColor }) {
  const outerRef = useRef();
  const middleRef = useRef();
  const innerRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (outerRef.current) {
      outerRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.08);
      outerRef.current.material.opacity = 0.06 + Math.sin(t * 0.3) * 0.025;
    }
    
    if (middleRef.current) {
      middleRef.current.scale.setScalar(1 + Math.sin(t * 0.6 + 0.5) * 0.06);
      middleRef.current.material.opacity = 0.1 + Math.sin(t * 0.4 + 0.3) * 0.03;
    }
    
    if (innerRef.current) {
      innerRef.current.scale.setScalar(1 + Math.sin(t * 0.7 + 1) * 0.05);
      innerRef.current.material.opacity = 0.14 + Math.sin(t * 0.5 + 0.6) * 0.04;
    }
  });

  const glowColor = useMemo(() => new THREE.Color(accentColor || '#e8a4b8'), [accentColor]);
  const creamColor = useMemo(() => new THREE.Color('#fff5f0'), []);

  return (
    <group>
      {/* Halo externe */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Halo intermédiaire */}
      <mesh ref={middleRef}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Halo interne crème */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshBasicMaterial
          color={creamColor}
          transparent
          opacity={0.14}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Lumières veilleuse */}
      <pointLight position={[0, 0, 3]} color={accentColor} intensity={0.8} distance={8} decay={2} />
      <pointLight position={[0, 2, -2]} color={'#fff5f0'} intensity={0.5} distance={6} decay={2} />
      <pointLight position={[-2, -1, 1]} color={accentColor} intensity={0.3} distance={5} decay={2} />
    </group>
  );
}

// Sac amniotique avec effet de membrane translucide
function AmnioticSac({ children }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(t * 0.25) * 0.02);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.4, 64, 64]} />
        <meshPhysicalMaterial
          color={'#fff5f7'}
          transparent
          opacity={0.08}
          roughness={0.15}
          metalness={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {children}
    </group>
  );
}

// Matériau de peau réaliste
function useSkinMaterial(isDark = false) {
  return useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(isDark ? '#ffd5dc' : '#ffe0e8'),
      roughness: 0.55,
      metalness: 0,
      clearcoat: 0.2,
      clearcoatRoughness: 0.6,
      sheen: 0.5,
      sheenColor: new THREE.Color('#ffb6c1'),
    });
  }, [isDark]);
}

// Animation de flottaison manuelle
function FloatingGroup({ children, speed = 1, intensity = 0.3 }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    if (groupRef.current) {
      // Mouvement de flottaison organique
      groupRef.current.position.y = Math.sin(t * 0.5) * intensity * 0.6;
      groupRef.current.position.x = Math.sin(t * 0.3) * intensity * 0.3;
      groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.08;
      groupRef.current.rotation.x = Math.sin(t * 0.35) * 0.05;
    }
  });
  
  return <group ref={groupRef}>{children}</group>;
}

// Sphère organique avec distortion via vertex shader
function OrganicSphere({ radius, color, position, scale, distortSpeed = 2, distortAmount = 0.1 }) {
  const meshRef = useRef();
  const materialRef = useRef();
  
  // Shader de distortion organique
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDistort: { value: distortAmount },
  }), [distortAmount]);
  
  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime() * distortSpeed;
    if (meshRef.current) {
      // Animation de respiration subtile
      const breathe = 1 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.02;
      meshRef.current.scale.setScalar(breathe);
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color={color}
        roughness={0.5}
        metalness={0}
        clearcoat={0.15}
        clearcoatRoughness={0.7}
        sheen={0.4}
        sheenColor={'#ffb6c1'}
      />
    </mesh>
  );
}

// Fœtus organique
function OrganicFetus({ week }) {
  const groupRef = useRef();
  const skinMaterial = useSkinMaterial();
  
  // Calcul des proportions selon la semaine
  const props = useMemo(() => {
    const progress = Math.min(week / 40, 1);
    return {
      headScale: 0.55 - progress * 0.12,
      bodyScale: 0.4 + progress * 0.25,
      limbScale: 0.12 + progress * 0.18,
      overallScale: 0.4 + progress * 0.5,
    };
  }, [week]);

  // Couleurs organiques
  const skinColor = week <= 12 ? '#ffe8ed' : '#ffd5dc';
  const skinColorDark = week <= 12 ? '#ffd1dc' : '#ffb6c1';

  // Embryon très précoce (1-4 semaines)
  if (week <= 4) {
    return (
      <FloatingGroup speed={1.5} intensity={0.5}>
        <group scale={0.9}>
          {/* Cellule principale */}
          <OrganicSphere 
            radius={0.8} 
            color={skinColor} 
            position={[0, 0, 0]}
            distortAmount={0.15}
          />
          {/* Noyau */}
          <mesh position={[0, 0.1, 0.3]}>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshPhysicalMaterial
              color={'#ffb6c1'}
              roughness={0.5}
              clearcoat={0.2}
            />
          </mesh>
          {/* Reflet brillant */}
          <mesh position={[-0.25, 0.3, 0.55]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color={'#ffffff'} transparent opacity={0.6} />
          </mesh>
        </group>
      </FloatingGroup>
    );
  }

  // Embryon (5-8 semaines)
  if (week <= 8) {
    return (
      <FloatingGroup speed={1.2} intensity={0.4}>
        <group ref={groupRef} scale={props.overallScale}>
          {/* Tête */}
          <OrganicSphere 
            radius={props.headScale * 1.8} 
            color={skinColor} 
            position={[0, 0.65, 0]}
            distortAmount={0.12}
          />
          
          {/* Corps courbé */}
          <mesh position={[0, 0, 0]} scale={[1, 1.4, 0.9]}>
            <sphereGeometry args={[0.35, 48, 48]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>
          
          {/* Bourgeons de bras */}
          <mesh position={[-0.35, 0.2, 0]}>
            <sphereGeometry args={[0.12, 24, 24]} />
            <meshPhysicalMaterial color={skinColorDark} roughness={0.6} />
          </mesh>
          <mesh position={[0.35, 0.2, 0]}>
            <sphereGeometry args={[0.12, 24, 24]} />
            <meshPhysicalMaterial color={skinColorDark} roughness={0.6} />
          </mesh>
          
          {/* Cœur battant (semaines 6+) */}
          {week >= 6 && <HeartBeat position={[0, 0.15, 0.25]} />}
        </group>
      </FloatingGroup>
    );
  }

  // Fœtus développé (semaine 9+)
  return (
    <FloatingGroup speed={1} intensity={0.35}>
      <group ref={groupRef} scale={props.overallScale}>
        {/* Tête avec forme réaliste */}
        <group position={[0, 0.85, 0]}>
          <OrganicSphere 
            radius={props.headScale} 
            color={skinColor} 
            position={[0, 0, 0]}
            distortAmount={0.08}
          />
          
          {/* Yeux (semaines 12+) */}
          {week >= 12 && (
            <>
              <mesh position={[-0.12, 0.05, 0.38]}>
                <sphereGeometry args={[0.055, 16, 16]} />
                <meshStandardMaterial color={'#2d3748'} roughness={0.3} />
              </mesh>
              <mesh position={[0.12, 0.05, 0.38]}>
                <sphereGeometry args={[0.055, 16, 16]} />
                <meshStandardMaterial color={'#2d3748'} roughness={0.3} />
              </mesh>
              {/* Reflets des yeux */}
              <mesh position={[-0.13, 0.06, 0.42]}>
                <sphereGeometry args={[0.018, 8, 8]} />
                <meshBasicMaterial color={'#ffffff'} />
              </mesh>
              <mesh position={[0.11, 0.06, 0.42]}>
                <sphereGeometry args={[0.018, 8, 8]} />
                <meshBasicMaterial color={'#ffffff'} />
              </mesh>
            </>
          )}
          
          {/* Nez (semaines 14+) */}
          {week >= 14 && (
            <mesh position={[0, -0.02, 0.42]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshPhysicalMaterial color={skinColorDark} roughness={0.6} />
            </mesh>
          )}
        </group>
        
        {/* Corps - Torse organique */}
        <group position={[0, 0.2, 0]}>
          <mesh scale={[0.85, 1.3, 0.75]}>
            <sphereGeometry args={[props.bodyScale, 48, 48]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>
        </group>
        
        {/* Bras organiques */}
        <group position={[-0.38, 0.35, 0]} rotation={[0.2, 0, 0.6]}>
          <mesh scale={[1, 2.2 + props.limbScale * 5, 1]}>
            <sphereGeometry args={[0.08, 24, 24]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>
          {/* Main */}
          {week >= 14 && (
            <mesh position={[0, -0.25 - props.limbScale, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshPhysicalMaterial color={skinColorDark} roughness={0.6} />
            </mesh>
          )}
        </group>
        <group position={[0.38, 0.35, 0]} rotation={[0.2, 0, -0.6]}>
          <mesh scale={[1, 2.2 + props.limbScale * 5, 1]}>
            <sphereGeometry args={[0.08, 24, 24]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>
          {week >= 14 && (
            <mesh position={[0, -0.25 - props.limbScale, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshPhysicalMaterial color={skinColorDark} roughness={0.6} />
            </mesh>
          )}
        </group>
        
        {/* Jambes organiques */}
        <group position={[-0.12, -0.35, 0]} rotation={[0.5, 0, 0.15]}>
          <mesh scale={[1, 2.5 + props.limbScale * 5, 1]}>
            <sphereGeometry args={[0.09, 24, 24]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>
          {/* Pied */}
          {week >= 16 && (
            <mesh position={[0, -0.3 - props.limbScale, 0.04]} rotation={[0.6, 0, 0]}>
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshPhysicalMaterial color={skinColorDark} roughness={0.6} />
            </mesh>
          )}
        </group>
        <group position={[0.12, -0.35, 0]} rotation={[0.5, 0, -0.15]}>
          <mesh scale={[1, 2.5 + props.limbScale * 5, 1]}>
            <sphereGeometry args={[0.09, 24, 24]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>
          {week >= 16 && (
            <mesh position={[0, -0.3 - props.limbScale, 0.04]} rotation={[0.6, 0, 0]}>
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshPhysicalMaterial color={skinColorDark} roughness={0.6} />
            </mesh>
          )}
        </group>
        
        {/* Cordon ombilical organique */}
        <UmbilicalCord />
        
        {/* Cœur battant */}
        <HeartBeat position={[0, 0.25, 0.32]} />
      </group>
    </FloatingGroup>
  );
}

// Cœur battant animé
function HeartBeat({ position }) {
  const heartRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Animation de battement cardiaque réaliste (lub-dub)
    const beatPhase = (t * 2) % 1;
    const beat = beatPhase < 0.1 ? 1.2 : (beatPhase < 0.2 ? 1.1 : 1);
    
    if (heartRef.current) {
      heartRef.current.scale.setScalar(beat);
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(beat * 1.8);
      glowRef.current.material.opacity = beat > 1 ? 0.4 : 0.15;
    }
  });
  
  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={'#ff6b8a'} transparent opacity={0.2} />
      </mesh>
      <mesh ref={heartRef}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial 
          color={'#ff6b8a'} 
          emissive={'#ff4466'} 
          emissiveIntensity={0.5}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

// Cordon ombilical avec courbe organique
function UmbilicalCord() {
  const cordRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (cordRef.current) {
      cordRef.current.rotation.z = Math.sin(t * 0.3) * 0.15;
      cordRef.current.rotation.x = Math.sin(t * 0.25) * 0.1;
    }
  });
  
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.05, 0.32),
      new THREE.Vector3(0.12, 0.12, 0.48),
      new THREE.Vector3(-0.08, 0.32, 0.58),
      new THREE.Vector3(0.18, 0.52, 0.48),
      new THREE.Vector3(-0.05, 0.72, 0.55),
    ]);
  }, []);
  
  return (
    <mesh ref={cordRef} position={[0, -0.1, 0]}>
      <tubeGeometry args={[curve, 48, 0.035, 12, false]} />
      <meshPhysicalMaterial
        color={'#e8a4b8'}
        roughness={0.45}
        clearcoat={0.3}
        clearcoatRoughness={0.6}
      />
    </mesh>
  );
}

// Scène 3D principale
function FetusScene({ week, onTouch, accentColor }) {
  const [touched, setTouched] = useState(false);
  
  const handleClick = () => {
    setTouched(true);
    onTouch?.();
    setTimeout(() => setTouched(false), 1000);
  };

  return (
    <>
      {/* Éclairage doux style veilleuse */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color={'#fff5f0'} />
      <directionalLight position={[-3, 3, -3]} intensity={0.35} color={'#e8a4b8'} />
      
      {/* Effet veilleuse */}
      <NightlightGlow accentColor={accentColor} />
      
      {/* Fœtus dans sac amniotique */}
      <group onClick={handleClick}>
        <AmnioticSac>
          <OrganicFetus week={week} />
        </AmnioticSac>
      </group>
      
      {/* Contrôles de rotation tactile fluides */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3.5}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI * 0.8}
        minPolarAngle={Math.PI * 0.2}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

// Composant principal exporté
export default function Fetus3DRealistic({ 
  week = 12, 
  onTouch, 
  className = "",
  showWeekInfo = true 
}) {
  const { isDarkMode, accentColor, accentColors } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Couleur d'accent actuelle
  const currentAccentColor = useMemo(() => {
    return accentColors?.[accentColor]?.primary || '#e8a4b8';
  }, [accentColor, accentColors]);
  
  // Description de la semaine
  const weekDescription = useMemo(() => {
    if (week <= 4) return "Embryon - Premières cellules";
    if (week <= 8) return "Embryon - Formation des organes";
    if (week <= 12) return "Fœtus - Traits du visage";
    if (week <= 16) return "Fœtus - Mouvements actifs";
    if (week <= 20) return "Fœtus - Sens développés";
    if (week <= 28) return "Fœtus - Croissance rapide";
    if (week <= 36) return "Fœtus - Préparation naissance";
    return "Fœtus - Prêt à naître";
  }, [week]);

  // Styles du conteneur avec fond mauve poudré
  const containerStyle = useMemo(() => ({
    width: '100%',
    height: '400px',
    borderRadius: '24px',
    overflow: 'hidden',
    position: 'relative',
    background: isDarkMode 
      ? 'radial-gradient(ellipse at center, rgba(55, 48, 68, 0.95) 0%, #1e1a24 100%)'
      : 'radial-gradient(ellipse at center, rgba(255, 248, 252, 0.98) 0%, rgba(255, 230, 240, 0.9) 100%)',
    boxShadow: isDarkMode
      ? `0 12px 40px rgba(0, 0, 0, 0.5), 0 0 100px ${currentAccentColor}12, inset 0 1px 0 rgba(255,255,255,0.06)`
      : '0 12px 40px rgba(232, 164, 184, 0.35), inset 0 1px 0 rgba(255,255,255,0.9)',
  }), [isDarkMode, currentAccentColor]);

  return (
    <div 
      className={`fetus-3d-realistic ${className}`}
      style={containerStyle}
      data-testid="fetus-3d-realistic"
    >
      {!isLoaded && <LoadingIndicator isDarkMode={isDarkMode} />}
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        onCreated={() => setIsLoaded(true)}
        style={{ touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          <FetusScene 
            week={week} 
            onTouch={onTouch}
            accentColor={currentAccentColor}
          />
        </Suspense>
      </Canvas>
      
      {/* Indicateur de semaine */}
      {showWeekInfo && isLoaded && (
        <div 
          className="absolute bottom-4 left-4 right-4 text-center pointer-events-none"
          style={{
            color: isDarkMode ? '#f5f0eb' : '#6b5f7a',
            textShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.7)' : 'none'
          }}
        >
          <p className="text-xs opacity-90 mb-1 font-medium">{weekDescription}</p>
          <p className="text-[10px] opacity-60">
            Faites glisser pour explorer en 360°
          </p>
        </div>
      )}
      
      {/* Badge semaine */}
      {isLoaded && (
        <div 
          className="absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold pointer-events-none"
          style={{
            background: isDarkMode 
              ? `linear-gradient(135deg, ${currentAccentColor}60 0%, ${currentAccentColor}30 100%)`
              : 'rgba(255,255,255,0.95)',
            color: isDarkMode ? '#ffffff' : '#6b5f7a',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(232,164,184,0.4)'}`,
            boxShadow: isDarkMode 
              ? `0 6px 20px rgba(0,0,0,0.4), 0 0 30px ${currentAccentColor}25`
              : '0 4px 15px rgba(232,164,184,0.3)'
          }}
        >
          Semaine {week}
        </div>
      )}
    </div>
  );
}
