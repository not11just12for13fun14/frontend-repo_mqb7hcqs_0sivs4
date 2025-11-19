import React from 'react'
import Spline from '@splinetool/react-spline'
import { motion } from 'framer-motion'
import { AppShell, Sidebar, Section, Card, colors } from './components/UI'
import { Dashboard, Agenda, Tarefas, Objetivos, Saude, Alimentacao, Casa, Contactos, Notas, CentroIA } from './components/Sections'
import { api, getUser, setUser, logout } from './lib/api'

function Login({ onLogin }){
  const [email, setEmail] = React.useState('demo@user.com')
  const [name, setName] = React.useState('Demo')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  async function submit(e){
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, name })
      setUser(res)
      onLogin(res)
    } catch (err) {
      setError('Não foi possível iniciar sessão. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <Spline scene="https://prod.spline.design/4Zh-Q6DWWp5yPnQf/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="relative min-h-screen grid place-items-center px-4">
          <div className="max-w-md w-full bg-black/50 backdrop-blur border border-white/10 rounded-2xl p-6">
            <motion.h1 initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} className="text-2xl font-semibold mb-2">Gestor de Alta Performance</motion.h1>
            <p className="text-white/70 mb-4">Acede à tua área privada</p>
            {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-sm text-white/70">Nome</label>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"/>
              </div>
              <div>
                <label className="text-sm text-white/70">Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"/>
              </div>
              <button type="submit" disabled={loading} className={`w-full rounded-lg px-3 py-2 transition ${loading? 'bg-[#1A3CFF]/60 cursor-not-allowed':'bg-[#1A3CFF] hover:bg-[#1430cc]'}`}>
                {loading? 'A entrar…' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App(){
  const [userState, setUserState] = React.useState(getUser())
  const [current, setCurrent] = React.useState('dashboard')
  const [menuOpen, setMenuOpen] = React.useState(false)

  if(!userState){
    return <Login onLogin={setUserState} />
  }

  function doLogout(){
    logout()
    setUserState(null)
  }

  const Content = {
    dashboard: <Dashboard/>,
    agenda: <Agenda/>,
    tarefas: <Tarefas/>,
    objetivos: <Objetivos/>,
    saude: <Saude/>,
    alimentacao: <Alimentacao/>,
    casa: <Casa/>,
    contactos: <Contactos/>,
    notas: <Notas/>,
    ia: <CentroIA/>
  }[current]

  return (
    <AppShell onLogout={doLogout} onOpenMenu={()=>setMenuOpen(true)}>
      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[18rem,1fr] gap-6">
        <Sidebar current={current} onSelect={(id)=>{setCurrent(id); setMenuOpen(false)}} open={menuOpen} />
        <main>
          {Content}
        </main>
      </div>
    </AppShell>
  )
}
