import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-logique-navy text-slate-100 flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="bg-logique-card p-8 rounded-2xl border border-slate-700/60 max-w-md w-full shadow-2xl">
                    <h2 className="text-2xl font-bold text-logique-yellow mb-2">LOGIQUE WMS Dashboard</h2>
                    <p className="text-slate-400 text-sm">Header Navigation is now Active & Ready!</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/items/new"
              element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="bg-logique-card p-8 rounded-2xl border border-slate-700/60 max-w-md w-full shadow-2xl">
                    <h2 className="text-2xl font-bold text-logique-yellow mb-2">Form Tambah Item Baru</h2>
                    <p className="text-slate-400 text-sm">Halaman Route /items/new Siap Dibuat</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
