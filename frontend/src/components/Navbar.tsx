import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Package, PlusCircle, BookOpen, Warehouse } from 'lucide-react'

export const Navbar: React.FC = () => {
  const location = useLocation()

  return (
    <header className="bg-logique-navy border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-logique-yellow/10 border border-logique-yellow/30 flex items-center justify-center text-logique-yellow group-hover:bg-logique-yellow group-hover:text-slate-950 transition-all duration-200">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-logique-yellow tracking-wider">LOGIQUE</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium border border-slate-700">WMS</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Warehouse Item Management</p>
            </div>
          </Link>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Swagger Docs Link */}
            <a
              href="http://localhost:8080/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-logique-yellow bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition"
              title="Open OpenAPI Swagger Documentation"
            >
              <BookOpen className="w-4 h-4 text-logique-yellow" />
              <span>API Docs</span>
            </a>

            {/* Navigation Buttons */}
            <Link
              to="/"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                location.pathname === '/'
                  ? 'bg-slate-800 text-logique-yellow border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/items/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-logique-yellow text-slate-950 text-xs font-bold hover:bg-logique-hover transition shadow-md hover:shadow-logique-yellow/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Item</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
