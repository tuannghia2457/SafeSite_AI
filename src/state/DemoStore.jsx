import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { CAMERAS, CURRENT_USER, buildInitialState, byId, createAlert } from '../data/mockData'
import { makeT } from '../lib/i18n'
import { request } from '../backend/api'

const STORAGE_KEY = 'safesite-demo-v1'
const SIMULATION_INTERVAL = 25_000
const MAX_ALERTS = 200

const DemoContext = createContext(null)

function freshState(prefs = {}) {
  return { version: 1, ...buildInitialState(), lang: 'en', simulation: true, ...prefs, toasts: [] }
}

function init() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.version === 1) return { ...saved, toasts: [] }
  } catch {
    /* corrupted storage: start fresh */
  }
  return freshState()
}

const updateIncident = (state, id, fn) => ({
  ...state,
  incidents: state.incidents.map((i) => (i.id === id ? fn(i) : i)),
})

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ALERT': {
      const alert = { ...action.alert, id: `ALT-${state.seq.alert}` }
      return {
        ...state,
        alerts: [...state.alerts, alert].slice(-MAX_ALERTS),
        seq: { ...state.seq, alert: state.seq.alert + 1 },
        toasts: [...state.toasts, { id: action.toastId, kind: 'alert', alertId: alert.id }],
      }
    }
    case 'DISMISS_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.id ? { ...a, status: 'dismissed', reviewedBy: CURRENT_USER, reviewedAt: action.at } : a,
        ),
      }
    case 'CONFIRM_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.incident.alertId
            ? { ...a, status: 'confirmed', incidentId: action.incident.id, reviewedBy: CURRENT_USER, reviewedAt: action.at }
            : a,
        ),
        incidents: [...state.incidents, action.incident],
        seq: { ...state.seq, incident: state.seq.incident + 1 },
      }
    case 'SET_INCIDENT_STATUS':
      return updateIncident(state, action.id, (i) => ({
        ...i,
        status: action.status,
        resolvedAt: action.status === 'resolved' ? action.at : null,
        timeline: [
          ...i.timeline,
          { at: action.at, by: CURRENT_USER, event: { in_progress: 'started', resolved: 'resolved', open: 'reopened' }[action.status] },
        ],
      }))
    case 'ADD_ACTION':
      return updateIncident(state, action.id, (i) => ({
        ...i,
        actions: [...i.actions, { ...action.action, id: `${i.id}-A${i.actions.length + 1}` }],
        timeline: [...i.timeline, { at: action.at, by: CURRENT_USER, event: 'action_added' }],
      }))
    case 'TOGGLE_ACTION':
      return updateIncident(state, action.id, (i) => ({
        ...i,
        actions: i.actions.map((a) =>
          a.id === action.actionId ? { ...a, done: !a.done, doneAt: a.done ? null : action.at } : a,
        ),
        timeline: [...i.timeline, { at: action.at, by: CURRENT_USER, event: 'action_updated' }],
      }))
    case 'SET_LANG':
      return { ...state, lang: action.lang }
    case 'TOGGLE_SIMULATION':
      return { ...state, simulation: !state.simulation }
    case 'PUSH_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] }
    case 'DROP_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }
    case 'RESET':
      return freshState({ lang: state.lang, simulation: state.simulation })
    default:
      return state
  }
}

const toastId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export function DemoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const { toasts, ...persisted } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
  }, [state])

  const simulateAlert = useCallback((cameraId, type) => {
    const online = CAMERAS.filter((c) => c.status === 'online')
    const camera = byId(CAMERAS, cameraId) ?? online[Math.floor(Math.random() * online.length)]
    dispatch({ type: 'ADD_ALERT', alert: createAlert({ camera, type, timestamp: Date.now() }), toastId: toastId() })
  }, [])

  // The "AI engine": periodically raises a detection from a random online camera.
  useEffect(() => {
    if (!state.simulation) return
    const timer = setInterval(() => simulateAlert(), SIMULATION_INTERVAL)
    return () => clearInterval(timer)
  }, [state.simulation, simulateAlert])

  const api = useMemo(() => {
    const now = () => Date.now()
    return {
      simulateAlert,
      dismissAlert: (id) => dispatch({ type: 'DISMISS_ALERT', id, at: now() }),
      /** Confirms an alert and opens an incident. Returns the new incident id. */
      confirmAlert: (alertId, form) => {
        const { alerts, seq } = stateRef.current
        const alert = byId(alerts, alertId)
        const id = `INC-2026-${String(seq.incident).padStart(3, '0')}`
        const at = now()
        const incident = {
          id,
          alertId,
          type: alert.type,
          siteId: alert.siteId,
          cameraId: alert.cameraId,
          severity: form.severity,
          status: 'open',
          assignee: form.assignee,
          dueDate: form.dueDate,
          notes: form.notes,
          createdAt: at,
          resolvedAt: null,
          actions: form.action
            ? [{ id: `${id}-A1`, text: form.action, assignee: form.assignee, due: form.dueDate, done: false, doneAt: null }]
            : [],
          timeline: [
            { at: alert.timestamp, by: 'AI', event: 'detected' },
            { at, by: CURRENT_USER, event: 'created' },
          ],
        }
        dispatch({ type: 'CONFIRM_ALERT', incident, at })
        dispatch({ type: 'PUSH_TOAST', toast: { id: toastId(), kind: 'success', key: 'toast.incidentCreated', vars: { id } } })
        return id
      },
      setIncidentStatus: (id, status) => {
        dispatch({ type: 'SET_INCIDENT_STATUS', id, status, at: now() })
        if (status === 'resolved')
          dispatch({ type: 'PUSH_TOAST', toast: { id: toastId(), kind: 'success', key: 'toast.incidentResolved', vars: { id } } })
      },
      addAction: (id, action) => dispatch({ type: 'ADD_ACTION', id, action: { ...action, done: false, doneAt: null }, at: now() }),
      toggleAction: (id, actionId) => dispatch({ type: 'TOGGLE_ACTION', id, actionId, at: now() }),
      setLang: (lang) => dispatch({ type: 'SET_LANG', lang }),
      toggleSimulation: () => dispatch({ type: 'TOGGLE_SIMULATION' }),
      dropToast: (id) => dispatch({ type: 'DROP_TOAST', id }),
      /** Generic toast: kind is 'success' | 'warning'; `key` is an i18n key. */
      notify: (key, vars, kind = 'success') => dispatch({ type: 'PUSH_TOAST', toast: { id: toastId(), kind, key, vars } }),
      reset: async () => {
        dispatch({ type: 'RESET' })
        await request('POST', '/api/admin/reset')
        dispatch({ type: 'PUSH_TOAST', toast: { id: toastId(), kind: 'success', key: 'toast.reset' } })
      },
    }
  }, [simulateAlert])

  const t = useMemo(() => makeT(state.lang), [state.lang])
  const value = useMemo(() => ({ state, lang: state.lang, t, ...api }), [state, t, api])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>')
  return ctx
}

