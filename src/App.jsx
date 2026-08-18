
import { useEffect, useState } from 'react'
import { getHealth } from './shared/services/api'

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking backend…')

  useEffect(() => {
    getHealth()
      .then(() => setBackendStatus('Backend connected'))
      .catch(() => setBackendStatus('Backend unavailable'))
  }, [])

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900">
      <section className="rounded-xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Banteay Digital</h1>
        <p className="mt-3 text-sm text-slate-600">{backendStatus}</p>
      </section>
    </main>
  )
}

export default App
