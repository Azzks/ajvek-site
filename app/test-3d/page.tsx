"use client";
import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, useProgress, Html } from "@react-three/drei";
import gsap from "gsap";

function Tshirt() {
  const { scene } = useGLTF("/models/tshirt_base.glb");
  return <primitive object={scene} />;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <p className="text-xs uppercase tracking-[0.3em] text-stone">
        Chargement {Math.round(progress)}%
      </p>
    </Html>
  );
}

export default function Test3D() {
  const controlsRef = useRef<any>(null);
  const [facingBack, setFacingBack] = useState(false);

  function toggleView() {
    const controls = controlsRef.current;
    if (!controls) return;
    const current = controls.getAzimuthalAngle();
    const next = facingBack ? 0 : Math.PI;
    const obj = { angle: current };
    gsap.to(obj, {
      angle: next,
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        controls.setAzimuthalAngle(obj.angle);
        controls.update();
      },
    });
    setFacingBack(!facingBack);
  }

  return (
    <div className="fixed inset-0 bg-background">
      <Canvas camera={{ position: [1.1, 0.55, 1.5], fov: 40 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[2, 3, 2]} intensity={1.6} color="#fff2dd" />
        <directionalLight position={[-2.5, 1.5, -1.5]} intensity={0.5} color="#7d9bd6" />
        <directionalLight position={[0, 0.5, -3]} intensity={0.8} color="#ffffff" />
        <Suspense fallback={<Loader />}>
          <Tshirt />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          target={[0, 0.3, 0]}
          minDistance={1}
          maxDistance={3}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          enablePan={false}
        />
      </Canvas>
      <button
        onClick={toggleView}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-stone/40 bg-surface/80 px-6 py-2 text-xs uppercase tracking-widest text-foreground backdrop-blur"
      >
        {facingBack ? "Voir l'avant" : "Voir l'arrière"}
      </button>
    </div>
  );
}