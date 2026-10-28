import { useEffect, useState } from 'react'
import { Eye, EyeOff, ScanEye } from 'lucide-react'
import CameraFeed from '../components/CameraFeed'
import { PageHeader, Tabs } from '../components/ui'
import { CAMERAS, SITES } from '../data/mockData'
import { bi } from '../lib/format'
import { useDemo } from '../state/DemoStore'

const FLASH_MS = 8000

export default function Monitoring() {
  const { state, lang, t, simulateAlert } = useDemo()
  const [siteId, setSiteId] = useState('all')
  const [showBoxes, setShowBoxes] = useState(true)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const cameras = CAMERAS.filter((c) => siteId === 'all' || c.siteId === siteId)
  const flashing = new Set(state.alerts.filter((a) => now - a.timestamp < FLASH_MS).map((a) => a.cameraId))

  return (
    <>
      <PageHeader
        title={t('monitor.title')}
        subtitle={t('monitor.subtitle')}
        actions={
          <>
            <button className="btn btn-outline" onClick={() => setShowBoxes((v) => !v)}>
              {showBoxes ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
              {showBoxes ? t('monitor.hideBoxes') : t('monitor.showBoxes')}
            </button>
            <button className="btn btn-cta" onClick={() => simulateAlert()}>
              <ScanEye size={15} aria-hidden /> {t('monitor.simulateRandom')}
            </button>
          </>
        }
      />

      <div className="mb-5">
        <Tabs
          value={siteId}
          onChange={setSiteId}
          items={[
            { value: 'all', label: t('common.allSites'), count: CAMERAS.length },
            ...SITES.map((s) => ({ value: s.id, label: bi(s.name, lang), count: CAMERAS.filter((c) => c.siteId === s.id).length })),
          ]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cameras.map((camera) => (
          <CameraFeed
            key={camera.id}
            camera={camera}
            flash={flashing.has(camera.id)}
            onSimulate={simulateAlert}
            showBoxes={showBoxes}
          />
        ))}
      </div>

      <p className="mt-6 text-xs text-fog">{t('monitor.disclaimer')}</p>
    </>
  )
}
