import { AppRoutes } from './AppRoutes'
import { AuthProvider } from '../state/AuthStore'

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}
