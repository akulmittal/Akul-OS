import React from 'react'

/* =====================================================================
   AKUL OS — living winter wallpaper
   One canvas. Static scenery is pre-rendered to offscreen layers;
   only stars, light, smoke, fog and snow are animated per frame.
   ===================================================================== */

function rng(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
}

type Layer = { c: HTMLCanvasElement; depth: number }
type Flake = { x: number; y: number; r: number; vy: number; sway: number; ph: number; a: number; layer: number }
type Star = { x: number; y: number; r: number; base: number; sp: number; ph: number; warm: boolean }
type Puff = { x: number; y: number; r: number; life: number; vx: number }

const PAD = 50

export default function Wallpaper({ snow = 1 }: { snow?: number }) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const snowRef = React.useRef(snow); snowRef.current = snow

  React.useEffect(() => {
    const cv = ref.current!
    const ctx = cv.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, raf = 0, running = true
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let layers: Layer[] = []
    let sky: HTMLCanvasElement
    let stars: Star[] = []
    let flakes: Flake[] = []
    let puffs: Puff[] = []
    let cabin = { x: 0, y: 0, s: 1, wins: [] as { x: number; y: number; w: number; h: number }[], chimney: { x: 0, y: 0 } }
    const m = { x: 0, y: 0, sx: 0, sy: 0 }

    const mk = () => { const c = document.createElement('canvas'); c.width = (W + PAD * 2) * dpr; c.height = (H + PAD * 2) * dpr; const g = c.getContext('2d')!; g.setTransform(dpr, 0, 0, dpr, 0, 0); return { c, g } }

    const ridge = (g: CanvasRenderingContext2D, r: () => number, baseY: number, amp: number, rough: number, fill: string | CanvasGradient, snowCap?: string) => {
      const pts: [number, number][] = []
      const w = W + PAD * 2
      let y = baseY
      const peaks = 3 + r() * 3
      const phs = [r() * 6, r() * 6, r() * 6, r() * 6, r() * 6]
      for (let x = 0; x <= w; x += 4) {
        const t = x / w
        let h = 0
        for (let k = 0; k < 4; k++) { const f = Math.pow(2.1, k); h += (1 - Math.abs(Math.sin(t * Math.PI * peaks * f + phs[k]))) * (amp / Math.pow(2.6, k)) }
        y = baseY - h * 0.75 - (r() - 0.5) * rough
        pts.push([x, y])
      }
      g.beginPath(); g.moveTo(0, H + PAD * 2); pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(w, H + PAD * 2); g.closePath()
      g.fillStyle = fill; g.fill()
      if (snowCap) {
        g.save(); g.clip()
        g.strokeStyle = snowCap; g.lineWidth = 2
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y + 1) : g.moveTo(x, y + 1))); g.stroke()
        g.restore()
      }
      return pts
    }

    const pine = (g: CanvasRenderingContext2D, x: number, y: number, h: number, col: string, snowCol?: string) => {
      const w = h * 0.36
      g.fillStyle = col
      for (let i = 0; i < 4; i++) {
        const ty = y - h + (i * h) / 4.4, bw = w * (0.45 + i * 0.2)
        g.beginPath(); g.moveTo(x, ty); g.lineTo(x - bw, ty + h / 2.6); g.lineTo(x + bw, ty + h / 2.6); g.closePath(); g.fill()
        if (snowCol) { g.fillStyle = snowCol; g.beginPath(); g.moveTo(x, ty); g.lineTo(x - bw * 0.5, ty + h / 5.5); g.lineTo(x + bw * 0.5, ty + h / 5.5); g.closePath(); g.fill(); g.fillStyle = col }
      }
      g.fillRect(x - h * 0.03, y - h * 0.08, h * 0.06, h * 0.1)
    }

    const build = () => {
      W = window.innerWidth; H = window.innerHeight
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const r = rng(7)
      const mobile = W < 820

      // Sky
      const s = mk(); sky = s.c
      const sg = s.g.createLinearGradient(0, 0, 0, H + PAD * 2)
      sg.addColorStop(0, '#02030a'); sg.addColorStop(0.45, '#070d1d'); sg.addColorStop(0.72, '#101a31'); sg.addColorStop(1, '#16213a')
      s.g.fillStyle = sg; s.g.fillRect(0, 0, W + PAD * 2, H + PAD * 2)
      // faint violet air near horizon + faint milky band
      const vg = s.g.createRadialGradient(W * 0.3, H * 0.7, 0, W * 0.3, H * 0.7, W * 0.6)
      vg.addColorStop(0, '#3a2f6a22'); vg.addColorStop(1, '#0000')
      s.g.fillStyle = vg; s.g.fillRect(0, 0, W + PAD * 2, H + PAD * 2)
      s.g.save(); s.g.translate(W * 0.5, H * 0.25); s.g.rotate(-0.35)
      const mg = s.g.createLinearGradient(0, -H * 0.12, 0, H * 0.12)
      mg.addColorStop(0, '#0000'); mg.addColorStop(0.5, '#8aa0d80c'); mg.addColorStop(1, '#0000')
      s.g.fillStyle = mg; s.g.fillRect(-W, -H * 0.12, W * 2, H * 0.24); s.g.restore()

      // Stars
      const n = Math.floor((W * H) / 5200)
      stars = Array.from({ length: n }, () => {
        const y = Math.pow(r(), 1.6) * H * 0.62
        return { x: r() * (W + PAD * 2), y, r: r() < 0.93 ? 0.35 + r() * 0.7 : 1 + r() * 0.8, base: 0.25 + r() * 0.6, sp: 0.2 + r() * 1.1, ph: r() * 6.28, warm: r() < 0.12 }
      })
      // a few scattered faint stars in the band
      for (let i = 0; i < 60; i++) stars.push({ x: W * 0.2 + r() * W * 0.7, y: H * 0.05 + r() * H * 0.35, r: 0.3 + r() * 0.3, base: 0.2 + r() * 0.2, sp: 0.3, ph: r() * 6, warm: false })

      layers = []
      // Far mountains
      const far = mk()
      const fg = far.g.createLinearGradient(0, H * 0.45, 0, H)
      fg.addColorStop(0, '#141d36'); fg.addColorStop(1, '#0b1225')
      ridge(far.g, r, H * 0.74, H * 0.16, 1.5, fg, '#c9d6ff22')
      layers.push({ c: far.c, depth: 0.15 })

      // Mid mountains
      const mid = mk()
      const mdg = mid.g.createLinearGradient(0, H * 0.55, 0, H)
      mdg.addColorStop(0, '#131c33'); mdg.addColorStop(1, '#0a1022')
      ridge(mid.g, r, H * 0.82, H * 0.1, 2, mdg, '#dfe8ff1e')
      layers.push({ c: mid.c, depth: 0.3 })

      // Forest line
      const forest = mk()
      const fy = H * 0.82
      forest.g.fillStyle = '#070b17'
      forest.g.fillRect(0, fy, W + PAD * 2, H)
      for (let x = -10; x < W + PAD * 2 + 20; x += 7 + r() * 10) pine(forest.g, x, fy + 6 + r() * 8, 26 + r() * 40, '#060a15', '#9fb3e018')
      layers.push({ c: forest.c, depth: 0.5 })

      // Near: snowy hill + cabin + trees
      const near = mk()
      const g = near.g
      const hillY = H * 0.86
      const cx = (mobile ? W * 0.62 : W * 0.74) + PAD
      const hg = g.createLinearGradient(0, hillY - 40, 0, H + PAD * 2)
      hg.addColorStop(0, '#2a3654'); hg.addColorStop(0.3, '#1a2440'); hg.addColorStop(1, '#0c1226')
      g.fillStyle = hg
      g.beginPath(); g.moveTo(0, H + PAD * 2)
      for (let x = 0; x <= W + PAD * 2; x += 8) {
        const t = x / (W + PAD * 2)
        const bump = Math.exp(-Math.pow((x - cx) / (W * 0.18), 2)) * H * 0.05
        g.lineTo(x, hillY - bump + Math.sin(t * 7) * 6)
      }
      g.lineTo(W + PAD * 2, H + PAD * 2); g.closePath(); g.fill()
      // rim light on snow
      g.strokeStyle = '#b9c8f033'; g.lineWidth = 1.2; g.stroke()

      // Cabin
      const sc = Math.max(0.7, Math.min(1.25, W / 1400))
      const bw = 92 * sc, bh = 54 * sc
      const by = hillY - Math.exp(0) * H * 0.05 + 4
      const bx = cx - bw / 2
      cabin = { x: cx, y: by, s: sc, wins: [], chimney: { x: bx + bw * 0.72, y: by - bh - 34 * sc } }
      // chimney
      g.fillStyle = '#0b0f1c'; g.fillRect(bx + bw * 0.66, by - bh - 34 * sc, 11 * sc, 30 * sc)
      g.fillStyle = '#dfe7ff55'; g.fillRect(bx + bw * 0.66 - 1, by - bh - 36 * sc, 13 * sc, 4 * sc)
      // body
      g.fillStyle = '#0d1120'; g.fillRect(bx, by - bh, bw, bh)
      // logs hint
      g.strokeStyle = '#ffffff08'; g.lineWidth = 1
      for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(bx, by - (bh * i) / 6); g.lineTo(bx + bw, by - (bh * i) / 6); g.stroke() }
      // roof
      g.fillStyle = '#080b16'
      g.beginPath(); g.moveTo(bx - 12 * sc, by - bh + 2); g.lineTo(cx, by - bh - 42 * sc); g.lineTo(bx + bw + 12 * sc, by - bh + 2); g.closePath(); g.fill()
      // snow on roof
      const rg = g.createLinearGradient(0, by - bh - 42 * sc, 0, by - bh)
      rg.addColorStop(0, '#e9efff'); rg.addColorStop(1, '#9fb0d6')
      g.fillStyle = rg
      g.beginPath(); g.moveTo(bx - 14 * sc, by - bh + 2); g.lineTo(cx, by - bh - 44 * sc); g.lineTo(bx + bw + 14 * sc, by - bh + 2)
      g.lineTo(bx + bw + 8 * sc, by - bh + 7 * sc); g.lineTo(cx, by - bh - 34 * sc); g.lineTo(bx - 8 * sc, by - bh + 7 * sc); g.closePath(); g.fill()
      // windows + door
      const wins = [
        { x: bx + 12 * sc, y: by - bh + 16 * sc, w: 18 * sc, h: 16 * sc },
        { x: bx + bw - 30 * sc, y: by - bh + 16 * sc, w: 18 * sc, h: 16 * sc },
        { x: cx - 5 * sc, y: by - bh - 22 * sc, w: 10 * sc, h: 12 * sc },
      ]
      cabin.wins = wins
      wins.forEach(w => { g.fillStyle = '#ffb45e'; g.fillRect(w.x, w.y, w.w, w.h); g.fillStyle = '#3a2410'; g.fillRect(w.x + w.w / 2 - 0.7, w.y, 1.4, w.h); g.fillRect(w.x, w.y + w.h / 2 - 0.7, w.w, 1.4) })
      g.fillStyle = '#1d1410'; g.fillRect(cx - 8 * sc, by - 30 * sc, 16 * sc, 30 * sc)
      g.fillStyle = '#ffcc7a'; g.fillRect(cx - 8 * sc, by - 30 * sc, 2 * sc, 30 * sc)
      // porch lamp
      g.fillStyle = '#ffd89a'; g.beginPath(); g.arc(cx + 13 * sc, by - 32 * sc, 2 * sc, 0, 6.28); g.fill()
      // snow bank at base
      g.fillStyle = '#2a3654'; g.beginPath(); g.ellipse(cx, by + 2, bw * 0.8, 6 * sc, 0, 0, 6.28); g.fill()

      // trees around cabin
      const tr = rng(11)
      const trees = [[-1.25, 78], [-0.95, 56], [1.2, 88], [1.5, 60], [1.75, 70], [-1.6, 64]]
      trees.forEach(([o, h]) => pine(g, cx + o * bw, by + 6 + tr() * 6, h * sc, '#050810', '#cdd9ff40'))
      // scattered near trees at edges
      for (let i = 0; i < 9; i++) { const x = r() < 0.5 ? r() * W * 0.18 : W * 0.9 + r() * W * 0.14; pine(g, x + PAD, hillY + 30 + r() * 60, (70 + r() * 90) * sc, '#03050b', '#cdd9ff26') }
      layers.push({ c: near.c, depth: 0.8 })

      // Snow
      const count = Math.floor(Math.min(420, (W * H) / 4200))
      flakes = Array.from({ length: count }, () => {
        const layer = r() < 0.6 ? 0 : r() < 0.8 ? 1 : 2
        return mkFlake(layer, true)
      })
      puffs = []
    }

    const mkFlake = (layer: number, anywhere = false): Flake => ({
      x: Math.random() * (W + 200) - 100, y: anywhere ? Math.random() * H : -10 - Math.random() * 40,
      r: layer === 0 ? 0.5 + Math.random() * 0.7 : layer === 1 ? 1.1 + Math.random() * 1.1 : 2.4 + Math.random() * 2.2,
      vy: layer === 0 ? 0.18 + Math.random() * 0.2 : layer === 1 ? 0.4 + Math.random() * 0.35 : 0.8 + Math.random() * 0.6,
      sway: 0.2 + Math.random() * 0.6, ph: Math.random() * 6.28, a: layer === 0 ? 0.35 + Math.random() * 0.3 : layer === 1 ? 0.55 + Math.random() * 0.3 : 0.35 + Math.random() * 0.3,
      layer,
    })

    const onMove = (e: PointerEvent) => { m.x = e.clientX / W - 0.5; m.y = e.clientY / H - 0.5 }
    const onVis = () => { running = !document.hidden; if (running) { last = performance.now(); raf = requestAnimationFrame(tick) } }
    let resizeT = 0
    const onResize = () => { clearTimeout(resizeT); resizeT = window.setTimeout(build, 150) }

    let last = performance.now()
    const tick = (now: number) => {
      if (!running) return
      const dt = Math.min(3, (now - last) / 16.67); last = now
      const t = now / 1000
      m.sx += (m.x - m.sx) * 0.03; m.sy += (m.y - m.sy) * 0.03
      const off = (d: number) => [-PAD - m.sx * PAD * 1.6 * d, -PAD - m.sy * PAD * 0.8 * d] as const

      // sky
      const [sx, sy] = off(0.05)
      ctx.drawImage(sky, sx, sy, W + PAD * 2, H + PAD * 2)

      // stars
      for (const s of stars) {
        let a = s.base * (0.65 + 0.35 * Math.sin(t * s.sp + s.ph))
        if (Math.sin(t * 0.13 + s.ph * 3) > 0.995) a = Math.min(1, a + 0.5) // rare brighten
        ctx.globalAlpha = a
        ctx.fillStyle = s.warm ? '#ffe2c4' : '#dfe8ff'
        ctx.beginPath(); ctx.arc(s.x + sx, s.y + sy, s.r, 0, 6.28); ctx.fill()
        if (s.r > 1.2) { ctx.globalAlpha = a * 0.12; ctx.beginPath(); ctx.arc(s.x + sx, s.y + sy, s.r * 4, 0, 6.28); ctx.fill() }
      }
      ctx.globalAlpha = 1

      // scenery layers + fog between them
      layers.forEach((L, i) => {
        const [lx, ly] = off(L.depth)
        ctx.drawImage(L.c, lx, ly, W + PAD * 2, H + PAD * 2)
        if (i === 1 || i === 2) {
          const fy = H * (i === 1 ? 0.74 : 0.83)
          const drift = ((t * (i === 1 ? 6 : 10)) % (W * 2))
          for (let k = -1; k < 2; k++) {
            const fx = k * W * 1.2 + drift - W * 0.2 + lx
            const fg = ctx.createRadialGradient(fx + W * 0.5, fy, 0, fx + W * 0.5, fy, W * 0.55)
            fg.addColorStop(0, i === 1 ? '#8ea3d614' : '#a9b8e012'); fg.addColorStop(1, '#0000')
            ctx.fillStyle = fg
            ctx.save(); ctx.translate(0, fy); ctx.scale(1, 0.12); ctx.translate(0, -fy); ctx.fillRect(fx, fy - W * 0.55, W * 1.1, W * 1.1); ctx.restore()
          }
        }
      })

      // cabin warm light
      const [cx, cy] = off(0.8)
      const flick = 0.85 + Math.sin(t * 2.3) * 0.04 + Math.sin(t * 7.1) * 0.025 + Math.sin(t * 13.7) * 0.015
      ctx.globalCompositeOperation = 'lighter'
      cabin.wins.forEach(w => {
        const gx = w.x + w.w / 2 + cx, gy = w.y + w.h / 2 + cy
        const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, 60 * cabin.s)
        gg.addColorStop(0, `rgba(255,170,80,${0.35 * flick})`); gg.addColorStop(1, 'rgba(255,140,60,0)')
        ctx.fillStyle = gg; ctx.fillRect(gx - 60 * cabin.s, gy - 60 * cabin.s, 120 * cabin.s, 120 * cabin.s)
      })
      // light spilling onto snow
      const px = cabin.x + cx, py = cabin.y + cy + 10
      const sg = ctx.createRadialGradient(px, py, 0, px, py, 170 * cabin.s)
      sg.addColorStop(0, `rgba(255,160,80,${0.16 * flick})`); sg.addColorStop(1, 'rgba(255,140,60,0)')
      ctx.save(); ctx.translate(px, py); ctx.scale(1.8, 0.45); ctx.translate(-px, -py)
      ctx.fillStyle = sg; ctx.fillRect(px - 170 * cabin.s, py - 170 * cabin.s, 340 * cabin.s, 340 * cabin.s); ctx.restore()
      ctx.globalCompositeOperation = 'source-over'

      // chimney smoke
      if (!reduce && Math.random() < 0.06 * dt) puffs.push({ x: cabin.chimney.x + 5 * cabin.s, y: cabin.chimney.y, r: 4 * cabin.s, life: 0, vx: 0.1 + Math.random() * 0.1 })
      puffs = puffs.filter(p => p.life < 1)
      for (const p of puffs) {
        p.life += 0.003 * dt; p.y -= 0.18 * dt; p.x += (p.vx + Math.sin(t * 0.4) * 0.12) * dt; p.r += 0.028 * dt
        ctx.globalAlpha = Math.sin(p.life * Math.PI) * 0.045
        ctx.fillStyle = '#c3cde6'
        ctx.beginPath(); ctx.arc(p.x + cx, p.y + cy, p.r, 0, 6.28); ctx.fill()
      }
      ctx.globalAlpha = 1

      // snow
      const wind = Math.sin(t * 0.07) * 0.35 + Math.sin(t * 0.23) * 0.15 + 0.15
      const density = snowRef.current
      const lim = Math.floor(flakes.length * density)
      for (let i = 0; i < lim; i++) {
        const f = flakes[i]
        if (!reduce) {
          f.y += f.vy * dt
          f.x += (wind * (0.4 + f.layer * 0.5) + Math.sin(t * f.sway + f.ph) * 0.25) * dt
        }
        if (f.y > H + 10 || f.x > W + 100 || f.x < -100) { Object.assign(f, mkFlake(f.layer)); if (f.x > W) f.x -= W }
        const par = f.layer === 0 ? 0.3 : f.layer === 1 ? 0.9 : 1.6
        const x = f.x - m.sx * PAD * par, y = f.y - m.sy * PAD * 0.5 * par
        ctx.globalAlpha = f.a
        ctx.fillStyle = '#eef3ff'
        if (f.layer === 2) {
          const gg = ctx.createRadialGradient(x, y, 0, x, y, f.r * 1.6)
          gg.addColorStop(0, '#f4f7ffcc'); gg.addColorStop(1, '#f4f7ff00')
          ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, f.r * 1.6, 0, 6.28); ctx.fill()
        } else { ctx.beginPath(); ctx.arc(x, y, f.r, 0, 6.28); ctx.fill() }
      }
      ctx.globalAlpha = 1

      // cinematic vignette
      const vg = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.35, W / 2, H * 0.5, Math.max(W, H) * 0.8)
      vg.addColorStop(0, '#0000'); vg.addColorStop(1, '#000000b0')
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H)

      if (!reduce) raf = requestAnimationFrame(tick)
    }

    build()
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove)
    document.addEventListener('visibilitychange', onVis)
    return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); window.removeEventListener('pointermove', onMove); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  return <canvas ref={ref} className="wallpaper" aria-hidden="true" />
}
