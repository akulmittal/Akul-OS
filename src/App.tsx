import React from 'react'
import { User, Rocket, Briefcase, FileText, Image as ImageIcon, Compass, Terminal, Mail, Settings, Wifi, Play, Pause } from 'lucide-react'
import { FaInstagram as Instagram } from 'react-icons/fa'
import bird from '/assets/attachments/image.png'
import Wallpaper from './Wallpaper'
import Logo from './Logo'
import { About, Projects, Experience, Resume, Gallery, SideQuests, Contact, TerminalApp, SettingsApp, LINKS } from './apps'

type AppId = 'about' | 'projects' | 'experience' | 'resume' | 'gallery' | 'sidequests' | 'terminal' | 'contact' | 'settings'

const APPS: { id: AppId; name: string; icon: React.ElementType; w: number; h: number }[] = [
  { id: 'about', name: 'About', icon: User, w: 620, h: 560 },
  { id: 'projects', name: 'Projects', icon: Rocket, w: 700, h: 600 },
  { id: 'experience', name: 'Experience', icon: Briefcase, w: 600, h: 600 },
  { id: 'resume', name: 'Resume', icon: FileText, w: 760, h: 680 },
  { id: 'gallery', name: 'Gallery', icon: ImageIcon, w: 680, h: 540 },
  { id: 'sidequests', name: 'Side Quests', icon: Compass, w: 560, h: 560 },
  { id: 'terminal', name: 'Terminal', icon: Terminal, w: 640, h: 420 },
  { id: 'contact', name: 'Contact', icon: Mail, w: 520, h: 560 },
  { id: 'settings', name: 'Settings', icon: Settings, w: 460, h: 440 },
]
const ALIASES: Record<string, AppId> = { cv: 'resume', photos: 'gallery', quests: 'sidequests', 'side-quests': 'sidequests', side_quests: 'sidequests', collaborate: 'contact', education: 'experience' }

const BOOT_LINES = ['loading environment...', 'loading projects...', 'loading personality...', 'loading side quests...']

