import { useEffect, useState } from 'react'
import { ScanEye, VideoOff } from 'lucide-react'
import CameraFrame from './CameraFrame'
import { buildLiveWorkers, violationsOf } from '../data/mockData'
import { bi, fmtTime } from '../lib/format'
import { useDemo } from '../state/DemoStore'

function step(w) {
  let { x, y, vx, vy } = w
  if (Math.random() < 0.08) vx = (Math.random() - 0.5) * 6
  x += vx
  y += vy
  if (x < 20 || x > 300) vx = -vx
  if (y < 114 || y > 170) vy = -vy
  return { ...w, x: Math.min(300, Math.max(20, x)), y: Math.min(170, Math.max(114, y)), vx, vy }
}

/** Live (simulated) CCTV feed with on-frame AI detection overlays. */
export default function CameraFeed({ camera, flash = false, onSimulate, showBoxes = true }) {
  const { lang, t } = useDemo()
  const [workers, setWorkers] = useState(() => buildLiveWorkers(camera))
  const [now, setNow] = useState(Date.now())
  const offline = camera.status !== 'online'

  useEffect(() => {
    if (offline) return
    const timer = setInterval(() => {
      setWorkers((ws) => ws.map(step))
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [offline])

  const violators = workers.filter((w) => violationsOf(w, camera.zone).length).length

  return (
    <div className={`glass-card overflow-hidden !p-0 transition-shadow ${flash ? 'ring-2 ring-critical' : ''}`}>
      <div className="relative aspect-video bg-canvas">
        {offline ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-fog">
            <VideoOff size={28} aria-hidden />
            <span className="eyebrow !text-xs">{t('monitor.signalLost')}</span>
          </div>
        ) : (
          <>
            <CameraFrame scene={camera.scene} workers={workers} zone={camera.zone} showBoxes={showBoxes} animate />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-2 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 rounded bg-canvas/70 px-1.5 py-0.5 text-white">
                <span className="size-1.5 animate-pulse rounded-full bg-critical" /> LIVE · {camera.id}
              </span>
              <span className="rounded bg-canvas/70 px-1.5 py-0.5 text-mist tabular-nums">{fmtTime(now, lang)}</span>
            </div>
            {flash && (
              <span className="absolute bottom-2 left-2 rounded bg-critical px-2 py-0.5 font-mono text-[11px] font-semibold text-canvas">
                {t('monitor.alertRaised')}
              </span>
            )}
          </>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ice">{bi(camera.name, lang)}</p>
          <p className="text-xs text-fog">
            {offline
              ? t('monitor.offline')
              : t('monitor.inFrame', { n: workers.length, v: violators })}
          </p>
        </div>
        {onSimulate && !offline && (
          <button className="btn btn-outline btn-sm" onClick={() => onSimulate(camera.id)} title={t('monitor.simulateHint')}>
            <ScanEye size={14} aria-hidden /> {t('monitor.simulate')}
          </button>
        )}
      </div>
    </div>
  )
}
