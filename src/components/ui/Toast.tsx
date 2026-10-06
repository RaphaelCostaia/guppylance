import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, Info } from 'lucide-react'

interface ToastItem {
  id: number
  message: string
  tone: 'success' | 'info'
}

const ToastContext = createContext<(message: string, tone?: ToastItem['tone']) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const show = useCallback((message: string, tone: ToastItem['tone'] = 'info') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div key={t.id} className="animate-toast-in pointer-events-auto flex items-center gap-2 rounded-xl bg-abyss-950 px-4 py-3 text-sm font-medium text-white shadow-lift">
            {t.tone === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Info className="h-4 w-4 text-abyss-300" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
