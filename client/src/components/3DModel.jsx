import React, { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


export function Model({ url }) {
    const gltf = useLoader(GLTFLoader, url);
    const modelRef = useRef();

    // Rotate the model automatically every frame
    useFrame((state, delta) => {
        if (modelRef.current) {
            // Rotate around Y-axis (vertical axis) - complete rotation every second
            modelRef.current.rotation.z += delta * Math.PI * 2 / 10; // 2π radians per second = 360 degrees per second
        }
    });

    return <primitive ref={modelRef} object={gltf.scene} position={[0, 0, 0]} scale={[2, 2, 2]} />;
}


export default function DragonModel() {

    return (
        <>
            <div className="flex justify-center items-center fixed -right-7 -bottom-14 w-[35%] h-[50%] z-10 pointer-events-none">
                <Canvas
                    camera={{ position: [-10, -30, -50], fov: 50 }}
                    style={{ pointerEvents: 'auto', background: 'transparent' }}
                >
                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />

                    {/* Load Model */}
                    <Suspense fallback={null}>
                        <Model url="/models/Snorlax/pokemon_snorlax.glb" />
                    </Suspense>

                    {/* Controls - Fixed size, only rotation allowed */}
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        minDistance={17}
                        maxDistance={17}
                        target={[0, 0, 0]}
                    />
                </Canvas>
            </div>
        </>
    );

}
