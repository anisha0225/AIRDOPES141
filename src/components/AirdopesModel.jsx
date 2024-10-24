

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';
import './AirdopesScene.css';
import Navbar from './Navbar';

const Model = ({ rotationTarget, setRotationTarget, isVisible, selectedColor, scale, resetPosition }) => {
  const modelRef = useRef();
  const sphereRef = useRef();
  const [zPosition, setZPosition] = useState(0);

  // Load the model
  const gltf = useLoader(GLTFLoader, '/AIRDOPS1.glb');

  // Store mesh references
  useEffect(() => {
    if (gltf.scene) {
      const sphere = gltf.scene.getObjectByName('Sphere');
      const sphere001 = gltf.scene.getObjectByName('Sphere001');
      const sphere002 = gltf.scene.getObjectByName('Sphere.002');
      const sphere004 = gltf.scene.getObjectByName('Sphere004');

      sphereRef.current = { sphere, sphere001, sphere002, sphere004 };
    }
  }, [gltf]);


  useFrame((state, delta) => {
    if (resetPosition) {
      setZPosition(0); 
    } else {
      if (zPosition > -5) {
        setZPosition((prev) => prev - delta);
      }
      modelRef.current.position.z = zPosition;
    }

    if (sphereRef.current && rotationTarget !== null) {
      const currentRotationZ = sphereRef.current.sphere001.rotation.x;
      if (Math.abs(currentRotationZ - rotationTarget) > 0.01) {
        sphereRef.current.sphere001.rotation.x += (rotationTarget - currentRotationZ) * 0.1;
      } else {
        setRotationTarget(null);
      }
    }

    if (sphereRef.current) {
      sphereRef.current.sphere.visible = isVisible;
      sphereRef.current.sphere001.visible = isVisible;
    }
  });

  useEffect(() => {
    if (sphereRef.current && selectedColor) {
      const { sphere002, sphere004 } = sphereRef.current;
      if (sphere002) {
        sphere002.material.color.set(selectedColor);
      }
      if (sphere004) {
        sphere004.material.color.set(selectedColor);
      }
    }
  }, [selectedColor]);

  return <primitive ref={modelRef} object={gltf.scene} scale={scale} />; 
};

const CameraAnimation = ({ userIsInteracting, phase, zoom }) => {
  useFrame((state) => {
    if (userIsInteracting) return;

    if (zoom) {
      state.camera.position.lerp({ x: 0, y: -3, z: 19 }, 0.02);
    } else {
      switch (phase) {
        case 0:
          state.camera.position.set(0, -3, 2);
          break;
        case 1:
          state.camera.position.lerp({ x: 2, y: -2, z: 5 }, 0.02);
          break;
        case 2:
          state.camera.position.lerp({ x: -1, y: -20, z: 2 }, 0.02);
          break;
        case 3:
          state.camera.position.lerp({ x: 0, y: 3, z: -16 }, 0.02);
          break;
        case 4:
          state.camera.position.lerp({ x: 0, y: -4, z: 15 }, 0.02);
          break;
        default:
          break;
      }
    }
  });

  return null;
};

const AirdopesScene = () => {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [phase, setPhase] = useState(0);
  const [rotationTarget, setRotationTarget] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [visibility, setVisibility] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showBackButton, setShowBackButton] = useState(false);
  const [scale, setScale] = useState(1.5); 
  const [initialRotation, setInitialRotation] = useState(Math.PI / -4); 
  const [resetPosition, setResetPosition] = useState(false); 

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 765) { 
        setScale(0.8); 
      } else {
        setScale(1.5); 
      }
    };

    handleResize(); 
    window.addEventListener('resize', handleResize); 

    return () => window.removeEventListener('resize', handleResize); 
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prevPhase) => (prevPhase < 4 ? prevPhase + 1 : 4));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const textForPhases = [
    "Sleek Design",
    "Portable",
    "UPTO 42 HOURS PLAYBACK",
    "Compact",
    "AIRDOPES 141",
  ];

  const handleSphereClick = () => {
    setRotationTarget(initialRotation); 
  };

  const handleDopesButtonClick = () => {
    setZoom(true);
    setVisibility(false);
    setShowBackButton(true);
    setResetPosition(false); 
  };

  const handleBackButtonClick = () => {
    setZoom(false);
    setVisibility(true);
    setShowBackButton(false);
    setResetPosition(true); 
  };

  const colorOptions = ['red', 'white', 'black', 'green', 'blue', 'pink', 'yellow'];

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  return (
    <div className="scene-container">
      <Navbar />
      <Canvas camera={{ position: [0, 0, 0], fov: 30 }} style={{ backgroundColor: 'black' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 5, 5]} intensity={2} />
        <directionalLight position={[-5, 5, -5]} intensity={2} />
        <directionalLight position={[2, 5, -5]} intensity={2} />
        <directionalLight position={[2, -5, -5]} intensity={2} />
        <directionalLight position={[5, -1, 5]} intensity={2} />
        <directionalLight position={[10, 2, -10]} intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, 10]} intensity={0.8} color="blue" />
        <spotLight position={[0, 10, 0]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          onStart={() => setIsUserInteracting(true)}
          onEnd={() => setIsUserInteracting(false)}
          enablePan={false}
          enableZoom={false}
        />
        <Model 
          rotationTarget={rotationTarget} 
          setRotationTarget={setRotationTarget} 
          isVisible={visibility} 
          selectedColor={selectedColor} 
          scale={scale} 
          resetPosition={resetPosition} 
        />
        <CameraAnimation userIsInteracting={isUserInteracting} phase={phase} zoom={zoom} />
      </Canvas>

      <div className={`phase-text phase-${phase}`}>
        {textForPhases[phase]}
      </div>

      {phase === 4 && !showBackButton && (
        <>
          <button className="dopes-button" onClick={handleSphereClick}>
            Show
          </button>
          <button className="dopes-button1" onClick={handleDopesButtonClick}>
            Dopes
          </button>
        </>
      )}
      {showBackButton && (
        <button className="back-button" onClick={handleBackButtonClick}>
          Back
        </button>
      )}

      {!visibility && (
        <div className="color-selection">
          {colorOptions.map((color) => (
            <div
              key={color}
              className="color-option"
              style={{ backgroundColor: color }}
              onClick={() => handleColorClick(color)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AirdopesScene;
