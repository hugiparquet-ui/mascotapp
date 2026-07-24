import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: '🏠', label: 'Inicio' },
  { to: '/adopt', icon: '🐾', label: 'Adoptar' },
  { to: '/lost/report', icon: '📢', label: 'Reportar' },
  { to: '/walkers', icon: '🐕', label: 'Paseadores' },
  { to: '/businesses', icon: '🏪', label: 'Negocios' },
  { to: '/profile', icon: '👤', label: 'Perfil' },
]

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-naranja-brillante to-azul-fuerte py-2 px-2 flex justify-around items-center z-50 shadow-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center text-[10px] ${
              isActive ? 'text-white' : 'text-white/70'
            } transition-colors duration-200`
          }
        >
          {({ isActive }) => (
            <>
              <span className="text-xl">{item.icon}</span>
              <span className="mt-0.5 font-medium">{item.label}</span>
              {isActive && <span className="w-1 h-1 bg-white rounded-full mt-1" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}