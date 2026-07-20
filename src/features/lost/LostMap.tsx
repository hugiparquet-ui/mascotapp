import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { supabase } from '../../core/config/supabase.client'
import { Loader } from '../../shared/ui/Loader'

// ============================================
// 1. FIX para los iconos de Leaflet
// ============================================
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ============================================
// 2. ICONOS PERSONALIZADOS
// ============================================
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const lostPetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// ============================================
// 3. INTERFAZ
// ============================================
interface LostReport {
  id: string
  title: string
  description: string
  pet_name: string
  pet_image: string
  distance_meters: number
  created_at: string
  lat: number
  lng: number
  pet_id: string
  qr_code_hash: string
}

// ============================================
// 4. COMPONENTE PRINCIPAL
// ============================================
export const LostMap = () => {
  const { coords, error } = useGeolocation()
  const navigate = useNavigate()
  const [reports, setReports] = useState<LostReport[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const mapRef = useRef<any>(null)
  const centerSetRef = useRef(false) // Solo centrar una vez

  // Cargar reportes solo cuando coords cambia significativamente
  useEffect(() => {
    if (!coords) {
      setLoading(false)
      return
    }

    // Si ya se centró el mapa, no recargar reportes (evita refrescos)
    if (centerSetRef.current) {
      return
    }

    let isMounted = true

    const fetchReports = async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const { data, error } = await supabase.rpc('find_lost_reports_nearby', {
          user_lat: coords.latitude,
          user_lng: coords.longitude,
          radius_meters: 5000,
        })

        if (error) throw error

        if (isMounted) {
          setReports(data || [])
        }
      } catch (err: any) {
        console.error('Error al cargar reportes:', err)
        if (isMounted) {
          setFetchError(err.message || 'Error al cargar los reportes')
          setReports([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchReports()

    return () => {
      isMounted = false
    }
  }, [coords])

  // Centrar el mapa UNA SOLA VEZ cuando se obtienen las coordenadas
  useEffect(() => {
    if (coords && mapRef.current && !centerSetRef.current) {
      mapRef.current.setView([coords.latitude, coords.longitude], 14)
      centerSetRef.current = true
    }
  }, [coords])

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        ❌ Error de geolocalización: {error.message}
        <br />
        <span className="text-sm text-gray-500">
          Activa el GPS y recarga la página
        </span>
      </div>
    )
  }

  if (loading) return <Loader />

  if (!coords) {
    return (
      <div className="p-4 text-center text-gray-500">
        Obteniendo tu ubicación...
        <Loader />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="p-4 text-red-500 text-center">
        ❌ Error: {fetchError}
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        key="lost-map-fixed"
        center={[coords.latitude, coords.longitude]}
        zoom={14}
        className="h-full w-full"
        ref={(map) => {
          if (map) mapRef.current = map
        }}
        whenReady={() => console.log('Mapa listo')}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <Marker position={[coords.latitude, coords.longitude]} icon={userIcon}>
          <Popup>
            <strong>📍 Tu ubicación</strong>
          </Popup>
        </Marker>

        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={lostPetIcon}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                {report.pet_image && (
                  <img
                    src={report.pet_image}
                    alt={report.pet_name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <h3 className="font-bold text-lg">{report.pet_name}</h3>
                <p className="text-sm text-gray-600">{report.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  🏃 a {Math.round(report.distance_meters)} metros
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(report.created_at).toLocaleString()}
                </p>
                <button
                  onClick={() => navigate(`/pet/${report.qr_code_hash}`)}
                  className="mt-2 w-full bg-orange-500 text-white text-sm py-1 rounded-lg font-bold hover:bg-orange-600 transition"
                >
                  Ver perfil completo
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg text-xs z-10 border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>
          <span>Tú</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-orange-500 rounded-full inline-block"></span>
          <span>Mascota perdida</span>
        </div>
      </div>
    </div>
  )
}