/* ------------------------------ Boot ------------------------------ */
function Boot({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const [stage, setStage] = React.useState(0) // 0 black · 1 bird · 2 text/lines · 3 online · 4 fade
  const [n, setN] = React.useState(0)
  React.useEffect(() => { const ts = [setTimeout(() => setStage(1), 500), setTimeout(() => setStage(2), 2000)]; return () => ts.forEach(clearTimeout) }, [])
  React.useEffect(() => {
    if (stage !== 2) return
    if (n < BOOT_LINES.length) { const t = setTimeout(() => setN(n + 1), 480); return () => clearTimeout(t) }
    const t = setTimeout(() => setStage(3), 500); return () => clearTimeout(t)
  }, [stage, n])
  React.useEffect(() => {
    if (stage === 3) { const t = setTimeout(() => setStage(4), 1100); return () => clearTimeout(t) }
    if (stage === 4) { onReveal(); const t = setTimeout(onDone, 1600); return () => clearTimeout(t) }
  }, [stage, onDone, onReveal])
  return (
    <div className={`boot ${stage === 4 ? 'out' : ''}`} onClick={() => setStage(4)}>
      <div className={`boot-bird ${stage >= 1 ? 'in' : ''}`}><img src={bird} alt="AKUL OS" /></div>
      <div className="boot-ui" style={{ opacity: stage >= 2 ? 1 : 0 }}>
        <div className="boot-title">AKUL OS</div>
        <div className="boot-status mono">{stage >= 3 ? <span className="online-t">AKUL OS // ONLINE</span> : 'INITIALIZING...'}</div>
        <div className="boot-lines mono">{BOOT_LINES.map((l, i) => <div key={l} style={{ opacity: i < n ? 1 : 0 }}>{l}</div>)}</div>
      </div>
    </div>
  )
}

/* ------------------------------ App ------------------------------ */
export default function App() {
  const [revealed, setRevealed] = React.useState(false)
  const [bootGone, setBootGone] = React.useState(false)
  const [active, setActive] = React.useState<AppId | null>(null)
  const [shown, setShown] = React.useState<AppId | null>(null)
  const [leaving, setLeaving] = React.useState(false)
  const [max, setMax] = React.useState(false)
  const [pos, setPos] = React.useState({ x: 0, y: 0 })
  const [lightbox, setLightbox] = React.useState<string | null>(null)
  const [playing, setPlaying] = React.useState(false)
  const [snow, setSnow] = React.useState(1)
  const [now, setNow] = React.useState(new Date())
  const [dockX, setDockX] = React.useState<number | null>(null)
  const dockRef = React.useRef<HTMLDivElement>(null)
  const reveal = React.useCallback(() => setRevealed(true), [])
  const finish = React.useCallback(() => setBootGone(true), [])

  React.useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000 * 15); return () => clearInterval(t) }, [])

  // One window at a time: fade the current one out, then bring the next one in.
  React.useEffect(() => {
    if (active === shown) return
    if (shown) {
      setLeaving(true)
      const t = setTimeout(() => { setLeaving(false); setShown(active); center(active) }, 220)
      return () => clearTimeout(t)
    }
    setShown(active); center(active)
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  const center = (id: AppId | null) => {
    if (!id) return
    const a = APPS.find(x => x.id === id)!
    const w = Math.min(a.w, window.innerWidth - 40), h = Math.min(a.h, window.innerHeight - 150)
    setPos({ x: (window.innerWidth - w) / 2, y: Math.max(44, (window.innerHeight - h) / 2 - 30) }); setMax(false)
  }

  const open = React.useCallback((raw: string) => {
    const k = raw.toLowerCase().trim().replace(/\s+/g, '')
    const id = ALIASES[k] || APPS.find(a => a.id === k || a.name.toLowerCase().replace(/\s+/g, '') === k)?.id
    if (id) setActive(id)
  }, [])

  React.useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (lightbox) setLightbox(null); else setActive(null) } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [lightbox])

  const app = shown ? APPS.find(a => a.id === shown)! : null
  const drag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || max || window.innerWidth < 820) return
    const sx = e.clientX - pos.x, sy = e.clientY - pos.y
    const mv = (ev: PointerEvent) => setPos({ x: Math.min(window.innerWidth - 120, Math.max(-200, ev.clientX - sx)), y: Math.max(34, Math.min(window.innerHeight - 80, ev.clientY - sy)) })
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up)
  }

  const render = (id: AppId) => {
    switch (id) {
      case 'about': return <About />
      case 'projects': return <Projects />
      case 'experience': return <Experience />
      case 'resume': return <Resume />
      case 'gallery': return <Gallery onOpen={setLightbox} />
      case 'sidequests': return <SideQuests />
      case 'terminal': return <TerminalApp onOpen={open} />
      case 'contact': return <Contact />
      case 'settings': return <SettingsApp snow={snow} setSnow={setSnow} />
    }
  }

  const scale = (i: number) => {
    if (dockX === null || !dockRef.current) return 1
    const el = dockRef.current.children[i] as HTMLElement | undefined
    if (!el) return 1
    const r = el.getBoundingClientRect()
    return 1 + Math.max(0, 1 - Math.abs(dockX - (r.left + r.width / 2)) / 110) * 0.28
  }

  const date = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }).toUpperCase()

  return (
    <div className="app-shell">
      <div className={`world ${revealed ? 'on' : ''}`}><Wallpaper snow={snow} /></div>
      {!bootGone && <Boot onReveal={reveal} onDone={finish} />}

      <div className={`desktop ${revealed ? 'on' : ''}`}>
        <header className="menubar">
          <div className="left">
            <button className="brand" onClick={() => open('settings')}><Logo size={16} /><span>AKUL OS</span></button>
            {(['projects', 'resume', 'terminal', 'contact'] as AppId[]).map(id => (
              <button key={id} className={`item ${active === id ? 'on' : ''}`} onClick={() => open(id)}>{APPS.find(a => a.id === id)!.name}</button>
            ))}
          </div>
          <div className="right">
            <span className="online mono"><i />ONLINE</span>
            <Wifi size={14} strokeWidth={1.8} />
            <span className="clock">{date}&nbsp;&nbsp;{time}</span>
          </div>
        </header>

        <main className={`hero ${shown ? 'dim' : ''}`}>
          <h1 className="name" aria-label="Akul Mittal">
            {'Akul Mittal'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${0.35 + i * 0.07}s` }}>{c === ' ' ? '\u00a0' : c}</span>)}
          </h1>
          <div className="hindi" lang="hi">अकुल मित्तल</div>
          <div className="role">Aspiring Software Engineer · Builder · Computer Science Student</div>
        </main>

        <aside className={`widgets ${shown ? 'dim' : ''}`}>
          <div className={`w music ${playing ? 'playing' : ''}`}>
            <div className="w-art" />
            <div className="w-txt">
              <div className="w-k">LAST PLAYED</div>
              <div className="w-t">Phir Kabhi</div>
              <div className="w-s">Arijit Singh</div>
            </div>
            <div className="eq" aria-hidden="true">{[0, 1, 2, 3].map(i => <span key={i} style={{ animationDelay: `${-i * 0.27}s` }} />)}</div>
            <button className="w-play" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={12} /> : <Play size={12} />}</button>
          </div>
          <a className="w insta" href={LINKS.instagram} target="_blank" rel="noreferrer">
            <Instagram size={15} />
            <div className="w-txt"><div className="w-k">INSTAGRAM</div><div className="w-h mono">@iwontgiveyoumyinsta</div></div>
          </a>
        </aside>

        {shown && app && (
          <section key={shown} className={`win ${max ? 'max' : ''} ${leaving ? 'leaving' : ''}`}
            style={{ left: pos.x, top: pos.y, width: Math.min(app.w, window.innerWidth - 40), height: Math.min(app.h, window.innerHeight - 150) }}>
            <div className="titlebar" onPointerDown={drag} onDoubleClick={() => setMax(!max)}>
              <div className="lights">
                <button className="r" onClick={() => setActive(null)} aria-label="Close" />
                <button className="y" onClick={() => setActive(null)} aria-label="Minimize" />
                <button className="g" onClick={() => setMax(!max)} aria-label="Maximize" />
              </div>
              <div className="t">{app.name}</div>
              <Logo size={13} />
            </div>
            <div className={`win-body ${shown === 'terminal' ? 'flush' : ''}`}>{render(shown)}</div>
          </section>
        )}

        <nav className="dock-wrap">
          <div className="dock" ref={dockRef} onPointerMove={e => e.pointerType === 'mouse' && setDockX(e.clientX)} onPointerLeave={() => setDockX(null)}>
            {APPS.map((a, i) => (
              <button key={a.id} className={`dock-btn ${a.id === 'terminal' ? 'sep' : ''} ${active === a.id ? 'active' : ''}`} style={{ ['--s' as string]: scale(i) }} onClick={() => setActive(active === a.id ? null : a.id)} aria-label={a.name}>
                <span className="face"><a.icon size={19} strokeWidth={1.6} /></span>
                <span className="tip">{a.name}</span>
                <span className="dot" />
              </button>
            ))}
          </div>
        </nav>
      </div>

      {lightbox && <div className="lightbox" onClick={() => setLightbox(null)}><img src={lightbox} alt="" /></div>}
    </div>
  )
}
