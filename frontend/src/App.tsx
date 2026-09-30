import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navbar } from './components/Navbar'
import { ToastProvider } from './context/ToastContext'
import { DashboardPage } from './pages/DashboardPage'
import { ItemFormPage } from './pages/ItemFormPage'
import { StockManagePage } from './pages/StockManagePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-logique-navy text-slate-100 flex flex-col font-sans antialiased">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/items/new" element={<ItemFormPage />} />
                <Route path="/items/edit/:id" element={<ItemFormPage />} />
                <Route path="/items/:id/stock" element={<StockManagePage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  )
}
