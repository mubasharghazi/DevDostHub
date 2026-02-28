// -----------------------------------------------
// pages/CreateEvent.jsx — Enhanced Create Event Form
// -----------------------------------------------

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const CATEGORIES = ["workshop", "webinar", "hackathon", "meetup", "conference", "bootcamp", "other"];

const CreateEvent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", date: "", endDate: "",
    location: "", speaker: "", category: "meetup",
    capacity: 0, tags: "", isOnline: false, meetingLink: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    try {
      const payload = {
        ...form,
        capacity: parseInt(form.capacity) || 0,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const { data } = await API.post("/events", payload);
      setSuccess(`Event "${data.data.title}" created successfully!`);
      setTimeout(() => navigate("/events"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📅 Create Event</h1>
        <p className="text-gray-500 mt-1">Add a new event for the community</p>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">✅ {success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
          <input name="title" type="text" required value={form.title} onChange={handleChange}
            placeholder="e.g., Intro to Serverless Architecture"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange}
            placeholder="Describe the event..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* Date + End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input name="date" type="datetime-local" required value={form.date} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Category + Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (0 = unlimited)</label>
            <input name="capacity" type="number" min="0" value={form.capacity} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Location + Speaker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input name="location" type="text" required value={form.location} onChange={handleChange}
              placeholder="Room 101 or Online"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Speaker *</label>
            <input name="speaker" type="text" required value={form.speaker} onChange={handleChange}
              placeholder="Sara Ahmed"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input name="tags" type="text" value={form.tags} onChange={handleChange}
            placeholder="React, Node.js, Cloud"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* Online Toggle */}
        <div className="flex items-center gap-3">
          <input name="isOnline" type="checkbox" checked={form.isOnline} onChange={handleChange}
            className="w-4 h-4 text-indigo-600 rounded" />
          <label className="text-sm text-gray-700">This is an online event</label>
        </div>

        {form.isOnline && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
            <input name="meetingLink" type="url" value={form.meetingLink} onChange={handleChange}
              placeholder="https://zoom.us/j/..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
