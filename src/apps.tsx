import React from 'react'
import { ArrowLeft, ArrowRight, Download, ExternalLink, Image as ImageIcon, Mail, FileText, MapPin } from 'lucide-react'
import { FaGithub as Github, FaLinkedin as Linkedin, FaInstagram as Instagram } from 'react-icons/fa'
import Logo from './Logo'

/* =====================================================================
   EDIT ME
   - Resume: put your PDF at  public/resume/akul_mittal_resume.pdf
   - Photos: put images in    public/gallery/  and add them to GALLERY
   ===================================================================== */
export const RESUME_URL = '/resume/akul_mittal_resume.pdf'
type Photo = { src?: string; caption: string; album: string }
const GALLERY: Photo[] = [
  {
    src: '/gallery/shoes.jpg',
    caption: 'Random memories',
    album: 'Memories',
  },
  {
    src: '/gallery/bowling.jpg',
    caption: 'Bowling night',
    album: 'College',
  },
  {
    src: '/gallery/dsa.jpg',
    caption: 'Late night coding',
    album: 'Projects',
  },
  {
    src: '/gallery/waterfall.jpg',
    caption: 'Exploring',
    album: 'Travel',
  },
  {
    src: '/gallery/aws-workshop.jpg',
    caption: 'AWS workshop',
    album: 'Events',
  },
]

export const LINKS = {
  email: 'akumittal07@gmail.com',
  github: 'https://github.com/akumittal',
  linkedin: 'https://linkedin.com/in/akul-mittal-90690370',
  instagram: 'https://instagram.com/iwontgiveyoumyinsta',
}
export const MAILTO = `mailto:${LINKS.email}?subject=${encodeURIComponent("Let's build something")}`

const Tags = ({ t }: { t: string[] }) => <div className="tags">{t.map(x => <span className="tag" key={x}>{x}</span>)}</div>

/* ------------------------------ ABOUT ------------------------------ */
export function About() {
  return (
    <div className="prose">
      <div className="eyebrow">About</div>
      <h2>Ayooh! I'm Akul.</h2>
      <p>I'm a Computer Science student who likes building things, breaking things, figuring out why they broke, and then probably rebuilding them again.</p>
      <p>I'm doing my B.Tech in CSE at PES University in Bengaluru. I'm into software engineering, AI/ML, computer vision, systems and cloud. Basically anything that makes me wonder how it works underneath.</p>
      <p>A lot of my learning has happened at hackathons: new teams, ridiculous deadlines, and the prototype somehow always working five minutes before submission. I also go to AWS events and workshops, and I've been slowly finding my way around the cloud.</p>
      <p>Right now I'm strengthening my fundamentals in C and DSA, and learning Operating Systems, Computer Networks and Digital Logic. I want to become a genuinely good software engineer.</p>
      <p className="soft">Outside of code: badminton, COD Mobile, music, thrillers, movies, and exploring new places.</p>
    </div>
  )
}

