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

  if (loading || loadingRemote) return <div className="p-4" style={{ color: 'var(--color-ink-mute)' }}>Loading...</div>;

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
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-canvas-soft)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="p-8 mb-6" style={{ backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex items-center gap-6">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-medium" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '2px solid var(--color-hairline)', color: 'var(--color-ink)' }}>
                {form.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', border: '3px solid var(--color-canvas)' }}>
                <svg className="w-3 h-3" style={{ color: 'var(--color-on-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-sub-title mb-1" style={{ color: 'var(--color-ink)' }}>
                {form.name || user?.name || "User Profile"}
              </h1>
              <p className="flex items-center gap-2" style={{ color: 'var(--color-ink-mute)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user?.email || "No email"}
              </p>
              {isDirty && (
                <div className="mt-2 inline-flex items-center px-3 py-1 text-sm font-medium" style={{ backgroundColor: '#fffbeb', color: '#92400e', borderRadius: 'var(--radius-full)', border: '1px solid #fde68a' }}>
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
        <div className="p-8 mb-6" style={{ backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-ink-mute)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-card-title" style={{ color: 'var(--color-ink)' }}>Personal Information</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>Full Name *</label>
                <input
                  className="input-field"
                  style={errors.name ? { borderColor: '#dc3545', backgroundColor: '#fef2f2' } : {}}
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
                {errors.name && <p className="text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {errors.name}
                </p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>Phone Number</label>
                <input
                  className="input-field"
                  style={errors.phone ? { borderColor: '#dc3545', backgroundColor: '#fef2f2' } : {}}
                  placeholder="+91 XXXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
                {errors.phone && <p className="text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {errors.phone}
                </p>}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>Age</label>
                <input
                  className="input-field"
                  style={errors.age ? { borderColor: '#dc3545', backgroundColor: '#fef2f2' } : {}}
                  placeholder="Enter your age"
                  type="number"
                  value={form.profile.age}
                  onChange={(e) => updateProfileField("age", e.target.value)}
                />
                {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>Gender</label>
                <select
                  className="input-field appearance-none cursor-pointer"
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
                <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>Annual Income (₹)</label>
                <input
                  className="input-field"
                  style={errors.income ? { borderColor: '#dc3545', backgroundColor: '#fef2f2' } : {}}
                  placeholder="Enter annual income"
                  type="number"
                  value={form.profile.income}
                  onChange={(e) => updateProfileField("income", e.target.value)}
                />
                {errors.income && <p className="text-sm text-red-500">{errors.income}</p>}
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>State</label>
                <input
                  className="input-field"
                  placeholder="Enter your state"
                  value={form.profile.state}
                  onChange={(e) => updateProfileField("state", e.target.value)}
                />
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>District</label>
                <input
                  className="input-field"
                  placeholder="Enter your district"
                  value={form.profile.district}
                  onChange={(e) => updateProfileField("district", e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>Category</label>
                <input
                  className="input-field"
                  placeholder="e.g., SC, ST, OBC, General"
                  value={form.profile.category}
                  onChange={(e) => updateProfileField("category", e.target.value)}
                />
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>Occupation</label>
                <input
                  className="input-field"
                  placeholder="e.g., Farmer, Business"
                  value={form.profile.occupation}
                  onChange={(e) => updateProfileField("occupation", e.target.value)}
                />
              </div>

              {/* Land Holding */}
              <div className="space-y-2">
                <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>Land Holding (acres)</label>
                <input
                  className="input-field"
                  style={errors.landHolding ? { borderColor: '#dc3545', backgroundColor: '#fef2f2' } : {}}
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
                className="btn-primary-cta flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                style={{ padding: '12px 24px' }}
                disabled={submitting || !isDirty || Object.keys(errors).length > 0}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ padding: '12px 24px' }}
                disabled={!isDirty || submitting}
                onClick={() => setForm(initial)}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Documents Section */}
        <div className="p-8" style={{ backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-ink-mute)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-card-title" style={{ color: 'var(--color-ink)' }}>Documents</h2>
          </div>

          {/* Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-6" style={{ backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-hairline)' }}>
            <div className="space-y-2">
              <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>Document Type</label>
              <input
                className="input-field"
                placeholder="e.g., Aadhar, PAN, Income Certificate"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium block" style={{ color: 'var(--color-ink)' }}>Upload File (PDF/JPG/PNG)</label>
              <input
                type="file"
                accept=".pdf,image/*"
                className="input-field file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:cursor-pointer"
                style={{ padding: '6px 12px' }}
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
                <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-ink-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p style={{ color: 'var(--color-ink-mute)' }}>No documents uploaded yet</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-ink-faint)' }}>Upload your documents to keep them safe and accessible</p>
              </div>
            ) : (
              docs.map((d) => (
                <div
                  key={d._id || d.url}
                  className="flex items-center justify-between p-4 transition-all"
                  style={{ backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-level1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', color: 'var(--color-ink-mute)' }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium" style={{ color: 'var(--color-ink)' }}>{d.type || "Document"}</div>
                      <a
                        className="text-sm flex items-center gap-1"
                        style={{ color: 'var(--color-primary)' }}
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
                    className="px-4 py-2 font-medium transition-all text-sm"
                    style={{ backgroundColor: '#fef2f2', color: '#dc3545', borderRadius: 'var(--radius-sm)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
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
