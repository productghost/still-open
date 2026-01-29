'use client';

import SceneCanvas from '../components/SceneCanvas';
import SceneHUD from '../components/SceneHUD';
import { useState, useRef } from 'react';
import type { CameraControllerRef } from '@/scene/SceneCameraController';

type Phase = 'PRE_ARRIVAL' | 'ARRIVED';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('PRE_ARRIVAL');
  const controllerRef = useRef<CameraControllerRef>(null);

  const handleArrive = () => {
    setPhase('ARRIVED');
  };

  const handleGoToAnchor = (anchorId: string) => {
    if (controllerRef.current) {
      controllerRef.current.goToAnchor(anchorId);
    }
  };

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000000' }}>
      {/* 3D Canvas: only render when ARRIVED */}
      {phase === 'ARRIVED' && (
        <SceneCanvas phase={phase} onPhaseChange={setPhase} controllerRef={controllerRef} />
      )}
      
      {/* HUD: shows CTA in PRE_ARRIVAL, anchor buttons in ARRIVED */}
      <SceneHUD phase={phase} onArrive={handleArrive} onGoToAnchor={handleGoToAnchor} />
    </main>
  );
}
