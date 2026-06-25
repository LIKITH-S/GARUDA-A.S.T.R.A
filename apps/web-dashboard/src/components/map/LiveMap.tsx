"use client"

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PatrolUnit } from '@/app/patrol/page' 

interface LiveMapProps {
  units: PatrolUnit[]
  focusedLocation?: [number, number] | null
}

function MapUpdater({ center }: { center?: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 1.5 })
    }
  }, [center, map])
  return null
}

export default function LiveMap({ units, focusedLocation }: LiveMapProps) {
  const defaultCenter: [number, number] = [12.9716, 77.5946]

  const createCustomIcon = (status: string) => {
    const color = status === 'Offline' ? '#64748b' : '#F6BE39'
    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `<div class="w-4 h-4 rounded-full bg-[${color}] border-2 border-white shadow-[0_0_10px_${color}]" style="background-color: ${color}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    })
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-outlineVariant relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <MapUpdater center={focusedLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {units.map((unit) => {
          if (unit.lat == null || unit.lng == null) return null;
          return (
            <Marker key={unit.id} position={[unit.lat, unit.lng]} icon={createCustomIcon(unit.status)}>
              <Popup>
                <div className="flex flex-col gap-1 text-background min-w-[150px]">
                  <h3 className="font-bold text-sm text-primary">{unit.name}</h3>
                  <div className="text-xs">
                    <span className="font-semibold">Status:</span> {unit.status}
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold">Battery:</span> {unit.battery}% {unit.charging ? '⚡' : ''}
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold">Last Update:</span> {unit.lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  )
}
