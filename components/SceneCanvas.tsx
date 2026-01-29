'use client';

import { Canvas } from '@react-three/fiber';

export default function SceneCanvas() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <color attach="background" args={['#000000']} />
        <ambientLight />
        <directionalLight position={[2, 2, 2]} />
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </div>
  );
}
