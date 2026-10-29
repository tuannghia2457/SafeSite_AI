import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ArrowRight, Clock, Database, Loader, Send, TriangleAlert } from 'lucide-react'
import { request } from '../backend/api'
import { db, dayKey, shiftStart } from '../backend/db'
import { CameraCapture, CheckinStatusChip, PPE_ICON, PipelineView } from '../components/checkin'
import { Card, CardTitle, Field, PageHeader } from '../components/ui'
import { COMPANIES, FITNESS_CHECKS, HAZARD_CATEGORIES, PPE_ITEMS, UNFIT_REASONS } from '../data/companies'
import { bi, fmtTime } from '../lib/format'
import { useDemo } from '../state/DemoStore'

const STEPS = ['identify', 'photo', 'ppe', 'fitness', 'submit']
const emptyForm = () => ({
  companyId: COMPANIES[0].id,
  workerId: '',
  photo: null,
  ppe: { helmet: false, vest: false, boots: false, gloves: false },
  checks: { rested: false, noAlcohol: false, healthy: false },
  unfitReason: '',
  hazardOn: false,
  hazard: { category: 'scaffold', text: '', location: '' },
  aiForce: 'auto',
})

function Toggle({ checked, onChange, children, required, Icon }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition-colors ${
        checked ? 'bg-good/12 text-ice ring-1 ring-good/40' : 'hairline text-mist hover:bg-blueprint/5'
      }`}
    >
      {Icon && <Icon size={18} className={checked ? 'text-good' : 'text-fog'} aria-hidden />}
      <span className="flex-1">{children}</span>
      {required && <span className="text-[10px] tracking-wide text-fog uppercase">{required}</span>}
      <span className={`flex size-5 items-center justify-center rounded-md text-xs ${checked ? 'bg-good text-canvas' : 'hairline'}`}>{checked ? '✓' : ''}</span>
    </button>
  )
}

export default function CheckIn() {
  const { lang, t, notify } = useDemo()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [phase, setPhase] = useState('form') // form | sending | result
  const [response, setResponse] = useState(null)
  const [revealed, setRevealed] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(timer)
  }, [])

  const today = dayKey(now)
  const workers = useLiveQuery(() => db.workers.where('companyId').equals(form.companyId).sortBy('name'), [form.companyId]) ?? []
  const existing = useLiveQuery(
    () => (form.workerId ? db.checkins.where('[workerId+date]').equals([form.workerId, today]).first() : undefined),
    [form.workerId, today],
  )
  const worker = workers.find((w) => w.id === form.workerId)
  const late = now > shiftStart(today)

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const fit = Object.values(form.checks).every(Boolean)

  const canNext = [
    !!worker && !existing,
    !!form.photo,
    true,
    fit || !!form.unfitReason,
    true,
  ][step]

  // Reveal server-side steps one by one once the response arrives.
  useEffect(() => {
    if (phase !== 'result' || !response?.steps) return
    if (revealed >= response.steps.length) return
    const timer = setTimeout(() => setRevealed((r) => r + 1), 260)
    return () => clearTimeout(timer)
  }, [phase, response, revealed])

  const submit = async () => {
    setPhase('sending')
    setRevealed(0)
    const res = await request('POST', '/api/checkins', {
      workerId: form.workerId,
      companyId: form.companyId,
      photo: form.photo === 'demo' ? null : form.photo,
      ppe: form.ppe,
      fitness: fit ? { fit: true, ...form.checks } : { fit: false, ...form.checks, reason: form.unfitReason || 'fatigue' },
      hazard: form.hazardOn ? form.hazard : null,
      aiForce: form.aiForce,
    })
    setResponse(res)
    setPhase('result')
    const c = res.body?.checkin
    if (c && c.status !== 'cleared')
      notify('toast.checkinIssue', { name: worker.name, status: t(`checkinStatus.${c.status}`) }, 'warning')
  }

  const restart = () => {
    setForm((f) => ({ ...emptyForm(), companyId: f.companyId }))
    setStep(0)
    setPhase('form')
    setResponse(null)
  }

  const checkin = response?.body?.checkin

  return (
    <>
      <PageHeader title={t('checkin.title')} subtitle={t('checkin.subtitle')} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Phone */}
        <div className="glass-modal mx-auto w-full max-w-[420px] overflow-hidden rounded-[32px] p-3">
          <div className="rounded-[24px] bg-canvas/60 p-5">
            <div className="mb-4 flex items-center justify-between text-xs text-fog">
              <span className="font-mono">{fmtTime(now, lang).slice(0, 5)}</span>
              <span className={`flex items-center gap-1 ${late ? 'text-warning' : ''}`}>
                <Clock size={12} aria-hidden /> {t('checkin.shift')} 07:00 {late && `· ${t('checkin.lateNow')}`}
              </span>
            </div>

            {phase === 'form' && (
              <>
                <ol className="mb-5 flex gap-1" aria-label={t('checkin.progress')}>
                  {STEPS.map((s, i) => (
                    <li key={s} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-frost' : 'bg-blueprint/12'}`} />
                  ))}
                </ol>
                <p className="eyebrow !text-[11px]">{t('workflow.stepOf', { n: step + 1, total: STEPS.length })}</p>
                <h2 className="mt-1 mb-4 font-display text-xl font-medium text-ice">{t(`checkin.step.${STEPS[step]}`)}</h2>

                {step === 0 && (
                  <div className="space-y-3">
                    <Field label={t('checkin.company')}>
                      <select className="field" value={form.companyId} onChange={(e) => set({ companyId: e.target.value, workerId: '' })}>
                        {COMPANIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {bi(c.name, lang)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t('checkin.worker')}>
                      <select className="field" value={form.workerId} onChange={(e) => set({ workerId: e.target.value })}>
                        <option value="">{t('checkin.pickWorker')}</option>
                        {workers.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} · {bi(w.trade, lang)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {existing && (
                      <div className="hairline flex items-center justify-between gap-3 rounded-xl p-3 text-sm">
                        <span className="text-mist">{t('checkin.already', { time: fmtTime(existing.submittedAt, lang).slice(0, 5) })}</span>
                        <CheckinStatusChip status={existing.status} />
                      </div>
                    )}
                    <p className="text-xs text-fog">{t('checkin.identifyHint')}</p>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-3">
                    <CameraCapture value={form.photo} onCapture={(photo) => set({ photo })} />
                    <p className="text-xs text-fog">{t('checkin.photo.privacy')}</p>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-2">
                    {PPE_ITEMS.map((p) => (
                      <Toggle
                        key={p.key}
                        Icon={PPE_ICON[p.key]}
                        checked={form.ppe[p.key]}
                        onChange={(v) => set({ ppe: { ...form.ppe, [p.key]: v } })}
                        required={p.required ? t('checkin.required') : t('checkin.recommended')}
                      >
                        {bi(p.label, lang)}
                      </Toggle>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-2">
                    {FITNESS_CHECKS.map((f) => (
                      <Toggle key={f.key} checked={form.checks[f.key]} onChange={(v) => set({ checks: { ...form.checks, [f.key]: v } })}>
                        {bi(f.label, lang)}
                      </Toggle>
                    ))}
                    {!fit && (
                      <Field label={t('checkin.unfitReason')} hint={t('checkin.unfitHint')}>
                        <select className="field" value={form.unfitReason} onChange={(e) => set({ unfitReason: e.target.value })}>
                          <option value="">{t('checkin.pickReason')}</option>
                          {Object.entries(UNFIT_REASONS).map(([k, v]) => (
                            <option key={k} value={k}>
                              {bi(v, lang)}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-3">
                    <Toggle Icon={TriangleAlert} checked={form.hazardOn} onChange={(v) => set({ hazardOn: v })}>
                      {t('checkin.hazardToggle')}
                    </Toggle>
                    {form.hazardOn && (
                      <div className="space-y-2">
                        <select className="field" value={form.hazard.category} onChange={(e) => set({ hazard: { ...form.hazard, category: e.target.value } })} aria-label={t('checkin.hazardCategory')}>
                          {Object.entries(HAZARD_CATEGORIES).map(([k, v]) => (
                            <option key={k} value={k}>
                              {bi(v, lang)}
                            </option>
                          ))}
                        </select>
                        <input className="field" placeholder={t('checkin.hazardWhere')} value={form.hazard.location} onChange={(e) => set({ hazard: { ...form.hazard, location: e.target.value } })} />
                        <textarea className="field min-h-16" placeholder={t('checkin.hazardWhat')} value={form.hazard.text} onChange={(e) => set({ hazard: { ...form.hazard, text: e.target.value } })} />
                      </div>
                    )}
                    <div className="hairline space-y-1.5 rounded-xl p-3 text-sm">
                      <p className="flex justify-between gap-2">
                        <span className="text-fog">{t('checkin.worker')}</span>
                        <span className="text-right text-ice">{worker?.name}</span>
                      </p>
                      <p className="flex justify-between gap-2">
                        <span className="text-fog">PPE</span>
                        <span className="text-ice">
                          {PPE_ITEMS.filter((p) => form.ppe[p.key]).length}/{PPE_ITEMS.length}
                        </span>
                      </p>
                      <p className="flex justify-between gap-2">
                        <span className="text-fog">{t('checkin.fitness')}</span>
                        <span className={fit ? 'text-good' : 'text-critical'}>{fit ? t('checkin.fit') : t('checkin.unfit')}</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-2">
                  {step > 0 && (
                    <button className="btn btn-outline" onClick={() => setStep(step - 1)} aria-label={t('checkin.back')}>
                      <ArrowLeft size={15} />
                    </button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button className="btn btn-ghost flex-1" disabled={!canNext} onClick={() => setStep(step + 1)}>
                      {t('checkin.next')} <ArrowRight size={15} aria-hidden />
                    </button>
                  ) : (
                    <button className="btn btn-cta flex-1" onClick={submit}>
                      <Send size={15} aria-hidden /> {t('checkin.submit')}
                    </button>
                  )}
                </div>
              </>
            )}

            {phase === 'sending' && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <Loader size={28} className="animate-spin text-frost" aria-hidden />
                <p className="text-sm text-mist">{t('checkin.sending')}</p>
              </div>
            )}

            {phase === 'result' && (
              <div className="py-2 text-center">
                {checkin ? (
                  <>
                    <div className="flex justify-center">
                      <CheckinStatusChip status={checkin.status} />
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-medium text-ice">{t(`checkin.result.${checkin.status}`)}</h2>
                    <p className="mt-1 text-sm text-mist">
                      {fmtTime(checkin.submittedAt, lang).slice(0, 5)} · {checkin.onTime ? t('checkin.onTime') : t('checkin.late')}
                    </p>
                    {checkin.reasons.length > 0 && (
                      <ul className="mt-4 space-y-1 text-left text-sm">
                        {checkin.reasons.map((r) => (
                          <li key={r.code} className={`rounded-lg px-3 py-2 ${r.level === 'note' ? 'hairline text-mist' : r.level === 'blocked' ? 'bg-critical/10 text-critical' : 'bg-warning/10 text-warning'}`}>
                            {t(`reason.${r.code}`)}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-4 font-mono text-[11px] text-fog">{checkin.id}</p>
                  </>
                ) : (
                  <>
                    <h2 className="font-display text-xl font-medium text-critical">{t('checkin.error')}</h2>
                    <p className="mt-2 font-mono text-xs text-mist">
                      HTTP {response?.status} · {response?.body?.error}
                    </p>
                  </>
                )}
                <div className="mt-6 flex flex-col gap-2">
                  <button className="btn btn-ghost" onClick={restart}>
                    {t('checkin.another')}
                  </button>
                  <Link to="/attendance" className="btn btn-outline">
                    {t('checkin.toBoard')}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Behind the scenes */}
        <div className="space-y-4">
          <Card>
            <CardTitle
              action={
                <Link to="/system" className="flex items-center gap-1 text-xs font-medium text-blueprint hover:text-ice">
                  <Database size={12} aria-hidden /> {t('checkin.backendLink')}
                </Link>
              }
            >
              {t('checkin.behind')}
            </CardTitle>
            <p className="mb-4 font-mono text-xs text-fog">
              POST /api/checkins
              {response && (
                <span className={response.status < 300 ? 'text-good' : 'text-critical'}>
                  {' '}
                  → {response.status} · {response.ms} ms
                </span>
              )}
            </p>
            <PipelineView steps={response?.steps ?? []} running={phase === 'sending'} revealed={phase === 'result' ? revealed : 0} />
          </Card>

          <Card>
            <CardTitle>{t('checkin.demoControls')}</CardTitle>
            <Field label={t('checkin.aiForce')} hint={t('checkin.aiForceHint')}>
              <select className="field" value={form.aiForce} onChange={(e) => set({ aiForce: e.target.value })}>
                <option value="auto">{t('checkin.ai.auto')}</option>
                <option value="no_helmet">{t('checkin.ai.no_helmet')}</option>
                <option value="no_vest">{t('checkin.ai.no_vest')}</option>
              </select>
            </Field>
          </Card>

          {checkin && (
            <Card>
              <CardTitle>{t('checkin.stored')}</CardTitle>
              <pre className="max-h-72 overflow-auto rounded-lg bg-canvas/70 p-3 font-mono text-[11px] leading-relaxed text-mist">
                {JSON.stringify({ ...checkin, photoId: checkin.photoId ?? null }, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
