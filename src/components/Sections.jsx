import React from 'react'
import { motion } from 'framer-motion'
import { Card, Section, ProgressBar, EnergyIndicator } from './UI'
import { api, getUser } from '../lib/api'

export function Dashboard(){
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  React.useEffect(()=>{
    const u = getUser()
    if(!u) return
    api.get('/dashboard', { user_id: u.user_id })
      .then(setData)
      .catch(()=>{})
      .finally(()=>setLoading(false))
  },[])
  if(loading) return <div className="text-white/60">A carregar...</div>
  if(!data) return <div className="text-white/60">Sem dados ainda.</div>
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
                <span className="text-xs text-white/50">{t.priority}</span>
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
  const [events, setEvents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  React.useEffect(()=>{
    const u = getUser(); if(!u) return
    api.get('/events', { user_id: u.user_id })
      .then(setEvents)
      .catch(()=>{})
      .finally(()=>setLoading(false))
  },[])
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Agenda Semanal" subtitle="Compromissos e blocos de foco">
          {loading? <div className="text-white/60">A carregar…</div> : (
            <div className="grid gap-2">
              {events.slice(0,10).map((e,i)=> (
                <div key={i} className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div className="font-medium">{e.title}</div>
                  <div className="text-white/60">{new Date(e.start_time).toLocaleString()}</div>
                </div>
              ))}
              {events.length===0 && <div className="text-white/60">Sem eventos ainda.</div>}
            </div>
          )}
        </Section>
      </Card>
      <Card>
        <Section title="Agenda Mensal" subtitle="Visão macro">
          <div className="text-white/60 text-sm">Em breve: calendário interativo com drag-and-drop.</div>
        </Section>
      </Card>
      <Card>
        <Section title="IA de Agenda" subtitle="Reorganiza a semana automaticamente">
          <div className="text-white/60 text-sm">Dá-nos contexto e a IA gera um plano equilibrado.</div>
        </Section>
      </Card>
    </div>
  )
}

export function Tarefas(){
  const u = getUser()
  const [tasks, setTasks] = React.useState([])
  const [title, setTitle] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(()=>{
    if(!u) return
    setLoading(true)
    api.get('/tasks', { user_id: u.user_id })
      .then(setTasks)
      .catch(()=>{})
      .finally(()=>setLoading(false))
  }, [u])

  React.useEffect(()=>{ load() }, [load])

  async function addTask(){
    if(!u || !title.trim()) return
    setSaving(true)
    try{
      await api.post('/tasks', { user_id: u.user_id, title, scope: 'personal', priority: 'medium', completed: false })
      setTitle('')
      load()
    } finally { setSaving(false) }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Adicionar Tarefa" subtitle="Etiquetas, prioridade e data limite">
          <div className="flex gap-2">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Rever proposta X" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"/>
            <button onClick={addTask} disabled={saving} className={`rounded-lg px-3 py-2 text-sm ${saving? 'bg-[#1A3CFF]/60 cursor-not-allowed':'bg-[#1A3CFF] hover:bg-[#1430cc]'}`}>Adicionar</button>
          </div>
        </Section>
      </Card>
      <Card>
        <Section title="Lista de Tarefas">
          {loading? <div className="text-white/60">A carregar…</div> : (
            <div className="grid gap-2">
              {tasks.map((t,i)=> (
                <motion.div key={i} whileHover={{x:4}} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div>
                    <div className="text-sm font-medium">{t.title}</div>
                    {t.due_date && <div className="text-xs text-white/60">Limite: {new Date(t.due_date).toLocaleDateString()}</div>}
                  </div>
                  <span className="text-xs text-white/60">{t.priority}</span>
                </motion.div>
              ))}
              {tasks.length===0 && <div className="text-white/60">Sem tarefas ainda.</div>}
            </div>
          )}
        </Section>
      </Card>
      <Card>
        <Section title="Sugestões da IA" subtitle="3 prioridades do dia">
          <ul className="text-sm space-y-1">
            {['Finalizar proposta', 'Preparar reunião', 'Treino 45min'].map((s,i)=> (<li key={i} className="flex gap-2"><span className="text-[#1A3CFF]">•</span>{s}</li>))}
          </ul>
        </Section>
      </Card>
    </div>
  )
}

