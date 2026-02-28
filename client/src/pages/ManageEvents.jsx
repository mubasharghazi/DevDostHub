// -----------------------------------------------
// pages/ManageEvents.jsx — Event Management
// -----------------------------------------------

import { useEffect, useState } from "react";
import API from "../api/axios";

const CATEGORIES = ["workshop", "webinar", "hackathon", "meetup", "conference", "bootcamp", "other"];

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  // Edit modal state
  const [editEvent, setEditEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      const { data } = await API.get("/events?limit=100");
      setEvents(data.data || []);
    } catch (err) {
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.title?.toLowerCase().includes(q) || e.speaker?.toLowerCase().includes(q);
    const matchCat = catFilter === "all" || e.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    try {
      await API.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setSuccess("Event deleted");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/events/${editEvent._id}`, editEvent);
      setEvents((prev) => prev.map((ev) => (ev._id === editEvent._id ? data.data : ev)));
      setEditEvent(null);
      setSuccess("Event updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
      setTimeout(() => setError(""), 3000);
    }
  };

  const statusColor = {
    upcoming: "bg-blue-50 text-blue-600",
    ongoing: "bg-green-50 text-green-600",
    completed: "bg-gray-100 text-gray-500",
    cancelled: "bg-red-50 text-red-500",
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📅 Events</h1>
          <p className="text-gray-500 mt-1">Manage all community events ({events.length} total)</p>
        </div>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Events Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-400 text-lg">No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((event) => (
            <div key={event._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3">
                <span className="text-xs text-white/80 uppercase tracking-wide">{event.category}</span>
                <h3 className="text-white font-semibold mt-1 truncate">{event.title}</h3>
              </div>
              <div className="p-5">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📅</span>
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📍</span>
                    <span>{event.location || "TBD"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🎤</span>
                    <span>{event.speaker || "TBD"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>👥</span>
                    <span>{event.rsvpCount || 0} RSVPs {event.capacity > 0 ? `/ ${event.capacity} capacity` : ""}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor[event.status] || "bg-gray-100 text-gray-500"}`}>
                    {event.status}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditEvent({ ...event })}
                      className="text-xs text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id, event.title)}
                      className="text-xs text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-800">Edit Event</h2>
                <button onClick={() => setEditEvent(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text" required
                    value={editEvent.title || ""}
                    onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editEvent.description || ""}
                    onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date" required
                      value={editEvent.date?.substring(0, 10) || ""}
                      onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={editEvent.category || "meetup"}
                      onChange={(e) => setEditEvent({ ...editEvent, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editEvent.location || ""}
                      onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speaker</label>
                    <input
                      type="text"
                      value={editEvent.speaker || ""}
                      onChange={(e) => setEditEvent({ ...editEvent, speaker: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (0 = unlimited)</label>
                    <input
                      type="number" min="0"
                      value={editEvent.capacity || 0}
                      onChange={(e) => setEditEvent({ ...editEvent, capacity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editEvent.status || "upcoming"}
                      onChange={(e) => setEditEvent({ ...editEvent, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editEvent.isOnline || false}
                    onChange={(e) => setEditEvent({ ...editEvent, isOnline: e.target.checked })}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <label className="text-sm text-gray-700">Online Event</label>
                </div>
                {editEvent.isOnline && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                    <input
                      type="url"
                      value={editEvent.meetingLink || ""}
                      onChange={(e) => setEditEvent({ ...editEvent, meetingLink: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditEvent(null)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
