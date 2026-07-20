// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [pets, setPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(false);
  const [matchPetName, setMatchPetName] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  const getCurrentUserId = () => {
    return '00000000-0000-0000-0000-000000000000';
  };

  useEffect(() => {
    const fetchAdoptionListings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('adoption_listings')
          .select(`
            id,
            title,
            description,
            requirements,
            contact_phone,
            pet:pet_id (
              id,
              name,
              breed,
              birth_date,
              image_url,
              color
            ),
            shelter:shelter_id (
              full_name,
              location,
              phone
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error cargando adopciones:', error);
          setPets([]);
        } else {
          const mappedPets = data.map((item) => ({
            id: item.id,
            name: item.pet?.name || 'Mascota sin nombre',
            breed: item.pet?.breed || 'Raza desconocida',
            age: item.pet?.birth_date
              ? `${new Date().getFullYear() - new Date(item.pet.birth_date).getFullYear()} años`
              : 'Edad no especificada',
            description: item.title || item.description || 'Sin descripción',
            location: item.shelter?.location || 'Ubicación no especificada',
            image_url: item.pet?.image_url || null,
            shelter_name: item.shelter?.full_name || 'Refugio',
            contact_phone: item.contact_phone || item.shelter?.phone || 'No disponible',
            listing_id: item.id,
            pet_id: item.pet?.id,
          }));
          setPets(mappedPets);
        }
      } catch (err) {
        console.error('Error inesperado:', err);
        setPets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdoptionListings();
  }, []);

  const handleSwipe = async (direction) => {
    if (currentIndex >= pets.length) return;

    const currentPet = pets[currentIndex];
    const userId = getCurrentUserId();

    if (userId === '00000000-0000-0000-0000-000000000000') {
      const isMatch = direction === 'like' && Math.random() < 0.33;
      if (isMatch) {
        setMatchPetName(currentPet.name);
        setMatch(true);
        setTimeout(() => setMatch(false), 3000);
      }
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('process_swipe', {
        p_listing_id: currentPet.listing_id,
        p_action: direction === 'like' ? 'like' : 'dislike',
      });

      if (error) {
        console.error('Error al procesar swipe:', error);
      } else if (data?.match) {
        setMatchPetName(currentPet.name);
        setMatch(true);
        setTimeout(() => setMatch(false), 3000);
      }
    } catch (err) {
      console.error('Error inesperado en swipe:', err);
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleImageError = (petId) => {
    setImageErrors(prev => ({ ...prev, [petId]: true }));
  };

  const renderPetImage = (pet) => {
    const hasError = imageErrors[pet.id];

    if (!pet.image_url || hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-200 to-pink-200">
          <span className="text-7xl">🐾</span>
        </div>
      );
    }

    return (
      <img
        src={pet.image_url}
        alt={pet.name}
        className="w-full h-full object-cover"
        onError={() => handleImageError(pet.id)}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-cream-50">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Cargando mascotas...</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-cream-50 p-6 text-center">
        <div className="text-6xl mb-4">🐕</div>
        <h2 className="text-2xl font-bold text-brown-700">No hay mascotas en adopción</h2>
        <p className="text-gray-600 mt-2">Vuelve más tarde, nuevas mascotas estarán disponibles.</p>
      </div>
    );
  }

  if (currentIndex >= pets.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-cream-50 p-6 text-center">
        <div className="text-6xl mb-4">🐾</div>
        <h2 className="text-2xl font-bold text-brown-700">¡Has visto todas las mascotas!</h2>
        <p className="text-gray-600 mt-2">Vuelve más tarde, nuevas mascotas estarán disponibles.</p>
        <button
          className="mt-6 px-8 py-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition"
          onClick={() => setCurrentIndex(0)}
        >
          Volver a empezar
        </button>
      </div>
    );
  }

  const currentPet = pets[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-100 to-cream-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="relative w-full" style={{ paddingBottom: '75%' }}>
          <div className="absolute inset-0">
            {renderPetImage(currentPet)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 text-white">
            <h2 className="text-2xl font-bold">{currentPet.name}</h2>
            <p className="text-sm font-medium">{currentPet.breed} · {currentPet.age}</p>
            <p className="text-sm mt-1 opacity-90 line-clamp-2">{currentPet.description}</p>
            <p className="text-xs mt-1 flex items-center">
              <span className="mr-1">📍</span> {currentPet.location}
            </p>
            <p className="text-xs mt-1 opacity-75">🏠 {currentPet.shelter_name}</p>
          </div>
        </div>

        <div className="flex justify-around items-center py-6 bg-white">
          <button
            onClick={() => handleSwipe('dislike')}
            className="w-14 h-14 rounded-full bg-red-100 text-red-500 text-3xl flex items-center justify-center shadow-md hover:bg-red-200 transition transform hover:scale-105 active:scale-95"
          >
            ✕
          </button>
          <button
            onClick={() => handleSwipe('like')}
            className="w-14 h-14 rounded-full bg-green-100 text-green-500 text-3xl flex items-center justify-center shadow-md hover:bg-green-200 transition transform hover:scale-105 active:scale-95"
          >
            ♥
          </button>
        </div>

        <div className="flex justify-center gap-2 pb-4 bg-white">
          {pets.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {match && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm mx-4 shadow-2xl">
            <div className="text-5xl mb-3">💕</div>
            <h2 className="text-3xl font-bold text-orange-500">¡Es un Match!</h2>
            <p className="text-gray-600 mt-2">
              A <span className="font-semibold">{matchPetName}</span> también le gustas.
              Pronto podrás contactar con el refugio.
            </p>
            <button
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition"
              onClick={() => setMatch(false)}
            >
              ¡Genial!
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-sm text-gray-400 text-center">
        Desliza o usa los botones para decidir
      </p>
    </div>
  );
}

export default App;