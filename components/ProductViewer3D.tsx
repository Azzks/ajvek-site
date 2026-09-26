"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Decal,
  OrbitControls,
  useProgress,
  Html,
} from "@react-three/drei";
import gsap from "gsap";
import type { Colorway } from "@/lib/products";

useGLTF.preload("/models/tshirt_base.glb");
useTexture.preload("/decals/ajk.png");
useTexture.preload("/decals/ajk-blanc.png");
useTexture.preload("/decals/roses.png");
useTexture.preload("/decals/roses-blanc.png");
useTexture.preload("/decals/sakura.png");
useTexture.preload("/decals/sakura-blanc.png");

function Tshirt({
  color,
  frontTexture,
  backTexture,
  backScale,
}: Colorway) {
  const { scene } = useGLTF("/models/tshirt_base.glb");
  const frontLogo = useTexture(frontTexture);
  const backDesign = useTexture(backTexture);

  const sourceMesh = useMemo(() => {
    let found: any = null;

    scene.traverse((child: any) => {
      if (child.isMesh && !found) {
        found = child;
      }
    });

    return found;
  }, [scene]);

  const material = useMemo(
    () => sourceMesh.material.clone(),
    [sourceMesh]
  );

  useEffect(() => {
    material.color.set(color);

    if ("roughness" in material) {
      material.roughness = 0.86;
    }

    if ("metalness" in material) {
      material.metalness = 0;
    }

    material.needsUpdate = true;
  }, [material, color]);

  return (
    <mesh
      geometry={sourceMesh.geometry}
      material={material}
      scale={1.08}
    >
      <Decal
        position={[0, 0.47, 0.155]}
        rotation={[0, 0, 0]}
        scale={[0.075, 0.025, 0.15]}
        map={frontLogo}
        depthTest
      />

      <Decal
        position={[0, 0.38, -0.155]}
        rotation={[0, Math.PI, 0]}
        scale={backScale}
        map={backDesign}
        depthTest
      />
    </mesh>
  );
}

function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
        {Math.round(progress)}%
      </p>
    </Html>
  );
}

