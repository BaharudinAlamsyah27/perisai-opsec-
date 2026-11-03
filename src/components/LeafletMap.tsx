import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { setupLeafletIcons } from '../utils/leafletSetup';
import { MapPin, WifiOff, ExternalLink } from 'lucide-react';

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  popupTitle?: string;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  latitude,
  longitude,
  zoom = 15,
  popupTitle = 'Lokasi Terdeteksi',
  className = 'h-64 w-full rounded-xl overflow-hidden',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [tileError, setTileError] = useState<boolean>(false);

  useEffect(() => {
    setupLeafletIcons();

    if (!mapContainerRef.current) return;

    // Destroy existing instance if container changed
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      });

      tileLayer.on('tileerror', () => {
        setTileError(true);
      });

      tileLayer.addTo(map);

      const marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(`<strong>${popupTitle}</strong><br/>${latitude.toFixed(6)}, ${longitude.toFixed(6)}`).openPopup();

      mapInstanceRef.current = map;
    } catch {
      setTileError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, popupTitle]);

  return (
    <div className={`relative ${className} border border-slate-700 bg-slate-950`}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Offline / Tile load fallback banner */}
      {tileError && (
        <div className="absolute inset-x-0 bottom-0 bg-slate-900/95 border-t border-amber-500/40 p-2.5 text-xs text-slate-300 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Mode Offline / Tile tidak terjangkau.</span>
          </div>
          <span className="font-mono text-emerald-400 font-semibold">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        </div>
      )}

      {/* Coordinate badge top right */}
      <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-md border border-slate-700 text-xs font-mono text-emerald-400 flex items-center space-x-1.5 shadow z-10 pointer-events-none">
        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
        <span>{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
      </div>

      {/* Attribution bottom left */}
      <div className="absolute bottom-1 left-2 text-[10px] text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800 z-10 pointer-events-none flex items-center space-x-1">
        <span>&copy; OpenStreetMap</span>
        <ExternalLink className="w-2.5 h-2.5" />
      </div>
    </div>
  );
};

