'use client'

import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import SceneCameraController, { type CameraControllerRef } from '@/scene/SceneCameraController'

type Phase = 'PRE_ARRIVAL' | 'ARRIVED'

type SceneCanvasProps = {
  phase: Phase
  onPhaseChange?: (phase: Phase) => void
  controllerRef: React.RefObject<CameraControllerRef>
}

export default function SceneCanvas({ phase, onPhaseChange, controllerRef }: SceneCanvasProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, margin: 0 }}>
      <Canvas>
        <SceneCameraController
          phase={phase}
          onPhaseChange={onPhaseChange}
          ref={controllerRef}
        >
          <color attach="background" args={['#000000']} />
          <ambientLight />
          <directionalLight position={[2, 2, 2]} />
          <mesh>
            <boxGeometry />
            <meshStandardMaterial color="orange" />
          </mesh>
        </SceneCameraController>
      </Canvas>
    </div>
  )
}
