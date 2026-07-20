import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { supabase } from '../../core/config/supabase.client'
import { Loader } from '../../shared/ui/Loader'

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const walkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface Walker {
  id: string
  user_id: string
  bio: string
  experience_years: number
  price_per_hour: number
  rating_avg: number
  location: { x: number; y: number }
  profiles: {
    full_name: string
    avatar_url: string
    phone: string
  }
}

export const WalkerMap = () => {
  const { coords } = useGeolocation()
  const [walkers, setWalkers] = useState<Walker[]>([])
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!coords) return

    const fetchWalkers = async () => {
      const { data, error } = await supabase.rpc('find_walkers_nearby', {
        user_lat: coords.latitude,
        user_lng: coords.longitude,
        max_distance_meters: 10000,
      })
      if (error) {
        console.error(error)
      } else {
        setWalkers(data || [])
      }
      setLoading(false)
    }

    fetchWalkers()
  }, [coords])

  useEffect(() => {
    if (coords && mapRef.current) {
      mapRef.current.setView([coords.latitude, coords.longitude], 13)
    }
  }, [coords])

  if (loading) return <Loader />
  if (!coords) return <div className="p-4 text-center">Obteniendo ubicación...</div>

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[coords.latitude, coords.longitude]}
        zoom={13}
        className="h-full w-full"
        ref={(map) => { if (map) mapRef.current = map }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <Marker position={[coords.latitude, coords.longitude]}>
          <Popup>📍 Tu ubicación</Popup>
        </Marker>

        {walkers.map((walker) => (
          <Marker
            key={walker.id}
            position={[walker.location.y, walker.location.x]}
            icon={walkerIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold">{walker.profiles?.full_name || 'Anónimo'}</h3>
                <p className="text-sm">{walker.bio}</p>
                <p className="text-sm">⭐ {walker.rating_avg || 0} · 💰 ${walker.price_per_hour}/hora</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}