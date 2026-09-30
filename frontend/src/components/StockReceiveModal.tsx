import { useState, FC, FormEvent } from 'react'
import { XIcon, PackageIcon, CircleNotchIcon, ArrowsLeftRightIcon, ArrowRightIcon } from '@phosphor-icons/react'
import { Item } from '../types'
import { useLocations, useReceiveStock, useTransferStock, useStockByItem, useToast } from '../hooks'

interface StockReceiveModalProps {
  isOpen: boolean
  onClose: () => void
  item: Item | null
}

export const StockReceiveModal: FC<StockReceiveModalProps> = ({ isOpen, onClose, item }) => {
  const [activeTab, setActiveTab] = useState<'receive' | 'transfer'>('receive')

  // Form states for Receive
  const [receiveLocationId, setReceiveLocationId] = useState<string>('')
  const [receiveQty, setReceiveQty] = useState<number | ''>('')

  // Form states for Transfer
  const [fromLocationId, setFromLocationId] = useState<string>('')
  const [toLocationId, setToLocationId] = useState<string>('')
  const [transferQty, setTransferQty] = useState<number | ''>('')

  const [errorMsg, setErrorMsg] = useState<string>('')

  const { data: locationsResponse, isLoading: isLoadingLocations } = useLocations()
  const { data: stockDetailsResponse, isLoading: isLoadingStockDetails } = useStockByItem(item?.id || '')
  
  const receiveStockMutation = useReceiveStock()
  const transferStockMutation = useTransferStock()
  const { showToast } = useToast()

  if (!isOpen || !item) return null

  const locations = locationsResponse?.data || []
  const itemStocks = stockDetailsResponse?.data || []

  // Filter locations that actually have stock > 0 for Transfer From
  const locationsWithStock = itemStocks.filter((s) => s.qty > 0)

  const selectedFromStock = itemStocks.find((s) => s.location_id === fromLocationId)?.qty || 0

  const handleClose = () => {
    setActiveTab('receive')
    setReceiveLocationId('')
    setReceiveQty('')
    setFromLocationId('')
    setToLocationId('')
    setTransferQty('')
    setErrorMsg('')
    onClose()
  }

  const handleReceiveSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!receiveLocationId) {
      setErrorMsg('Pilih lokasi gudang penyimpan item')
      return
    }

    const qtyNum = Number(receiveQty)
    if (!receiveQty || isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Jumlah stok harus lebih dari 0')
      return
    }

    receiveStockMutation.mutate(
      {
        item_id: item.id,
        location_id: receiveLocationId,
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
          setErrorMsg(err?.message || 'Gagal menambah stok')
        },
      }
    )
  }

  const handleTransferSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!fromLocationId) {
      setErrorMsg('Pilih lokasi asal pengiriman stok')
      return
    }
    if (!toLocationId) {
      setErrorMsg('Pilih lokasi tujuan pengiriman stok')
      return
    }
    if (fromLocationId === toLocationId) {
      setErrorMsg('Lokasi asal dan lokasi tujuan tidak boleh sama')
      return
    }

    const qtyNum = Number(transferQty)
    if (!transferQty || isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Jumlah transfer harus lebih dari 0')
      return
    }

    if (qtyNum > selectedFromStock) {
      setErrorMsg(`Stok di lokasi asal tidak mencukupi (Tersedia: ${selectedFromStock} ${item.unit})`)
      return
    }

    transferStockMutation.mutate(
      {
        item_id: item.id,
        from_location_id: fromLocationId,
        to_location_id: toLocationId,
        qty: qtyNum,
      },
      {
        onSuccess: () => {
          showToast({
            type: 'success',
            title: 'Transfer Stok Berhasil',
            message: `Berhasil memindahkan ${qtyNum} ${item.unit || 'unit'} stok ${item.name}`,
          })
          handleClose()
        },
        onError: (err: any) => {
          setErrorMsg(err?.message || 'Gagal memindahkan stok')
        },
      }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onKeyDown={(e) => e.key === 'Escape' && handleClose()}
    >
      <div className="bg-logique-card border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-logique-yellow/10 border border-logique-yellow/30 flex items-center justify-center">
              <PackageIcon size={20} weight="duotone" className="text-logique-yellow" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Kelola Stok Barang</h3>
              <p className="text-xs text-slate-400 truncate max-w-[260px]">{item.name}</p>
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

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 mt-4">
          <button
            onClick={() => { setActiveTab('receive'); setErrorMsg('') }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'receive'
                ? 'border-logique-yellow text-logique-yellow bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackageIcon size={15} weight="bold" />
            <span>Terima Stok Baru</span>
          </button>
          <button
            onClick={() => { setActiveTab('transfer'); setErrorMsg('') }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'transfer'
                ? 'border-logique-yellow text-logique-yellow bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowsLeftRightIcon size={15} weight="bold" />
            <span>Transfer Antar Lokasi</span>
          </button>
        </div>

        {/* Item Summary Info */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            SKU: <strong className="text-slate-200 font-mono">{item.sku}</strong>
          </span>
          <span className="text-slate-400">
            Total Stok: <strong className="text-logique-yellow">{item.total_stock ?? 0} {item.unit}</strong>
          </span>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: RECEIVE STOCK */}
        {activeTab === 'receive' && (
          <form onSubmit={handleReceiveSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lokasi Tujuan Terima <span className="text-rose-400">*</span>
              </label>
              {isLoadingLocations ? (
                <div className="h-10 bg-slate-800 animate-pulse rounded-lg" />
              ) : (
                <select
                  value={receiveLocationId}
                  onChange={(e) => setReceiveLocationId(e.target.value)}
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Jumlah Masuk ({item.unit || 'Unit'}) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="Contoh: 50"
                value={receiveQty}
                onChange={(e) => setReceiveQty(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
              />
            </div>

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
                  <span>Konfirmasi Terima Stok</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: TRANSFER STOCK */}
        {activeTab === 'transfer' && (
          <form onSubmit={handleTransferSubmit} className="mt-4 space-y-4">
            {isLoadingStockDetails || isLoadingLocations ? (
              <div className="h-20 bg-slate-800/60 animate-pulse rounded-xl flex items-center justify-center text-xs text-slate-500">
                Memuat rincian stok per lokasi...
              </div>
            ) : itemStocks.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center">
                Item ini belum memiliki stok di lokasi manapun. Silakan lakukan <strong>Terima Stok Baru</strong> terlebih dahulu.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* From Location */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Dari Lokasi Asal <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={fromLocationId}
                      onChange={(e) => {
                        setFromLocationId(e.target.value)
                        if (e.target.value === toLocationId) setToLocationId('')
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
                    >
                      <option value="">-- Pilih Lokasi Asal --</option>
                      {locationsWithStock.map((stock) => (
                        <option key={stock.location_id} value={stock.location_id}>
                          {stock.location_code} ({stock.zone}) - Stok: {stock.qty} {item.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* To Location */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Ke Lokasi Tujuan <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={toLocationId}
                      onChange={(e) => setToLocationId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
                    >
                      <option value="">-- Pilih Lokasi Tujuan --</option>
                      {locations
                        .filter((loc) => loc.id !== fromLocationId)
                        .map((loc) => {
                          const currentQtyInLoc = itemStocks.find((s) => s.location_id === loc.id)?.qty || 0
                          return (
                            <option key={loc.id} value={loc.id}>
                              {loc.code} ({loc.zone}) - Stok: {currentQtyInLoc} {item.unit}
                            </option>
                          )
                        })}
                    </select>
                  </div>
                </div>

                {/* Info Arrow */}
                {fromLocationId && toLocationId && (
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span>
                      Asal: <strong className="text-rose-400">{locations.find((l) => l.id === fromLocationId)?.code}</strong> (Tersedia: {selectedFromStock} {item.unit})
                    </span>
                    <ArrowRightIcon size={14} className="text-logique-yellow" />
                    <span>
                      Tujuan: <strong className="text-emerald-400">{locations.find((l) => l.id === toLocationId)?.code}</strong>
                    </span>
                  </div>
                )}

                {/* Transfer Quantity Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Jumlah Transfer ({item.unit || 'Unit'}) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedFromStock || undefined}
                    placeholder={`Maksimal ${selectedFromStock} ${item.unit}`}
                    value={transferQty}
                    onChange={(e) => setTransferQty(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
                  />
                </div>

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
                    disabled={transferStockMutation.isPending || itemStocks.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-logique-yellow text-slate-950 text-xs font-bold rounded-lg hover:bg-logique-hover transition shadow-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-logique-yellow/50"
                  >
                    {transferStockMutation.isPending ? (
                      <>
                        <CircleNotchIcon size={14} weight="bold" className="animate-spin" />
                        <span>Memindahkan...</span>
                      </>
                    ) : (
                      <span>Proses Transfer</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
