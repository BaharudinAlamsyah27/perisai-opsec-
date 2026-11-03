import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { nearestEquivalentAngle, toGlobeRotation } from '../utils/globeCoordinates';

interface GlobeHeroProps {
  targetLocation?: { latitude: number; longitude: number };
  className?: string;
}

const INITIAL_ORIENTATION = toGlobeRotation(-2, 115);

export const GlobeHero: React.FC<GlobeHeroProps> = ({ targetLocation, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const locationRef = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (targetLocation && typeof targetLocation.latitude === 'number' && typeof targetLocation.longitude === 'number') {
      locationRef.current = { lat: targetLocation.latitude, lon: targetLocation.longitude };
    } else {
      locationRef.current = null;
    }
  }, [targetLocation]);

  useEffect(() => {
    // Initial angle centered on Indonesia (~115° E, ~ -2° S)
    let phi = INITIAL_ORIENTATION.phi;
    let theta = INITIAL_ORIENTATION.theta;
    let width = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    const onResize = () => {
      if (canvas) {
        width = canvas.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationFrameId: number | null = null;

    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: width * 2,
        height: width * 2,
        phi: INITIAL_ORIENTATION.phi,
        theta: INITIAL_ORIENTATION.theta,
        dark: 1,
        diffuse: 1.6,
        mapSamples: 24000,
        mapBrightness: 14, // Kecerahan titik benua tinggi & jelas terbaca
        mapBaseBrightness: 0.12, // Kontur benua terlihat tegas di latar gelap
        baseColor: [0.15, 0.45, 0.58], // Warna benua cyan-teal militer terbaca jelas
        markerColor: [0.95, 0.2, 0.2], // Merah tegas untuk marker GPS leak
        glowColor: [0.08, 0.65, 0.8], // Glow cyan tipis & profesional di tepi
        markers: locationRef.current
          ? [{ location: [locationRef.current.lat, locationRef.current.lon], size: 0.1 }]
          : [],
      });

      const animate = () => {
        if (globe && !document.hidden) {
          if (locationRef.current) {
            const target = toGlobeRotation(locationRef.current.lat, locationRef.current.lon);
            const targetPhi = nearestEquivalentAngle(phi, target.phi);
            const targetTheta = nearestEquivalentAngle(theta, target.theta);
            phi += (targetPhi - phi) * 0.05;
            theta += (targetTheta - theta) * 0.05;
            globe.update({
              phi,
              theta,
              width: width * 2,
              height: width * 2,
              markers: [
                { location: [locationRef.current.lat, locationRef.current.lon], size: 0.12 },
              ],
            });
          } else {
            // Idle gentle rotation
            if (!prefersReducedMotion) {
              phi += 0.003;
            }
            globe.update({
              phi,
              theta,
              width: width * 2,
              height: width * 2,
              markers: [],
            });
          }
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);
    } catch {
      // Clean fallback if WebGL is unavailable
    }

    return () => {
      window.removeEventListener('resize', onResize);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (globe) {
        globe.destroy();
      }
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden w-full h-full ${className}`}>
      {/* Tactical Glow Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.18)_0,transparent_70%)] pointer-events-none" />

      {/* Orbit Ring */}
      <div className="absolute w-[220px] sm:w-[260px] aspect-square rounded-full border border-cyan-500/20 border-dashed pointer-events-none animate-[spin_60s_linear_infinite]" />

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 'auto', maxWidth: '280px', aspectRatio: '1' }}
        className="opacity-100 transition-opacity duration-700 relative z-10"
      />

      {/* Status Label bergaya monospace di bawah globe */}
      <div className="mt-2 relative z-20">
        {targetLocation ? (
          <div className="bg-slate-950/90 backdrop-blur border border-rose-500/50 px-3 py-1 rounded text-[11px] font-mono text-rose-300 flex items-center space-x-1.5 shadow-lg shadow-rose-950/40">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>
              GPS: {targetLocation.latitude.toFixed(6)}, {targetLocation.longitude.toFixed(6)}
            </span>
          </div>
        ) : (
          <div className="bg-slate-950/80 backdrop-blur border border-cyan-500/30 px-3 py-1 rounded text-[10px] font-mono text-cyan-400 flex items-center space-x-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>MENUNGGU DATA GPS DARI FOTO</span>
          </div>
        )}
      </div>
    </div>
  );
};
