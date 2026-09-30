import { useState, FC } from 'react'
import { Link } from 'react-router-dom'
import {
  StackIcon,
  MapPinIcon,
  WarningOctagonIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowClockwiseIcon,
  PencilSimpleIcon,
  TrashIcon,
  PackageIcon,
  PlusCircleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CircleNotchIcon,
  XIcon,
  SortDescendingIcon,
} from '@phosphor-icons/react'
import { useItems, useCategories, useLocations, useDeleteItem, useDebounce, useToast } from '../hooks'
import { Item } from '../types'
import { CardSkeleton, TableRowSkeleton } from '../components/Skeleton'

export const DashboardPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const debouncedSearch = useDebounce(searchTerm, 300)

  const [itemToDelete, setItemToDelete] = useState<Item | null>(null)

  const { data: itemsResponse, isLoading: isLoadingItems, isError: isErrorItems, error: itemsError, isRefetching, refetch } = useItems({
    page,
    limit,
    search: debouncedSearch || undefined,
    category: selectedCategory || undefined,
  })

  const { data: categoriesResponse } = useCategories()
  const { data: locationsResponse } = useLocations()
  const deleteItemMutation = useDeleteItem()
  const { showToast } = useToast()

  const items = itemsResponse?.data || []
  const meta = itemsResponse?.meta
  const categories = categoriesResponse?.data || []
  const totalLocations = locationsResponse?.data?.length || 0
  const totalRecords = meta?.total || 0
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1
  const outOfStockCount = items.filter((i) => (i.total_stock ?? 0) === 0).length

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return
    deleteItemMutation.mutate(itemToDelete.id, {
      onSuccess: () => {
        showToast({ type: 'success', title: 'Item dihapus', message: `${itemToDelete.name} dihapus dari sistem` })
        setItemToDelete(null)
      },
      onError: (err: any) => {
        showToast({ type: 'error', title: 'Gagal menghapus', message: err?.message || 'Terjadi kesalahan' })
      },
    })
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex justify-end gap-4 pb-5 border-b border-slate-800/80">
        <Link
          to="/items/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-logique-yellow text-slate-950 font-bold text-sm rounded-xl hover:bg-logique-hover transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-logique-yellow/50"
        >
          <PlusCircleIcon size={16} weight="bold" />
          <span>Tambah Item Baru</span>
        </Link>
      </div>

      {/* Summary Cards — equal width 3-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoadingItems ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Card 1: Total Items */}
            <div className="bg-logique-card p-5 rounded-2xl border border-slate-700/60 shadow-lg flex items-center justify-between group hover:border-slate-600/80 transition-colors">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Total Varian</p>
                <h3 className="text-4xl font-extrabold text-slate-100 mt-1 tabular-nums">{totalRecords}</h3>
                <p className="text-xs text-slate-500 mt-1">item terdaftar</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-logique-yellow/10 border border-logique-yellow/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <StackIcon size={28} weight="duotone" className="text-logique-yellow" />
              </div>
            </div>

            {/* Card 2: Locations */}
            <div className="bg-logique-card p-5 rounded-2xl border border-slate-700/60 shadow-lg flex items-center justify-between group hover:border-slate-600/80 transition-colors">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Total Lokasi</p>
                <h3 className="text-4xl font-extrabold text-slate-100 mt-1 tabular-nums">{totalLocations}</h3>
                <p className="text-xs text-slate-500 mt-1">lokasi terdaftar</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPinIcon size={28} weight="duotone" className="text-sky-400" />
              </div>
            </div>

            {/* Card 3: Out of Stock */}
            <div className="bg-rose-950/30 p-5 rounded-2xl border border-rose-500/20 shadow-lg flex items-center justify-between group hover:border-rose-500/40 transition-colors">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-rose-400/70 uppercase">Perlu Restok</p>
                <h3 className="text-4xl font-extrabold text-rose-400 mt-1 tabular-nums">{outOfStockCount}</h3>
                <p className="text-xs text-rose-400/60 mt-1">item stok habis</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <WarningOctagonIcon size={28} weight="duotone" className="text-rose-400" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-logique-card border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <MagnifyingGlassIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama atau SKU..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label="Hapus pencarian"
                >
                  <XIcon size={14} weight="bold" />
                </button>
              )}
            </div>

            {/* Category filter */}
            <div className="relative">
              <FunnelIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
                className="bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow appearance-none cursor-pointer transition"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory(''); setPage(1) }}
                className="text-xs text-logique-yellow hover:underline font-medium whitespace-nowrap"
              >
                Reset Filter
              </button>
            )}
          </div>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-logique-yellow bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-slate-600"
          >
            <ArrowClockwiseIcon size={14} weight="bold" className={isRefetching ? 'animate-spin text-logique-yellow' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/70 border-b border-slate-800">
                {['SKU', 'Nama Item', 'Kategori', 'Satuan', 'Total Stok', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="py-3.5 px-4 text-[11px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap"
                  >
                    {h === 'Total Stok' ? (
                      <span className="inline-flex items-center gap-1">
                        <SortDescendingIcon size={12} />
                        {h}
                      </span>
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {isLoadingItems ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : isErrorItems ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <WarningOctagonIcon size={28} weight="duotone" />
                      </div>
                      <p className="font-semibold text-rose-400">Gagal Memuat Data Item</p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        {(itemsError as any)?.message || 'Terjadi kesalahan koneksi server.'}
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
                      >
                        <ArrowClockwiseIcon size={14} weight="bold" />
                        <span>Coba Lagi</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <PackageIcon size={40} weight="duotone" className="text-slate-700" />
                      <p className="font-semibold text-slate-400">Tidak ada item ditemukan</p>
                      <p className="text-xs text-slate-600 max-w-xs">
                        {searchTerm || selectedCategory
                          ? 'Coba ubah filter pencarian atau kategori.'
                          : 'Tambah item pertama dengan klik "Tambah Item Baru".'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const stockQty = item.total_stock ?? 0
                  const isOut = stockQty === 0
                  const isLow = stockQty > 0 && stockQty <= 20
                  const isSafe = stockQty > 20

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-slate-500 group-hover:text-logique-yellow transition-colors">
                        {item.sku}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{item.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {item.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-100 tabular-nums">{stockQty}</span>
                        <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isSafe && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            Aman
                          </span>
                        )}
                        {isLow && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                            Menipis
                          </span>
                        )}
                        {isOut && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                            Habis
                          </span>
                        )}
                      </td>
                      {/* Action column: Stock, Edit, Delete always visible */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/items/${item.id}/stock`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-slate-950 bg-logique-yellow hover:bg-logique-hover rounded-lg transition focus:outline-none focus:ring-2 focus:ring-logique-yellow/50 whitespace-nowrap"
                          >
                            <PackageIcon size={13} weight="bold" />
                            <span>Kelola Stok</span>
                          </Link>
                          <Link
                            to={`/items/edit/${item.id}`}
                            className="p-1.5 text-slate-400 hover:text-logique-yellow bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-logique-yellow/40"
                            title="Edit item"
                          >
                            <PencilSimpleIcon size={14} weight="bold" />
                          </Link>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-rose-500/30 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                            title="Hapus item"
                          >
                            <TrashIcon size={14} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Halaman <span className="text-slate-300 font-semibold">{page}</span> dari{' '}
              <span className="text-slate-300 font-semibold">{totalPages}</span>
              <span className="text-slate-600 ml-2">({totalRecords} item)</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-slate-600"
              >
                <CaretLeftIcon size={12} weight="bold" />
                <span>Sebelumnya</span>
              </button>
              <span className="text-xs px-3 py-1.5 bg-slate-900 text-logique-yellow font-bold rounded-lg border border-slate-800 tabular-nums">
                {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-slate-600"
              >
                <span>Selanjutnya</span>
                <CaretRightIcon size={12} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onKeyDown={(e) => e.key === 'Escape' && setItemToDelete(null)}
        >
          <div className="bg-logique-card border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrashIcon size={18} weight="duotone" className="text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Hapus Item?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  <span className="text-logique-yellow font-semibold">{itemToDelete.name}</span>{' '}
                  (SKU: {itemToDelete.sku}) akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-slate-600"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteItemMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                {deleteItemMutation.isPending ? (
                  <>
                    <CircleNotchIcon size={13} weight="bold" className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Sekarang</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
