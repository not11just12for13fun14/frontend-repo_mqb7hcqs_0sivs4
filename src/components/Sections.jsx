import React from 'react'
import { motion } from 'framer-motion'
import { Card, Section, ProgressBar, EnergyIndicator, AddQuick } from './UI'
import { api, getUser } from '../lib/api'

export function Dashboard(){
  const [data, setData] = React.useState(null)
  React.useEffect(()=>{
    const u = getUser()
    if(!u) return
    api.get('/dashboard', { user_id: u.user_id }).then(setData).catch(()=>{})
  },[])
  if(!data) return <div className="text-white/60">A carregar...</div>
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <EnergyIndicator value={data.energy} />
      </Card>
      <Card>
        <div className="text-sm text-white/60 mb-2">Recomendações da IA</div>
        <ul className="space-y-1 text-sm">
          {data.recommendations.map((r,i)=>(<li key={i} className="flex gap-2"><span className="text-[#1A3CFF]">•</span><span>{r}</span></li>))}
        </ul>
      </Card>
      <Card>
        <div className="text-sm text-white/60 mb-2">Alertas</div>
        <ul className="space-y-1 text-sm">
          {data.alerts.map((a,i)=>(<li key={i} className="flex gap-2"><span className="text-[#1A3CFF]">•</span><span>{a.type==='birthday'?`Aniversário: ${a.name}`:`Deadline: ${a.title}`}</span></li>))}
        </ul>
      </Card>
      <Card>
        <Section title="Tarefas do dia" subtitle="Pessoais e Profissionais">
          <div className="grid gap-2">
            {data.tasks.slice(0,5).map((t,i)=>(
              <motion.div key={i} whileHover={{x:4}} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                <span className="text-sm">{t.title}</span>
                <button className="text-xs text-white/60 hover:text-white">Concluir</button>
              </motion.div>
            ))}
          </div>
        </Section>
      </Card>
      <Card>
        <Section title="Hábitos de hoje">
          <div className="grid gap-2">
            {data.habits.slice(0,5).map((h,i)=>(
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1"><span>{h.name}</span><span>{h.done_today}/{h.target_per_day}</span></div>
                <ProgressBar value={Math.min(100, (h.done_today/h.target_per_day)*100)} />
              </div>
            ))}
          </div>
        </Section>
      </Card>
      <Card>
        <Section title="Próximos compromissos">
          <div className="grid gap-2">
            {data.events.slice(0,5).map((e,i)=>(
              <div key={i} className="text-sm">
                <div className="font-medium">{e.title}</div>
                <div className="text-white/60">{new Date(e.start_time).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Section>
      </Card>
    </div>
  )
}

export function Agenda(){
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Agenda Semanal" subtitle="Compromissos e blocos de foco"></Section>
      </Card>
      <Card>
        <Section title="Agenda Mensal" subtitle="Visão macro"></Section>
      </Card>
      <Card>
        <Section title="IA de Agenda" subtitle="Reorganiza a semana automaticamente"></Section>
      </Card>
    </div>
  )
}

export function Tarefas(){
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Adicionar Tarefa" right={<AddQuick/>}>
          <div className="text-sm text-white/60">Etiquetas, prioridade, data limite e categorias.</div>
        </Section>
      </Card>
      <Card>
        <Section title="Lista de Tarefas"></Section>
      </Card>
      <Card>
        <Section title="Sugestões da IA" subtitle="3 prioridades do dia"></Section>
      </Card>
    </div>
  )
}

export function Objetivos(){
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Objetivos" subtitle="Anuais, trimestrais, mensais e semanais"></Section>
      </Card>
      <Card>
        <Section title="Progresso"><ProgressBar value={62}/></Section>
      </Card>
      <Card>
        <Section title="Revisão da IA" subtitle="Sugestões para a próxima semana"></Section>
      </Card>
    </div>
  )
}

export function Saude(){
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Suplementação" subtitle="Plano diário e registo de toma"></Section>
      </Card>
      <Card>
        <Section title="Treino e Água" subtitle="Registo rápido"></Section>
      </Card>
      <Card>
        <Section title="IA de Saúde" subtitle="Recomendações personalizadas"></Section>
      </Card>
    </div>
  )
}

export function Alimentacao(){
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Planeamento semanal"></Section>
      </Card>
      <Card>
        <Section title="Lista de compras"></Section>
      </Card>
      <Card>
        <Section title="IA de Refeições" subtitle="Menus ajustados ao objetivo"></Section>
      </Card>
    </div>
  )
}

export function Casa(){
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Manutenção da casa"></Section>
      </Card>
      <Card>
        <Section title="Tarefas familiares"></Section>
      </Card>
      <Card>
        <Section title="Documentos e lembretes"></Section>
      </Card>
    </div>
  )
}

export function Contactos(){
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Lista de contactos"></Section>
      </Card>
      <Card>
        <Section title="Aniversários"></Section>
      </Card>
      <Card>
        <Section title="Mensagens com IA"></Section>
      </Card>
    </div>
  )
}

export function Notas(){
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Notas rápidas"></Section>
      </Card>
      <Card>
        <Section title="Diário de gratidão"></Section>
      </Card>
      <Card>
        <Section title="IA de notas" subtitle="Transforma ideias em planos"></Section>
      </Card>
    </div>
  )
}

export function CentroIA(){
  const [result, setResult] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [prompt, setPrompt] = React.useState('Organiza a minha semana')
  const u = getUser()
  async function run(){
    if(!u) return
    setLoading(true)
    try {
      const r = await api.post('/ai/center', { user_id: u.user_id, prompt })
      setResult(r)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Assistente Central">
          <div className="space-y-2">
            <input value={prompt} onChange={e=>setPrompt(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"/>
            <button onClick={run} className="bg-[#1A3CFF] hover:bg-[#1430cc] rounded-lg px-3 py-2 text-sm">Executar</button>
          </div>
        </Section>
      </Card>
      <Card>
        <Section title="Resultado">
          <pre className="text-xs whitespace-pre-wrap text-white/80">{loading? 'A pensar...' : JSON.stringify(result, null, 2)}</pre>
        </Section>
      </Card>
      <Card>
        <Section title="Sugestões rápidas">
          <div className="grid gap-2">
            {["Organiza a minha semana","Cria o meu plano alimentar","Reformula as minhas prioridades","Faz a revisão mensal dos meus objetivos"].map(s=> (
              <button key={s} onClick={()=>setPrompt(s)} className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm">{s}</button>
            ))}
          </div>
        </Section>
      </Card>
    </div>
  )
}
