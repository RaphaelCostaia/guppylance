import { Check } from 'lucide-react'

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                done ? 'bg-abyss-700 text-white' : active ? 'bg-coral-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`hidden text-sm font-medium sm:block ${active ? 'text-abyss-950' : 'text-slate-500'}`}>{s}</span>
            {i < steps.length - 1 && <span className={`h-px flex-1 ${done ? 'bg-abyss-600' : 'bg-slate-200'}`} />}
          </li>
        )
      })}
    </ol>
  )
}
