import React from 'react'
import { motion } from 'framer-motion'
import { Card, Section, ProgressBar, EnergyIndicator } from './UI'
import { api, getUser } from '../lib/api'

// Hook for browser Voice-to-Text using Web Speech API
function useSpeechRecognition(onText){
  const [recording, setRecording] = React.useState(false)
  const recRef = React.useRef(null)
  const start = React.useCallback(()=>{
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if(!SR){
      alert('Reconhecimento de voz não suportado neste navegador.')
      return
    }
    const rec = new SR()
    rec.lang = 'pt-PT'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e)=>{
      const text = e.results?.[0]?.[0]?.transcript
      if(text && onText) onText(text)
    }
    rec.onend = ()=> setRecording(false)
    rec.onerror = ()=> setRecording(false)
    rec.start()
    recRef.current = rec
    setRecording(true)
  }, [onText])
  const stop = React.useCallback(()=>{
    try{ recRef.current?.stop() }catch{}
    setRecording(false)
  }, [])
  return { recording, start, stop }
}

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

function MonthCalendar({ events, onDropEvent }){
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const first = new Date(year, month, 1)
  const startDay = first.getDay() || 7 // make Monday=1..Sunday=7
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const totalCells = 42
  const cells = []
  let d = 1 - (startDay-1)
  for(let i=0;i<totalCells;i++){
    const dateObj = new Date(year, month, d)
    const inMonth = dateObj.getMonth()===month
    const dayEvents = events.filter(e=>{
      const sd = new Date(e.start_time)
      return sd.getFullYear()===dateObj.getFullYear() && sd.getMonth()===dateObj.getMonth() && sd.getDate()===dateObj.getDate()
    })
    cells.push({ dateObj, inMonth, dayEvents })
    d++
  }
  function handleDrop(ev, dateObj){
    ev.preventDefault()
    const data = ev.dataTransfer.getData('application/json') || ev.dataTransfer.getData('text/event') || ev.dataTransfer.getData('text')
    if(!data) return
    try{
      const parsed = JSON.parse(data)
      onDropEvent?.(parsed, dateObj)
    }catch{}
  }
  return (
    <div className="grid grid-cols-7 gap-2">
      {cells.map((c,idx)=> (
        <div key={idx}
          onDragOver={e=>e.preventDefault()}
          onDrop={e=>handleDrop(e, c.dateObj)}
          className={`min-h-[90px] rounded-lg border ${c.inMonth? 'border-white/10 bg-white/[0.04]':'border-white/[0.06] bg-white/[0.02]'} p-2`}>
          <div className="text-xs text-white/60 mb-1">{c.dateObj.getDate()}</div>
          <div className="space-y-1">
            {c.dayEvents.slice(0,3).map((e,i)=> (
              <div key={i} className="text-[11px] truncate bg-[#1A3CFF]/20 border border-[#1A3CFF]/30 rounded px-2 py-0.5">{e.title}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function Agenda(){
  const [events, setEvents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [iaPlan, setIaPlan] = React.useState(null)
  const u = getUser()
  const load = React.useCallback(()=>{
    if(!u) return
    setLoading(true)
    api.get('/events', { user_id: u.user_id })
      .then(setEvents)
      .catch(()=>{})
      .finally(()=>setLoading(false))
  },[u])
  React.useEffect(()=>{ load() }, [load])

  async function updateEventDate(payload, dateObj){
    // keep original time + duration
    const ev = events.find(e=> String(e._id)===String(payload.id))
    if(!ev) return
    const start = new Date(ev.start_time)
    const end = new Date(ev.end_time)
    const duration = end.getTime() - start.getTime()
    const newStart = new Date(dateObj)
    newStart.setHours(start.getHours(), start.getMinutes(), 0, 0)
    const newEnd = new Date(newStart.getTime() + duration)
    await api.patch(`/events/${payload.id}` , { start_time: newStart.toISOString(), end_time: newEnd.toISOString() })
    load()
  }

  async function generateWeeklyPlan(){
    if(!u) return
    const r = await api.post('/ai/weekly-plan', { user_id: u.user_id })
    setIaPlan(r)
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Agenda Semanal" subtitle="Compromissos e blocos de foco">
          {loading? <div className="text-white/60">A carregar…</div> : (
            <div className="grid gap-2">
              {events.slice(0,10).map((e,i)=> (
                <motion.div key={i} draggable onDragStart={(ev)=>{
                    ev.dataTransfer.setData('application/json', JSON.stringify({ id: e._id }))
                    ev.dataTransfer.effectAllowed = 'move'
                  }} whileHover={{x:4}} className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 cursor-grab">
                  <div className="font-medium">{e.title}</div>
                  <div className="text-white/60">{new Date(e.start_time).toLocaleString()}</div>
                </motion.div>
              ))}
              {events.length===0 && <div className="text-white/60">Sem eventos ainda.</div>}
            </div>
          )}
        </Section>
      </Card>
      <Card>
        <Section title="Agenda Mensal" subtitle="Arrasta eventos para mover o dia" right={<button onClick={generateWeeklyPlan} className="text-xs bg-[#1A3CFF] hover:bg-[#1430cc] rounded px-2 py-1">Plano semanal (IA)</button>}>
          <MonthCalendar events={events} onDropEvent={updateEventDate} />
        </Section>
      </Card>
      <Card>
        <Section title="IA de Agenda" subtitle="Plano sugerido">
          <pre className="text-xs whitespace-pre-wrap text-white/80">{iaPlan? JSON.stringify(iaPlan, null, 2): 'Clica em "Plano semanal (IA)" para gerar.'}</pre>
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
  const [aiOrder, setAiOrder] = React.useState(null)

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

  async function prioritize(){
    if(!u) return
    const r = await api.post('/ai/prioritize', { user_id: u.user_id })
    setAiOrder(r)
  }

  const { recording, start: startRec, stop: stopRec } = useSpeechRecognition(text=> setTitle(t=> (t? t+" ":"") + text))

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Adicionar Tarefa" subtitle="Etiquetas, prioridade e data limite" right={
          <button onClick={prioritize} className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 rounded px-2 py-1">Priorizar com IA</button>
        }>
          <div className="flex gap-2">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Rever proposta X" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"/>
            <button onClick={addTask} disabled={saving} className={`rounded-lg px-3 py-2 text-sm ${saving? 'bg-[#1A3CFF]/60 cursor-not-allowed':'bg-[#1A3CFF] hover:bg-[#1430cc]'}`}>Adicionar</button>
          </div>
          <div className="mt-2">
            <button onClick={recording? stopRec : startRec} className={`text-xs rounded px-2 py-1 border border-white/10 ${recording? 'bg-red-500/40':'bg-white/10 hover:bg-white/20'}`}>{recording? 'Parar voz':'Adicionar por voz'}</button>
          </div>
        </Section>
      </Card>
      <Card>
        <Section title="Lista de Tarefas">
          {loading? <div className="text-white/60">A carregar…</div> : (
            <div className="grid gap-2">
              {(aiOrder?.suggested_order || tasks).map((t,i)=> (
                <motion.div key={t._id || i} whileHover={{x:4}} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div>
                    <div className="text-sm font-medium">{t.title}</div>
                    {t.due_date && <div className="text-xs text-white/60">Limite: {new Date(t.due_date).toLocaleDateString()}</div>}
                  </div>
                  <span className="text-xs text-white/60">{t.priority || '—'}</span>
                </motion.div>
              ))}
              {(tasks.length===0) && <div className="text-white/60">Sem tarefas ainda.</div>}
            </div>
          )}
        </Section>
      </Card>
      <Card>
        <Section title="Sugestões da IA" subtitle="3 prioridades do dia">
          <ul className="text-sm space-y-1">
            {aiOrder?.suggested_order ? aiOrder.suggested_order.slice(0,3).map((t,i)=> (
              <li key={i} className="flex gap-2"><span className="text-[#1A3CFF]">•</span>{t.title}</li>
            )) : ['Finalizar proposta', 'Preparar reunião', 'Treino 45min'].map((s,i)=> (<li key={i} className="flex gap-2"><span className="text-[#1A3CFF]">•</span>{s}</li>))}
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
  const [review, setReview] = React.useState(null)
  React.useEffect(()=>{
    if(!u) return
    api.get('/goals', { user_id: u.user_id })
      .then(setGoals)
      .catch(()=>{})
      .finally(()=>setLoading(false))
  },[])
  const overall = goals.length? Math.round(goals.reduce((a,g)=>a+Number(g.progress||0),0)/goals.length) : 0
  async function runReview(){
    if(!u) return
    const r = await api.post('/ai/goals-review', { user_id: u.user_id })
    setReview(r)
  }
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card>
        <Section title="Objetivos" subtitle="Anuais, trimestrais, mensais e semanais" right={<button onClick={runReview} className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 rounded px-2 py-1">Revisão IA</button>}>
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
          <pre className="text-xs whitespace-pre-wrap text-white/80">{review? JSON.stringify(review, null, 2): 'Clica em "Revisão IA" para gerar recomendações.'}</pre>
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
  const { recording, start: startRec, stop: stopRec } = useSpeechRecognition(text=> setContent(c => (c? c+"\n":"") + text))

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
        <Section title="Notas rápidas" right={
          <button onClick={recording? stopRec : startRec} className={`text-xs rounded px-2 py-1 border border-white/10 ${recording? 'bg-red-500/40':'bg-white/10 hover:bg-white/20'}`}>{recording? 'Parar voz':'Ditado por voz'}</button>
        }>
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
