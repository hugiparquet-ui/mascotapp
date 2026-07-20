import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { supabase } from '../../core/config/supabase.client'
import { Loader } from '../../shared/ui/Loader'
import { BackButton } from '../../shared/ui/BackButton'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const businessIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface Business {
  id: string
  name: string
  category: string
  address: string
  phone: string
  location: { x: number; y: number }
}

export const BusinessMap = () => {
  const { coords } = useGeolocation()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!coords) return
    const fetch = async () => {
      const { data, error } = await supabase.rpc('find_businesses_nearby', {
        user_lat: coords.latitude,
        user_lng: coords.longitude,
        max_distance_meters: 10000,
      })
      if (!error) setBusinesses(data || [])
      setLoading(false)
    }
    fetch()
  }, [coords])

  useEffect(() => {
    if (coords && mapRef.current) mapRef.current.setView([coords.latitude, coords.longitude], 13)
  }, [coords])

  if (loading) return <Loader />
  if (!coords) return <div className="p-4 text-center">Obteniendo ubicación...</div>

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 left-2 z-10 bg-white p-2 rounded-lg shadow-lg">
        <BackButton />
      </div>
      <MapContainer center={[coords.latitude, coords.longitude]} zoom={13} className="h-full w-full" ref={(map) => { if (map) mapRef.current = map }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
        <Marker position={[coords.latitude, coords.longitude]}><Popup>📍 Tu ubicación</Popup></Marker>
        {businesses.map(b => (
          <Marker key={b.id} position={[b.location.y, b.location.x]} icon={businessIcon}>
            <Popup>
              <div><h3 className="font-bold">{b.name}</h3><p>{b.category}</p>{b.address && <p>📍 {b.address}</p>}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}