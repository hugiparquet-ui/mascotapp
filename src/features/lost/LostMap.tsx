import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { supabase } from '../../core/config/supabase.client'
import { Loader } from '../../shared/ui/Loader'
import { BackButton } from '../../shared/ui/BackButton'

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
  const centerSetRef = useRef(false)
  const reportsLoadedRef = useRef(false)

  // Cargar reportes SOLO UNA VEZ
  useEffect(() => {
    if (!coords || reportsLoadedRef.current) {
      if (!coords) setLoading(false)
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
          reportsLoadedRef.current = true
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

  // Centrar el mapa UNA SOLA VEZ
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
      {/* ✅ Botón de retroceso reposicionado (más abajo y a la derecha) */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[1000]">
        <BackButton />
      </div>

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
              {/* ✅ Estilo mejorado del popup */}
              <div className="min-w-[220px] max-w-[260px] p-2">
                {report.pet_image && (
                  <img
                    src={report.pet_image}
                    alt={report.pet_name}
                    className="w-full h-36 object-cover rounded-lg mb-2 border-2 border-azul-turquesa"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <h3 className="font-bold text-lg text-naranja-brillante">
                  {report.pet_name}
                </h3>
                <p className="text-sm text-gray-700 font-medium">{report.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                    🏃 {Math.round(report.distance_meters)} m
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                    📅 {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/pet/${report.qr_code_hash}`)}
                  className="mt-3 w-full bg-naranja-brillante text-white text-sm py-1.5 rounded-lg font-bold hover:bg-naranja-suave transition shadow-sm"
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