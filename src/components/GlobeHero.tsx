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
    let phi = 0;
    let theta = 0.25;
    let width = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check reduced motion preference safely (guard against JSDOM test environment)
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
        phi: 0,
        theta: 0.25,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.03, 0.08, 0.12], // Deep cyan-blue dark theme
        markerColor: [0.95, 0.2, 0.2], // Red glow marker for GPS breach
        glowColor: [0.05, 0.45, 0.55], // Military cyan glow
        markers: locationRef.current
          ? [{ location: [locationRef.current.lat, locationRef.current.lon], size: 0.08 }]
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
                { location: [locationRef.current.lat, locationRef.current.lon], size: 0.09 },
              ],
            });
          } else {
            if (!prefersReducedMotion) {
              phi += 0.004;
            }
            globe.update({
              phi,
              theta: 0.25,
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
      {/* Background HUD glow */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', maxWidth: '340px', aspectRatio: '1' }}
        className="opacity-95 transition-opacity duration-700"
      />

      {/* Target Coordinates Overlay Badge */}
      {targetLocation && (
        <div className="absolute bottom-2 bg-slate-950/80 backdrop-blur border border-cyan-500/40 px-3 py-1 rounded text-[11px] font-mono text-cyan-400 flex items-center space-x-1.5 shadow-lg shadow-cyan-950/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span>
            TARGET GPS: {targetLocation.latitude.toFixed(4)}, {targetLocation.longitude.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
};
