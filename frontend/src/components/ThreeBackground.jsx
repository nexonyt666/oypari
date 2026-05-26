import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeBackground — Full-page WebGL 3D scene
 * Features:
 *  • Persistent background with pathname-reactive morphing
 *  • Morphing TorusKnot (main gem) + wireframe overlay
 *  • Icosahedron wireframe shell
 *  • 600 glowing colored particles
 *  • 3 orbiting point lights (indigo / purple / pink)
 *  • Mouse-reactive camera drift
 *  • Lerp-based smooth route transitions & mobile responsive scaling
 */
const ThreeBackground = ({ pathname }) => {
  const mountRef = useRef(null);
  const pathRef = useRef(pathname);

  // Sync prop changes to ref so animation loop reads the latest route
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ────────────────────────────────────────
    let W = window.innerWidth;
    let H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Scene & Camera ───────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
    
    // Initial camera position
    const isInitialHome = pathRef.current === '/';
    const isInitialMobile = W < 768;
    camera.position.set(0, 0, isInitialHome ? 6 : 7.5);

    // ── Particles ────────────────────────────────────────
    const COUNT = 600;
    const posArr = new Float32Array(COUNT * 3);
    const colArr = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 9;

      posArr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      posArr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      posArr[i * 3 + 2] = r * Math.cos(phi);

      // Gradient: indigo (#6366F1) → purple (#A855F7) → pink (#EC4899)
      const tVal = Math.random();
      if (tVal < 0.4) {
        // indigo
        colArr[i * 3] = 0.388; colArr[i * 3 + 1] = 0.400; colArr[i * 3 + 2] = 0.945;
      } else if (tVal < 0.7) {
        // purple
        colArr[i * 3] = 0.659; colArr[i * 3 + 1] = 0.333; colArr[i * 3 + 2] = 0.969;
      } else {
        // pink
        colArr[i * 3] = 0.925; colArr[i * 3 + 1] = 0.282; colArr[i * 3 + 2] = 0.600;
      }
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(colArr, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Main TorusKnot ───────────────────────────────────
    const knotGeo = new THREE.TorusKnotGeometry(1.4, 0.42, 220, 22);
    const knotMat = new THREE.MeshPhongMaterial({
      color:     new THREE.Color(0x6366F1),
      emissive:  new THREE.Color(0x1e1f8a),
      specular:  new THREE.Color(0xA855F7),
      shininess: 100,
      transparent: true,
      opacity: 0.88,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    scene.add(knotMesh);

    // ── Wire TorusKnot overlay ───────────────────────────
    const wireGeo = new THREE.TorusKnotGeometry(1.48, 0.44, 120, 18);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xEC4899,
      wireframe: true,
      transparent: true,
      opacity: 0.13,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // ── Icosahedron shell ────────────────────────────────
    const icoGeo = new THREE.IcosahedronGeometry(3.5, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x6366F1,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    scene.add(icoMesh);

    // ── Small satellite orb ──────────────────────────────
    const orbGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const orbMat = new THREE.MeshPhongMaterial({
      color: 0xEC4899,
      emissive: 0x7d1950,
      transparent: true,
      opacity: 0.7,
    });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orbMesh);

    // ── Second satellite ─────────────────────────────────
    const orb2Geo = new THREE.OctahedronGeometry(0.18, 0);
    const orb2Mat = new THREE.MeshPhongMaterial({
      color: 0xA855F7,
      emissive: 0x4a1580,
      transparent: true,
      opacity: 0.8,
    });
    const orb2Mesh = new THREE.Mesh(orb2Geo, orb2Mat);
    scene.add(orb2Mesh);

    // ── Lights ───────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0d0f2e, 3));

    const light1 = new THREE.PointLight(0x6366F1, 10, 18);
    const light2 = new THREE.PointLight(0xA855F7, 8, 18);
    const light3 = new THREE.PointLight(0xEC4899, 8, 18);
    scene.add(light1, light2, light3);

    // ── Mouse ─────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    // ── Resize ───────────────────────────────────────────
    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener('resize', onResize);

    // ── Lerp Interpolation State ──────────────────────────
    let curKnotX = isInitialHome ? (isInitialMobile ? 0 : 1.8) : 0;
    let curKnotY = isInitialHome ? (isInitialMobile ? -1.2 : 0.2) : 0;
    let curKnotZ = isInitialHome ? 0 : -5;
    let curKnotScale = isInitialHome ? (isInitialMobile ? 0.65 : 1) : 0;
    let curLookAtX = isInitialHome ? (isInitialMobile ? 0 : 0.8) : 0;
    let curLookAtY = isInitialHome ? (isInitialMobile ? -0.3 : 0) : 0;
    let curCamZ = isInitialHome ? 6 : 7.5;

    // Set initial positions
    knotMesh.position.set(curKnotX, curKnotY, curKnotZ);
    knotMesh.scale.set(curKnotScale, curKnotScale, curKnotScale);
    wireMesh.position.copy(knotMesh.position);
    wireMesh.scale.copy(knotMesh.scale);
    icoMesh.position.copy(knotMesh.position);
    icoMesh.scale.copy(knotMesh.scale);

    // ── Animation loop ───────────────────────────────────
    let frameId;
    let t = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.006;

      // Dynamic targets based on path & responsiveness
      const isMobile = window.innerWidth < 768;
      const isHome = pathRef.current === '/';

      const targetKnotX = isHome ? (isMobile ? 0 : 1.8) : 0;
      const targetKnotY = isHome ? (isMobile ? -1.2 : 0.2) : 0;
      const targetKnotZ = isHome ? 0 : -5;
      const targetKnotScale = isHome ? (isMobile ? 0.65 : 1) : 0;
      const targetLookAtX = isHome ? (isMobile ? 0 : 0.8) : 0;
      const targetLookAtY = isHome ? (isMobile ? -0.35 : 0) : 0;
      const targetCamZ = isHome ? 6 : 7.5;

      // LERP values smoothly
      curKnotX += (targetKnotX - curKnotX) * 0.045;
      curKnotY += (targetKnotY - curKnotY) * 0.045;
      curKnotZ += (targetKnotZ - curKnotZ) * 0.045;
      curKnotScale += (targetKnotScale - curKnotScale) * 0.045;
      curLookAtX += (targetLookAtX - curLookAtX) * 0.045;
      curLookAtY += (targetLookAtY - curLookAtY) * 0.045;
      curCamZ += (targetCamZ - curCamZ) * 0.045;

      // Apply positions & scales
      knotMesh.position.set(curKnotX, curKnotY, curKnotZ);
      knotMesh.scale.set(curKnotScale, curKnotScale, curKnotScale);
      
      wireMesh.position.copy(knotMesh.position);
      wireMesh.scale.set(curKnotScale * 1.05, curKnotScale * 1.05, curKnotScale * 1.05);
      
      icoMesh.position.copy(knotMesh.position);
      icoMesh.scale.set(curKnotScale, curKnotScale, curKnotScale);

      orbMesh.scale.set(curKnotScale, curKnotScale, curKnotScale);
      orb2Mesh.scale.set(curKnotScale, curKnotScale, curKnotScale);

      // Rotate objects
      knotMesh.rotation.x += 0.0035;
      knotMesh.rotation.y += 0.007;
      wireMesh.rotation.x -= 0.003;
      wireMesh.rotation.y += 0.005;
      wireMesh.rotation.z += 0.002;
      icoMesh.rotation.y += 0.0015;
      icoMesh.rotation.z += 0.001;
      particles.rotation.y += 0.0004;
      particles.rotation.x += 0.00015;

      // Orbit lights around the torus knot (which moves with curKnotX/Y)
      const cx = curKnotX;
      const cy = curKnotY;
      light1.position.set(cx + Math.cos(t) * 3,          cy + Math.sin(t * 0.7) * 2,    Math.sin(t) * 3);
      light2.position.set(cx + Math.cos(t * 0.8 + 2.09) * 3, cy + Math.cos(t * 0.5) * 2, Math.sin(t * 0.8 + 2.09) * 3);
      light3.position.set(cx + Math.sin(t * 0.6 + 4.19) * 3, cy + Math.sin(t + 1) * 2,   Math.cos(t * 0.6 + 4.19) * 3);

      // Orbiting satellite orbs
      orbMesh.position.set(
        cx + Math.cos(t * 1.5) * 2.8,
        cy + Math.sin(t * 1.5) * 1.2,
        Math.sin(t * 0.8) * 1.5
      );
      orb2Mesh.position.set(
        cx + Math.cos(t * 1.1 + Math.PI) * 2.4,
        cy + Math.sin(t * 1.1) * 1.8,
        Math.cos(t * 0.9) * 1.2
      );
      orb2Mesh.rotation.y += 0.05;

      // Camera mouse drift & position
      camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.04;
      camera.position.z = curCamZ;
      camera.lookAt(new THREE.Vector3(curLookAtX, curLookAtY, 0));

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      [knotGeo, wireGeo, icoGeo, pGeo, orbGeo, orb2Geo].forEach(g => g.dispose());
      [knotMat, wireMat, icoMat, pMat, orbMat, orb2Mat].forEach(m => m.dispose());
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ThreeBackground;
