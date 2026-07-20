import { useAppStore } from '../store/appStore'

export const useAuth = () => {
  const { user, session, loading, signOut, initialize } = useAppStore()
  return { user, session, loading, signOut, initialize }
}