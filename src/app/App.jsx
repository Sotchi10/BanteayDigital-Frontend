import { AppRoutes } from './AppRoutes'
import { AuthProvider } from '../state/AuthStore'
import { ProfileCompletionModal } from '../features/auth/ProfileCompletionModal'

export default function App() {
  return <AuthProvider><AppRoutes /><ProfileCompletionModal /></AuthProvider>
}
