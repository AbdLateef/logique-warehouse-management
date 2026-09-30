import { FC } from 'react'

export const CardSkeleton: FC = () => (
  <div className="bg-logique-card p-6 rounded-2xl border border-slate-700/60 shadow-xl animate-pulse flex items-center justify-between">
    <div className="space-y-3 flex-1">
      <div className="h-4 bg-slate-800 rounded w-28"></div>
      <div className="h-8 bg-slate-800 rounded w-16"></div>
      <div className="h-3 bg-slate-800 rounded w-36"></div>
    </div>
    <div className="w-12 h-12 bg-slate-800 rounded-xl"></div>
  </div>
)

export const TableRowSkeleton: FC = () => (
  <tr className="border-b border-slate-800/60 animate-pulse">
    <td className="py-4 px-4">
      <div className="h-4 bg-slate-800 rounded w-16"></div>
    </td>
    <td className="py-4 px-4">
      <div className="space-y-1.5">
        <div className="h-4 bg-slate-800 rounded w-36"></div>
        <div className="h-3 bg-slate-800 rounded w-48"></div>
      </div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4 bg-slate-800 rounded w-24"></div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4 bg-slate-800 rounded w-20"></div>
    </td>
    <td className="py-4 px-4 text-center">
      <div className="h-6 bg-slate-800 rounded-full w-20 mx-auto"></div>
    </td>
    <td className="py-4 px-4 text-right">
      <div className="h-8 bg-slate-800 rounded-lg w-24 ml-auto"></div>
    </td>
  </tr>
)
