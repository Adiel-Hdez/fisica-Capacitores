import { Canvas, useThree } from '@react-three/fiber'
import { Html, Line, OrbitControls, RoundedBox, Text } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export type CameraView = 'perspective' | 'front' | 'side' | 'top'

interface SceneProps {
  distanceMm: number
  areaCm2: number
  fieldStrength: number
  showField?: boolean
  showCharges?: boolean
  showLabels?: boolean
  showDielectric?: boolean
  showDistance?: boolean
  cameraView?: CameraView
  compact?: boolean
}

const cameraPositions: Record<CameraView, [number, number, number]> = {
  perspective: [6.2, 4.2, 7.2], front: [0, 0, 9], side: [9, 0, 0], top: [0, 9, 0.01],
}

function CameraRig({ view }: { view: CameraView }) {
  const { camera } = useThree()
  const controls = useRef<OrbitControlsImpl>(null)
  useEffect(() => {
    camera.position.set(...cameraPositions[view])
    camera.lookAt(0, 0, 0)
    controls.current?.reset()
    controls.current?.update()
  }, [camera, view])
  return <OrbitControls ref={controls} makeDefault enableDamping minDistance={4} maxDistance={14} />
}

function Charges({ x, positive, plateSize }: { x: number; positive: boolean; plateSize: number }) {
  const positions = useMemo(() => {
    const list: [number, number][] = []
    for (let y = -1; y <= 1; y += 1) for (let z = -1; z <= 1; z += 1) list.push([y * plateSize * 0.32, z * plateSize * 0.32])
    return list
  }, [plateSize])
  return <group>{positions.map(([y, z], index) => <Text key={index} position={[x, y, z]} rotation={[0, Math.PI / 2, 0]} fontSize={0.24} color={positive ? '#ffb45b' : '#65d9ff'} anchorX="center" anchorY="middle">{positive ? '+' : '−'}</Text>)}</group>
}

function FieldLines({ separation, plateSize, strength }: { separation: number; plateSize: number; strength: number }) {
  const opacity = Math.min(0.95, 0.3 + Math.log10(Math.max(1, strength)) / 12)
  const coords = [-0.72, 0, 0.72]
  return <group>{coords.flatMap((y) => coords.map((z) => {
    const points = [new THREE.Vector3(-separation / 2 + 0.15, y * plateSize / 2, z * plateSize / 2), new THREE.Vector3(separation / 2 - 0.15, y * plateSize / 2, z * plateSize / 2)]
    return <group key={`${y}-${z}`}>
      <Line points={points} color="#67e8f9" transparent opacity={opacity} lineWidth={1} />
      <mesh position={[0.12, y * plateSize / 2, z * plateSize / 2]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.07, 0.2, 8]} /><meshBasicMaterial color="#67e8f9" transparent opacity={opacity} /></mesh>
    </group>
  }))}</group>
}

function Scene({ distanceMm, areaCm2, fieldStrength, showField = true, showCharges = true, showLabels = true, showDielectric = true, showDistance = true, cameraView = 'perspective' }: SceneProps) {
  const separation = 0.75 + (distanceMm / 20) * 2.75
  const plateSize = 2 + ((areaCm2 - 10) / 190) * 1.6
  return <>
    <color attach="background" args={['#06101f']} />
    <ambientLight intensity={0.85} />
    <directionalLight position={[5, 6, 4]} intensity={2.2} color="#dff8ff" />
    <pointLight position={[-4, 2, 4]} intensity={25} color="#0da8ff" />
    <group rotation={[0, -0.08, 0]}>
      <RoundedBox args={[0.16, plateSize, plateSize]} radius={0.08} smoothness={4} position={[-separation / 2, 0, 0]}>
        <meshStandardMaterial color="#ff8a32" metalness={0.75} roughness={0.23} emissive="#7f2500" emissiveIntensity={0.45} />
      </RoundedBox>
      <RoundedBox args={[0.16, plateSize, plateSize]} radius={0.08} smoothness={4} position={[separation / 2, 0, 0]}>
        <meshStandardMaterial color="#1f8fff" metalness={0.8} roughness={0.2} emissive="#004a91" emissiveIntensity={0.55} />
      </RoundedBox>
      {showCharges && <><Charges x={-separation / 2 - 0.1} positive plateSize={plateSize} /><Charges x={separation / 2 + 0.1} positive={false} plateSize={plateSize} /></>}
      {showDielectric && <mesh position={[0, 0, 0]}><boxGeometry args={[Math.max(0.1, separation - 0.3), plateSize * 0.92, plateSize * 0.92]} /><meshPhysicalMaterial color="#66d9ff" transparent opacity={0.1} roughness={0.1} transmission={0.45} side={THREE.DoubleSide} /></mesh>}
      {showField && <FieldLines separation={separation} plateSize={plateSize} strength={fieldStrength} />}
      {showDistance && <group position={[0, -plateSize / 2 - 0.42, plateSize / 2 + 0.1]}>
        <mesh><boxGeometry args={[separation, 0.025, 0.025]} /><meshBasicMaterial color="#a5f3fc" /></mesh>
        <Text position={[0, -0.2, 0]} fontSize={0.18} color="#cffafe">d = {distanceMm} mm</Text>
      </group>}
      {showLabels && <><Html position={[-separation / 2, plateSize / 2 + 0.45, 0]} center><span className="scene-label positive">Placa +</span></Html><Html position={[separation / 2, plateSize / 2 + 0.45, 0]} center><span className="scene-label negative">Placa −</span></Html></>}
    </group>
    <gridHelper args={[14, 28, '#123754', '#0a2337']} position={[0, -plateSize / 2 - 0.65, 0]} />
    <CameraRig view={cameraView} />
  </>
}

function WebGLFallback({ distanceMm }: { distanceMm: number }) {
  return <div className="webgl-fallback"><div className="plate-2d positive" /><div className="field-2d" style={{ width: `${72 + distanceMm * 4}px` }} /><div className="plate-2d negative" /><p>Vista 2D accesible · d = {distanceMm} mm</p></div>
}

function supportsWebGL() {
  try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')) } catch { return false }
}

export default function CapacitorScene(props: SceneProps) {
  if (!supportsWebGL()) return <WebGLFallback distanceMm={props.distanceMm} />
  return <div className={`capacitor-canvas ${props.compact ? 'compact' : ''}`}><Canvas dpr={[1, 1.5]} camera={{ position: cameraPositions.perspective, fov: 42 }} gl={{ antialias: true, powerPreference: 'high-performance' }}><Scene {...props} /></Canvas></div>
}
