import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const linkCls = 'relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors'

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <Link href="#top" className="font-bold text-xl" style={{ color: scrolled ? '#0b1f3b' : 'white' }}>
          R_Imports
        </Link>
        <nav className="hidden md:flex items-center space-x-2">
          {[
            {href: '#produtos', label: 'Produtos'},
            {href: '#processo', label: 'Como comprar'},
            {href: '#sobre', label: 'Sobre'},
            {href: '#contato', label: 'Contato'}
          ].map(item => (
            <a key={item.href} href={item.href} className={linkCls} style={{ color: scrolled ? '#374151' : 'rgba(255,255,255,0.9)' }}>
              {item.label}
            </a>
          ))}
        </nav>
        <a href="#contato" className="hidden md:inline-block px-4 py-2 rounded-full text-sm font-medium transition-colors" style={{ background: '#d4af37', color: '#0b1f3b' }}>
          Fazer pedido
        </a>
        <button 
          onClick={() => setOpen(o=>!o)} 
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t px-6 py-4">
          {[
            {href: '#produtos', label: 'Produtos'},
            {href: '#processo', label: 'Como comprar'},
            {href: '#sobre', label: 'Sobre'},
            {href: '#contato', label: 'Contato'}
          ].map(item => (
            <a 
              key={item.href} 
              href={item.href} 
              className="block py-2 hover:text-yellow-600"
              style={{ color: '#0b1f3b' }}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a 
            href="#contato" 
            className="block mt-4 px-4 py-2 rounded-full text-center font-medium"
            style={{ background: '#d4af37', color: '#0b1f3b' }}
            onClick={() => setOpen(false)}
          >
            Fazer pedido
          </a>
        </div>
      )}
    </header>
  )
}
