import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { OrganizerLayout } from './components/OrganizerLayout'
import { Home } from './pages/Home'
import { Events } from './pages/Events'
import { EventDetail } from './pages/EventDetail'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { BecomeOrganizer } from './pages/BecomeOrganizer'
import { OrganizerRequestStatus } from './pages/OrganizerRequestStatus'
import { AdminOrganizerRequests } from './pages/AdminOrganizerRequests'
import { AdminHosts } from './pages/AdminHosts'
import { AdminLocations } from './pages/AdminLocations'
import { AdminLayout } from './components/AdminLayout'
import { HostProfile } from './pages/HostProfile'
import { LocationPage } from './pages/LocationPage'
import { OrderSuccess } from './pages/OrderSuccess'

// Organizer Dashboard Pages
import { OrganizerDashboard } from './pages/organizer/Dashboard'
import { CreateEvent } from './pages/organizer/CreateEvent'
import { MyEvents as ManageEvents } from './pages/organizer/MyEvents'
import { Orders } from './pages/organizer/Orders'
import { OrderDetail } from './pages/organizer/OrderDetail'
import { Hosts } from './pages/organizer/Hosts'
import { Locations } from './pages/organizer/Locations'
import { EventTemplates } from './pages/organizer/EventTemplates'
import { CreateTemplate } from './pages/organizer/CreateTemplate'

function App() {
  return (
    <Routes>
      {/* Public Layout Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="become-organizer" element={<BecomeOrganizer />} />
        <Route path="organizer-request-status" element={<OrganizerRequestStatus />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="organizer-requests" element={<AdminOrganizerRequests />} />
          <Route path="hosts" element={<AdminHosts />} />
          <Route path="locations" element={<AdminLocations />} />
        </Route>
        <Route path="hosts/:id" element={<HostProfile />} />
        <Route path="locations/:id" element={<LocationPage />} />
        <Route path="order-success" element={<OrderSuccess />} />
      </Route>

      {/* Organizer Dashboard Routes - Nested Layout */}
      <Route path="/organizer" element={<OrganizerLayout />}>
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="create-event" element={<CreateEvent />} />
        <Route path="manage-events" element={<ManageEvents />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:orderId" element={<OrderDetail />} />
        <Route path="hosts" element={<Hosts />} />
        <Route path="locations" element={<Locations />} />
        <Route path="templates" element={<EventTemplates />} />
        <Route path="templates/create" element={<CreateTemplate />} />
      </Route>
    </Routes>
  )
}

export default App
