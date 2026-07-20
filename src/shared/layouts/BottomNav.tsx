import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: '📍', label: 'Mapa' },
  { to: '/adopt', icon: '🐾', label: 'Adoptar' },
  { to: '/lost/report', icon: '📢', label: 'Reportar' },
  { to: '/walkers', icon: '🐕', label: 'Paseadores' },
  { to: '/businesses', icon: '🏥', label: 'Veterinarias' },
  { to: '/profile', icon: '👤', label: 'Mi Perfil' }, // ← BOTÓN DE PERFIL
  { to: '/stray', icon: '🐾', label: 'Callejeros' },
]

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-1 px-2 flex justify-around items-center z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center text-[10px] ${isActive ? 'text-orange-500' : 'text-gray-400'}`
          }
        >
          <span className="text-xl">{item.icon}</span>
          <span className="mt-0.5">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}