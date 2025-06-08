import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  red: { hex: 0xff4444, name: 'Red' },
  blue: { hex: 0x4444ff, name: 'Blue' },
  green: { hex: 0x44ff44, name: 'Green' },
  yellow: { hex: 0xffff44, name: 'Yellow' },
  purple: { hex: 0xff44ff, name: 'Purple' }
};

const COLOR_KEYS = Object.keys(COLORS);

function generateColorSequence(pathLength) {
  if (pathLength < 7) return Array.from({ length: pathLength }, (_, i) => COLOR_KEYS[i % 5]);

  const sequence = [...COLOR_KEYS, COLOR_KEYS[0], COLOR_KEYS[1]];

  for (let i = 7; i < pathLength; i++) {
    const lastSix = sequence.slice(i - 6, i);
    const colorCount = {};
    COLOR_KEYS.forEach(color => colorCount[color] = 0);
    lastSix.forEach(color => colorCount[color]++);
    const minCount = Math.min(...Object.values(colorCount));
    const candidateColors = COLOR_KEYS.filter(color => colorCount[color] === minCount);
    const nextColor = candidateColors[Math.floor(Math.random() * candidateColors.length)];
    sequence.push(nextColor);
  }
  return sequence;
}

function validateColorSequence(sequence) {
  if (sequence.length < 7) return true;
  for (let i = 0; i <= sequence.length - 7; i++) {
    const window = sequence.slice(i, i + 7);
    const uniqueColors = new Set(window);
    if (uniqueColors.size < 5) return false;
  }
  return true;
}

function convertPathTo3D(path2D) {
  if (!path2D || path2D.length === 0) return [];
  const colorSequence = generateColorSequence(path2D.length);
  const isValid = validateColorSequence(colorSequence);

  const xs = path2D.map(p => p.x ?? p[0]);
  const ys = path2D.map(p => p.y ?? p[1]);

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const scale = 0.9; // increased spacing between tiles

  const path3D = [];

  path2D.forEach((point2D, index) => {
    const x = ((point2D.x ?? point2D[0]) - xMin - xRange / 2) * scale;
    const z = ((point2D.y ?? point2D[1]) - yMin - yRange / 2) * scale;
    let y = 0;
    const progress = index / path2D.length;
    y += progress * 8;
    y += Math.sin(progress * 4 * Math.PI) * 1.5;
    y += (Math.random() - 0.5) * 0.5;

    const colorKey = colorSequence[index];
    const colorData = COLORS[colorKey];

    path3D.push({
      id: index,
      position: [x, y, z],
      colorValue: colorData.hex,
      colorName: colorData.name
    });
  });

  return { path3D, isValid, colorSequence };
}

const Tile = ({ position, colorValue, isStart, isEnd }) => {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 0.3, 8]} />
        <meshLambertMaterial color={colorValue} transparent opacity={0.9} />
      </mesh>
      {isStart || isEnd ? (
        <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.4, 16]} />
          <meshBasicMaterial color={isStart ? 0x00ff00 : 0xffd700} transparent opacity={0.6} />
        </mesh>
      ) : null}
    </group>
  );
};

const TileBoard = ({ pathTiles }) => {
  const { path3D } = convertPathTo3D(pathTiles);
  return (
    <>
      {path3D.map((tile, i) => (
        <Tile key={i} position={tile.position} colorValue={tile.colorValue} isStart={i === 0} isEnd={i === path3D.length - 1} />
      ))}
    </>
  );
};

const GameBoard = ({ pathTiles }) => {
  return (
    <div className="fixed inset-0 w-full h-screen bg-gray-900 z-50">
      <Canvas shadows camera={{ position: [0, 20, 30], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 5]} intensity={0.8} castShadow />
        <OrbitControls />
        <TileBoard pathTiles={pathTiles} />
      </Canvas>
    </div>
  );
};

export default GameBoard;
