import { useState, useEffect, FC, FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeftIcon,
  PlusCircleIcon,
  PencilSimpleIcon,
  CircleNotchIcon,
  PackageIcon,
} from '@phosphor-icons/react'
import {
  useItemDetail,
  useCategories,
  useCreateItem,
  useUpdateItem,
  useToast,
} from '../hooks'

export const ItemFormPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [unit, setUnit] = useState('PCS')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: itemResponse, isLoading: isLoadingDetail, isError: isErrorDetail } = useItemDetail(id || '')
  const { data: categoriesResponse } = useCategories()
  const createItemMutation = useCreateItem()
  const updateItemMutation = useUpdateItem()

  const existingCategories = categoriesResponse?.data || []
  const itemDetail = itemResponse?.data

  // Common units suggestions
  const commonUnits = ['PCS', 'BOX', 'PACK', 'SET', 'UNIT', 'KG', 'METER', 'ROLL', 'DUS']

  // Prefill data in Edit Mode
  useEffect(() => {
    if (isEditMode && itemDetail) {
      setSku(itemDetail.sku || '')
      setName(itemDetail.name || '')
      setCategory(itemDetail.category || '')
      setUnit(itemDetail.unit || 'PCS')
    }
  }, [isEditMode, itemDetail])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!sku.trim()) newErrors.sku = 'SKU item wajib diisi'
    if (!name.trim()) newErrors.name = 'Nama item wajib diisi'
    if (!category.trim()) newErrors.category = 'Kategori wajib diisi'
    if (!unit.trim()) newErrors.unit = 'Satuan wajib diisi'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category: category.trim(),
      unit: unit.trim().toUpperCase(),
    }

    if (isEditMode && id) {
      updateItemMutation.mutate(
        { id, payload },
        {
          onSuccess: () => {
            showToast({
              type: 'success',
              title: 'Item Diperbarui',
              message: `${payload.name} berhasil diperbarui`,
            })
            navigate('/')
          },
          onError: (err: any) => {
            showToast({
              type: 'error',
              title: 'Gagal Memperbarui Item',
              message: err?.response?.data?.message || err?.message || 'Terjadi kesalahan sistem',
            })
          },
        }
      )
    } else {
      createItemMutation.mutate(payload, {
        onSuccess: () => {
          showToast({
            type: 'success',
            title: 'Item Dibuat',
            message: `${payload.name} berhasil ditambahkan ke inventaris`,
          })
          navigate('/')
        },
        onError: (err: any) => {
          showToast({
            type: 'error',
            title: 'Gagal Menambah Item',
            message: err?.response?.data?.message || err?.message || 'Terjadi kesalahan sistem',
          })
        },
      })
    }
  }

  const isPending = createItemMutation.isPending || updateItemMutation.isPending

  if (isEditMode && isLoadingDetail) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse py-8">
        <div className="h-6 w-36 bg-slate-800 rounded-lg" />
        <div className="h-10 w-64 bg-slate-800 rounded-xl" />
        <div className="bg-logique-card border border-slate-700/60 rounded-2xl p-8 space-y-6">
          <div className="h-10 bg-slate-800 rounded-xl" />
          <div className="h-10 bg-slate-800 rounded-xl" />
          <div className="h-10 bg-slate-800 rounded-xl" />
          <div className="h-10 bg-slate-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isEditMode && isErrorDetail) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
          <PackageIcon size={24} weight="duotone" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Item tidak ditemukan</h2>
        <p className="text-xs text-slate-400">Data item yang ingin Anda edit tidak ada atau telah dihapus.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-700 transition"
        >
          <ArrowLeftIcon size={14} />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Back Button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-logique-yellow transition group"
        >
          <ArrowLeftIcon size={14} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>

      {/* Page Title */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-logique-yellow/10 border border-logique-yellow/20 flex items-center justify-center flex-shrink-0 text-logique-yellow">
          {isEditMode ? (
            <PencilSimpleIcon size={24} weight="duotone" />
          ) : (
            <PlusCircleIcon size={24} weight="duotone" />
          )}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
            {isEditMode ? 'Edit Item Barang' : 'Tambah Item Baru'}
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-logique-card border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
      >
        {/* SKU */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            SKU Item <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: ELEC-001, MISC-100"
            value={sku}
            onChange={(e) => {
              setSku(e.target.value)
              if (errors.sku) setErrors((prev) => ({ ...prev, sku: '' }))
            }}
            className={`w-full bg-slate-900 border ${errors.sku ? 'border-rose-500/80 focus:ring-rose-500/40' : 'border-slate-700/80 focus:ring-logique-yellow/40 focus:border-logique-yellow'
              } rounded-xl px-4 py-3 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition uppercase`}
          />
          {errors.sku ? (
            <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.sku}</p>
          ) : (
            <p className="text-[11px] text-slate-500 mt-1.5">Kode unik unik stok barang (misal: ELEC-001).</p>
          )}
        </div>

        {/* Nama Item */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Nama Item <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Logitech Wireless Mouse M185"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
            }}
            className={`w-full bg-slate-900 border ${errors.name ? 'border-rose-500/80 focus:ring-rose-500/40' : 'border-slate-700/80 focus:ring-logique-yellow/40 focus:border-logique-yellow'
              } rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition`}
          />
          {errors.name && <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.name}</p>}
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Kategori <span className="text-rose-400">*</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              list="category-suggestions"
              placeholder="Pilih atau ketik nama kategori..."
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                if (errors.category) setErrors((prev) => ({ ...prev, category: '' }))
              }}
              className={`w-full bg-slate-900 border ${errors.category ? 'border-rose-500/80 focus:ring-rose-500/40' : 'border-slate-700/80 focus:ring-logique-yellow/40 focus:border-logique-yellow'
                } rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition`}
            />
            <datalist id="category-suggestions">
              {existingCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>

            {existingCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500 self-center mr-1">Rekomendasi:</span>
                {existingCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat)
                      if (errors.category) setErrors((prev) => ({ ...prev, category: '' }))
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${category === cat
                      ? 'bg-logique-yellow/20 text-logique-yellow border-logique-yellow/40 font-semibold'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.category && <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.category}</p>}
        </div>

        {/* Satuan */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Satuan <span className="text-rose-400">*</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Contoh: PCS, BOX, PACK"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value)
                if (errors.unit) setErrors((prev) => ({ ...prev, unit: '' }))
              }}
              className={`w-full bg-slate-900 border ${errors.unit ? 'border-rose-500/80 focus:ring-rose-500/40' : 'border-slate-700/80 focus:ring-logique-yellow/40 focus:border-logique-yellow'
                } rounded-xl px-4 py-3 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition uppercase`}
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {commonUnits.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    setUnit(u)
                    if (errors.unit) setErrors((prev) => ({ ...prev, unit: '' }))
                  }}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition ${unit.toUpperCase() === u
                    ? 'bg-logique-yellow/20 text-logique-yellow border-logique-yellow/40 font-bold'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {errors.unit && <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.unit}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
          <Link
            to="/"
            className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-logique-yellow text-slate-950 text-xs font-bold rounded-xl hover:bg-logique-hover transition shadow-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-logique-yellow/50"
          >
            {isPending ? (
              <>
                <CircleNotchIcon size={16} weight="bold" className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : isEditMode ? (
              <>
                <PencilSimpleIcon size={16} weight="bold" />
                <span>Simpan Perubahan</span>
              </>
            ) : (
              <>
                <PlusCircleIcon size={16} weight="bold" />
                <span>Tambah Item Baru</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
