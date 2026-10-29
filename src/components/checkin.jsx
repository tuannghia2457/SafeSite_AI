import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Camera, CircleAlert, CircleCheck, CircleX, Footprints, Hand, HardHat, House, ImageUp, RefreshCw, Shirt, UserRound, X } from 'lucide-react'
import { db } from '../backend/db'
import { CHECKIN_STATUS } from '../data/companies'
import { hashString } from '../data/mockData'
import { useDemo } from '../state/DemoStore'

export const PPE_ICON = { helmet: HardHat, vest: Shirt, boots: Footprints, gloves: Hand }

const STATUS_STYLE = {
  cleared: { cls: 'text-good bg-good/12', Icon: CircleCheck },
  flagged: { cls: 'text-warning bg-warning/12', Icon: CircleAlert },
  blocked: { cls: 'text-critical bg-critical/12', Icon: CircleX },
  sent_home: { cls: 'text-fog bg-steel/60', Icon: House },
  missing: { cls: 'text-fog bg-blueprint/8', Icon: UserRound },
}

export function CheckinStatusChip({ status }) {
  const { lang } = useDemo()
  const { cls, Icon } = STATUS_STYLE[status]
  return (
    <span className={`chip ${cls}`}>
      <Icon size={12} aria-hidden /> {CHECKIN_STATUS[status][lang]}
    </span>
  )
}

/** Row of PPE icons: dim + struck when the item was not declared. */
export function PpeIcons({ ppe, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {Object.entries(PPE_ICON).map(([key, Icon]) => (
        <span key={key} className={ppe[key] ? 'text-frost' : 'relative text-critical'} title={key}>
          <Icon size={size} aria-label={`${key}: ${ppe[key] ? 'yes' : 'no'}`} />
          {!ppe[key] && <span className="absolute inset-x-0 top-1/2 h-px -rotate-45 bg-critical" aria-hidden />}
        </span>
      ))}
    </span>
  )
}

/** Generated head-and-shoulders portrait for seeded check-ins (no real photos of people in the demo). */
export function WorkerPortrait({ seed = 'x', helmet = true, vest = true, className = '' }) {
  const h = Math.abs(hashString(seed))
  const skin = ['#c9a07c', '#b98a63', '#d6ad8a', '#a8794f'][h % 4]
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" fill="#141b2b" />
      <path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill={vest ? '#c8e64a' : '#55627a'} />
      {vest && <path d="M14 56h36M12 60h40" stroke="#eef4fb" strokeWidth="2" opacity="0.8" />}
      <rect x="27" y="36" width="10" height="9" fill={skin} />
      <circle cx="32" cy="27" r="12" fill={skin} />
      {helmet ? (
        <>
          <path d="M19 26a13 13 0 0 1 26 0z" fill="#f2c230" />
          <rect x="16" y="24.5" width="32" height="3" rx="1.5" fill="#f2c230" />
        </>
      ) : (
        <path d="M21 24a11 11 0 0 1 22 0c-4-3-18-3-22 0z" fill="#2a2522" />
      )}
    </svg>
  )
}

/** Shows the stored check-in photo, or the generated portrait for seeded records. */
export function CheckinPhoto({ checkin, className = '' }) {
  const photo = useLiveQuery(() => (checkin.photoId ? db.photos.get(checkin.photoId) : null), [checkin.photoId])
  if (photo?.dataUrl) return <img src={photo.dataUrl} alt="" className={`object-cover ${className}`} />
  return <WorkerPortrait seed={checkin.workerId} helmet={checkin.ai?.helmet ?? checkin.ppe.helmet} vest={checkin.ai?.vest ?? checkin.ppe.vest} className={className} />
}

/** Front-camera capture with file-upload and demo-photo fallbacks. Calls onCapture(dataUrl | 'demo'). */
export function CameraCapture({ value, onCapture }) {
  const { t } = useDemo()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [state, setState] = useState('idle') // idle | live | error
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  const stop = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    streamRef.current = null
  }
  useEffect(() => stop, [])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640 }, audio: false })
      streamRef.current = stream
      setState('live')
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      })
    } catch {
      setState('error')
    }
  }

  const snap = () => {
    const v = videoRef.current
    const canvas = document.createElement('canvas')
    const w = 480
    canvas.width = w
    canvas.height = Math.round((v.videoHeight / v.videoWidth) * w) || 360
    canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height)
    onCapture(canvas.toDataURL('image/jpeg', 0.72))
    stop()
    setState('idle')
  }

  const fromFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 480
      canvas.height = Math.round((img.height / img.width) * 480)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      onCapture(canvas.toDataURL('image/jpeg', 0.72))
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-canvas hairline">
        {state === 'live' ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
            <div className="pointer-events-none absolute inset-6 rounded-[40%] border-2 border-dashed border-frost/40" aria-hidden />
          </>
        ) : value === 'demo' ? (
          <WorkerPortrait seed="demo" className="h-full w-full" />
        ) : value ? (
          <img src={value} alt={t('checkin.photo.preview')} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-fog">
            <Camera size={28} aria-hidden />
            <p className="text-xs">{state === 'error' ? t('checkin.photo.denied') : t('checkin.photo.hint')}</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {state === 'live' ? (
          <>
            <button type="button" className="btn btn-cta flex-1" onClick={snap}>
              <Camera size={15} aria-hidden /> {t('checkin.photo.take')}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => (stop(), setState('idle'))} aria-label={t('common.cancel')}>
              <X size={15} />
            </button>
          </>
        ) : (
          <>
            {supported && (
              <button type="button" className={`btn flex-1 ${value ? 'btn-outline' : 'btn-ghost'}`} onClick={start}>
                {value ? <RefreshCw size={15} aria-hidden /> : <Camera size={15} aria-hidden />}
                {value ? t('checkin.photo.retake') : t('checkin.photo.open')}
              </button>
            )}
            <label className="btn btn-outline cursor-pointer">
              <ImageUp size={15} aria-hidden /> {t('checkin.photo.upload')}
              <input type="file" accept="image/*" capture="user" className="hidden" onChange={fromFile} />
            </label>
            <button type="button" className="btn btn-outline" onClick={() => onCapture('demo')}>
              {t('checkin.photo.demo')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export const PIPELINE = ['validate', 'photo', 'ai', 'rules', 'save', 'notify']

/** Visualises the server-side steps of a check-in request. `steps` come from the mock API response. */
export function PipelineView({ steps = [], running = false, revealed = PIPELINE.length }) {
  const { t } = useDemo()
  return (
    <ol className="space-y-2">
      {PIPELINE.map((key, i) => {
        const step = steps.find((s) => s.key === key)
        const done = step && i < revealed
        const active = running ? i === steps.length : !done && i === revealed
        return (
          <li key={key} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                done ? 'bg-good text-canvas' : active ? 'animate-pulse bg-frost/70 text-canvas' : 'hairline text-fog'
              }`}
            >
              {done ? '✓' : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`flex items-baseline justify-between gap-2 text-sm ${done ? 'text-ice' : 'text-fog'}`}>
                <span>{t(`pipeline.${key}`)}</span>
                {done && <span className="font-mono text-[11px] text-fog">{step.ms} ms</span>}
              </p>
              <p className="text-xs text-fog">{t(`pipeline.${key}.desc`)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
