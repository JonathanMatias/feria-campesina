import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function ScrollToButton() {
  const [visible, setVisible] = useState(false)
  const [goingDown, setGoingDown] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const atBottom = scrollTop + windowHeight >= docHeight - 50
      const atTop = scrollTop < 10

      setVisible(scrollTop > 300)

      if (atBottom) {
        setGoingDown(false)
      } else if (atTop) {
        setGoingDown(true)
      } else {
        setGoingDown(scrollTop > lastScrollY.current)
      }

      lastScrollY.current = scrollTop
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = () => {
    if (goingDown) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!visible) return null

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center animate-fade-in"
      title={goingDown ? 'Ir abajo' : 'Ir arriba'}
    >
      {goingDown ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
    </button>
  )
}
