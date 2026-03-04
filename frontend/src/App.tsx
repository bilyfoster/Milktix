import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Events } from './pages/Events'
import { EventDetail } from './pages/EventDetail'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { OrganizerDashboard } from './pages/OrganizerDashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
      </Route>
    </Routes>
  )
}

export default App