/* ------------------------------ PROJECTS ------------------------------ */
type Proj = { id: string; name: string; alt?: string; label: string; line: string; body: string[]; tech: string[]; accent: string }
const PROJECTS: Proj[] = [
  { id: 'equizent', name: 'Equizent', alt: 'MeetMid', label: 'Featured · Built', accent: '#ffb45e',
    line: 'A geospatial meeting-point platform that helps groups find a practical and fair place to meet.',
    body: [
      "A geospatial meeting-point platform that helps groups find a practical and fair place to meet, so one person doesn't end up travelling forever.",
      "It takes everyone's location and uses routing and travel-time data to rank places. The scoring looks at maximum travel time, average time and how evenly the travel is spread.",
      "This is a properly built, working project: POI search, traffic-aware routing, place filters, scheduling and an interactive map.",
    ],
    tech: ['Geoapify', 'TomTom', 'OpenStreetMap', 'Leaflet', 'Routing / distance APIs'] },
  { id: 'drishti', name: 'DRISHTI', alt: 'Sonar-Drishti', label: 'AI · Edge', accent: '#8fb8ff',
    line: 'Underwater marine-debris and anomaly detection from side-scan sonar imagery.',
    body: [
      'An AI-powered system for detecting marine debris and underwater anomalies in side-scan sonar imagery.',
      'The focus is finding objects under the water and running inference efficiently on edge hardware.',
    ],
    tech: ['Python', 'YOLO', 'OpenCV', 'ONNX Runtime', 'PyTorch (development)', 'Edge inference'] },
  { id: 'imgproc', name: 'Image Processing', label: 'Computer Vision', accent: '#e7a6c8',
    line: 'An interactive image editor with filters, effects and undo/redo.',
    body: [
      'A GUI image editor for transforming images interactively: grayscale, sketch, cartoonify, filters, cropping, and undo/redo.',
      'Built as a team project with modular code and version control.',
    ],
    tech: ['Python', 'OpenCV', 'Image processing', 'Image analysis'] },
  { id: 'jal', name: 'JalDrishti', alt: 'SatVision', label: 'Satellite imagery', accent: '#9fd6e8',
    line: 'A satellite-imagery project focused on water bodies.',
    body: ['A satellite-imagery project focused on water bodies. More details soon.'],
    tech: ['Computer vision', 'Python'] },
]

