'use client'

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react'
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
  const [isVisible, setIsVisible] = useState(true)
  const [isStatic, setIsStatic] = useState(false)
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)
  const hasWebGL = mounted && canUseWebGL()

  useEffect(() => {
    if (!containerRef.current) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 640px)').matches
    setIsStatic(reduceMotion || mobile)
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.05 })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  if (!mounted) return <div className="h-[31rem] w-full bg-bg-surface lg:h-[calc(100vh-8rem)]" />

  const poster = <div className="relative flex h-[31rem] w-full items-center justify-center overflow-hidden bg-bg-surface lg:h-[calc(100vh-8rem)]"><img src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=85" alt="Ummati Oud Kannauj perfume bottle" className="absolute inset-0 h-full w-full object-cover opacity-35 grayscale" /><div className="absolute inset-0 bg-bg-base/55" /><div className="relative flex h-[25rem] w-44 items-center justify-center rounded-[5rem_5rem_2rem_2rem] border border-brand-accent/30 bg-bg-elevated/80 shadow-[0_32px_90px_rgba(0,0,0,0.25)]"><div className="text-center"><span className="font-display text-4xl tracking-[0.18em] text-brand-accent">UMMATI</span><span className="mt-3 block text-label text-text-muted">Extrait de parfum</span></div></div></div>

  if (!hasWebGL || isStatic) return poster

  return (
    <div ref={containerRef} onMouseMove={(event) => { const box = event.currentTarget.getBoundingClientRect(); setGlow({ x: ((event.clientX - box.left) / box.width) * 100, y: ((event.clientY - box.top) / box.height) * 100 }) }} className="relative h-[31rem] w-full overflow-hidden bg-bg-surface lg:h-[calc(100vh-8rem)]">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-70 transition-[background] duration-700" style={{ background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(214,173,103,0.14), transparent 36%)` }} />
      <Canvas shadows frameloop={isVisible ? 'always' : 'never'} camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.55} /><spotLight position={[6, 9, 8]} angle={0.2} penumbra={1} intensity={1.4} castShadow /><pointLight position={[-4, 3, -3]} intensity={0.8} color="#d7b16b" />
        <Environment preset="studio" resolution={256} background={false} />
        <Suspense fallback={null}><PresentationControls global snap rotation={[0, 0.25, 0]} polar={[-Math.PI / 5, Math.PI / 4]} azimuth={[-Math.PI / 2, Math.PI / 2]}><Float speed={1.25} rotationIntensity={0.25} floatIntensity={0.65}><ProceduralBottle /></Float></PresentationControls></Suspense>
        <ContactShadows position={[0, -1.8, 0]} opacity={0.52} scale={8} blur={2.8} far={4} color="#000000" />
      </Canvas>
      <div className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-label text-text-muted">Drag to discover the bottle</div>
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
