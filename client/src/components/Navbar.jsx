// -----------------------------------------------
// components/Navbar.jsx — Admin Sidebar-style Navbar
// -----------------------------------------------

import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  if (!isLoggedIn) return null;

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/users", label: "Users", icon: "👥" },
    { to: "/events", label: "Events", icon: "📅" },
    { to: "/create-event", label: "Create Event", icon: "➕" },
    { to: "/rsvps", label: "RSVPs", icon: "🎟️" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600 tracking-tight flex items-center gap-2">
            🚀 <span className="hidden sm:inline">DevDostHub</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname === link.to
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
              {adminUser.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <span className="text-sm font-medium text-gray-700">{adminUser.name || "Admin"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition font-medium"
          >
            Logout
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-1 overflow-x-auto">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              location.pathname === link.to
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {link.icon} {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
