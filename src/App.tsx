import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './core/hooks/useAuth'
import { Login } from './features/auth/Login'
import { Register } from './features/auth/Register'
import { HomePage } from './features/home/HomePage'
import { ProfilePage } from './features/profile/ProfilePage'
import { LostMap } from './features/lost/LostMap'
import { LostReport } from './features/lost/LostReport'
import { AdoptSwipe } from './features/adopt/AdoptSwipe'
import { AdoptionPublish } from './features/adopt/AdoptionPublish'
import { PublicPetProfile } from './features/pets/PublicPetProfile'
import { WalkerList } from './features/walkers/WalkerList'
import { WalkerMap } from './features/walkers/WalkerMap'
import { WalkerRegister } from './features/walkers/WalkerRegister'
import { BusinessList } from './features/businesses/BusinessList'
import { BusinessMap } from './features/businesses/BusinessMap'
import { BusinessRegister } from './features/businesses/BusinessRegister'
import { StrayList } from './features/stray/StrayList'
import { StrayReport } from './features/stray/StrayReport'
import { Loader } from './shared/ui/Loader'
import { MyPets } from './features/my-pets/MyPets'
import { AddPet } from './features/my-pets/AddPet'

function App() {
  const { user, loading, initialize } = useAuth()

  useEffect(() => {
    initialize()
  }, [])

  if (loading) return <Loader />

  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col bg-cream-50">
        <div className="flex-1 overflow-y-auto pb-16">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/pet/:hash" element={<PublicPetProfile />} />

            {/* Rutas protegidas */}
            <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/map" element={user ? <LostMap /> : <Navigate to="/login" />} />
            <Route path="/adopt" element={user ? <AdoptSwipe /> : <Navigate to="/login" />} />
            <Route path="/adopt/publish" element={user ? <AdoptionPublish /> : <Navigate to="/login" />} />
            <Route path="/lost/report" element={user ? <LostReport /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />

            {/* Paseadores */}
            <Route path="/walkers" element={user ? <WalkerList /> : <Navigate to="/login" />} />
            <Route path="/walkers/map" element={user ? <WalkerMap /> : <Navigate to="/login" />} />
            <Route path="/walkers/register" element={user ? <WalkerRegister /> : <Navigate to="/login" />} />

            {/* Veterinarias y Tiendas */}
            <Route path="/businesses" element={user ? <BusinessList /> : <Navigate to="/login" />} />
            <Route path="/businesses/map" element={user ? <BusinessMap /> : <Navigate to="/login" />} />
            <Route path="/businesses/register" element={user ? <BusinessRegister /> : <Navigate to="/login" />} />

            {/* Mascotas callejeras */}
            <Route path="/stray" element={user ? <StrayList /> : <Navigate to="/login" />} />
            <Route path="/stray/report" element={user ? <StrayReport /> : <Navigate to="/login" />} />
            <Route path="/my-pets" element={user ? <MyPets /> : <Navigate to="/login" />} />
<Route path="/my-pets/add-pet" element={user ? <AddPet /> : <Navigate to="/login" />} />
<Route path="/my-pets/add-stray" element={user ? <StrayReport /> : <Navigate to="/login" />} />
          </Routes>
        </div>
        
      </div>
    </BrowserRouter>
  )
}

export default App