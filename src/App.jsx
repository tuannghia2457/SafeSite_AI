import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DemoProvider } from './state/DemoStore'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Evidence from './pages/Evidence'
import Dashboard from './pages/Dashboard'
import Monitoring from './pages/Monitoring'
import Alerts from './pages/Alerts'
import Incidents from './pages/Incidents'
import IncidentDetail from './pages/IncidentDetail'
import Reports from './pages/Reports'
import CheckIn from './pages/CheckIn'
import Attendance from './pages/Attendance'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import System from './pages/System'

// HashRouter keeps the demo deployable to any static host without server rewrites.
export default function App() {
  return (
    <DemoProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/system" element={<System />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </DemoProvider>
  )
}
