import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { apiRequest } from "../../config/api.js";
import { useToast } from "../../context/ToastContext.jsx";

function Profile() {
  const { user, loading } = useAuth();
  const { getToken } = useClerkAuth();
  const { pushToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    profile: {
      age: "",
      gender: "",
      income: "",
      state: "",
      district: "",
      category: "",
      occupation: "",
      landHolding: "",
    },
  });
  const [initial, setInitial] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadingRemote, setLoadingRemote] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchMe() {
      if (!user) {
        setLoadingRemote(false);
        return;
      }
      try {
        const token = await getToken();
        const res = await apiRequest("/users/me", { clerkToken: token });
        const u = res.data || {};
        const next = {
          name: u.name || "",
          phone: u.phone || "",
          profile: {
            age: u.profile?.age ?? "",
            gender: u.profile?.gender || "",
            income: u.profile?.income ?? "",
            state: u.profile?.state || "",
            district: u.profile?.district || "",
            category: u.profile?.category || "",
            occupation: u.profile?.occupation || "",
            landHolding: u.profile?.landHolding ?? "",
          },
        };
        if (!cancelled) {
          setForm(next);
          setInitial(next);
          setDocs(Array.isArray(u.documents) ? u.documents : []);
        }
      } catch (e) {
        if (!cancelled) {
          pushToast({ type: "error", message: e.message || "Failed to load profile" });
        }
      } finally {
        if (!cancelled) setLoadingRemote(false);
      }
    }
    fetchMe();
    return () => {
      cancelled = true;
    };
  }, [user, getToken]);

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) e.name = "Name is required";
    if (f.phone && !/^\+?[0-9]{7,15}$/.test(f.phone)) e.phone = "Enter a valid phone";
    if (f.profile.age !== "" && (Number.isNaN(Number(f.profile.age)) || Number(f.profile.age) < 0 || Number(f.profile.age) > 120)) e.age = "Age must be between 0 and 120";
    if (f.profile.income !== "" && (Number(f.profile.income) < 0)) e.income = "Income cannot be negative";
    if (f.profile.landHolding !== "" && (Number(f.profile.landHolding) < 0)) e.landHolding = "Land holding cannot be negative";
    return e;
  };

  useEffect(() => {
    setErrors(validate(form));
  }, [form]);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial || {}), [form, initial]);

  if (loading || loadingRemote) return <div className="p-4">Loading...</div>;

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const updateProfileField = (key, value) => setForm((f) => ({ ...f, profile: { ...f.profile, [key]: value } }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const currentErrors = validate(form);
      setErrors(currentErrors);
      if (Object.keys(currentErrors).length) throw new Error("Please fix the errors");
      const payload = { ...form };
      // Convert numeric strings to numbers where applicable
      if (payload.profile?.age !== "") payload.profile.age = Number(payload.profile.age);
      if (payload.profile?.income !== "") payload.profile.income = Number(payload.profile.income);
      if (payload.profile?.landHolding !== "") payload.profile.landHolding = Number(payload.profile.landHolding);
      const token = await getToken();
      const res = await apiRequest("/users/me", { method: "PUT", body: payload, clerkToken: token });
      pushToast({ type: "success", message: "Profile updated" });
      setInitial(form);
    } catch (err) {
      pushToast({ type: "error", message: err.message || "Update failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-6 border border-white/20">
          <div className="flex items-center gap-6">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {form.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                {form.name || user?.name || "User Profile"}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user?.email || "No email"}
              </p>
              {isDirty && (
                <div className="mt-2 inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Unsaved changes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-6 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {errors.name}
                </p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 ${errors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                    placeholder="+91 XXXXXXXXXX"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {errors.phone}
                </p>}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Age</label>
                <input
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 ${errors.age ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  placeholder="Enter your age"
                  type="number"
                  value={form.profile.age}
                  onChange={(e) => updateProfileField("age", e.target.value)}
                />
                {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Gender</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  value={form.profile.gender}
                  onChange={(e) => updateProfileField("gender", e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              {/* Income */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Annual Income (₹)</label>
                <input
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 ${errors.income ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  placeholder="Enter annual income"
                  type="number"
                  value={form.profile.income}
                  onChange={(e) => updateProfileField("income", e.target.value)}
                />
                {errors.income && <p className="text-sm text-red-500">{errors.income}</p>}
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">State</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  placeholder="Enter your state"
                  value={form.profile.state}
                  onChange={(e) => updateProfileField("state", e.target.value)}
                />
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">District</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  placeholder="Enter your district"
                  value={form.profile.district}
                  onChange={(e) => updateProfileField("district", e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Category</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  placeholder="e.g., SC, ST, OBC, General"
                  value={form.profile.category}
                  onChange={(e) => updateProfileField("category", e.target.value)}
                />
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Occupation</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  placeholder="e.g., Farmer, Business"
                  value={form.profile.occupation}
                  onChange={(e) => updateProfileField("occupation", e.target.value)}
                />
              </div>

              {/* Land Holding */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Land Holding (acres)</label>
                <input
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 ${errors.landHolding ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  placeholder="Enter land holding in acres"
                  type="number"
                  step="0.01"
                  value={form.profile.landHolding}
                  onChange={(e) => updateProfileField("landHolding", e.target.value)}
                />
                {errors.landHolding && <p className="text-sm text-red-500">{errors.landHolding}</p>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                type="submit"
                disabled={submitting || !isDirty || Object.keys(errors).length > 0}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isDirty || submitting}
                onClick={() => setForm(initial)}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Documents Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Documents</h2>
          </div>

          {/* Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Document Type</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                placeholder="e.g., Aadhar, PAN, Income Certificate"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Upload File (PDF/JPG/PNG)</label>
              <input
                type="file"
                accept=".pdf,image/*"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  if (docType) fd.append("type", docType);
                  setUploading(true);
                  try {
                    const token = (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")) || "";
                    const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1").replace(/\/$/, "");
                    const res = await fetch(`${base}/users/me/documents`, {
                      method: "POST",
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                      body: fd,
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.message || "Upload failed");
                    setDocs((d) => [...d, data.data]);
                    setDocType("");
                    e.target.value = "";
                    pushToast({ type: "success", message: "Document uploaded" });
                  } catch (err) {
                    pushToast({ type: "error", message: err.message || "Upload failed" });
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-3">
            {docs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No documents uploaded yet</p>
                <p className="text-sm text-gray-400 mt-1">Upload your documents to keep them safe and accessible</p>
              </div>
            ) : (
              docs.map((d) => (
                <div
                  key={d._id || d.url}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{d.type || "Document"}</div>
                      <a
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Document
                      </a>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-all"
                    onClick={async () => {
                      try {
                        const token = await getToken();
                        await apiRequest(`/users/me/documents/${d._id}`, { method: "DELETE", clerkToken: token });
                        setDocs((x) => x.filter((x1) => (x1._id || x1.url) !== (d._id || d.url)));
                        pushToast({ type: "success", message: "Deleted" });
                      } catch (e) {
                        pushToast({ type: "error", message: e.message || "Delete failed" });
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;


