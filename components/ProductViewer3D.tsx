"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useTexture, Decal, OrbitControls, useProgress, Html } from "@react-three/drei";
import gsap from "gsap";
import type { Colorway } from "@/lib/products";

useGLTF.preload("/models/tshirt_base.glb");
useTexture.preload("/decals/ajk.png");
useTexture.preload("/decals/ajk-blanc.png");
useTexture.preload("/decals/roses.png");
useTexture.preload("/decals/roses-blanc.png");
useTexture.preload("/decals/sakura.png");
useTexture.preload("/decals/sakura-blanc.png");

function Tshirt({ color, frontTexture, backTexture, backScale }: Colorway) {
  const { scene } = useGLTF("/models/tshirt_base.glb");
  const frontLogo = useTexture(frontTexture);
  const backDesign = useTexture(backTexture);

  const sourceMesh = useMemo(() => {
    let found: any = null;
    scene.traverse((child: any) => {
      if (child.isMesh && !found) found = child;
    });
    return found;
  }, [scene]);

  const material = useMemo(() => sourceMesh.material.clone(), [sourceMesh]);

  useEffect(() => {
    material.color.set(color);
  }, [material, color]);

  return (
    <mesh geometry={sourceMesh.geometry} material={material}>
      <Decal position={[0, 0.47, 0.155]} rotation={[0, 0, 0]} scale={[0.075, 0.025, 0.15]} map={frontLogo} depthTest />
      <Decal position={[0, 0.38, -0.155]} rotation={[0, Math.PI, 0]} scale={backScale} map={backDesign} depthTest />
    </mesh>
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <p className="text-[10px] uppercase tracking-[0.3em] text-stone">{Math.round(progress)}%</p>
    </Html>
  );
}

export default function ProductViewer3D({ colorway }: { colorway: Colorway }) {
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
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-surface bg-background">
      <Canvas camera={{ position: [1.1, 0.55, 1.5], fov: 40 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[2, 3, 2]} intensity={1.6} color="#fff2dd" />
        <directionalLight position={[-2.5, 1.5, -1.5]} intensity={0.5} color="#7d9bd6" />
        <directionalLight position={[0, 0.5, -3]} intensity={0.8} color="#ffffff" />
        <Suspense fallback={<Loader />}>
          <Tshirt {...colorway} />
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
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-stone/40 bg-surface/80 px-3 py-1 text-[10px] uppercase tracking-widest text-foreground backdrop-blur"
      >
        {facingBack ? "Avant" : "Arriere"}
      </button>
    </div>
  );
}