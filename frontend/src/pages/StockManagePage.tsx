import { useState, FC, FormEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  CaretLeftIcon,
  PackageIcon,
  ArrowsLeftRightIcon,
  ClockCounterClockwiseIcon,
  CircleNotchIcon,
  ArrowRightIcon,
  MapPinIcon,
  WarningOctagonIcon,
  CheckCircleIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  PencilSimpleIcon
} from '@phosphor-icons/react'
import { useItemDetail, useLocations, useStockByItem, useStockLogsByItem, useReceiveStock, useTransferStock, useToast } from '../hooks'
import { CardSkeleton } from '../components/Skeleton'

export const StockManagePage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const itemId = id || ''

  const [activeTab, setActiveTab] = useState<'receive' | 'transfer' | 'logs'>('receive')

  // Receive Form
  const [receiveLocationId, setReceiveLocationId] = useState('')
  const [receiveQty, setReceiveQty] = useState<number | ''>('')

  // Transfer Form
  const [fromLocationId, setFromLocationId] = useState('')
  const [toLocationId, setToLocationId] = useState('')
  const [transferQty, setTransferQty] = useState<number | ''>('')

  const [errorMsg, setErrorMsg] = useState('')

  const { data: itemResponse, isLoading: isLoadingItem, isError: isErrorItem } = useItemDetail(itemId)
  const { data: locationsResponse, isLoading: isLoadingLocations } = useLocations()
  const { data: stockDetailsResponse, isLoading: isLoadingStockDetails } = useStockByItem(itemId)
  const { data: logsResponse, isLoading: isLoadingLogs } = useStockLogsByItem(itemId)

  const receiveMutation = useReceiveStock()
  const transferMutation = useTransferStock()
  const { showToast } = useToast()

  const item = itemResponse?.data
  const locations = locationsResponse?.data || []
  const itemStocks = stockDetailsResponse?.data || []
  const logs = logsResponse?.data || []

  const stockQty = item?.total_stock ?? 0
  const isOut = stockQty === 0
  const isLow = stockQty > 0 && stockQty <= 20
  const isSafe = stockQty > 20

  const locationsWithStock = itemStocks.filter((s) => s.qty > 0)
  const selectedFromStock = itemStocks.find((s) => s.location_id === fromLocationId)?.qty || 0

  const handleReceiveSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!receiveLocationId) {
      setErrorMsg('Pilih lokasi penyimpan barang')
      return
    }

    const qtyNum = Number(receiveQty)
    if (!receiveQty || isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Jumlah stok harus lebih dari 0')
      return
    }

    receiveMutation.mutate(
      { item_id: itemId, location_id: receiveLocationId, qty: qtyNum },
      {
        onSuccess: () => {
          showToast({
            type: 'success',
            title: 'Stok Berhasil Ditambahkan',
            message: `${qtyNum} ${item?.unit || 'unit'} ditambahkan ke ${item?.name}`,
          })
          setReceiveQty('')
          setReceiveLocationId('')
          setErrorMsg('')
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
      setErrorMsg('Pilih lokasi asal stok')
      return
    }
    if (!toLocationId) {
      setErrorMsg('Pilih lokasi tujuan stok')
      return
    }
    if (fromLocationId === toLocationId) {
      setErrorMsg('Lokasi asal dan lokasi tujuan harus berbeda')
      return
    }

    const qtyNum = Number(transferQty)
    if (!transferQty || isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Jumlah transfer harus lebih dari 0')
      return
    }

    if (qtyNum > selectedFromStock) {
      setErrorMsg(`Stok di lokasi asal tidak mencukupi (Tersedia: ${selectedFromStock} ${item?.unit})`)
      return
    }

    transferMutation.mutate(
      { item_id: itemId, from_location_id: fromLocationId, to_location_id: toLocationId, qty: qtyNum },
      {
        onSuccess: () => {
          showToast({
            type: 'success',
            title: 'Transfer Stok Berhasil',
            message: `Memindahkan ${qtyNum} ${item?.unit || 'unit'} stok`,
          })
          setTransferQty('')
          setFromLocationId('')
          setToLocationId('')
          setErrorMsg('')
        },
        onError: (err: any) => {
          setErrorMsg(err?.message || 'Gagal memindahkan stok')
        },
      }
    )
  }

  if (isLoadingItem) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (isErrorItem || !item) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <WarningOctagonIcon size={32} weight="duotone" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Item Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400">Data barang yang Anda cari tidak ditemukan atau telah dihapus.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
        >
          Kembali ke Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-logique-yellow transition"
        >
          <CaretLeftIcon size={14} weight="bold" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <Link
          to={`/items/edit/${item.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
        >
          <PencilSimpleIcon size={14} weight="bold" />
          <span>Edit Details</span>
        </Link>
      </div>

      {/* Item Info Summary Card */}
      <div className="bg-logique-card border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-logique-yellow font-bold bg-logique-yellow/10 px-2 py-0.5 rounded border border-logique-yellow/20">
                {item.sku}
              </span>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
                {item.category}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 mt-2">{item.name}</h1>
          </div>

          <div className="flex items-center gap-4 sm:text-right">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Stok Saat Ini</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-extrabold text-slate-100 tabular-nums">{stockQty}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">{item.unit}</span>
              </div>
            </div>
            <div>
              {isSafe && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Stok Aman
                </span>
              )}
              {isLow && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  Stok Menipis
                </span>
              )}
              {isOut && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Stok Habis
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Location Stock Breakdown */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Sebaran Stok per Lokasi Gudang</p>
          {isLoadingStockDetails ? (
            <div className="h-12 bg-slate-900 animate-pulse rounded-xl" />
          ) : itemStocks.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Belum ada stok tersimpan di lokasi manapun.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {itemStocks.map((stock) => (
                <div key={stock.location_id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
                      <MapPinIcon size={12} className="text-sky-400" />
                      <span>{stock.location_code}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{stock.zone}</p>
                  </div>
                  <span className="text-sm font-bold text-logique-yellow tabular-nums">
                    {stock.qty} <span className="text-[10px] text-slate-500 uppercase">{item.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Stock Management Card & Tabs */}
      <div className="bg-logique-card border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={() => { setActiveTab('receive'); setErrorMsg('') }}
            className={`flex-1 py-3.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'receive'
                ? 'border-logique-yellow text-logique-yellow bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <PackageIcon size={16} weight="bold" />
            <span>Terima Stok Baru</span>
          </button>
          <button
            onClick={() => { setActiveTab('transfer'); setErrorMsg('') }}
            className={`flex-1 py-3.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'transfer'
                ? 'border-logique-yellow text-logique-yellow bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <ArrowsLeftRightIcon size={16} weight="bold" />
            <span>Transfer Antar Lokasi</span>
          </button>
          <button
            onClick={() => { setActiveTab('logs'); setErrorMsg('') }}
            className={`flex-1 py-3.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'logs'
                ? 'border-logique-yellow text-logique-yellow bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <ClockCounterClockwiseIcon size={16} weight="bold" />
            <span>Riwayat Mutasi ({logs.length})</span>
          </button>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <WarningOctagonIcon size={16} weight="bold" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: RECEIVE STOCK FORM */}
          {activeTab === 'receive' && (
            <form onSubmit={handleReceiveSubmit} className="max-w-xl space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Form Penerimaan Stok Masuk</h3>
                <p className="text-xs text-slate-400 mt-0.5">Catat barang masuk dari supplier atau penerimaan fisik ke rak gudang.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Lokasi Gudang Penyimpan <span className="text-rose-400">*</span>
                </label>
                {isLoadingLocations ? (
                  <div className="h-10 bg-slate-900 animate-pulse rounded-xl" />
                ) : (
                  <select
                    value={receiveLocationId}
                    onChange={(e) => setReceiveLocationId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
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
                  Jumlah Stok Masuk ({item.unit || 'Unit'}) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Contoh: 50"
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={receiveMutation.isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-logique-yellow text-slate-950 text-xs font-bold rounded-xl hover:bg-logique-hover transition shadow-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-logique-yellow/50"
                >
                  {receiveMutation.isPending ? (
                    <>
                      <CircleNotchIcon size={15} weight="bold" className="animate-spin" />
                      <span>Menyimpan Transaksi...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon size={16} weight="bold" />
                      <span>Konfirmasi Stok Masuk</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: TRANSFER STOCK FORM */}
          {activeTab === 'transfer' && (
            <form onSubmit={handleTransferSubmit} className="max-w-2xl space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Form Transfer Stok Antar Lokasi</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pindahkan kuantitas barang dari satu rak/zona ke lokasi lain.</p>
              </div>

              {isLoadingStockDetails || isLoadingLocations ? (
                <div className="h-20 bg-slate-900 animate-pulse rounded-xl" />
              ) : itemStocks.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                  Item ini belum memiliki stok di lokasi manapun. Silakan lakukan <strong>Terima Stok Baru</strong> terlebih dahulu.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
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

                  {fromLocationId && toLocationId && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                      <span>
                        Asal: <strong className="text-rose-400">{locations.find((l) => l.id === fromLocationId)?.code}</strong> (Tersedia: {selectedFromStock} {item.unit})
                      </span>
                      <ArrowRightIcon size={16} className="text-logique-yellow" />
                      <span>
                        Tujuan: <strong className="text-emerald-400">{locations.find((l) => l.id === toLocationId)?.code}</strong>
                      </span>
                    </div>
                  )}

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
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-logique-yellow/40 focus:border-logique-yellow transition"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={transferMutation.isPending || itemStocks.length === 0}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-logique-yellow text-slate-950 text-xs font-bold rounded-xl hover:bg-logique-hover transition shadow-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-logique-yellow/50"
                    >
                      {transferMutation.isPending ? (
                        <>
                          <CircleNotchIcon size={15} weight="bold" className="animate-spin" />
                          <span>Memindahkan Stok...</span>
                        </>
                      ) : (
                        <>
                          <ArrowsLeftRightIcon size={16} weight="bold" />
                          <span>Proses Transfer Stok</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* TAB 3: MUTATION LOGS AUDIT TRAIL TABLE */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Audit Trail / Riwayat Mutasi Stok</h3>
                <p className="text-xs text-slate-400 mt-0.5">Catatan jejak kronologis perpindahan dan penerimaan stok untuk barang ini.</p>
              </div>

              {isLoadingLogs ? (
                <div className="py-12 text-center text-slate-500 text-xs">Memuat riwayat log mutasi...</div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                  Belum ada catatan mutasi stok untuk barang ini.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        <th className="py-3 px-4">Waktu Transaksi</th>
                        <th className="py-3 px-4">Tipe Mutasi</th>
                        <th className="py-3 px-4">Lokasi Gudang</th>
                        <th className="py-3 px-4 text-right">Perubahan Qty</th>
                        <th className="py-3 px-4 text-right">Sisa Stok Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {logs.map((log) => {
                        const isReceive = log.type === 'RECEIVE'
                        const isTransferIn = log.type === 'TRANSFER_IN'
                        const isTransferOut = log.type === 'TRANSFER_OUT'

                        const formattedDate = new Date(log.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })

                        return (
                          <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                              {formattedDate}
                            </td>
                            <td className="py-3 px-4">
                              {isReceive && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <ArrowDownRightIcon size={12} weight="bold" />
                                  RECEIVE
                                </span>
                              )}
                              {isTransferIn && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                  <ArrowDownRightIcon size={12} weight="bold" />
                                  TRANSFER IN
                                </span>
                              )}
                              {isTransferOut && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <ArrowUpRightIcon size={12} weight="bold" />
                                  TRANSFER OUT
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-200">
                              Gudang {log.location_code} ({log.zone})
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold">
                              {log.qty_change > 0 ? (
                                <span className="text-emerald-400">+{log.qty_change}</span>
                              ) : (
                                <span className="text-amber-400">{log.qty_change}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                              {log.balance_after} {item.unit}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
