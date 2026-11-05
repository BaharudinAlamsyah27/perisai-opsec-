import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { setupLeafletIcons } from '../utils/leafletSetup';
import { MapPin, WifiOff, Map as MapIcon, AlertTriangle } from 'lucide-react';

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
  className = 'w-full rounded-xl overflow-hidden',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [tileError, setTileError] = useState<boolean>(false);
  // Opt-in: tile OSM TIDAK dimuat sampai pengguna menekan tombol
  const [mapEnabled, setMapEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Hanya inisialisasi peta setelah pengguna menekan tombol opt-in
    if (!mapEnabled) return;

    setupLeafletIcons();

    if (!mapContainerRef.current) return;

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
      marker
        .bindPopup(
          `<strong>${popupTitle}</strong><br/>${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        )
        .openPopup();

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
  }, [mapEnabled, latitude, longitude, zoom, popupTitle]);

  // Tampilan sebelum opt-in: hanya koordinat teks + tombol
  if (!mapEnabled) {
    return (
      <div
        className={`relative ${className} border border-slate-700 bg-slate-900`}
        data-testid="map-optin-panel"
      >
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-6">
          <div className="flex items-center space-x-2 text-emerald-400">
            <MapPin className="w-5 h-5" />
            <span className="font-mono text-lg font-semibold">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </span>
          </div>
          <p className="text-xs text-slate-400 text-center max-w-xs">
            Koordinat GPS terdeteksi. Peta belum dimuat untuk menjaga privasi.
          </p>

          <div className="flex items-start space-x-2 bg-amber-900/30 border border-amber-500/40 rounded-lg px-3 py-2.5 text-xs text-amber-200 max-w-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              Jika peta ditampilkan, browser memuat gambar peta dari server{' '}
              <strong>OpenStreetMap</strong>. Server tersebut akan mengetahui{' '}
              <strong>area kasar lokasi</strong> foto berdasarkan bagian peta yang diminta,
              meski tidak menerima foto Anda.
            </span>
          </div>

          <button
            onClick={() => setMapEnabled(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-700/60 hover:bg-emerald-700 border border-emerald-500/50 text-emerald-100 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            data-testid="map-enable-button"
          >
            <MapIcon className="w-4 h-4" />
            <span>Tampilkan Peta (memuat dari OpenStreetMap)</span>
          </button>
        </div>
      </div>
    );
  }

  // Tampilan setelah opt-in: peta Leaflet aktif
  return (
    <div className={`relative ${className} h-64 border border-slate-700 bg-slate-950`} data-testid="map-active-panel">
      <div ref={mapContainerRef} className="h-full w-full z-0" />

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

      <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-md border border-slate-700 text-xs font-mono text-emerald-400 flex items-center space-x-1.5 shadow z-10 pointer-events-none">
        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
        <span>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </span>
      </div>

      <div className="absolute bottom-1 left-2 text-[10px] text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800 z-10 pointer-events-none">
        © OpenStreetMap contributors
      </div>
    </div>
  );
};
