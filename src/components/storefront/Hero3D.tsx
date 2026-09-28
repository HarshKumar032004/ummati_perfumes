'use client'

import { Suspense, useRef, useSyncExternalStore } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Lightformer, PresentationControls } from '@react-three/drei'
import * as THREE from 'three'

function ProceduralBottle() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const targetX = state.pointer.y * -0.12
    const targetY = state.pointer.x * 0.2 + Math.sin(state.clock.elapsedTime * 0.28) * 0.08
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.035)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.035)
  })

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[1, 0.9, 2.4, 48]} />
        <meshPhysicalMaterial
          color="#E8C987"
          transmission={0.9}
          thickness={1.8}
          roughness={0.07}
          metalness={0.08}
          ior={1.52}
          clearcoat={1}
          clearcoatRoughness={0.12}
          envMapIntensity={1.6}
        />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.84, 0.74, 2.08, 48]} />
        <meshPhysicalMaterial color="#B58B4B" transmission={0.38} roughness={0.2} ior={1.33} thickness={1.1} />
      </mesh>
      <mesh castShadow position={[0, 2.52, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.3, 32]} />
        <meshStandardMaterial color="#C8A96E" metalness={1} roughness={0.18} envMapIntensity={2} />
      </mesh>
      <mesh position={[0, 2.75, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 20]} />
        <meshStandardMaterial color="#E6C98D" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0, 3.1, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.7, 32]} />
        <meshStandardMaterial color="#191613" metalness={0.35} roughness={0.24} envMapIntensity={1.3} />
      </mesh>
      <mesh position={[0, 1.2, 1.01]}>
        <planeGeometry args={[0.8, 1.2]} />
        <meshStandardMaterial color="#E5C98E" metalness={0.75} roughness={0.28} />
      </mesh>
    </group>
  )
}

export function Hero3D() {
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false)
  const hasWebGL = mounted && canUseWebGL()

  if (!mounted) return <div className="h-[31rem] w-full bg-bg-surface lg:h-[calc(100vh-8rem)]" />

  if (!hasWebGL) {
    return (
      <div className="relative flex h-[31rem] w-full items-center justify-center overflow-hidden bg-bg-surface lg:h-[calc(100vh-8rem)]">
        <div className="absolute h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="relative flex h-[25rem] w-44 items-center justify-center rounded-[5rem_5rem_2rem_2rem] border border-brand-accent/30 bg-bg-elevated shadow-[0_32px_90px_rgba(0,0,0,0.25)]">
          <div className="text-center">
            <span className="font-display text-4xl tracking-[0.18em] text-brand-accent">UMMATI</span>
            <span className="mt-3 block text-label text-text-muted">Extrait de parfum</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[31rem] w-full overflow-hidden bg-bg-surface lg:h-[calc(100vh-8rem)]">
      <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent/10 blur-[7rem]" />
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.55} />
        <spotLight position={[6, 9, 8]} angle={0.2} penumbra={1} intensity={1.4} castShadow />
        <Environment resolution={256} background={false}>
          <group rotation={[-Math.PI / 4, -0.3, 0]}>
            <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.1, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[5, 1, -1]} scale={[20, 0.1, 1]} />
          </group>
        </Environment>
        <Suspense fallback={null}>
          <PresentationControls global snap rotation={[0, 0.25, 0]} polar={[-Math.PI / 5, Math.PI / 4]} azimuth={[-Math.PI / 2, Math.PI / 2]}>
            <Float speed={1.25} rotationIntensity={0.25} floatIntensity={0.65}>
              <ProceduralBottle />
            </Float>
          </PresentationControls>
        </Suspense>
        <ContactShadows position={[0, -1.8, 0]} opacity={0.52} scale={8} blur={2.8} far={4} color="#000000" />
      </Canvas>
      <div className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-label text-text-muted">
        Drag to discover the bottle
      </div>
    </div>
  )
}

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}
