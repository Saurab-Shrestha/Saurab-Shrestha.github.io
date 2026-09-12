import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EVIDENCE, MAX_TIER, type EvidenceNode } from './graphData';

interface Props {
  /** 0..1 through the section; drives assembly and camera orbit. */
  progress: number;
}

const SUPPORT_COLOR = 0xff5c35;
const CONTRADICT_COLOR = 0xffb84d;
const SCALE = 1.7;

/** Eased 0..1 for a node given overall progress — staggered by discovery tier. */
function tierProgress(progress: number, tier: number): number {
  // Assembly finishes by 0.75 so the saturation beat has room at the end.
  const span = 0.75 / (MAX_TIER + 1);
  const start = tier * span;
  const t = (progress - start) / span;
  return Math.min(1, Math.max(0, t));
}

/** Builds a dashed or solid line between two points. */
function makeEdge(from: THREE.Vector3, to: THREE.Vector3, node: EvidenceNode) {
  const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
  const contradicts = node.polarity === 'contradicts';

  const material = contradicts
    ? new THREE.LineDashedMaterial({
        color: CONTRADICT_COLOR,
        dashSize: 0.07,
        gapSize: 0.05,
        transparent: true,
        opacity: 0,
      })
    : new THREE.LineBasicMaterial({
        color: SUPPORT_COLOR,
        transparent: true,
        opacity: 0,
      });

  const line = new THREE.Line(geometry, material);
  if (contradicts) line.computeLineDistances();
  return line;
}

/**
 * The Evidence Graph as a live 3D scene.
 *
 * Raw three.js rather than react-three-fiber + drei: this is one scene with a
 * hand-driven animation loop, and the wrapper libraries would roughly double
 * the bytes for no benefit here.
 *
 * Everything allocated is disposed on unmount — a WebGL context leaked per route
 * change is the classic way this kind of component degrades a SPA.
 */
const GraphScene: React.FC<Props> = ({ progress }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 5.4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // caller's <noscript>-style fallback stays on screen
    }
    // Cap DPR: a 3x retina buffer costs 9x the fill rate for no visible gain.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ── Hypothesis node at the centre ────────────────────────────────────────
    const hypothesis = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 32, 32),
      new THREE.MeshBasicMaterial({ color: SUPPORT_COLOR, transparent: true, opacity: 0.9 })
    );
    group.add(hypothesis);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.23, 0.245, 48),
      new THREE.MeshBasicMaterial({
        color: SUPPORT_COLOR, transparent: true, opacity: 0.5, side: THREE.DoubleSide,
      })
    );
    group.add(halo);

    // ── Evidence nodes + edges ───────────────────────────────────────────────
    const centre = new THREE.Vector3(0, 0, 0);
    const nodes = EVIDENCE.map((node) => {
      const pos = new THREE.Vector3(...node.position).multiplyScalar(SCALE);
      const colour = node.polarity === 'supports' ? SUPPORT_COLOR : CONTRADICT_COLOR;

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 24, 24),
        new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0 })
      );
      mesh.position.copy(pos);
      group.add(mesh);

      const edge = makeEdge(centre, pos, node);
      group.add(edge);

      return { node, mesh, edge, pos };
    });

    // ── Resize ───────────────────────────────────────────────────────────────
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    // ── Render only while on screen ──────────────────────────────────────────
    let visible = true;
    const visibility = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { rootMargin: '120px' }
    );
    visibility.observe(mount);

    let frame = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!visible) return;

      const p = progressRef.current;
      const t = clock.getElapsedTime();

      // Slow orbit, tied to scroll rather than time, so the motion is the
      // reader's and stops when they stop.
      group.rotation.y = (p - 0.5) * 1.5;
      group.rotation.x = Math.sin(p * Math.PI) * 0.18;

      for (const { node, mesh, edge } of nodes) {
        const local = tierProgress(p, node.tier);
        const material = mesh.material as THREE.MeshBasicMaterial;
        material.opacity = local;
        mesh.scale.setScalar(0.4 + local * 0.6);
        (edge.material as THREE.Material & { opacity: number }).opacity =
          node.polarity === 'contradicts' ? local * 0.75 : local * 0.85;
      }

      // Saturation: once every tier has landed, the hypothesis pulses once and
      // settles — the termination condition, not a loop.
      const settled = Math.min(1, Math.max(0, (p - 0.78) / 0.12));
      const pulse = settled > 0 && settled < 1 ? Math.sin(settled * Math.PI) : 0;
      hypothesis.scale.setScalar(1 + pulse * 0.35);
      halo.scale.setScalar(1 + pulse * 0.5);
      (halo.material as THREE.MeshBasicMaterial).opacity = 0.32 + pulse * 0.45;
      halo.rotation.z = t * 0.15;
      halo.quaternion.copy(camera.quaternion);

      renderer.render(scene, camera);
    };
    animate();

    // ── Teardown ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();

      scene.traverse((obj) => {
        const any = obj as THREE.Mesh | THREE.Line;
        any.geometry?.dispose?.();
        const mat = any.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat?.dispose?.();
      });

      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="eg-canvas" ref={mountRef} aria-hidden="true" />;
};

export default GraphScene;
