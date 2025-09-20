# R_Imports — Landing Promocional

Uma landing page promocional minimalista focada em apresentar a marca e serviços com design tecnológico futurista.

## Stack Tecnológica
- **Next.js 14** (Pages Router) + **React 18** + **TypeScript**
- **Tailwind CSS** para estilização
- **Framer Motion** para animações suaves

## Características
- Design minimalista e futurista
- Animações suaves e responsivas
- Otimizada para performance
- SEO básico implementado
- Sem backend ou banco de dados

## Tema Visual
- **Cores:** Azul escuro (`#0b1f3b`) e dourado (`#d4af37`)
- **Tipografia:** Inter + system fonts
- **Estilo:** Gradientes, glassmorphism, animações fluidas

## Seções da Landing
- **Hero:** Chamada principal com animações
- **Features:** Destaques dos serviços
- **Gallery:** Showcase visual
- **About:** Apresentação da marca
- **Contact:** Call-to-action

## Desenvolvimento

### Requisitos
- Node.js 18+
- npm ou yarn

### Scripts Disponíveis
```bash
npm run dev       # Servidor de desenvolvimento (porta 3000)
npm run build     # Build de produção
npm run start     # Servidor de produção
npm run lint      # Linting com ESLint
npm run typecheck # Verificação de tipos TypeScript
```

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` (opcional):
```env
SITE_URL="http://localhost:3000"  # Para sitemap em produção
```

## Deploy

### Vercel (Recomendado)
1. Conecte o repositório no Vercel
2. Configure `SITE_URL` com seu domínio final
3. Deploy automático no push

### Outros Providers
- Build command: `npm run build`
- Output directory: `.next`
- Node.js 18+

## SEO
- Meta tags otimizadas
- Sitemap.xml dinâmico
- Robots.txt configurado
- Estrutura semântica HTML

## Performance
- CSS-in-JS otimizado
- Componentes React otimizados
- Imagens responsivas
- Lazy loading implementado

## Estrutura do Projeto
```
src/
├── components/           # Componentes React
│   └── LandingHeader.tsx # Header da landing
├── pages/               # Páginas Next.js
│   ├── index.tsx        # Página principal
│   ├── robots.txt.ts    # Robots.txt dinâmico
│   └── sitemap.xml.ts   # Sitemap dinâmico
├── styles/              # Estilos globais
└── public/              # Assets estáticos
```

## Customização

### Cores
Edite as variáveis CSS-in-JS no componente principal ou configure no Tailwind CSS.

### Conteúdo
Todo o conteúdo está no arquivo `pages/index.tsx` para fácil edição.

### Animações
Configuradas com Framer Motion. Ajuste os valores nos componentes motion.

## Manutenção
- Atualize dependências regularmente
- Monitore Core Web Vitals
- Otimize imagens conforme necessário
- Mantenha conteúdo atualizado

---
Projeto limpo e otimizado para máxima performance como landing page promocional.
