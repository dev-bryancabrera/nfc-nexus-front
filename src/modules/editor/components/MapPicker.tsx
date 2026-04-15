import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { CardBlock } from '../../../types';

// Fix leaflet marker icon in React/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Props {
  block: CardBlock;
  onChange: (id: string, config: Record<string, unknown>) => void;
}

/** Flies the map to a new center whenever `flyTo` changes. */
function FlyController({ flyTo }: { flyTo: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) map.flyTo(flyTo, 16, { duration: 1 });
  }, [flyTo, map]);
  return null;
}

/** Drops a marker wherever the user clicks. */
function ClickMarker({ position, onPlace }: {
  position: L.LatLng | null;
  onPlace: (p: L.LatLng) => void;
}) {
  useMapEvents({ click: e => onPlace(e.latlng) });
  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ block, onChange }: Props) {
  const cfg = block.config;
  const initLat = (cfg.lat as number) || -12.0464;
  const initLng = (cfg.lng as number) || -77.0428;

  const [position, setPosition] = useState<L.LatLng | null>(
    cfg.lat && cfg.lng ? new L.LatLng(initLat, initLng) : null
  );
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Persist lat/lng whenever marker moves
  useEffect(() => {
    if (position) {
      onChange(block.id, {
        ...cfg,
        lat: +position.lat.toFixed(6),
        lng: +position.lng.toFixed(6),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  const placeAt = (lat: number, lng: number, label?: string) => {
    const latlng = new L.LatLng(lat, lng);
    setPosition(latlng);
    setFlyTo([lat, lng]);
    if (label) {
      onChange(block.id, {
        ...cfg,
        lat: +lat.toFixed(6),
        lng: +lng.toFixed(6),
        address: label,
      });
    }
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      if (!data.length) { setSearchError('No se encontró esa ubicación.'); return; }
      const { lat, lon, display_name } = data[0];
      placeAt(parseFloat(lat), parseFloat(lon), display_name.split(',').slice(0, 3).join(', '));
    } catch {
      setSearchError('Error al buscar. Verifica tu conexión.');
    } finally {
      setSearching(false);
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        placeAt(pos.coords.latitude, pos.coords.longitude);
        setGpsLoading(false);
      },
      () => { setGpsLoading(false); },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Address label */}
      <div>
        <label className="label">Nombre / Dirección visible</label>
        <input
          className="input"
          value={cfg.address as string || ''}
          onChange={e => onChange(block.id, { ...cfg, address: e.target.value })}
          placeholder="Ej: Av. Principal 123, Lima"
        />
      </div>

      {/* Search */}
      <div>
        <label className="label">Buscar ubicación en el mapa</label>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              clearTimeout(debounceRef.current);
            }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar ciudad, dirección, lugar..."
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="btn btn-secondary whitespace-nowrap px-3"
          >
            {searching ? '⏳' : '🔍 Buscar'}
          </button>
          <button
            onClick={handleGPS}
            disabled={gpsLoading}
            className="btn btn-secondary px-3"
            title="Usar mi ubicación actual"
          >
            {gpsLoading ? '⏳' : '📍'}
          </button>
        </div>
        {searchError && <p className="text-[10px] text-danger mt-1">{searchError}</p>}
      </div>

      {/* Map */}
      <div>
        <div className="h-64 rounded-xl overflow-hidden border border-[var(--border)] relative z-0">
          <MapContainer
            center={[initLat, initLng]}
            zoom={position ? 15 : 4}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            />
            <FlyController flyTo={flyTo} />
            <ClickMarker position={position} onPlace={p => placeAt(p.lat, p.lng)} />
          </MapContainer>
        </div>
        <p className="text-[10px] text-[var(--text-dim)] mt-1.5">
          Busca una ubicación arriba o haz clic en el mapa para fijar el marcador exacto.
          {position && (
            <span className="ml-1 font-mono text-accent">
              {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