export default function ProductViewer3D({
  colorway,
}: {
  colorway: Colorway;
}) {
  const controlsRef = useRef<any>(null);

  const [facingBack, setFacingBack] =
    useState(false);

  const [zoomOpen, setZoomOpen] =
    useState(false);

  const [zoomVisible, setZoomVisible] =
    useState(false);

  useEffect(() => {
    if (zoomOpen) {
      const id = requestAnimationFrame(() =>
        setZoomVisible(true)
      );

      return () =>
        cancelAnimationFrame(id);
    }

    setZoomVisible(false);
  }, [zoomOpen]);

  function toggleView() {
    const controls = controlsRef.current;

    if (!controls) return;

    const current =
      controls.getAzimuthalAngle();

    const next = facingBack
      ? 0
      : Math.PI;

    const obj = {
      angle: current,
    };

    gsap.to(obj, {
      angle: next,
      duration: 0.8,
      ease: "power2.inOut",

      onUpdate: () => {
        controls.setAzimuthalAngle(
          obj.angle
        );

        controls.update();
      },
    });

    setFacingBack(!facingBack);
  }

  function handleZoomToggle() {
    const opening = !zoomOpen;

    setZoomOpen(opening);

    const controls =
      controlsRef.current;

    if (!controls) return;

    const camera = controls.object;

    const dir = camera.position
      .clone()
      .sub(controls.target)
      .normalize();

    const state = {
      tx: controls.target.x,
      ty: controls.target.y,
      tz: controls.target.z,
      d: controls.getDistance(),
    };

    const goal = opening
      ? {
          tx: 0,
          ty: facingBack
            ? 0.38
            : 0.47,
          tz: 0,
          d: 0.55,
        }
      : {
          tx: 0,
          ty: 0.3,
          tz: 0,
          d: 1.9,
        };

    gsap.to(state, {
      ...goal,
      duration: 0.9,
      ease: "power2.inOut",

      onUpdate: () => {
        controls.target.set(
          state.tx,
          state.ty,
          state.tz
        );

        camera.position.copy(
          controls.target
            .clone()
            .add(
              dir
                .clone()
                .multiplyScalar(
                  state.d
                )
            )
        );

        controls.update();
      },
    });
  }

  const frontEmbroidery =
    colorway.frontTexture.includes(
      "blanc"
    )
      ? "/embroidery/ajk-brode-blanc.png"
      : "/embroidery/ajk-brode-noir.png";

  const zoomImg = facingBack
    ? colorway.backTexture
    : frontEmbroidery;

  const zoomLabel = facingBack
    ? "Impression DTF en France"
    : "Brodé en France";

  return (
    <div className="relative">
      <div
        className="relative h-[66svh] min-h-[430px] max-h-[620px] w-full overflow-hidden rounded-lg border border-black/10 md:aspect-[4/3] md:h-auto md:min-h-0 md:max-h-none"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, #d8d7d3 0%, #cac9c5 45%, #b9b8b4 100%)",
        }}
      >
        {/* Halo studio très léger */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[43%] h-[72%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
        />

        {/* Assombrissement discret en bas */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%]"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.055), transparent)",
          }}
        />

        <Canvas
          camera={{
            position: [
              1.02,
              0.52,
              1.38,
            ],
            fov: 38,
          }}
          resize={{
            scroll: false,
            debounce: {
              scroll: 50,
              resize: 0,
            },
          }}
          dpr={[1, 2]}
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Éclairage studio doux */}
          <ambientLight intensity={0.38} />

          {/* Lumière principale */}
          <directionalLight
            position={[3, 4, 4]}
            intensity={1.55}
            color="#fff8ef"
          />

          {/* Remplissage */}
          <directionalLight
            position={[-3, 2, 2]}
            intensity={0.65}
            color="#eef1f5"
          />

          {/* Contours */}
          <directionalLight
            position={[0, 2, -4]}
            intensity={0.85}
            color="#ffffff"
          />

          {/* Épaules / col */}
          <directionalLight
            position={[0, 5, 0]}
            intensity={0.45}
            color="#ffffff"
          />

          <Suspense
            fallback={<Loader />}
          >
            <Tshirt {...colorway} />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            target={[0, 0.3, 0]}
            minDistance={0.5}
            maxDistance={3}
            minPolarAngle={
              Math.PI / 3
            }
            maxPolarAngle={
              Math.PI / 1.8
            }
            enablePan={false}
          />
        </Canvas>

        <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-3 px-3">
          <button
            type="button"
            onClick={toggleView}
            className="rounded-full border border-black/20 bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-black backdrop-blur-md transition hover:bg-white"
          >
            {facingBack
              ? "Avant"
              : "Arrière"}
          </button>

          <button
            type="button"
            onClick={handleZoomToggle}
            aria-label="Zoomer sur le détail"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/30 bg-white/70 text-base text-black shadow-sm backdrop-blur-md transition hover:bg-white"
          >
            +
          </button>
        </div>
      </div>

      {zoomOpen && (
        <div className="mt-5 flex flex-col items-center gap-3">
          <div
            className={`h-48 w-48 overflow-hidden rounded-full border border-surface bg-background shadow-2xl transition-opacity duration-300 ease-out sm:h-56 sm:w-56 ${
              zoomVisible
                ? "opacity-100"
                : "opacity-0"
            }`}
            style={{
              perspective: "900px",
            }}
          >
            <div className="flex h-full w-full items-center justify-center bg-stone/10 p-3">
              <img
                src={zoomImg}
                alt={zoomLabel}
                className="h-full w-full object-contain transition-transform duration-500 ease-out"
                style={{
                  transform: zoomVisible
                    ? "rotateY(0deg) rotateX(0deg) scale(1.15)"
                    : "rotateY(50deg) rotateX(12deg) scale(0.5)",

                  transformStyle:
                    "preserve-3d",

                  filter:
                    "contrast(1.2) brightness(1.05)",
                }}
              />
            </div>
          </div>

          <div
            className={`rounded-full border border-surface bg-background px-3 py-1.5 shadow-lg transition-opacity delay-150 duration-300 ease-out ${
              zoomVisible
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            <p className="whitespace-nowrap text-[9px] uppercase tracking-widest text-stone">
              {zoomLabel}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}