export function Objetivos(){
  const u = getUser()
  const [goals, setGoals] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  React.useEffect(()=>{
    if(!u) return
    api.get('/goals', { user_id: u.user_id })
      .then(setGoals)
      .catch(()=>{})
      .finally(()=>setLoading(false))
  },[])
  const overall = goals.length? Math.round(goals.reduce((a,g)=>a+Number(g.progress||0),0)/goals.length) : 0
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Objetivos" subtitle="Anuais, trimestrais, mensais e semanais">
          {loading? <div className="text-white/60">A carregar…</div> : (
            <ul className="space-y-2 text-sm">
              {goals.map((g,i)=> (
                <li key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div className="font-medium">{g.title}</div>
                  <ProgressBar value={g.progress||0} />
                </li>
              ))}
              {goals.length===0 && <div className="text-white/60">Sem objetivos ainda.</div>}
            </ul>
          )}
        </Section>
      </Card>
      <Card>
        <Section title="Progresso">
          <ProgressBar value={overall}/>
          <div className="text-sm text-white/60 mt-2">Progresso médio</div>
        </Section>
      </Card>
      <Card>
        <Section title="Revisão da IA" subtitle="Sugestões para a próxima semana">
          <div className="text-sm text-white/70">Mantém 3 objetivos-chave e cria 2 ações concretas para cada um.</div>
        </Section>
      </Card>
    </div>
  )
}

export function Saude(){
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Suplementação" subtitle="Plano diário e registo de toma">
          <div className="text-white/60 text-sm">Em breve: lembretes e registo automático.</div>
        </Section>
      </Card>
      <Card>
        <Section title="Treino e Água" subtitle="Registo rápido">
          <div className="text-white/60 text-sm">Log simples de água e treinos.</div>
        </Section>
      </Card>
      <Card>
        <Section title="IA de Saúde" subtitle="Recomendações personalizadas">
          <div className="text-white/60 text-sm">Insights de energia e recuperação ao longo da semana.</div>
        </Section>
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
  const u = getUser()
  const [contacts, setContacts] = React.useState([])
  React.useEffect(()=>{
    if(!u) return
    api.get('/contacts', { user_id: u.user_id }).then(setContacts).catch(()=>{})
  },[])
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Lista de contactos">
          <div className="grid gap-2">
            {contacts.map((c,i)=> (
              <div key={i} className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-white/60">{c.email||c.phone||'—'}</div>
                </div>
                {c.birthday && <div className="text-xs text-white/60">🎂 {new Date(c.birthday).toLocaleDateString()}</div>}
              </div>
            ))}
            {contacts.length===0 && <div className="text-white/60">Sem contactos.</div>}
          </div>
        </Section>
      </Card>
      <Card>
        <Section title="Aniversários">
          <div className="text-white/60 text-sm">Em breve: lembretes automáticos e mensagens geradas por IA.</div>
        </Section>
      </Card>
      <Card>
        <Section title="Mensagens com IA">
          <div className="text-white/60 text-sm">Sugestões de mensagens personalizadas.</div>
        </Section>
      </Card>
    </div>
  )
}

export function Notas(){
  const u = getUser()
  const [notes, setNotes] = React.useState([])
  const [title, setTitle] = React.useState('')
  const [content, setContent] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(()=>{
    if(!u) return
    setLoading(true)
    api.get('/notes', { user_id: u.user_id })
      .then(setNotes)
      .catch(()=>{})
      .finally(()=>setLoading(false))
  }, [u])

  React.useEffect(()=>{ load() }, [load])

  async function addNote(){
    if(!u || !title.trim() || !content.trim()) return
    setSaving(true)
    try{
      await api.post('/notes', { user_id: u.user_id, title, content, type: 'note' })
      setTitle(''); setContent('')
      load()
    } finally { setSaving(false) }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Notas rápidas">
          <div className="space-y-2">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"/>
            <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Escreve a tua nota…" rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"/>
            <button onClick={addNote} disabled={saving} className={`rounded-lg px-3 py-2 text-sm ${saving? 'bg-[#1A3CFF]/60 cursor-not-allowed':'bg-[#1A3CFF] hover:bg-[#1430cc]'}`}>Guardar</button>
          </div>
        </Section>
      </Card>
      <Card>
        <Section title="Diário de gratidão">
          <div className="text-white/60 text-sm">Em breve: prompts diários e tracking de humor.</div>
        </Section>
      </Card>
      <Card>
        <Section title="Minhas notas" subtitle="Últimas adicionadas">
          {loading? <div className="text-white/60">A carregar…</div> : (
            <div className="grid gap-2">
              {notes.slice().reverse().map((n,i)=> (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-white/70 whitespace-pre-wrap">{n.content}</div>
                </div>
              ))}
              {notes.length===0 && <div className="text-white/60">Sem notas ainda.</div>}
            </div>
          )}
        </Section>
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
