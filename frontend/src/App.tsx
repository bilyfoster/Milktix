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
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminEvents as AdminEventsV2 } from './pages/admin/AdminEvents'
import { AdminLayout } from './components/AdminLayout'
import { HostProfile } from './pages/HostProfile'
import { LocationPage } from './pages/LocationPage'
import { OrderSuccess } from './pages/OrderSuccess'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Terms } from './pages/Terms'
import { Privacy } from './pages/Privacy'

// Organizer Dashboard Pages
import { OrganizerDashboard } from './pages/organizer/Dashboard'
import { CreateEvent } from './pages/organizer/CreateEvent'
import { EditEvent } from './pages/organizer/EditEvent'
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
          <Route path="events" element={<AdminEventsV2 />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="organizer-requests" element={<AdminOrganizerRequests />} />
          <Route path="hosts" element={<AdminHosts />} />
          <Route path="locations" element={<AdminLocations />} />
          <Route path="reports" element={<div className="card p-12 text-center"><h2 className="text-xl font-semibold text-warmgray-900">Reports</h2><p className="text-warmgray-600 mt-2">Reports dashboard coming soon.</p></div>} />
        </Route>
        <Route path="hosts/:id" element={<HostProfile />} />
        <Route path="locations/:id" element={<LocationPage />} />
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
      </Route>

      {/* Organizer Dashboard Routes - Nested Layout */}
      <Route path="/organizer" element={<OrganizerLayout />}>
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="create-event" element={<CreateEvent />} />
        <Route path="events/:eventId/edit" element={<EditEvent />} />
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
