// -----------------------------------------------
// pages/RSVPOverview.jsx — RSVP Management
// -----------------------------------------------

import { useEffect, useState } from "react";
import API from "../api/axios";

const RSVPOverview = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [attendees, setAttendees] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get("/events?limit=100");
        setEvents(data.data || []);
      } catch (err) {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const toggleAttendees = async (eventId) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
      return;
    }
    setExpandedEvent(eventId);
    if (!attendees[eventId]) {
      try {
        const { data } = await API.get(`/rsvps/event/${eventId}`);
        setAttendees((prev) => ({ ...prev, [eventId]: data.data || [] }));
      } catch {
        setAttendees((prev) => ({ ...prev, [eventId]: [] }));
      }
    }
  };

  const totalRSVPs = events.reduce((acc, e) => acc + (e.rsvpCount || 0), 0);
  const eventsWithRSVPs = events.filter((e) => (e.rsvpCount || 0) > 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🎟️ RSVPs</h1>
        <p className="text-gray-500 mt-1">Track event registrations and attendance</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-indigo-600">{totalRSVPs}</p>
          <p className="text-sm text-gray-500 mt-1">Total RSVPs</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-emerald-600">{eventsWithRSVPs.length}</p>
          <p className="text-sm text-gray-500 mt-1">Events with RSVPs</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-purple-600">
            {eventsWithRSVPs.length > 0 ? Math.round(totalRSVPs / eventsWithRSVPs.length) : 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Avg RSVPs/Event</p>
        </div>
      </div>

      {/* Event RSVP List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-gray-400 text-lg">No events found</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleAttendees(event._id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-lg">
                    📅
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{event.title}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString()} · {event.location} · {event.speaker}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    (event.rsvpCount || 0) > 0
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    {event.rsvpCount || 0} {event.capacity > 0 ? `/ ${event.capacity}` : ""} RSVPs
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedEvent === event._id ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Attendee List */}
              {expandedEvent === event._id && (
                <div className="px-5 pb-4 border-t bg-gray-50">
                  {!attendees[event._id] ? (
                    <p className="py-3 text-sm text-gray-400">Loading attendees...</p>
                  ) : attendees[event._id].length === 0 ? (
                    <p className="py-3 text-sm text-gray-400">No RSVPs yet</p>
                  ) : (
                    <div className="pt-3 space-y-2">
                      {attendees[event._id].map((rsvp, i) => (
                        <div key={rsvp._id || i} className="flex items-center gap-3 py-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                            {rsvp.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">{rsvp.userId?.name || "Unknown"}</span>
                            <span className="text-xs text-gray-400 ml-2">{rsvp.userId?.email}</span>
                          </div>
                          <span className="text-xs text-gray-400">{new Date(rsvp.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RSVPOverview;
