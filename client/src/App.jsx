// -----------------------------------------------
// App.jsx — Root Component with Routing
// -----------------------------------------------

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import ManageUsers from "./pages/ManageUsers";
import ManageEvents from "./pages/ManageEvents";
import RSVPOverview from "./pages/RSVPOverview";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/events" element={<ManageEvents />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/rsvps" element={<RSVPOverview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
