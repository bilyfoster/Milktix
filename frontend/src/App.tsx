import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Events } from './pages/Events'
import { EventDetail } from './pages/EventDetail'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { BecomeOrganizer } from './pages/BecomeOrganizer'
import { AdminOrganizerRequests } from './pages/AdminOrganizerRequests'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="become-organizer" element={<BecomeOrganizer />} />
        <Route path="admin/organizer-requests" element={<AdminOrganizerRequests />} />
      </Route>
    </Routes>
  )
}

export default App
