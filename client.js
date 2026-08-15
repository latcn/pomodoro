// Pomodoro (番茄钟) — DSH dynamic Cordis Plugin · client half
// Plugin: pomo-1  ·  Package: pkg-1
//
// This file is the `code.client` FUNCTION BODY used with `cordis_define`.
// It is NOT a standalone module: the DSH client wraps it in a function and
// supplies the builtins `ctx`, `React`, `host`, `styles`, `console`.
// It declares the hard dependency `timer` (used as `ctx.interval`).
//
// To re-create it: cordis_define -> code.client = contents after the header
// comment -> cordis_run.

return {
  inject: ['timer'],
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return

    styles.insert(`
.dsh-pomo { position: fixed; right: 20px; bottom: 20px; z-index: 1000; pointer-events: auto; box-sizing: border-box; width: 220px; padding: 14px 16px 16px; border-radius: 16px; background: var(--dsw-alias-bg-overlay, #ffffff); color: var(--dsw-alias-label-primary, #111827); border: 1px solid var(--dsw-alias-border-l1, #e5e7eb); box-shadow: 0 12px 32px rgba(0,0,0,0.25); font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; user-select: none; }
.dsh-pomo-collapsed { position: fixed; right: 20px; bottom: 20px; z-index: 1000; pointer-events: auto; border: 1px solid var(--dsw-alias-border-l1, #e5e7eb); background: var(--dsw-alias-bg-overlay, #ffffff); color: var(--dsw-alias-label-primary, #111827); border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 20px rgba(0,0,0,0.2); font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.dsh-pomo-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.dsh-pomo-title { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.dsh-pomo-emoji { font-size: 16px; }
.dsh-pomo-min { border: none; background: transparent; color: var(--dsw-alias-label-secondary, #6b7280); cursor: pointer; font-size: 14px; line-height: 1; padding: 2px 6px; border-radius: 6px; }
.dsh-pomo-min:hover { background: var(--dsw-alias-bg-layer-1, #f3f4f6); }
.dsh-pomo-tabs { display: flex; gap: 4px; margin-bottom: 12px; }
.dsh-pomo-tab { flex: 1; border: 1px solid var(--dsw-alias-border-l1, #e5e7eb); background: transparent; color: var(--dsw-alias-label-secondary, #6b7280); border-radius: 8px; padding: 4px 0; font-size: 12px; cursor: pointer; }
.dsh-pomo-tab.active { background: var(--dsw-alias-brand-primary, #6366f1); border-color: var(--dsw-alias-brand-primary, #6366f1); color: #ffffff; }
.dsh-pomo-ring { display: flex; justify-content: center; margin-bottom: 12px; }
.dsh-pomo-time { fill: var(--dsw-alias-label-primary, #111827); font-size: 26px; font-weight: 700; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.dsh-pomo-controls { display: flex; gap: 8px; }
.dsh-pomo-btn { flex: 1; border: 1px solid var(--dsw-alias-border-l1, #e5e7eb); background: var(--dsw-alias-bg-layer-1, #f3f4f6); color: var(--dsw-alias-label-primary, #111827); border-radius: 8px; padding: 7px 0; font-size: 13px; cursor: pointer; font-weight: 500; }
.dsh-pomo-btn:hover { background: var(--dsw-alias-bg-layer-2, #e5e7eb); }
.dsh-pomo-btn.primary { background: var(--dsw-alias-brand-primary, #6366f1); border-color: var(--dsw-alias-brand-primary, #6366f1); color: #ffffff; font-weight: 600; }
.dsh-pomo-dots { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
.dsh-pomo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-border-l2, #d1d5db); }
.dsh-pomo-dot.on { background: var(--dsw-alias-brand-primary, #6366f1); }
`)

    const DURATIONS = { work: 1500, short: 300, long: 900 }
    const LABELS = { work: '专注', short: '短休息', long: '长休息' }
    const CIRC = 339.292

    function pad(n) { return n < 10 ? '0' + n : String(n) }

    function nextPhase(mode, cycle) {
      if (mode === 'work') {
        const c = cycle + 1
        const m = c % 4 === 0 ? 'long' : 'short'
        return { mode: m, cycle: c, remaining: DURATIONS[m] }
      }
      return { mode: 'work', cycle: mode === 'long' ? 0 : cycle, remaining: DURATIONS.work }
    }

    function Pomodoro() {
      const [mode, setMode] = React.useState('work')
      const [remaining, setRemaining] = React.useState(DURATIONS.work)
      const [running, setRunning] = React.useState(false)
      const [cycle, setCycle] = React.useState(0)
      const [collapsed, setCollapsed] = React.useState(false)

      React.useEffect(() => {
        if (!running) return undefined
        return ctx.interval(() => {
          setRemaining((r) => (r > 0 ? r - 1 : 0))
        }, 1000)
      }, [running])

      React.useEffect(() => {
        if (!running || remaining > 0) return
        const p = nextPhase(mode, cycle)
        setCycle(p.cycle)
        setMode(p.mode)
        setRemaining(p.remaining)
      }, [remaining, running, mode, cycle])

      const total = DURATIONS[mode]
      const mm = pad(Math.floor(remaining / 60))
      const ss = pad(remaining % 60)
      const dash = CIRC * (remaining / total)

      const toggle = () => setRunning((r) => !r)
      const reset = () => { setRunning(false); setRemaining(DURATIONS[mode]) }
      const skip = () => {
        const p = nextPhase(mode, cycle)
        setCycle(p.cycle)
        setMode(p.mode)
        setRemaining(p.remaining)
        setRunning(false)
      }
      const pickMode = (m) => { setRunning(false); setMode(m); setRemaining(DURATIONS[m]) }

      if (collapsed) {
        return React.createElement('button',
          { className: 'dsh-pomo-collapsed', onClick: () => setCollapsed(false), title: '展开番茄钟' },
          '🍅 ' + mm + ':' + ss)
      }

      const head = React.createElement('div', { className: 'dsh-pomo-head' },
        React.createElement('div', { className: 'dsh-pomo-title' },
          React.createElement('span', { className: 'dsh-pomo-emoji' }, '🍅'),
          '番茄钟'),
        React.createElement('button', { className: 'dsh-pomo-min', onClick: () => setCollapsed(true), title: '收起' }, '—'))

      const tabs = React.createElement('div', { className: 'dsh-pomo-tabs' },
        ['work', 'short', 'long'].map((m) =>
          React.createElement('button', {
            key: m,
            className: 'dsh-pomo-tab' + (m === mode ? ' active' : ''),
            onClick: () => pickMode(m)
          }, LABELS[m])))

      const ring = React.createElement('div', { className: 'dsh-pomo-ring' },
        React.createElement('svg', { width: 140, height: 140, viewBox: '0 0 120 120' },
          React.createElement('circle', { cx: 60, cy: 60, r: 54, fill: 'none', stroke: 'var(--dsw-alias-border-l1, #e5e7eb)', strokeWidth: 8 }),
          React.createElement('circle', {
            cx: 60, cy: 60, r: 54, fill: 'none',
            stroke: 'var(--dsw-alias-brand-primary, #6366f1)', strokeWidth: 8,
            strokeLinecap: 'round', strokeDasharray: CIRC, strokeDashoffset: dash,
            transform: 'rotate(-90 60 60)'
          }),
          React.createElement('text', { x: 60, y: 60, textAnchor: 'middle', dominantBaseline: 'central', className: 'dsh-pomo-time' }, mm + ':' + ss)))

      const controls = React.createElement('div', { className: 'dsh-pomo-controls' },
        React.createElement('button', { className: 'dsh-pomo-btn primary', onClick: toggle }, running ? '暂停' : '开始'),
        React.createElement('button', { className: 'dsh-pomo-btn', onClick: skip }, '跳过'),
        React.createElement('button', { className: 'dsh-pomo-btn', onClick: reset }, '重置'))

      const dots = React.createElement('div', { className: 'dsh-pomo-dots' },
        [0, 1, 2, 3].map((i) =>
          React.createElement('span', { key: i, className: 'dsh-pomo-dot' + (i < cycle % 4 ? ' on' : '') })))

      return React.createElement('div', { className: 'dsh-pomo' },
        head, tabs, ring, controls, dots)
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'pomodoro', order: 100, label: '番茄钟' },
      () => React.createElement(Pomodoro)))
  },
}
