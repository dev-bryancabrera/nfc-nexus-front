import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { CardBlock } from '../../../types';

// Fix leaflet marker icon issue in React
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

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position} />;
}

export default function MapPicker({ block, onChange }: Props) {
  const cfg = block.config;
  const initLat = (cfg.lat as number) || -12.0464; // Default coordinates
  const initLng = (cfg.lng as number) || -77.0428;
  const [position, setPosition] = useState<L.LatLng | null>(
    cfg.lat && cfg.lng ? new L.LatLng(initLat, initLng) : null
  );

  useEffect(() => {
    if (position) {
      onChange(block.id, { ...cfg, lat: position.lat, lng: position.lng });
    }
  }, [position]);

  return (
    <div className="space-y-3">
      <div>
        <label className="label cursor-default">Nombre de Ubicación / Dirección</label>
        <input 
          className="input" 
          value={cfg.address as string || ''} 
          onChange={e => onChange(block.id, { ...cfg, address: e.target.value })} 
          placeholder="Ej: Av. Principal 123" 
        />
      </div>
      <div>
        <label className="label cursor-default">Pincho en el Mapa</label>
        <div className="h-48 rounded-xl overflow-hidden border border-[var(--border)] relative z-0">
          <MapContainer center={[initLat, initLng]} zoom={position ? 15 : 3} style={{ height: '100%', width: '100%' }}>
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
              attribution="&copy; OpenStreetMap contributors"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
        <p className="text-[10px] text-[var(--text-dim)] mt-1">
          Haz click en el mapa para fijar geolocalización exacta. El GPS dirigirá hasta aquí.
        </p>
      </div>
    </div>
  );
}
