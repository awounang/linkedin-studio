import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/Layout'
import { Auth } from './pages/Auth'
import { CalendarPage } from './pages/Calendar'
import { CreatePost } from './pages/CreatePost'
import { Dashboard } from './pages/Dashboard'
import { Editor } from './pages/Editor'
import { LibraryPage } from './pages/Library'
import { Onboarding } from './pages/Onboarding'
import { ProfilePage } from './pages/Profile'
import { ReviewPage } from './pages/Review'
import { SettingsPage } from './pages/Settings'
import { StrategyPage } from './pages/Strategy'
import { Welcome } from './pages/Welcome'
import { useStore } from './store'

function RequireAuth({ onboarded }: { onboarded?: boolean }) {
  const { account, data } = useStore()
  if (!account) return <Navigate to="/" replace />
  if (onboarded && !data?.onboardingComplete) return <Navigate to="/onboarding" replace />
  if (onboarded === false && data?.onboardingComplete) return <Navigate to="/app" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/connexion" element={<Auth mode="login" />} />
      <Route path="/inscription" element={<Auth mode="signup" />} />
      <Route element={<RequireAuth onboarded={false} />}>
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>
      <Route element={<RequireAuth onboarded />}>
        <Route element={<AppLayout />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/profil" element={<ProfilePage />} />
          <Route path="/app/strategie" element={<StrategyPage />} />
          <Route path="/app/creer" element={<CreatePost />} />
          <Route path="/app/editeur/:id" element={<Editor />} />
          <Route path="/app/calendrier" element={<CalendarPage />} />
          <Route path="/app/bibliotheque" element={<LibraryPage />} />
          <Route path="/app/revue" element={<ReviewPage />} />
          <Route path="/app/parametres" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