export function Projects() {
  const [open, setOpen] = React.useState<Proj | null>(null)
  if (open) return (
    <div className="prose fade" style={{ ['--acc' as string]: open.accent }}>
      <button className="link-btn" onClick={() => setOpen(null)}><ArrowLeft size={14} />Projects</button>
      <div className="eyebrow" style={{ color: open.accent, marginTop: 22 }}>{open.label}</div>
      <h2>{open.name}{open.alt && <span className="alt"> / {open.alt}</span>}</h2>
      {open.body.map((b, i) => <p key={i}>{b}</p>)}
      <div className="eyebrow" style={{ marginTop: 28 }}>Stack</div>
      <Tags t={open.tech} />
    </div>
  )
  const [f, ...rest] = PROJECTS
  return (
    <div className="prose">
      <div className="eyebrow">Projects</div>
      <h2>Things I've built.</h2>
      <button className="feature" style={{ ['--acc' as string]: f.accent }} onClick={() => setOpen(f)}>
        <div className="eyebrow" style={{ color: f.accent }}>{f.label}</div>
        <div className="feature-t">{f.name} <span className="alt">/ {f.alt}</span></div>
        <p>{f.line}</p>
        <span className="open">Open project <ArrowRight size={14} /></span>
      </button>
      <div className="plist">
        {rest.map(p => (
          <button key={p.id} className="prow" style={{ ['--acc' as string]: p.accent }} onClick={() => setOpen(p)}>
            <span className="pdot" />
            <span className="pname">{p.name}{p.alt && <span className="alt"> / {p.alt}</span>}</span>
            <span className="pline">{p.line}</span>
            <ArrowRight size={14} className="parr" />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------ EXPERIENCE ------------------------------ */
export function Experience() {
  const items = [
    ['2025 — Present', 'PES University', 'B.Tech Computer Science Engineering · Bengaluru'],
    ['Ongoing', 'Hackathons', 'Participated in multiple hackathons and technical competitions. This is where I learned to build fast with a team.'],
    ['Ongoing', 'AWS', 'Attended various AWS events and workshops.'],
    ['', 'NASSCOM × IBM Bootcamp', ''],
    ['', 'AWS Nexus', 'Part of the student / community ecosystem.'],
  ]
  return (
    <div className="prose">
      <div className="eyebrow">Experience</div>
      <h2>So far.</h2>
      <div className="xlist">
        {items.map(([d, t, s]) => (
          <div className="xrow" key={t}>
            <div className="xd mono">{d}</div>
            <div><div className="xt">{t}</div>{s && <div className="xs">{s}</div>}</div>
          </div>
        ))}
      </div>
      <div className="eyebrow" style={{ marginTop: 34 }}>Education</div>
      <div className="xlist">
        {[['2025 — Present', 'PES University', 'B.Tech Computer Science Engineering'], ['2023 — 2025', 'The Foundation School', ''], ['2021 — 2023', 'Delhi Public School', '']].map(([d, t, s]) => (
          <div className="xrow" key={t}><div className="xd mono">{d}</div><div><div className="xt">{t}</div>{s && <div className="xs">{s}</div>}</div></div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------ RESUME ------------------------------ */
export function Resume() {
  const [state, setState] = React.useState<'checking' | 'ok' | 'missing'>('checking')
  React.useEffect(() => {
    fetch(RESUME_URL, { method: 'HEAD' })
      .then(r => setState(r.ok && (r.headers.get('content-type') || '').includes('pdf') ? 'ok' : 'missing'))
      .catch(() => setState('missing'))
  }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div><div className="eyebrow">Resume</div><h2 style={{ margin: 0 }}>Akul Mittal</h2></div>
        {state === 'ok' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <a className="btn" href={RESUME_URL} target="_blank" rel="noreferrer"><ExternalLink size={14} />Open resume</a>
            <a className="btn warm" href={RESUME_URL} download="Akul_Mittal_Resume.pdf"><Download size={14} />Download resume</a>
          </div>
        )}
      </div>
      {state === 'ok'
        ? <iframe title="Akul Mittal resume" src={`${RESUME_URL}#view=FitH`} style={{ flex: 1, minHeight: 420, width: '100%', border: '1px solid #ffffff14', borderRadius: 10, background: '#fff' }} />
        : <div className="empty"><FileText size={26} strokeWidth={1.3} /><p>{state === 'checking' ? 'Loading…' : 'My resume will appear here.'}</p></div>}
    </div>
  )
}

/* ------------------------------ GALLERY ------------------------------ */
export function Gallery({ onOpen }: { onOpen: (s: string) => void }) {
  return (
    <div>
      <div className="eyebrow">Gallery</div>
      <h2>Photos</h2>
      <p className="soft" style={{ marginBottom: 22 }}>Coming soon. Still picking the good ones.</p>
      <div className="gallery">
        {GALLERY.map(g => (
          <div className="ph" key={g.caption} onClick={() => g.src && onOpen(g.src)}>
            {g.src ? <img src={g.src} alt={g.caption} /> : <div className="ph-e"><ImageIcon size={18} strokeWidth={1.3} /><span>{g.caption}</span></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------ SIDE QUESTS ------------------------------ */
export function SideQuests() {
  const q = [['Badminton', 'the main one'], ['Call of Duty Mobile', 'reflex practice, apparently'], ['Music', 'always on'], ['Thrillers', "books where I can't guess the ending"], ['Movies', 'anything with a good twist'], ['Exploring', 'new places, new food, new conversations']]
  return (
    <div className="prose">
      <div className="eyebrow">Side Quests</div>
      <h2>Things I enjoy outside coding.</h2>
      <ul className="quests">
        {q.map(([n, d]) => <li key={n}><span className="qn">{n}</span><span className="qd">{d}</span></li>)}
      </ul>
    </div>
  )
}

/* ------------------------------ CONTACT (+ collaborate) ------------------------------ */
export function Contact() {
  const rows = [
    { i: Mail, l: 'Email', v: LINKS.email, h: `mailto:${LINKS.email}` },
    { i: Github, l: 'GitHub', v: 'github.com/akumittal', h: LINKS.github },
    { i: Linkedin, l: 'LinkedIn', v: 'in/akul-mittal-90690370', h: LINKS.linkedin },
    { i: Instagram, l: 'Instagram', v: '@iwontgiveyoumyinsta', h: LINKS.instagram },
  ]
  return (
    <div className="prose">
      <div className="eyebrow">Contact</div>
      <h2>Building something interesting?</h2>
      <p>Need someone for a hackathon, or have a completely ridiculous idea? I'm in.</p>
      <a className="btn warm big" href={MAILTO}>Let's build it <ArrowRight size={15} /></a>
      <div className="clist">
        {rows.map(r => (
          <a key={r.l} href={r.h} target={r.l === 'Email' ? undefined : '_blank'} rel="noreferrer" className="crow">
            <r.i size={15} /><span className="cl">{r.l}</span><span className="cv mono">{r.v}</span>
          </a>
        ))}
      </div>
      <p className="soft" style={{ marginTop: 18 }}><MapPin size={12} style={{ verticalAlign: -1 }} /> Bengaluru, India</p>
    </div>
  )
}

/* ------------------------------ TERMINAL ------------------------------ */

export function TerminalApp({ onOpen }: { onOpen: (id: string) => void }) {
  const PROMPT = 'akul@akul-os ~ %'

  const [lines, setLines] = React.useState<string[]>([
    'Last login: tonight, it was snowing.',
    "Type 'help'.",
    '',
  ])

  const [value, setValue] = React.useState('')
  const [history, setHistory] = React.useState<string[]>([])
  const [historyIndex, setHistoryIndex] = React.useState(-1)

  const inputRef = React.useRef<HTMLInputElement>(null)

  const commands: Record<string, () => string[]> = {
    help: () => [
      'whoami  neofetch  projects  skills  education',
      'interests  music  hackathons  contact  clear',
      '',
      "(there are a few others. you'll find them.)",
    ],

    whoami: () => [
      'Akul Mittal',
      'Computer Science student.',
      'Aspiring software engineer.',
      'Builder.',
      'Professional overthinker.',
    ],

    neofetch: () => [
      'AKUL OS',
      '-------------------------',
      'USER       Akul Mittal',
      'ROLE       Aspiring Software Engineer',
      'HOST       PES University, Bengaluru',
      'LANGUAGE   C / Python',
      'PROJECTS   EQUIZENT / DRISHTI',
      'WEATHER    snowing (always, here)',
      'STATUS     BUILDING',
    ],

    projects: () => [
      'equizent/     fair meeting points. built, works.',
      'drishti/      sonar + YOLO + edge.',
      'imgproc/      filters, sketch, undo.',
      'jaldrishti/   water, from space.',
      '',
      "try 'open projects'",
    ],

    skills: () => [
      'C, Python',
      'DSA · OS · CN · Digital Logic',
      'OpenCV · YOLO · ONNX Runtime · PyTorch',
      'AWS: Cognito, IAM, Lambda, API Gateway, S3, Bedrock',
      'git, vs code, ubuntu/wsl, sqlite',
    ],

    education: () => [
      '2021–2023   Delhi Public School',
      '2023–2025   The Foundation School',
      '2025–now    PES University · B.Tech CSE',
    ],

    interests: () => [
      'badminton',
      'call of duty mobile',
      'music',
      'thrillers',
      'movies',
      'exploring',
    ],

    music: () => [
      '♪ last played: Phir Kabhi — Arijit Singh',
      '  (on repeat. do not ask how many times.)',
    ],

    hackathons: () => [
      'many. no sleep. always a demo.',
      'lesson learned: it works 5 minutes before the deadline.',
    ],

    contact: () => [
      `email      ${LINKS.email}`,
      'github     github.com/akumittal',
      'linkedin   in/akul-mittal-90690370',
      'instagram  @iwontgiveyoumyinsta',
    ],

    coffee: () => [
      '████████████████████ 100%',
    ],

    secret: () => [
      'There is no secret.',
    ],

    'secret --force': () => [
      'Fine. I like overengineering things.',
    ],

    ls: () => [
      'projects/  side_quests/  resume.pdf  .snow',
    ],

    'cat .snow': () => [
      '*  .  *   .  *',
      '  .   *  .    .',
      'it has been snowing since the site loaded.',
    ],

    weather: () => [
      'outside: -4°C, snowing',
      'inside: warm, one lamp on, laptop fan loud',
    ],

    sleep: () => [
      'sleep: command not found',
    ],

    exit: () => [
      "you can't leave. it's snowing.",
    ],

    vim: () => [
      'nope. I still google how to exit.',
    ],

    hello: () => [
      'ayooh.',
    ],

    'rm -rf /': () => [
      'nice try. the cabin stays.',
    ],
  }

  const runCommand = (raw: string) => {
    const command = raw.trim()

    if (!command) {
      setLines(previous => [
        ...previous,
        `${PROMPT} `,
      ])
      return
    }

    setHistory(previous => [...previous, command])
    setHistoryIndex(-1)

    if (command === 'clear') {
      setLines([])
      return
    }

    let output: string[] = []

    if (command.startsWith('open ')) {
      const target = command.slice(5).trim()
      onOpen(target)
    } else if (command.startsWith('sudo') && !commands[command]) {
      output = [
        'akul is not in the sudoers file. this incident will be reported.',
      ]
    } else {
      output =
        commands[command]?.() ??
        [`zsh: command not found: ${command}`]
    }

    setLines(previous => [
      ...previous,
      `${PROMPT} ${command}`,
      ...output,
    ])
  }

  return (
    <div
      className="term"
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, index) => (
        <div key={index}>
          {line.startsWith(PROMPT) ? (
            <>
              <span className="pr">{PROMPT}</span>
              {line.slice(PROMPT.length)}
            </>
          ) : (
            line || '\u00a0'
          )}
        </div>
      ))}

      <div>
        <span className="pr">{PROMPT}</span>{' '}

        <input
          ref={inputRef}
          value={value}
          spellCheck={false}
          aria-label="Terminal input"
          onChange={event => setValue(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              runCommand(value)
              setValue('')
            }

            if (event.key === 'ArrowUp' && history.length > 0) {
              event.preventDefault()

              const nextIndex =
                historyIndex < 0
                  ? history.length - 1
                  : Math.max(0, historyIndex - 1)

              setHistoryIndex(nextIndex)
              setValue(history[nextIndex])
            }

            if (event.key === 'ArrowDown' && historyIndex >= 0) {
              event.preventDefault()

              const nextIndex = historyIndex + 1

              if (nextIndex >= history.length) {
                setHistoryIndex(-1)
                setValue('')
              } else {
                setHistoryIndex(nextIndex)
                setValue(history[nextIndex])
              }
            }
          }}
        />
      </div>
    </div>
  )
}

/* ------------------------------ SETTINGS ------------------------------ */
export function SettingsApp({ snow, setSnow }: { snow: number; setSnow: (n: number) => void }) {
  return (
    <div className="prose">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><Logo size={44} /><div><h2 style={{ margin: 0 }}>AKUL OS</h2><div className="soft mono" style={{ fontSize: 12 }}>winter build</div></div></div>
      <div className="eyebrow" style={{ marginTop: 30 }}>Snowfall</div>
      <div className="seg">
        {[['Light', 0.4], ['Normal', 1], ['Off', 0]].map(([l, n]) => (
          <button key={l as string} className={snow === n ? 'on' : ''} onClick={() => setSnow(n as number)}>{l}</button>
        ))}
      </div>
      <div className="eyebrow" style={{ marginTop: 30 }}>About this computer</div>
      <div className="mono soft" style={{ fontSize: 12, lineHeight: 2 }}>
        user ....... Akul Mittal<br />host ....... PES University, Bengaluru<br />location ... a cabin, apparently<br />weather .... snowing
      </div>
    </div>
  )
}
