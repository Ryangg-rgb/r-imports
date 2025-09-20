import Head from 'next/head'
import LandingHeader from '../components/LandingHeader'
import { useEffect, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

// Função para gerar array de imagens dinamicamente
function generateImages(productId: string, maxCount = 10) {
  const images = []
  for (let i = 1; i <= maxCount; i++) {
    images.push(`/produtos/${productId}/foto${i}.jpg`)
  }
  return images
}

// Simple intersection fade-in utility
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-in')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.25 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export default function Landing() {
  useReveal()
  const [activeTab, setActiveTab] = useState<'eletronicos' | 'beleza'>('eletronicos')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [bubbles, setBubbles] = useState([
    { id: 1, x: 20, y: 30, text: 'Confiabilidade', isDragging: false, color: 'blue', originalId: [1] },
    { id: 2, x: 50, y: 60, text: 'Produtos Originais', isDragging: false, color: 'blue', originalId: [2] },
    { id: 3, x: 80, y: 40, text: 'Entrega Rápida', isDragging: false, color: 'blue', originalId: [3] }
  ])
  const [explosionActive, setExplosionActive] = useState(false)
  const [cracksVisible, setCracksVisible] = useState(false)
  const [nextBubbleId, setNextBubbleId] = useState(4)
  const [fusionEffect, setFusionEffect] = useState<{ x: number; y: number; color: string } | null>(null)
  const [glassBreaking, setGlassBreaking] = useState(false)
  const [showFinalMessage, setShowFinalMessage] = useState(false)
  const [isReconstructing, setIsReconstructing] = useState(false)
  
  // Resetar índice da imagem quando o produto mudar
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedProduct])
  
  // Funções para arrastar bolhas
  const handleBubbleMouseDown = (bubbleId: number, e: React.MouseEvent) => {
    e.preventDefault()
    setBubbles(prev => prev.map(b => 
      b.id === bubbleId ? { ...b, isDragging: true } : b
    ))
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const draggingBubble = bubbles.find(b => b.isDragging)
    if (!draggingBubble) return
    
    const heroSection = document.querySelector('.hero-section')
    if (!heroSection) return
    
    const rect = heroSection.getBoundingClientRect()
    
    // Calcular posição em porcentagem baseada na posição do cursor
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Permitir movimento por toda a área azul (0% a 100%)
    const clampedX = Math.max(0, Math.min(100, x))
    const clampedY = Math.max(0, Math.min(100, y))
    
    setBubbles(prev => prev.map(b => 
      b.id === draggingBubble.id ? { ...b, x: clampedX, y: clampedY } : b
    ))
  }
  
  const handleMouseUp = () => {
    setBubbles(prev => prev.map(b => ({ ...b, isDragging: false })))
    checkBubbleCollisions()
  }
  
  // Função para verificar colisões e fusões entre bolhas
  const checkBubbleCollisions = useCallback(() => {
    const threshold = 15 // Distância mínima para considerar colisão
    
    for (let i = 0; i < bubbles.length; i++) {
      for (let j = i + 1; j < bubbles.length; j++) {
        const bubble1 = bubbles[i]
        const bubble2 = bubbles[j]
        
        const distance = Math.sqrt(
          Math.pow(bubble1.x - bubble2.x, 2) + 
          Math.pow(bubble1.y - bubble2.y, 2)
        )
        
        if (distance < threshold) {
          // Verificar se temos todas as 3 bolhas originais combinadas
          const allOriginalIds = [...bubble1.originalId, ...bubble2.originalId]
          const uniqueIds = [...new Set(allOriginalIds)]
          
          if (uniqueIds.length === 3 && uniqueIds.includes(1) && uniqueIds.includes(2) && uniqueIds.includes(3)) {
            // EXPLOSÃO ÉPICA - todas as 3 combinadas!
            triggerExplosion()
            return
          } else {
            // Fusão de 2 bolhas
            fuseBubbles(bubble1, bubble2)
            return
          }
        }
      }
    }
  }
  
  // Função para combinar duas bolhas
  const fuseBubbles = (bubble1: any, bubble2: any) => {
    const combinedOriginalIds = [...bubble1.originalId, ...bubble2.originalId]
    const uniqueIds = [...new Set(combinedOriginalIds)]
    
    // Determinar o texto combinado baseado nos IDs originais
    const getCombinedText = (ids: number[]) => {
      const texts: string[] = []
      if (ids.includes(1)) texts.push('Confiabilidade')
      if (ids.includes(2)) texts.push('Produtos Originais') 
      if (ids.includes(3)) texts.push('Entrega Rápida')
      return texts.join(' + ')
    }
    
    // Determinar a cor baseada na combinação
    const getCombinedColor = (ids: number[]) => {
      if (ids.length === 2) {
        if (ids.includes(1) && ids.includes(2)) return 'purple' // Confiabilidade + Produtos
        if (ids.includes(1) && ids.includes(3)) return 'red'    // Confiabilidade + Entrega
        if (ids.includes(2) && ids.includes(3)) return 'green'  // Produtos + Entrega
      }
      return 'blue'
    }
    
    // Criar nova bolha combinada
    const newBubble = {
      id: nextBubbleId,
      x: (bubble1.x + bubble2.x) / 2, // Posição no meio das duas
      y: (bubble1.y + bubble2.y) / 2,
      text: getCombinedText(uniqueIds),
      isDragging: false,
      color: getCombinedColor(uniqueIds),
      originalId: uniqueIds
    }
    
    // Atualizar estado removendo as bolhas antigas e adicionando a nova
    setBubbles(prev => {
      const filtered = prev.filter(b => b.id !== bubble1.id && b.id !== bubble2.id)
      return [...filtered, newBubble]
    })
    
    setNextBubbleId(prev => prev + 1)
    
    // Mostrar efeito visual de fusão
    setFusionEffect({
      x: newBubble.x,
      y: newBubble.y,
      color: getCombinedColor(uniqueIds)
    })
    
    // Remover o efeito após 800ms
    setTimeout(() => {
      setFusionEffect(null)
    }, 800)
  }, [bubbles, nextBubbleId])
  
  // Função para ativar a explosão épica
  const triggerExplosion = () => {
    setExplosionActive(true)
    setCracksVisible(true)
    
    // Ativar efeito de vidro quebrado após 1 segundo
    setTimeout(() => {
      setGlassBreaking(true)
    }, 1000)
    
    // Mostrar mensagem final após 2 segundos
    setTimeout(() => {
      setShowFinalMessage(true)
    }, 2000)
    
    // Iniciar fase de reconstrução após 4.5 segundos
    setTimeout(() => {
      setIsReconstructing(true)
    }, 4500)
    
    // Começar a remover elementos da explosão
    setTimeout(() => {
      setShowFinalMessage(false)
    }, 5500)
    
    setTimeout(() => {
      setExplosionActive(false)
      setCracksVisible(false)
    }, 6000)
    
    setTimeout(() => {
      setGlassBreaking(false)
    }, 6500)
    
    // Reset completo após 7.5 segundos
    setTimeout(() => {
      setIsReconstructing(false)
      
      // Resetar bolhas ao estado inicial
      setBubbles([
        { id: 1, x: 20, y: 60, text: 'Confiabilidade', isDragging: false, color: 'blue', originalId: [1] },
        { id: 2, x: 50, y: 30, text: 'Produtos Originais', isDragging: false, color: 'blue', originalId: [2] },
        { id: 3, x: 80, y: 40, text: 'Entrega Rápida', isDragging: false, color: 'blue', originalId: [3] }
      ])
      setNextBubbleId(4)
    }, 7500)
  }
  
  // Event listeners globais para capturar movimento fora da seção
  useEffect(() => {
    let animationFrameId: number
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const draggingBubble = bubbles.find(b => b.isDragging)
      if (!draggingBubble) return
      
      // Usar requestAnimationFrame para performance máxima
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      
      animationFrameId = requestAnimationFrame(() => {
        const heroSection = document.querySelector('.hero-section')
        if (!heroSection) return
        
        const rect = heroSection.getBoundingClientRect()
        
        // Calcular posição em porcentagem
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        
        // Permitir movimento por toda a área azul (0% a 100%)
        const clampedX = Math.max(0, Math.min(100, x))
        const clampedY = Math.max(0, Math.min(100, y))
        
        setBubbles(prev => prev.map(b => 
          b.id === draggingBubble.id ? { ...b, x: clampedX, y: clampedY } : b
        ))
      })
    }
    
    const handleGlobalMouseUp = () => {
      setBubbles(prev => prev.map(b => ({ ...b, isDragging: false })))
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      // Verificar colisões após soltar
      setTimeout(checkBubbleCollisions, 100)
    }
    
    if (bubbles.some(b => b.isDragging)) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true })
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [bubbles, checkBubbleCollisions])
  
  // Função para obter todas as imagens disponíveis de um produto
  const getAvailableImages = (product: any) => {
    // Por enquanto vamos assumir que cada produto tem até 6 fotos
    const imageMap: Record<string, number> = {
      'mouse_delux': 3,
      'mouse_attack_shark': 4,
      'fone_lenovo': 4,
      'teclado_irok': 6,
      'bonsai': 6,
      'venom_figure': 4,
      'majin_vegeta': 4,
      'gtr_miniatura': 6,
      'fusca_classico': 4
    }
    
    const count = imageMap[product.id] || 3
    const images = []
    for (let i = 1; i <= count; i++) {
      images.push(`/produtos/${product.id}/foto${i}.jpg`)
    }
    return images
  }
  
  const produtos = {
    eletronicos: {
      title: '⚡ Tech & Gaming Pro',
      description: '🎮 Equipamentos de alta performance para gamers e entusiastas. Mouses premium, teclados magnéticos, fones profissionais e muito mais.',
      items: [
        {
          id: 'mouse_delux',
          nome: 'Mouse Delux M600 2.4GHz',
          preco: 'R$ 130',
          descricao: 'Mouse gamer tri-modo ultra-leve, novo',
          disponivel: 'OLX',
          descricaoCompleta: 'Delux M600 – Mouse gamer tri-modo (sem fio 2.4 GHz + cabo USB). Produto novo, aberto apenas para fotos e testes.',
          especificacoes: ['Sensor PixArt PMW3325 até 10.000 DPI', 'Ultra-leve: apenas 49g', '7 botões programáveis', 'Switches Huano Pink Dot (80M cliques)', 'Bateria 300 mAh, até 55h autonomia', 'Polling rate 1.000 Hz', 'Design ambidestro'],
          imagens: generateImages('mouse_delux')
        },
        {
          id: 'mouse_attack_shark',
          nome: 'Mouse Attack Shark X11 Gamer',
          preco: 'R$ 170',
          descricao: 'Mouse gamer tri-modo com base magnética RGB',
          disponivel: 'OLX',
          descricaoCompleta: 'Attack Shark X11 – Mouse gamer tri-modo (USB-C, Bluetooth e 2.4GHz). Produto novo, aberto apenas para fotos e testes.',
          especificacoes: ['Sensor PixArt até 22.000 DPI', 'Ergonômico 63g', 'Base magnética com RGB', 'Switches HUANO (20M cliques)', 'Bateria até 65h', 'Compatível Windows, Mac, Android', 'Software para macros e RGB'],
          imagens: generateImages('mouse_attack_shark')
        },
        {
          id: 'fone_lenovo',
          nome: 'Fone Lenovo GM2 Pro',
          preco: 'R$ 70',
          descricao: 'Fone Bluetooth 5.3 com LED, ideal para games',
          disponivel: 'OLX',
          descricaoCompleta: 'Fone sem fio Bluetooth 5.3 com LED embutido, ideal para jogos, músicas e chamadas. Produto novo, aberto apenas para fotos e testes. Acompanha cabo de carregamento e borrachinhas extras.',
          especificacoes: ['Bluetooth 5.3', 'Baixa latência para games', 'Som estéreo com graves marcantes', 'Microfone integrado', 'Case recarregável', 'LED embutido', 'Acessórios inclusos'],
          imagens: generateImages('fone_lenovo')
        },
        {
          id: 'teclado_irok',
          nome: 'Teclado Gamer IROK MG75 Pro',
          preco: 'R$ 800',
          descricao: 'Teclado magnético premium com Rapid Trigger',
          disponivel: 'OLX',
          descricaoCompleta: 'Teclado magnético IROK MG75 Pro – um dos mais avançados do mercado. Produto novo, pronto para envio via OLX Pay.',
          especificacoes: ['Switches magnéticos Hall Effect', 'Rapid Trigger 0,005 mm', 'Polling rate 8.000 Hz', 'Scan rate 256k Hz', 'Estrutura alumínio CNC', 'Keycaps PBT', 'ARGB 500 Hz personalizável', 'Hot-swappable', 'Layout 75% (81 teclas)'],
          imagens: generateImages('teclado_irok')
        }
      ]
    },
    beleza: {
      title: '🏆 Coleções Exclusivas',
      description: '🎨 Action figures, miniaturas detalhadas e decorações únicas. Itens raros e especiais para colecionadores exigentes.',
      items: [
        {
          id: 'bonsai',
          nome: 'Bonsai Artificial Decorativo',
          preco: 'R$ 45',
          descricao: 'Mini árvore bonsai artificial para decoração',
          disponivel: 'OLX',
          descricaoCompleta: 'Linda mini árvore bonsai artificial, perfeita para decorar qualquer ambiente. Toque de natureza e elegância sem sujeira ou manutenção. Compacta, bonita e prática.',
          especificacoes: ['Sem manutenção', 'Compacto e elegante', 'Material resistente', 'Decoração premium', 'Fácil limpeza', 'Envio em 48h'],
          imagens: generateImages('bonsai')
        },
        {
          id: 'venom_figure',
          nome: 'Action Figure Venom',
          preco: 'R$ 50',
          descricao: 'Action figure com acabamento impecável e base',
          disponivel: 'OLX',
          descricaoCompleta: 'Action figure do Venom com acabamento impecável e base personalizada. Detalhes fiéis ao personagem, ótima peça para coleções da Marvel ou setups diferenciados. Altura aproximada: 19 cm.',
          especificacoes: ['Altura 19 cm', 'Acabamento premium', 'Base personalizada', 'Detalhes fiéis', 'Material resistente', 'Colecionável Marvel'],
          imagens: generateImages('venom_figure')
        },
        {
          id: 'majin_vegeta',
          nome: 'Action Figure Majin Vegeta',
          preco: 'R$ 60',
          descricao: 'Boneco Majin Vegeta Super Saiyajin detalhado',
          disponivel: 'OLX',
          descricaoCompleta: 'Boneco do Majin Vegeta Super Saiyajin, cheio de detalhes: cabelo dourado, roupa rasgada e marca "M" na testa. Acabamento realista e resistente. Altura aproximada: 20 cm. Peça perfeita para fãs de Dragon Ball e colecionadores.',
          especificacoes: ['Altura 20 cm', 'Cabelo dourado', 'Marca "M" na testa', 'Roupa rasgada detalhada', 'Acabamento realista', 'Dragon Ball oficial'],
          imagens: generateImages('majin_vegeta')
        },
        {
          id: 'gtr_miniatura',
          nome: 'Miniatura Nissan GTR R34 Skyline',
          preco: 'R$ 90',
          descricao: 'Miniatura detalhada com portas funcionais e sons',
          disponivel: 'OLX',
          descricaoCompleta: 'Miniatura detalhada do lendário Nissan GTR R34 Skyline. Portas, capô e porta-malas abrem, faróis acendem + sons realistas inspirados no carro. Acabamento premium, rica em detalhes. Peça de destaque para colecionadores e apaixonados por carros.',
          especificacoes: ['Portas funcionais', 'Capô e porta-malas abrem', 'Faróis com LED', 'Sons realistas', 'Acabamento premium', 'Escala detalhada'],
          imagens: generateImages('gtr_miniatura')
        },
        {
          id: 'fusca_classico',
          nome: 'Miniatura Fusca Clássico',
          preco: 'R$ 40',
          descricao: 'Fusca vintage "Herbie" #53',
          disponivel: 'OLX',
          descricaoCompleta: 'Miniatura premium do icônico Fusca brasileiro dos anos 70. Design nostálgico fiel ao original, portas funcionais, interior detalhado e pintura vintage impecável. Um pedaço da história automotiva em suas mãos.',
          especificacoes: ['Design vintage autêntico', 'Portas funcionais', 'Interior detalhado', 'Pintura premium', 'Acabamento nostálgico', 'Ícone brasileiro'],
          imagens: generateImages('fusca_classico')
        }
      ]
    }
  }

  return (
    <>
      <Head>
        <title>R_Imports — Produtos Importados Premium | Eletrônicos & Colecionáveis</title>
        <meta name="description" content="🎯 Produtos importados originais com qualidade premium. Gaming, tech, action figures e colecionáveis únicos. Entrega rápida para todo Brasil!" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <LandingHeader />
      <main id="top" className="landing-root">
        {/* HERO */}
        <section className="hero-section" id="showcase">
          <div className="hero-bg" />
          
          {/* Efeito de Explosão e Rachaduras */}
          {explosionActive && (
            <motion.div
              className="explosion-effect"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 3, opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          )}
          
          {cracksVisible && (
            <>
              {/* Sistema de Rachaduras Cinematográficas */}
              <div className="cracks-overlay">
                {/* Camada 1: Rachaduras Principais */}
                <svg className="crack-svg primary-cracks" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Rachadura Central Épica */}
                  <motion.path
                    d="M50,10 Q48,20 52,25 Q45,35 50,45 Q55,50 48,60 Q52,70 50,80 Q47,85 50,95"
                    stroke="url(#epicCrackGradient)"
                    strokeWidth="0.4"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, delay: 0.2, ease: "easeOut" }}
                    filter="url(#glowFilter)"
                  />
                  
                  {/* Rachadura Diagonal Superior */}
                  <motion.path
                    d="M20,15 Q30,20 40,25 Q50,30 60,35 Q70,40 80,45"
                    stroke="url(#secondaryCrackGradient)"
                    strokeWidth="0.25"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.8, delay: 0.5, ease: "easeOut" }}
                    filter="url(#glowFilter)"
                  />
                  
                  {/* Rachadura Diagonal Inferior */}
                  <motion.path
                    d="M15,70 Q25,65 35,60 Q45,55 55,60 Q65,65 75,70 Q80,75 85,80"
                    stroke="url(#secondaryCrackGradient)"
                    strokeWidth="0.25"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.8, delay: 0.7, ease: "easeOut" }}
                    filter="url(#glowFilter)"
                  />
                  
                  <defs>
                    {/* Gradiente Épico Principal */}
                    <linearGradient id="epicCrackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="20%" stopColor="#ffd700" stopOpacity="1" />
                      <stop offset="40%" stopColor="#ffed4e" stopOpacity="0.8" />
                      <stop offset="70%" stopColor="#f4d03f" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#d4af37" stopOpacity="0.3" />
                    </linearGradient>
                    
                    {/* Gradiente Secundário */}
                    <linearGradient id="secondaryCrackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffed4e" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#f4d03f" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#d4af37" stopOpacity="0.2" />
                    </linearGradient>
                    
                    {/* Filtro de Brilho */}
                    <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                </svg>
                
                {/* Camada 2: Micro Rachaduras */}
                <svg className="crack-svg micro-cracks" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[...Array(20)].map((_, i) => (
                    <motion.path
                      key={i}
                      d={`M${15 + i * 3.5},${20 + Math.sin(i) * 15} L${20 + i * 3.5},${25 + Math.sin(i) * 15}`}
                      stroke="url(#microCrackGradient)"
                      strokeWidth="0.08"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 1.2 + i * 0.05, ease: "easeOut" }}
                    />
                  ))}
                  
                  <defs>
                    <linearGradient id="microCrackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffd700" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#d4af37" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Camada 3: Partículas de Energia */}
                <div className="energy-particles">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="particle"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                        y: [-20, -40, -60]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        delay: 0.8 + i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    />
                  ))}
                </div>
                
                {/* Camada 4: Ondas de Choque */}
                <div className="shockwaves">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="shockwave"
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ scale: 8, opacity: 0 }}
                      transition={{ 
                        duration: 3, 
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
                
                {/* Camada 5: Distorção Atmosférica */}
                <motion.div 
                  className="atmospheric-distortion"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                />
              </div>
            </>
          )}
          
          {/* Bolhas Interativas */}
          {bubbles.map(bubble => (
            <motion.div
              key={bubble.id}
              className={`floating-bubble color-${bubble.color} ${bubble.isDragging ? 'dragging' : ''} ${explosionActive ? 'exploding' : ''}`}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                cursor: bubble.isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={(e) => handleBubbleMouseDown(bubble.id, e)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: explosionActive ? 0 : 1, 
                scale: bubble.isDragging ? 1.1 : (explosionActive ? 0 : 1),
                transition: { 
                  opacity: { duration: explosionActive ? 0.3 : 0.8, delay: explosionActive ? 0 : 1 + bubble.id * 0.2 },
                  scale: { duration: bubble.isDragging ? 0 : 0.2 }
                }
              }}
              whileHover={{ scale: bubble.isDragging ? 1.1 : 1.05 }}
              transition={{ duration: 0 }}
            >
              {bubble.text}
            </motion.div>
          ))}
          
          {/* Efeito de fusão */}
          {fusionEffect && (
            <motion.div
              className={`fusion-effect color-${fusionEffect.color}`}
              style={{
                left: `${fusionEffect.x}%`,
                top: `${fusionEffect.y}%`
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
          
          <motion.div className={`hero-content hero-content-elevated ${glassBreaking && !isReconstructing ? 'glass-breaking' : ''} ${isReconstructing ? 'reconstructing' : ''}`} data-reveal initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:1.2, ease:[0.19,1,0.22,1] }}>
            <motion.h1
              className={`hero-title ${glassBreaking && !isReconstructing ? 'shatter' : ''}`}
              initial={{ opacity:0, scale:.94 }}
              animate={{ opacity:1, scale:1 }}
              transition={{ duration:1.4, ease:[0.19,1,0.22,1] }}
            >
              <span className="shatter-fragment">Produtos</span>
              <span className="shatter-fragment">importados</span>
              <br />
              <span className="gradient-text shatter-fragment">premium</span>
              <span className="gradient-text shatter-fragment">& originais</span>
            </motion.h1>
            <motion.p className={`hero-sub ${glassBreaking && !isReconstructing ? 'shatter' : ''}`} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.4, duration:1 }}>
              <span className="shatter-fragment">🎯 Importamos os melhores produtos para você.</span>
              <span className="shatter-fragment">Gaming, tech e colecionáveis únicos</span>
              <span className="shatter-fragment">com qualidade premium e entrega expressa.</span>
            </motion.p>
            <motion.div className={`hero-cta ${glassBreaking && !isReconstructing ? 'shatter' : ''}`} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.8, duration:1 }}>
              <span className="shatter-fragment">
                <a href="#produtos" className="cta-btn primary">Ver produtos</a>
              </span>
              <span className="shatter-fragment">
                <a href="#contato" className="cta-btn secondary">Fazer pedido</a>
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* Mensagem Final Épica */}
        <AnimatePresence mode="wait">
          {showFinalMessage && (
            <motion.div 
              className="final-epic-message"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 1.5 } }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div 
                className="epic-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 1.2 } }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                R_Imports
              </motion.div>
              <motion.div 
                className="epic-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.8 } }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Com a R_Imports você tem tudo isso e muito mais!!!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BADGES DE CONFIANÇA */}
        <section className="trust-badges">
          <div className="trust-container">
            <motion.div 
              className="badges-grid"
              initial={{ opacity:0, y:30 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay:1.2, duration:0.8 }}
            >
              <div className="badge">
                <span className="badge-icon">✅</span>
                <span className="badge-text">100% Original</span>
              </div>
              <div className="badge">
                <span className="badge-icon">🚚</span>
                <span className="badge-text">Entrega Expressa</span>
              </div>
              <div className="badge">
                <span className="badge-icon">💎</span>
                <span className="badge-text">Premium Quality</span>
              </div>
              <div className="badge">
                <span className="badge-icon">🛡️</span>
                <span className="badge-text">Garantia Total</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PRODUTOS */}
        <section className="services" id="produtos">
          <div className="services-container">
            <div className="services-header" data-reveal>
              <h2>🎯 Nosso Catálogo Premium</h2>
              <p>Produtos cuidadosamente selecionados e importados especialmente para você. Qualidade internacional, preços justos.</p>
            </div>
            
            {/* TABS */}
            <div className="product-tabs">
              <button 
                className={`tab-btn ${activeTab === 'eletronicos' ? 'active' : ''}`}
                onClick={() => setActiveTab('eletronicos')}
              >
                ⚡ Tech & Gaming Pro
              </button>
              <button 
                className={`tab-btn ${activeTab === 'beleza' ? 'active' : ''}`}
                onClick={() => setActiveTab('beleza')}
              >
                🏆 Coleções Exclusivas
              </button>
            </div>

            {/* CONTEÚDO DA TAB ATIVA */}
            <div className="tab-content">
              <div className="tab-header">
                <h3>{produtos[activeTab].title}</h3>
                <p>{produtos[activeTab].description}</p>
              </div>
              
              <div className="products-grid">
                {produtos[activeTab].items.map((produto, i) => (
                  <motion.div
                    key={produto.id}
                    className="product-card"
                    initial={{ opacity:0, y:40 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.6, delay:i*0.1, ease:[0.19,1,0.22,1] }}
                    onClick={() => setSelectedProduct(produto)}
                  >
                    <div className="product-info">
                      <h4>{produto.nome}</h4>
                      <p className="product-price">{produto.preco}</p>
                      <p className="product-desc">{produto.descricao}</p>
                      <span className="product-availability">{produto.disponivel}</span>
                    </div>
                    <div className="product-actions">
                      <button className="btn-details">
                        🔍 Ver detalhes
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="category-cta">
                <p><strong>Gostou de algum produto?</strong></p>
                <p>Me chama no WhatsApp para fazer seu orçamento ou confira nossos anúncios nas plataformas!</p>
                <div className="platform-links">
                  <a href="https://wa.me/5519999869226" className="platform-btn whatsapp">
                    💬 WhatsApp Direto
                  </a>
                  <a href="https://www.olx.com.br/perfil/r-imports-b2470ecb" className="platform-btn olx">
                    🔍 Ver no OLX
                  </a>
                  <a href="https://www.facebook.com/share/1DF3ZDUDY1/" className="platform-btn facebook">
                    📘 Facebook Marketplace
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MODAL DE PRODUTO MELHORADO */}
        {selectedProduct && (() => {
          const availableImages = getAvailableImages(selectedProduct)
          return (
            <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
              <div className="product-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedProduct(null)}>✕</button>
                
                <div className="modal-content">
                  <div className="modal-images">
                    <div className="main-image-container">
                      <button 
                        className="nav-btn prev" 
                        onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : availableImages.length - 1)}
                        style={{ display: availableImages.length <= 1 ? 'none' : 'block' }}
                      >
                        ‹
                      </button>
                      <div className="main-image">
                        <img 
                          src={availableImages[currentImageIndex] || selectedProduct.imagens[0]} 
                          alt={selectedProduct.nome}
                          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                        />
                      </div>
                      <button 
                        className="nav-btn next" 
                        onClick={() => setCurrentImageIndex(prev => prev < availableImages.length - 1 ? prev + 1 : 0)}
                        style={{ display: availableImages.length <= 1 ? 'none' : 'block' }}
                      >
                        ›
                      </button>
                    </div>
                    
                    {availableImages.length > 1 && (
                      <div className="image-gallery">
                        {availableImages.map((img: string, index: number) => (
                          <img 
                            key={index} 
                            src={img} 
                            alt={`${selectedProduct.nome} ${index + 1}`}
                            className={index === currentImageIndex ? 'active' : ''}
                            onClick={() => setCurrentImageIndex(index)}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="modal-info">
                    <h2>{selectedProduct.nome}</h2>
                    <p className="modal-price">{selectedProduct.preco}</p>
                    <span className="modal-availability">{selectedProduct.disponivel}</span>
                    
                    <div className="modal-description">
                      <h3>Descrição</h3>
                      <p>{selectedProduct.descricaoCompleta}</p>
                    </div>
                    
                    <div className="modal-specs">
                      <h3>Especificações</h3>
                      <ul>
                        {selectedProduct.especificacoes.map((spec: string, index: number) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="modal-actions">
                      <a 
                        href={`https://wa.me/5519999869226?text=Olá! Tenho interesse no ${selectedProduct.nome}. Pode me passar mais informações?`}
                        className="btn-modal whatsapp"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        💬 WhatsApp
                      </a>
                      <a 
                        href="https://www.olx.com.br/perfil/r-imports-b2470ecb"
                        className="btn-modal olx"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🔍 Ver na OLX
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* PROCESSO */}
        <section className="process" id="processo">
          <div className="process-container">
            <div className="process-header" data-reveal>
              <h2>Como fazer seu pedido</h2>
              <p>Processo simples e transparente para você receber seu produto rapidinho</p>
            </div>
            <div className="process-grid">
              {[
                { step: '01', title: 'Escolha', desc: 'Navegue pelos produtos ou me mande o que você procura' },
                { step: '02', title: 'Orçamento', desc: 'Receba preço final transparente com frete incluso' },
                { step: '03', title: 'Pagamento', desc: 'PIX, cartão ou transferência - como preferir' },
                { step: '04', title: 'Entrega', desc: 'Envio rápido com código de rastreamento' }
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  className="process-item"
                  data-reveal
                  initial={{ opacity:0, x:-40 }}
                  whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true, amount:.6 }}
                  transition={{ duration:1, delay:i*0.2 }}
                >
                  <div className="process-number">{item.step}</div>
                  <div className="process-content">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section className="about" id="sobre">
          <div className="about-inner" data-reveal>
            <h2>🚀 Por que a R_Imports é diferente?</h2>
            <p>🎯 Não somos apenas mais uma loja. Somos especialistas em importação que garante autenticidade, qualidade premium e preços justos. Cada produto é cuidadosamente selecionado pensando em você!</p>
            <div className="stats">
              <div className="stat">
                <span className="stat-number">🏆</span>
                <span className="stat-label">Qualidade Premium</span>
              </div>
              <div className="stat">
                <span className="stat-number">⚡</span>
                <span className="stat-label">Entrega Expressa</span>
              </div>
              <div className="stat">
                <span className="stat-number">💎</span>
                <span className="stat-label">Produtos Únicos</span>
              </div>
              <div className="stat">
                <span className="stat-number">🛡️</span>
                <span className="stat-label">Garantia Total</span>
              </div>
            </div>
          </div>
        </section>

        {/* CONTATO */}
        <section className="contact" id="contato">
          <div className="contact-inner" data-reveal>
            <h2>💬 Pronto para importar seus sonhos?</h2>
            <p>🎯 Fale comigo no WhatsApp! Tire suas dúvidas, peça orçamentos personalizados e descubra produtos exclusivos. Atendimento humanizado, sem pressão de vendas!</p>
            <div className="contact-options">
              <a href="https://wa.me/5519999869226" className="cta-btn primary">💬 WhatsApp Direto</a>
              <a href="https://instagram.com/r_imports_store" className="cta-btn secondary">📱 Instagram</a>
            </div>
            <div className="contact-info">
              <p><strong>WhatsApp:</strong> (19) 99986-9226</p>
              <p><strong>Instagram:</strong> @r_imports_store</p>
              <p><strong>Atendimento:</strong> Segunda a sábado, 9h às 19h</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>R_Imports</h3>
            <p>Produtos importados originais</p>
          </div>
          <div className="footer-links">
            <a href="#produtos">Produtos</a>
            <a href="#processo">Como comprar</a>
            <a href="#sobre">Sobre</a>
            <a href="#contato">Contato</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} R_Imports. Todos os direitos reservados.</p>
        </div>
      </footer>
      <style jsx global>{`
        html,body,#__next { height:100%; background:#fff; color:#333; scroll-behavior:smooth; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height:1.6; }
        .landing-root { overflow-x:hidden; }
        
        /* Hero Section */
        .hero-section { position:relative; min-height:80vh; display:flex; align-items:center; justify-content:center; text-align:center; background:linear-gradient(135deg, #0b1f3b 0%, #1e3a8a 100%); color:white; overflow:hidden; user-select:none; }
        .hero-bg { position:absolute; inset:0; background:linear-gradient(135deg, rgba(11,31,59,0.95), rgba(30,58,138,0.9)); }
        .hero-content { position:relative; z-index:2; max-width:900px; padding:0 2rem; }
        .hero-content-elevated { transform:translateY(-40px); }
        .hero-title { font-size:clamp(2.5rem,6vw,4.5rem); line-height:1.1; font-weight:700; margin-bottom:1.5rem; }
        .gradient-text { background:linear-gradient(90deg,#d4af37,#f4d03f); -webkit-background-clip:text; color:transparent; }
        .hero-sub { font-size:clamp(1.1rem,2vw,1.4rem); opacity:0.9; margin-bottom:2.5rem; max-width:600px; margin-left:auto; margin-right:auto; }
        .hero-cta { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
        
        /* Floating Bubbles */
        .floating-bubble { 
          position:absolute; 
          backdrop-filter:blur(10px); 
          border-radius:50px; 
          padding:12px 20px; 
          font-size:14px; 
          font-weight:600; 
          color:white; 
          z-index:3; 
          cursor:grab; 
          user-select:none;
          white-space:nowrap;
          box-shadow:0 8px 32px rgba(0,0,0,0.3);
          animation:float 6s ease-in-out infinite;
          transform:translate(-50%, -50%);
          will-change:transform;
          pointer-events:auto;
          transition:all 0.3s ease;
        }
        
        /* Cores das bolhas baseadas no estado */
        .floating-bubble.color-blue { 
          background:rgba(212,175,55,0.15); 
          border:2px solid rgba(212,175,55,0.3); 
        }
        .floating-bubble.color-blue:hover { 
          background:rgba(212,175,55,0.25); 
          border-color:rgba(212,175,55,0.5); 
        }
        
        .floating-bubble.color-red { 
          background:rgba(220,38,127,0.15); 
          border:2px solid rgba(220,38,127,0.3); 
          box-shadow:0 8px 32px rgba(220,38,127,0.3);
        }
        .floating-bubble.color-red:hover { 
          background:rgba(220,38,127,0.25); 
          border-color:rgba(220,38,127,0.5); 
        }
        
        .floating-bubble.color-green { 
          background:rgba(34,197,94,0.15); 
          border:2px solid rgba(34,197,94,0.3); 
          box-shadow:0 8px 32px rgba(34,197,94,0.3);
        }
        .floating-bubble.color-green:hover { 
          background:rgba(34,197,94,0.25); 
          border-color:rgba(34,197,94,0.5); 
        }
        
        .floating-bubble.color-purple { 
          background:rgba(147,51,234,0.15); 
          border:2px solid rgba(147,51,234,0.3); 
          box-shadow:0 8px 32px rgba(147,51,234,0.3);
        }
        .floating-bubble.color-purple:hover { 
          background:rgba(147,51,234,0.25); 
          border-color:rgba(147,51,234,0.5); 
        }
        
        .floating-bubble.dragging { 
          cursor:grabbing; 
          z-index:10; 
          animation:none;
          transition:none;
          transform:translate(-50%, -50%) scale(1.1);
        }
        .floating-bubble.exploding {
          pointer-events:none;
        }
        
        /* Efeito de Fusão */
        .fusion-effect {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          z-index: 8;
          pointer-events: none;
        }
        
        .fusion-effect.color-red {
          background: radial-gradient(circle, #dc2626 0%, #ef4444 30%, transparent 70%);
          box-shadow: 0 0 30px #dc2626, 0 0 60px #ef4444;
        }
        
        .fusion-effect.color-green {
          background: radial-gradient(circle, #16a34a 0%, #22c55e 30%, transparent 70%);
          box-shadow: 0 0 30px #16a34a, 0 0 60px #22c55e;
        }
        
        .fusion-effect.color-purple {
          background: radial-gradient(circle, #9333ea 0%, #a855f7 30%, transparent 70%);
          box-shadow: 0 0 30px #9333ea, 0 0 60px #a855f7;
        }
        
        .fusion-effect.color-blue {
          background: radial-gradient(circle, #2563eb 0%, #3b82f6 30%, transparent 70%);
          box-shadow: 0 0 30px #2563eb, 0 0 60px #3b82f6;
        }
        
        /* Easter Egg - Explosão e Efeitos */
        .explosion-effect {
          position:absolute;
          top:50%;
          left:50%;
          width:100px;
          height:100px;
          background:radial-gradient(circle, #f4d03f 0%, #d4af37 30%, transparent 70%);
          border-radius:50%;
          transform:translate(-50%, -50%);
          z-index:5;
          box-shadow:0 0 100px #d4af37, 0 0 200px #f4d03f, 0 0 300px #d4af37;
        }
        
        .cracks-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 4;
          pointer-events: none;
          overflow: hidden;
        }
        
        /* Sistema de Rachaduras Épicas */
        .crack-svg {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }
        
        .primary-cracks {
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8)) 
                  drop-shadow(0 0 30px rgba(255, 215, 0, 0.9))
                  drop-shadow(0 0 45px rgba(244, 208, 63, 0.7))
                  drop-shadow(0 0 60px rgba(212, 175, 55, 0.5));
          animation: epicCrackGlow 2s ease-in-out infinite alternate;
          z-index: 6;
        }
        
        .micro-cracks {
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
          animation: microCrackShimmer 3s ease-in-out infinite;
          z-index: 5;
        }
        
        /* Partículas de Energia */
        .energy-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 7;
        }
        
        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, #ffffff 0%, #ffd700 30%, #f4d03f 70%, transparent 100%);
          border-radius: 50%;
          box-shadow: 
            0 0 10px #ffd700,
            0 0 20px #ffed4e,
            0 0 30px #f4d03f;
          filter: blur(0.5px);
        }
        
        /* Ondas de Choque */
        .shockwaves {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 3;
        }
        
        .shockwave {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 215, 0, 0.6);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 
            0 0 20px rgba(255, 215, 0, 0.4),
            inset 0 0 20px rgba(255, 215, 0, 0.2);
        }
        
        /* Distorção Atmosférica */
        .atmospheric-distortion {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 215, 0, 0.1) 0%,
            rgba(244, 208, 63, 0.05) 30%,
            rgba(212, 175, 55, 0.02) 60%,
            transparent 100%
          );
          backdrop-filter: blur(2px) hue-rotate(15deg) brightness(1.1);
          z-index: 2;
        }
        
        /* Animações Épicas */
        @keyframes epicCrackGlow {
          0% {
            filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8)) 
                    drop-shadow(0 0 30px rgba(255, 215, 0, 0.9))
                    drop-shadow(0 0 45px rgba(244, 208, 63, 0.7))
                    drop-shadow(0 0 60px rgba(212, 175, 55, 0.5));
          }
          100% {
            filter: drop-shadow(0 0 25px rgba(255, 255, 255, 1)) 
                    drop-shadow(0 0 50px rgba(255, 215, 0, 1))
                    drop-shadow(0 0 75px rgba(244, 208, 63, 0.9))
                    drop-shadow(0 0 100px rgba(212, 175, 55, 0.7))
                    drop-shadow(0 0 125px rgba(255, 215, 0, 0.4));
          }
        }
        
        @keyframes microCrackShimmer {
          0%, 100% {
            opacity: 0.6;
            filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.9))
                    drop-shadow(0 0 25px rgba(244, 208, 63, 0.6));
          }
        }
        
        @keyframes crackGlow {
          0% {
            filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)) 
                    drop-shadow(0 0 16px rgba(244, 208, 63, 0.6))
                    drop-shadow(0 0 24px rgba(212, 175, 55, 0.4));
          }
          100% {
            filter: drop-shadow(0 0 12px rgba(255, 215, 0, 1)) 
                    drop-shadow(0 0 24px rgba(244, 208, 63, 0.8))
                    drop-shadow(0 0 36px rgba(212, 175, 55, 0.6))
                    drop-shadow(0 0 48px rgba(255, 215, 0, 0.3));
          }
        }
        
        .easter-egg-logo {
          position:absolute;
          top:50%;
          left:50%;
          transform:translate(-50%, -50%);
          font-size:clamp(3rem, 8vw, 6rem);
          font-weight:900;
          color:#d4af37;
          z-index:6;
          text-shadow:0 0 20px #d4af37, 0 0 40px #f4d03f, 0 0 60px #d4af37;
          animation:logoGlow 2s ease-in-out infinite alternate;
          letter-spacing:0.1em;
          background:linear-gradient(45deg, #d4af37, #f4d03f, #d4af37);
          -webkit-background-clip:text;
          background-clip:text;
          -webkit-text-fill-color:transparent;
          filter:drop-shadow(0 0 30px rgba(212,175,55,0.8));
        }
        
        @keyframes logoGlow {
          0% { 
            text-shadow:0 0 20px #d4af37, 0 0 40px #f4d03f, 0 0 60px #d4af37;
            filter:drop-shadow(0 0 30px rgba(212,175,55,0.8)) brightness(1);
          }
          100% { 
            text-shadow:0 0 30px #d4af37, 0 0 60px #f4d03f, 0 0 90px #d4af37, 0 0 120px #f4d03f;
            filter:drop-shadow(0 0 50px rgba(212,175,55,1)) brightness(1.2);
          }
        }
        
        /* Efeito de Vidro Quebrado */
        .glass-breaking .shatter-fragment {
          display: inline-block;
          animation: shatterGlass 1.5s ease-out forwards;
        }
        
        .shatter-fragment:nth-child(1) { animation-delay: 0s; }
        .shatter-fragment:nth-child(2) { animation-delay: 0.1s; }
        .shatter-fragment:nth-child(3) { animation-delay: 0.2s; }
        .shatter-fragment:nth-child(4) { animation-delay: 0.3s; }
        .shatter-fragment:nth-child(5) { animation-delay: 0.4s; }
        .shatter-fragment:nth-child(6) { animation-delay: 0.5s; }
        
        @keyframes shatterGlass {
          0% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          20% {
            opacity: 0.8;
            transform: scale(1.1) rotate(2deg);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.9) rotate(-5deg) translateX(var(--shatter-x, 0)) translateY(var(--shatter-y, 0));
          }
          100% {
            opacity: 0;
            transform: scale(0.3) rotate(var(--shatter-rotate, 15deg)) translateX(var(--shatter-x, 100px)) translateY(var(--shatter-y, 100px));
          }
        }
        
        .shatter-fragment:nth-child(1) { --shatter-x: -200px; --shatter-y: -150px; --shatter-rotate: -45deg; }
        .shatter-fragment:nth-child(2) { --shatter-x: 180px; --shatter-y: -120px; --shatter-rotate: 30deg; }
        .shatter-fragment:nth-child(3) { --shatter-x: -150px; --shatter-y: 160px; --shatter-rotate: -60deg; }
        .shatter-fragment:nth-child(4) { --shatter-x: 220px; --shatter-y: 140px; --shatter-rotate: 75deg; }
        .shatter-fragment:nth-child(5) { --shatter-x: -180px; --shatter-y: 50px; --shatter-rotate: -30deg; }
        .shatter-fragment:nth-child(6) { --shatter-x: 160px; --shatter-y: -80px; --shatter-rotate: 45deg; }
        
        /* Animação de Reconstrução */
        .reconstructing .shatter-fragment {
          animation: reconstructGlass 2s ease-in-out forwards;
        }
        
        .reconstructing .shatter-fragment:nth-child(1) { animation-delay: 0s; }
        .reconstructing .shatter-fragment:nth-child(2) { animation-delay: 0.1s; }
        .reconstructing .shatter-fragment:nth-child(3) { animation-delay: 0.2s; }
        .reconstructing .shatter-fragment:nth-child(4) { animation-delay: 0.3s; }
        .reconstructing .shatter-fragment:nth-child(5) { animation-delay: 0.4s; }
        .reconstructing .shatter-fragment:nth-child(6) { animation-delay: 0.5s; }
        
        @keyframes reconstructGlass {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(var(--shatter-rotate, 15deg)) translateX(var(--shatter-x, 100px)) translateY(var(--shatter-y, 100px));
          }
          30% {
            opacity: 0.3;
            transform: scale(0.7) rotate(calc(var(--shatter-rotate, 15deg) * 0.5)) translateX(calc(var(--shatter-x, 100px) * 0.5)) translateY(calc(var(--shatter-y, 100px) * 0.5));
          }
          70% {
            opacity: 0.8;
            transform: scale(1.05) rotate(2deg) translateX(0) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg) translateX(0) translateY(0);
          }
        }
        
        /* Mensagem Final Épica */
        .final-epic-message {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 10;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          text-align: center;
          padding-top: 15vh;
        }
        
        .epic-logo {
          font-size: clamp(4rem, 10vw, 8rem);
          font-weight: 900;
          background: linear-gradient(45deg, #d4af37, #f4d03f, #ffd700, #d4af37);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: epicGlow 2s ease-in-out infinite alternate, gradientShift 3s ease-in-out infinite;
          text-shadow: 0 0 50px rgba(212, 175, 55, 0.8);
          filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.6));
          margin-bottom: 1rem;
        }
        
        .epic-subtitle {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 600;
          color: #ffffff;
          text-shadow: 
            0 0 20px rgba(212, 175, 55, 0.8),
            0 0 40px rgba(244, 208, 63, 0.6),
            0 0 60px rgba(255, 215, 0, 0.4);
          animation: textPulse 3s ease-in-out infinite;
        }
        
        @keyframes epicGlow {
          0% { 
            filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.6)) brightness(1);
          }
          100% { 
            filter: drop-shadow(0 0 80px rgba(255, 215, 0, 1)) brightness(1.3);
          }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes textPulse {
          0%, 100% { 
            text-shadow: 
              0 0 20px rgba(212, 175, 55, 0.8),
              0 0 40px rgba(244, 208, 63, 0.6),
              0 0 60px rgba(255, 215, 0, 0.4);
          }
          50% { 
            text-shadow: 
              0 0 30px rgba(212, 175, 55, 1),
              0 0 60px rgba(244, 208, 63, 0.8),
              0 0 90px rgba(255, 215, 0, 0.6);
          }
        }
        
        @keyframes fusionPulse {
          0% { transform:translate(-50%, -50%) scale(0); opacity:1; }
          50% { transform:translate(-50%, -50%) scale(1.5); opacity:0.8; }
          100% { transform:translate(-50%, -50%) scale(2); opacity:0; }
        }
        
        @keyframes float {
          0%, 100% { transform:translate(-50%, -50%) translateY(0px); }
          50% { transform:translate(-50%, -50%) translateY(-10px); }
        }
        
        /* Buttons */
        .cta-btn { display:inline-block; padding:1rem 2rem; font-size:1rem; font-weight:600; border-radius:50px; text-decoration:none; transition:all 0.3s ease; border:2px solid transparent; }
        .cta-btn.primary { background:#d4af37; color:#0b1f3b; }
        .cta-btn.primary:hover { background:#f4d03f; transform:translateY(-2px); box-shadow:0 8px 25px rgba(212,175,55,0.4); }
        .cta-btn.secondary { background:#0b1f3b; color:white; border-color:#d4af37; }
        .cta-btn.secondary:hover { background:#d4af37; color:#0b1f3b; }
        
        /* Trust Badges */
        .trust-badges { padding:2rem 0; background:linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); }
        .trust-container { max-width:1200px; margin:0 auto; padding:0 1rem; }
        .badges-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1.5rem; }
        .badge { display:flex; align-items:center; justify-content:center; gap:0.8rem; background:white; padding:1.2rem; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.08); transition:all 0.3s ease; }
        .badge:hover { transform:translateY(-3px); box-shadow:0 8px 25px rgba(0,0,0,0.12); }
        .badge-icon { font-size:1.5rem; }
        .badge-text { font-size:0.95rem; font-weight:600; color:#0b1f3b; }
        
        /* Services Section */
        .services { padding:6rem 0; background:#f8fafc; }
        .services-container { max-width:1200px; margin:0 auto; padding:0 2rem; }
        .services-header { text-align:center; margin-bottom:3rem; }
        .services-header h2 { font-size:clamp(2rem,4vw,3rem); font-weight:700; color:#0b1f3b; margin-bottom:1rem; }
        .services-header p { font-size:1.2rem; color:#64748b; max-width:600px; margin:0 auto; }
        
        /* Product Tabs */
        .product-tabs { display:flex; justify-content:center; gap:1rem; margin-bottom:3rem; }
        .tab-btn { background:white; border:2px solid #e2e8f0; color:#64748b; padding:1rem 2rem; border-radius:50px; font-size:1rem; font-weight:600; cursor:pointer; transition:all 0.3s ease; }
        .tab-btn:hover { border-color:#d4af37; color:#0b1f3b; }
        .tab-btn.active { background:#d4af37; border-color:#d4af37; color:#0b1f3b; transform:translateY(-2px); box-shadow:0 8px 25px rgba(212,175,55,0.3); }
        
        /* Tab Content */
        .tab-content { min-height:600px; }
        .tab-header { text-align:center; margin-bottom:3rem; }
        .tab-header h3 { font-size:2rem; font-weight:700; color:#0b1f3b; margin-bottom:1rem; }
        .tab-header p { font-size:1.1rem; color:#64748b; max-width:700px; margin:0 auto; }
        
        /* Products Grid */
        .products-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:2rem; margin-bottom:3rem; }
        .product-card { background:white; border-radius:20px; padding:2rem; box-shadow:0 4px 6px rgba(0,0,0,0.05); transition:all 0.3s ease; border-top:4px solid #d4af37; cursor:pointer; }
        .product-card:hover { transform:translateY(-5px); box-shadow:0 20px 40px rgba(11,31,59,0.15); }
        .product-info h4 { font-size:1.3rem; font-weight:700; color:#0b1f3b; margin-bottom:0.5rem; }
        .product-price { font-size:1.1rem; font-weight:600; color:#d4af37; margin-bottom:0.8rem; }
        .product-desc { color:#64748b; margin-bottom:1rem; line-height:1.5; }
        .product-availability { display:inline-block; background:#f1f5f9; color:#0b1f3b; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.85rem; font-weight:500; }
        .product-actions { margin-top:1.5rem; }
        .btn-whatsapp { display:inline-block; background:#25d366; color:white; padding:0.8rem 1.5rem; border-radius:25px; text-decoration:none; font-weight:600; transition:all 0.3s ease; }
        .btn-whatsapp:hover { background:#128c7e; transform:translateY(-2px); }
        .btn-details { display:inline-block; background:#0b1f3b; color:white; padding:0.8rem 1.5rem; border-radius:25px; border:none; font-weight:600; cursor:pointer; transition:all 0.3s ease; width:100%; }
        .btn-details:hover { background:#1e3a8a; transform:translateY(-2px); }
        
        /* Product Modal */
        .product-modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1rem; }
        .product-modal { background:white; border-radius:20px; max-width:900px; width:100%; max-height:90vh; overflow-y:auto; position:relative; }
        .modal-close { position:absolute; top:1rem; right:1rem; background:#f1f5f9; border:none; width:40px; height:40px; border-radius:50%; cursor:pointer; font-size:1.2rem; color:#64748b; transition:all 0.3s ease; z-index:10; }
        .modal-close:hover { background:#e2e8f0; color:#0b1f3b; }
        .modal-content { display:grid; grid-template-columns:1fr 1fr; gap:2rem; padding:2rem; }
        
        /* Modal Images */
        .modal-images { }
        .main-image-container { position:relative; margin-bottom:1rem; border-radius:15px; overflow:hidden; }
        .main-image { width:100%; min-height:300px; display:flex; align-items:center; justify-content:center; background:#f8fafc; }
        .main-image img { max-width:100%; max-height:400px; object-fit:contain; border-radius:15px; }
        
        /* Navigation Buttons */
        .nav-btn { position:absolute; top:50%; transform:translateY(-50%); background:rgba(11,31,59,0.8); color:white; border:none; width:50px; height:50px; border-radius:50%; cursor:pointer; font-size:1.5rem; font-weight:bold; transition:all 0.3s ease; z-index:5; }
        .nav-btn:hover { background:#0b1f3b; transform:translateY(-50%) scale(1.1); }
        .nav-btn.prev { left:10px; }
        .nav-btn.next { right:10px; }
        
        /* Image Gallery */
        .image-gallery { display:grid; grid-template-columns:repeat(auto-fit,minmax(80px,1fr)); gap:0.5rem; max-height:120px; overflow-x:auto; }
        .image-gallery img { width:100%; height:80px; object-fit:cover; border-radius:8px; cursor:pointer; transition:all 0.3s ease; border:3px solid transparent; }
        .image-gallery img:hover { transform:scale(1.05); border-color:#d4af37; }
        .image-gallery img.active { border-color:#0b1f3b; transform:scale(1.1); box-shadow:0 4px 12px rgba(11,31,59,0.3); }
        
        /* Modal Info */
        .modal-info h2 { font-size:1.8rem; font-weight:700; color:#0b1f3b; margin-bottom:0.5rem; }
        .modal-price { font-size:1.3rem; font-weight:600; color:#d4af37; margin-bottom:1rem; display:block; }
        .modal-availability { display:inline-block; background:#f1f5f9; color:#0b1f3b; padding:0.4rem 1rem; border-radius:20px; font-size:0.9rem; font-weight:500; margin-bottom:2rem; }
        .modal-description { margin-bottom:2rem; }
        .modal-description h3 { font-size:1.2rem; font-weight:700; color:#0b1f3b; margin-bottom:0.8rem; }
        .modal-description p { color:#64748b; line-height:1.6; }
        .modal-specs { margin-bottom:2rem; }
        .modal-specs h3 { font-size:1.2rem; font-weight:700; color:#0b1f3b; margin-bottom:0.8rem; }
        .modal-specs ul { list-style:none; padding:0; }
        .modal-specs li { color:#64748b; margin-bottom:0.5rem; padding-left:1.5rem; position:relative; }
        .modal-specs li:before { content:'✓'; position:absolute; left:0; color:#d4af37; font-weight:bold; }
        
        /* Modal Actions */
        .modal-actions { display:flex; gap:1rem; flex-wrap:wrap; }
        .btn-modal { flex:1; padding:1rem; border-radius:25px; text-decoration:none; font-weight:600; text-align:center; transition:all 0.3s ease; min-width:140px; }
        .btn-modal.whatsapp { background:#25d366; color:white; }
        .btn-modal.whatsapp:hover { background:#128c7e; transform:translateY(-2px); }
        .btn-modal.olx { background:#6f2ed6; color:white; }
        .btn-modal.olx:hover { background:#5a23b0; transform:translateY(-2px); }
        
        /* Category CTA */
        .category-cta { background:white; padding:2.5rem; border-radius:20px; text-align:center; border:2px solid #d4af37; }
        .category-cta p { color:#64748b; margin-bottom:1rem; }
        .category-cta p:first-child { color:#0b1f3b; font-size:1.1rem; }
        .platform-links { display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; margin-top:1.5rem; }
        .platform-btn { display:inline-block; padding:0.8rem 1.5rem; border-radius:25px; text-decoration:none; font-weight:600; transition:all 0.3s ease; }
        .platform-btn.whatsapp { background:#25d366; color:white; }
        .platform-btn.whatsapp:hover { background:#128c7e; }
        .platform-btn.olx { background:#6f2ed6; color:white; }
        .platform-btn.olx:hover { background:#5a23b0; }
        .platform-btn.facebook { background:#1877f2; color:white; }
        .platform-btn.facebook:hover { background:#166fe5; }
        
        /* Process Section */
        .process { padding:6rem 0; background:white; }
        .process-container { max-width:1200px; margin:0 auto; padding:0 2rem; }
        .process-header { text-align:center; margin-bottom:4rem; }
        .process-header h2 { font-size:clamp(2rem,4vw,3rem); font-weight:700; color:#0b1f3b; margin-bottom:1rem; }
        .process-header p { font-size:1.2rem; color:#64748b; max-width:600px; margin:0 auto; }
        .process-grid { display:grid; gap:2rem; max-width:800px; margin:0 auto; }
        .process-item { display:flex; align-items:center; gap:1.5rem; padding:2rem; background:#f8fafc; border-radius:15px; border-left:5px solid #d4af37; }
        .process-number { font-size:2rem; font-weight:700; color:#d4af37; background:#0b1f3b; width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .process-content h3 { font-size:1.3rem; font-weight:700; color:#0b1f3b; margin-bottom:0.5rem; }
        .process-content p { color:#64748b; }
        
        /* About Section */
        .about { padding:6rem 0; background:#0b1f3b; color:white; }
        .about-inner { max-width:1000px; margin:0 auto; padding:0 2rem; text-align:center; }
        .about-inner h2 { font-size:clamp(2rem,4vw,3rem); font-weight:700; margin-bottom:1.5rem; }
        .about-inner p { font-size:1.2rem; opacity:0.9; margin-bottom:3rem; }
        .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:2rem; }
        .stat { text-align:center; }
        .stat-number { display:block; font-size:3rem; font-weight:700; color:#d4af37; }
        .stat-label { font-size:1rem; opacity:0.8; }
        
        /* Contact Section */
        .contact { padding:6rem 0; background:#f8fafc; }
        .contact-inner { max-width:800px; margin:0 auto; text-align:center; padding:0 2rem; }
        .contact-inner h2 { font-size:clamp(2rem,4vw,3rem); font-weight:700; color:#0b1f3b; margin-bottom:1rem; }
        .contact-inner > p { font-size:1.2rem; color:#64748b; margin-bottom:2.5rem; }
        .contact-options { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-bottom:3rem; }
        .contact-info { background:white; padding:2rem; border-radius:15px; text-align:left; max-width:400px; margin:0 auto; border-top:4px solid #d4af37; }
        .contact-info p { margin-bottom:1rem; color:#475569; }
        .contact-info strong { color:#0b1f3b; }
        
        /* Footer */
        .landing-footer { background:#0b1f3b; color:white; padding:3rem 0 1rem; }
        .footer-content { max-width:1200px; margin:0 auto; padding:0 2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:2rem; margin-bottom:2rem; }
        .footer-info h3 { font-size:1.5rem; font-weight:700; margin-bottom:0.5rem; color:#d4af37; }
        .footer-info p { opacity:0.8; }
        .footer-links { display:flex; gap:2rem; }
        .footer-links a { color:white; text-decoration:none; opacity:0.8; transition:all 0.3s; }
        .footer-links a:hover { opacity:1; color:#d4af37; }
        .footer-bottom { text-align:center; padding-top:2rem; border-top:1px solid rgba(212,175,55,0.2); opacity:0.6; }
        
        /* Reveal Animation */
        [data-reveal] { opacity:0; transform:translateY(30px); transition:opacity 0.8s ease, transform 0.8s ease; }
        .reveal-in { opacity:1 !important; transform:translateY(0) !important; }
        
        /* Responsive */
        @media (max-width: 768px) { 
          .hero-cta { flex-direction:column; align-items:center; }
          .hero-content-elevated { transform:translateY(-20px); }
          .floating-bubble { 
            font-size:12px; 
            padding:8px 16px; 
            border-radius:30px;
            position:fixed;
          }
          .easter-egg-logo {
            font-size:clamp(2rem, 12vw, 4rem);
          }
          .crack {
            height:2px;
          }
          .crack-1, .crack-2, .crack-3, .crack-4, .crack-5, .crack-6, .crack-7, .crack-8, .crack-9, .crack-10, .crack-11, .crack-12 {
            width:60px;
          }
          .badges-grid { grid-template-columns:repeat(2,1fr); gap:1rem; }
          .badge { padding:1rem; }
          .badge-text { font-size:0.85rem; }
          .product-tabs { flex-direction:column; align-items:center; }
          .tab-btn { width:100%; max-width:280px; text-align:center; }
          .products-grid { grid-template-columns:1fr; }
          .platform-links { flex-direction:column; align-items:center; }
          .platform-btn { width:100%; max-width:250px; text-align:center; }
          .process-item { flex-direction:column; text-align:center; }
          .footer-content { flex-direction:column; text-align:center; }
          .footer-links { flex-wrap:wrap; justify-content:center; }
          
          /* Modal Responsive */
          .modal-content { grid-template-columns:1fr; padding:1.5rem; }
          .modal-actions { flex-direction:column; }
          .main-image img { max-height:250px; }
          .nav-btn { width:40px; height:40px; font-size:1.2rem; }
          .nav-btn.prev { left:5px; }
          .nav-btn.next { right:5px; }
          .image-gallery { grid-template-columns:repeat(auto-fit,minmax(60px,1fr)); }
          .image-gallery img { height:60px; }
          .contact-options { flex-direction:column; }
        }
      `}</style>
    </>
  )
}