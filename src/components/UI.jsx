import { motion } from 'framer-motion'
import { Flame, LayoutDashboard, Calendar, CheckSquare, Target, HeartPulse, Utensils, Home, Users, StickyNote, Bot, LogOut, Mic, Plus, Sparkles, Search, Menu } from 'lucide-react'

export const colors = {
  dark: '#0D0D0D',
  white: '#FFFFFF',
  blue: '#1A3CFF'
}

export function AppShell({ children, onLogout, onOpenMenu }) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <header className="sticky top-0 z-20 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-md hover:bg-white/5" onClick={onOpenMenu}><Menu className="w-5 h-5"/></button>
          <motion.div initial={{opacity:0, y:-6}} animate={{opacity:1, y:0}} className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-[#1A3CFF]" />
            <span className="font-semibold tracking-tight">Gestor de Alta Performance</span>
          </motion.div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
              <Search className="w-4 h-4 text-white/70" />
              <input placeholder="Pesquisar" className="bg-transparent outline-none text-sm placeholder:text-white/50"/>
            </div>
            <button onClick={onLogout} className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 transition">
              <LogOut className="w-4 h-4"/> <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}

export function Sidebar({ current, onSelect, open }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard da Vida', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda Inteligente', icon: Calendar },
    { id: 'tarefas', label: 'Tarefas e Prioridades', icon: CheckSquare },
    { id: 'objetivos', label: 'Objetivos', icon: Target },
    { id: 'saude', label: 'Saúde e Performance', icon: HeartPulse },
    { id: 'alimentacao', label: 'Alimentação', icon: Utensils },
    { id: 'casa', label: 'Casa e Família', icon: Home },
    { id: 'contactos', label: 'Contactos e Aniversários', icon: Users },
    { id: 'notas', label: 'Notas e Brain Dump', icon: StickyNote },
    { id: 'ia', label: 'Centro de IA', icon: Bot },
  ]
  return (
    <div className={(open? 'translate-x-0':'-translate-x-full lg:translate-x-0')+" transition lg:transition-none fixed lg:static inset-y-0 left-0 w-72 bg-black/30 border-r border-white/10 backdrop-blur p-4 space-y-2"}>
      {items.map(item=>{
        const Icon = item.icon
        const active = current===item.id
        return (
          <motion.button key={item.id} whileHover={{x:4}} onClick={()=>onSelect(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border ${active? 'bg-[#1A3CFF]/10 border-[#1A3CFF]/40':'bg-white/5 border-white/10 hover:bg-white/10'}`}>
            <motion.div animate={{scale: active?1.1:1}} transition={{type:'spring', stiffness:300, damping:20}}>
              <Icon className={active? 'text-[#1A3CFF]':''} />
            </motion.div>
            <span className="text-sm">{item.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

export function Section({ title, subtitle, children, right }){
  return (
    <section className="mb-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="text-white/60 text-sm">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="grid gap-3">
        {children}
      </div>
    </section>
  )
}

export function Card({ children }){
  return (
    <motion.div whileHover={{y:-2}} transition={{type:'spring', stiffness:300, damping:20}} className="bg-white/5 border border-white/10 rounded-xl p-4">
      {children}
    </motion.div>
  )
}

export function ProgressBar({ value }){
  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <motion.div initial={{width:0}} animate={{width: `${Math.min(100, Math.max(0, value))}%`}} transition={{duration:0.8}} className="h-full bg-[#1A3CFF]"/>
    </div>
  )
}

export function EnergyIndicator({ value=70 }){
  // flame-like pulse
  return (
    <div className="relative flex items-center gap-3">
      <motion.div initial={{scale:0.9, opacity:0.8}} animate={{scale:[0.95,1.05,0.95], opacity:[0.9,1,0.9]}} transition={{duration:2.2, repeat:Infinity, ease:'easeInOut'}} className="w-10 h-10 rounded-full bg-[#1A3CFF]/20 border border-[#1A3CFF]/40 flex items-center justify-center">
        <Flame className="text-[#1A3CFF]"/>
      </motion.div>
      <div>
        <div className="text-sm text-white/60">Energia de hoje</div>
        <div className="font-semibold">{value}%</div>
      </div>
    </div>
  )
}

export function AddQuick({ onAdd }){
  return (
    <div className="flex items-center gap-2">
      <button onClick={()=>onAdd?.('text')} className="inline-flex items-center gap-2 bg-[#1A3CFF] hover:bg-[#1430cc] rounded-lg px-3 py-1.5 text-sm">
        <Plus className="w-4 h-4"/> Adicionar
      </button>
      <button onClick={()=>onAdd?.('voice')} className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
        <Mic className="w-4 h-4"/> Voz
      </button>
    </div>
  )
}
