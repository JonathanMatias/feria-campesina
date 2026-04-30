import { Leaf, Calendar } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-950 text-gray-300 py-6 mt-12">
      <div className="container mx-auto px-4 text-center text-sm">
        <p className="flex items-center justify-center gap-2">
          <Leaf className="w-4 h-4 text-green-400" />
          2026 Feria Campesina — Productos frescos del campo a tu mesa
        </p>
        <p className="mt-1 flex items-center justify-center gap-1 text-gray-400">
          <Calendar className="w-4 h-4" />
          Entregas sábados y domingos
        </p>
      </div>
    </footer>
  )
}
