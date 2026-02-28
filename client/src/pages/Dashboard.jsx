// -----------------------------------------------
// pages/Dashboard.jsx — Admin Dashboard with Stats
// -----------------------------------------------

import { useEffect, useState } from "react";
import API from "../api/axios";

const StatCard = ({ title, value, icon, color, sub }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition`}>
    <div className="flex items-center justify-between mb-3">
      <span className={`text-2xl ${color} bg-opacity-10 p-2 rounded-lg`} style={{ backgroundColor: `${color}15` }}>{icon}</span>
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{title}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, eventsRes, statsRes] = await Promise.all([
          API.get("/users"),
          API.get("/events?limit=5"),
          API.get("/events/stats"),
        ]);
        setUsers(usersRes.data.data || []);
        setEvents(eventsRes.data.data || []);
        setStats(statsRes.data.data || {});
      } catch (err) {
        setError("Failed to load dashboard data. Check backend connection.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="ml-4 text-gray-500">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {adminUser.name || "Admin"} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening in your community</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Users" value={users.length} icon="👥" color="text-indigo-600" />
        <StatCard title="Total Events" value={stats?.totalEvents || 0} icon="📅" color="text-emerald-600" />
        <StatCard title="Upcoming Events" value={stats?.upcomingEvents || 0} icon="🚀" color="text-blue-600" />
        <StatCard title="Total RSVPs" value={stats?.totalRSVPs || 0} icon="🎟️" color="text-purple-600" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Users by Role</h2>
          <div className="space-y-3">
            {Object.entries(roleCounts).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-block w-3 h-3 rounded-full bg-indigo-400"></span>
                  <span className="text-sm text-gray-700 capitalize">{role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${(count / users.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events by Category */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Events by Category</h2>
          <div className="space-y-3">
            {(stats?.categoryCounts || []).map((cat) => (
              <div key={cat._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-block w-3 h-3 rounded-full bg-emerald-400"></span>
                  <span className="text-sm text-gray-700 capitalize">{cat._id}</span>
                </div>
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">{cat.count}</span>
              </div>
            ))}
            {(!stats?.categoryCounts || stats.categoryCounts.length === 0) && (
              <p className="text-sm text-gray-400">No events yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h2>
          {users.length === 0 ? (
            <p className="text-sm text-gray-400">No users yet</p>
          ) : (
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full capitalize">{user.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Events</h2>
          {events.length === 0 ? (
            <p className="text-sm text-gray-400">No events yet</p>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div key={event._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-lg">
                    📅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
                    <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()} · {event.location}</p>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full capitalize">{event.status || event.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
