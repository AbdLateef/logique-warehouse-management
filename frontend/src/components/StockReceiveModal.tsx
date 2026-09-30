import { useState, FC, FormEvent } from 'react'
import { XIcon, PackageIcon, CircleNotchIcon } from '@phosphor-icons/react'
import { Item } from '../types'
import { useLocations, useReceiveStock, useToast } from '../hooks'

interface StockReceiveModalProps {
  isOpen: boolean
  onClose: () => void
  item: Item | null
}

export const StockReceiveModal: FC<StockReceiveModalProps> = ({ isOpen, onClose, item }) => {
  const [locationId, setLocationId] = useState<string>('')
  const [quantity, setQuantity] = useState<number | ''>('')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const { data: locationsResponse, isLoading: isLoadingLocations } = useLocations()
  const receiveStockMutation = useReceiveStock()
  const { showToast } = useToast()

  if (!isOpen || !item) return null

  const locations = locationsResponse?.data || []

  const handleClose = () => {
    setQuantity('')
    setLocationId('')
    setErrorMsg('')
    onClose()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!locationId) {
      setErrorMsg('Pilih lokasi gudang penyimpan item')
      return
    }

    const qtyNum = Number(quantity)
    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Jumlah stok harus lebih dari 0')
      return
    }

    receiveStockMutation.mutate(
      {
        item_id: item.id,
        location_id: locationId,
        qty: qtyNum,
      },
      {
        onSuccess: () => {
          showToast({
            type: 'success',
            title: 'Stok Berhasil Ditambahkan',
            message: `${qtyNum} ${item.unit || 'unit'} ditambahkan ke ${item.name}`,
          })
          handleClose()
        },
        onError: (err: any) => {
          showToast({
            type: 'error',
            title: 'Gagal Menambah Stok',
            message: err?.message || 'Terjadi kesalahan sistem',
          })
        },
      }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onKeyDown={(e) => e.key === 'Escape' && handleClose()}
    >
      <div className="bg-logique-card border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-logique-yellow/10 border border-logique-yellow/30 flex items-center justify-center">
              <PackageIcon size={20} weight="duotone" className="text-logique-yellow" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Terima Stok Barang</h3>
              <p className="text-xs text-slate-400 truncate max-w-[220px]">{item.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-logique-yellow/50"
            aria-label="Tutup modal"
          >
            <XIcon size={18} weight="bold" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Item info */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">
              SKU: <strong className="text-slate-200 font-mono">{item.sku}</strong>
            </span>
            <span className="text-slate-400">
              Stok saat ini: <strong className="text-logique-yellow">{item.total_stock ?? 0} {item.unit}</strong>
            </span>
          </div>

          {/* Location Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Lokasi Warehouse <span className="text-rose-400">*</span>
            </label>
            {isLoadingLocations ? (
              <div className="h-10 bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
              >
                <option value="">-- Pilih Lokasi Gudang --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    Gudang {loc.code} - Zone {loc.zone} ({loc.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Jumlah Masuk ({item.unit || 'Unit'}) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="Contoh: 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={receiveStockMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-logique-yellow text-slate-950 text-xs font-bold rounded-lg hover:bg-logique-hover transition shadow-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-logique-yellow/50"
            >
              {receiveStockMutation.isPending ? (
                <>
                  <CircleNotchIcon size={14} weight="bold" className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Konfirmasi Stok</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
