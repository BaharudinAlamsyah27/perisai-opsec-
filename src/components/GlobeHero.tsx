import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

interface GlobeHeroProps {
  targetLocation?: { latitude: number; longitude: number };
  className?: string;
}

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
    // Initial angle centered roughly on Indonesia (longitude ~115° E, latitude ~ -2° S)
    // Formula: -(lon * PI)/180 + PI/2 -> for 115 deg E: -0.64 * PI + 0.5 * PI = -0.14 * PI + PI = ~2.7
    let phi = 2.8;
    let theta = 0.1;
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
        phi: 2.8,
        theta: 0.1,
        dark: 1,
        diffuse: 1.5,
        mapSamples: 20000,
        mapBrightness: 12, // Daratan jauh lebih terang & tajam
        mapBaseBrightness: 0.08, // Kontur daratan terlihat meski sisi gelap
        baseColor: [0.08, 0.28, 0.4], // Cyan militer cerah untuk daratan
        markerColor: [0.95, 0.2, 0.2], // Merah menyala untuk GPS leak
        glowColor: [0.06, 0.6, 0.75], // Glow atmosfer cyan tegas
        markers: locationRef.current
          ? [{ location: [locationRef.current.lat, locationRef.current.lon], size: 0.1 }]
          : [],
      });

      const animate = () => {
        if (globe && !document.hidden) {
          if (locationRef.current) {
            const targetPhi = -(locationRef.current.lon * Math.PI) / 180 + Math.PI / 2;
            const targetTheta = (locationRef.current.lat * Math.PI) / 180;
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
            if (!prefersReducedMotion) {
              phi += 0.003;
            }
            globe.update({
              phi,
              theta: 0.1,
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
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0,transparent_70%)] pointer-events-none" />

      {/* Outer Tactical Crosshair Ring */}
      <div className="absolute w-[88%] aspect-square rounded-full border border-cyan-500/20 border-dashed pointer-events-none animate-[spin_60s_linear_infinite]" />
      <div className="absolute w-[94%] aspect-square rounded-full border border-cyan-500/10 pointer-events-none" />

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', maxWidth: '340px', aspectRatio: '1' }}
        className="opacity-100 transition-opacity duration-700 relative z-10"
      />

      {/* Target Coordinates Overlay Badge */}
      {targetLocation ? (
        <div className="absolute bottom-2 bg-slate-950/90 backdrop-blur border border-rose-500/50 px-3 py-1 rounded text-[11px] font-mono text-rose-300 flex items-center space-x-1.5 shadow-lg shadow-rose-950/40 z-20">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>
            TARGET GPS: {targetLocation.latitude.toFixed(4)}, {targetLocation.longitude.toFixed(4)}
          </span>
        </div>
      ) : (
        <div className="absolute bottom-2 bg-slate-950/80 backdrop-blur border border-cyan-500/30 px-2.5 py-0.5 rounded text-[10px] font-mono text-cyan-400/80 flex items-center space-x-1.5 z-20">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>STANDBY · MENUNGGU KOORDINAT FOTO</span>
        </div>
      )}
    </div>
  );
};
