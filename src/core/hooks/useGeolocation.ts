import { useState, useEffect } from 'react'

export const useGeolocation = () => {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null)
  const [error, setError] = useState<GeolocationPositionError | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError({ code: 0, message: 'Geolocalización no soportada' } as any)
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCoords(pos.coords),
      (err) => setError(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { coords, error }
}