import type { LucideIcon } from 'lucide-react'

export function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: LucideIcon; accent?: boolean }) {
  return (
    <div className={`card p-5 ${accent ? 'bg-gradient-to-br from-abyss-800 to-abyss-950 text-white' : ''}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${accent ? 'bg-white/10 text-coral-300' : 'bg-abyss-50 text-abyss-600'}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className={`mt-4 text-2xl font-extrabold ${accent ? 'text-white' : 'text-abyss-950'}`}>{value}</p>
      <p className={`text-sm ${accent ? 'text-abyss-200' : 'text-slate-500'}`}>{label}</p>
    </div>
  )
}
